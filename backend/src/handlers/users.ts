import { Router, Request, Response } from "express";

import { ObjectId } from "mongodb";
import platformAPIClient from "../services/platformAPIClient";
import env from "../environments";

type VerifiedPiUser = {
  uid?: string;
  username?: string;
};

const isImageReference = (value: string) => !value || value.startsWith("data:image/") || /^https:\/\/[^\s]+/i.test(value);

const toClientUser = (user: any) => user ? ({
  uid: user.uid,
  username: user.username,
  piUsername: user.piUsername,
  displayName: user.displayName,
  country: user.country,
  contactPhone: user.contactPhone || "",
  avatar: user.avatar || "",
  coverImage: user.coverImage || "",
  bio: user.bio || "",
  language: user.language || user.settings?.language || "English",
  sellerActive: Boolean(user.sellerActive || user.role === "seller"),
  role: user.role,
  roles: user.roles,
  blocked: Boolean(user.blocked),
  verificationLevel: user.verificationLevel || "verified",
  verificationRequested: Boolean(user.verificationRequested),
  settings: user.settings || { theme: "light", language: "English", notifications: true },
  createdAt: user.createdAt,
}) : null;

const destroySession = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during signout:", err);
      return res.status(500).json({ error: "internal_error", message: "Failed to sign out" });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "User signed out" });
  });
};

export const handleSignIn = async (req: Request, res: Response) => {
  const auth = req.body?.authResult;
  const userCollection = req.app.locals.userCollection;

  if (!auth?.accessToken || !auth?.user?.uid || !auth?.user?.username) {
    return res.status(400).json({ error: "bad_request", message: "Missing required authResult payload" });
  }

  if (!userCollection) {
    return res.status(503).json({ error: "service_unavailable", message: "Database not ready" });
  }

  let verifiedUser: VerifiedPiUser;

  try {
    const meResponse = await platformAPIClient.get<VerifiedPiUser>("/v2/me", {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    verifiedUser = meResponse.data ?? {};
  } catch (err) {
    console.error("Error verifying access token:", err);
    return res.status(401).json({ error: "invalid_token", message: "Invalid access token" });
  }

  if (verifiedUser.uid && verifiedUser.uid !== auth.user.uid) {
    return res.status(401).json({ error: "invalid_token", message: "Authenticated user mismatch" });
  }

  if (verifiedUser.username && verifiedUser.username !== auth.user.username) {
    return res.status(401).json({ error: "invalid_token", message: "Authenticated username mismatch" });
  }

  const normalizedUser = {
    uid: verifiedUser.uid || auth.user.uid,
    username: verifiedUser.username || auth.user.username,
    roles: Array.isArray(auth.user.roles) ? auth.user.roles : [],
  };
  const isConfiguredAdmin = env.admin_pi_usernames.includes(String(normalizedUser.username || "").toLowerCase());

  try {
    let currentUser = await userCollection.findOne({ uid: normalizedUser.uid });

    if (currentUser) {
      const role = isConfiguredAdmin ? "admin" : ["buyer", "seller", "admin"].includes(currentUser.role) ? currentUser.role : "buyer";
      if (currentUser.blocked) {
        return res.status(403).json({ error: "blocked", message: "This SMAJ account has been blocked" });
      }
      await userCollection.updateOne(
        {
          _id: currentUser._id,
        },
        {
          $set: {
            username: normalizedUser.username,
            piUsername: normalizedUser.username,
            displayName: currentUser.displayName || normalizedUser.username,
            country: currentUser.country || "",
            contactPhone: currentUser.contactPhone || "",
            role,
            roles: [role],
            blocked: false,
            verificationLevel: currentUser.verificationLevel || "verified",
            verificationRequested: Boolean(currentUser.verificationRequested),
            settings: currentUser.settings || { theme: "light", language: "English", notifications: true },
            createdAt: currentUser.createdAt || new Date(),
            accessToken: auth.accessToken,
          },
        },
      );

      currentUser = await userCollection.findOne({ _id: currentUser._id });
    } else {
      const role = isConfiguredAdmin ? "admin" : "buyer";
      const insertResult = await userCollection.insertOne({
        username: normalizedUser.username,
        piUsername: normalizedUser.username,
        uid: normalizedUser.uid,
        displayName: normalizedUser.username,
        country: "",
        contactPhone: "",
        role,
        roles: [role],
        blocked: false,
        verificationLevel: "verified",
        verificationRequested: false,
        settings: { theme: "light", language: "English", notifications: true },
        createdAt: new Date(),
        accessToken: auth.accessToken,
      });

      currentUser = await userCollection.findOne(insertResult.insertedId);
    }

    req.session.currentUser = currentUser;
    return res.status(200).json({ message: "User signed in", user: toClientUser(currentUser) });
  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(500).json({ error: "internal_error", message: "Failed to sign in" });
  }
};

export default function mountUserEndpoints(router: Router) {
  router.post("/dev-signin", async (req: Request, res: Response) => {
    if (!env.dev_auth || process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "not_found", message: "Development sign-in is disabled" });
    }

    const uid = "local-dev-user";
    const userCollection = req.app.locals.userCollection;
    await userCollection.updateOne(
      { uid },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          username: "localdev",
          piUsername: "localdev",
          uid,
          displayName: "Local Dev Seller",
          country: "Local",
          contactPhone: "@localdev",
          role: "seller",
          roles: ["seller"],
          sellerActive: true,
          blocked: false,
          verificationLevel: "trusted_seller",
          verificationRequested: false,
          settings: { theme: "light", language: "English", notifications: true },
          createdAt: new Date(),
          accessToken: "dev-token",
        },
      },
      { upsert: true },
    );
    const currentUser = await userCollection.findOne({ uid });
    req.session.currentUser = currentUser;
    return res.status(200).json({ message: "Development user signed in", user: toClientUser(currentUser) });
  });

  // POST /user/signin
  router.post("/signin", handleSignIn);

  // GET /user (session check)
  router.get("/", async (req: Request, res: Response) => {
    return res.status(200).json({
      user: toClientUser(req.session.currentUser),
    });
  });

  router.put("/profile", async (req: Request, res: Response) => {
    const currentUser = req.session.currentUser;
    const userCollection = req.app.locals.userCollection;

    if (!currentUser) {
      return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    }

    const displayName = String(req.body?.displayName || currentUser.displayName || currentUser.username || "Pi User").trim();
    const country = String(req.body?.country || "").trim();
    const contactPhone = String(req.body?.contactPhone || "").trim();
    const avatar = String(req.body?.avatar || currentUser.avatar || "");
    const coverImage = String(req.body?.coverImage || currentUser.coverImage || "");
    const bio = String(req.body?.bio || currentUser.bio || "").trim();
    const language = String(req.body?.language || currentUser.language || currentUser.settings?.language || "English").trim();
    const sellerActive = typeof req.body?.sellerActive === "boolean" ? req.body.sellerActive : Boolean(currentUser.sellerActive || currentUser.role === "seller");
    const requestedRole = req.body?.role;
    const role = currentUser.role === "admin" ? "admin" : sellerActive ? "seller" : requestedRole === "seller" ? "seller" : "buyer";

    if (displayName.length > 80 || country.length > 80 || contactPhone.length > 40 || bio.length > 500 || language.length > 40 || avatar.length > 6_500_000 || coverImage.length > 6_500_000 || !isImageReference(avatar) || !isImageReference(coverImage) || !["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ error: "bad_request", message: "Profile image or text is too large." });
    }

    const verificationLevel = currentUser.verificationLevel === "trusted_seller" ? "trusted_seller" : "verified";
    await userCollection.updateOne(
      { uid: currentUser.uid },
      { $set: { displayName, country, contactPhone, avatar, coverImage, bio, language, sellerActive, role, roles: [role], verificationLevel } },
    );

    const updatedUser = await userCollection.findOne({ uid: currentUser.uid });
    req.session.currentUser = updatedUser;
    return res.status(200).json({ user: toClientUser(updatedUser) });
  });

  router.get("/stats", async (req: Request, res: Response) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    const [totalProducts, successfulOrders] = await Promise.all([
      req.app.locals.productCollection.countDocuments({ sellerId: currentUser.uid }),
      req.app.locals.marketplaceOrderCollection.countDocuments({ $or: [{ sellerId: currentUser.uid }, { buyerId: currentUser.uid }], status: "completed" }),
    ]);
    return res.status(200).json({ stats: { totalProducts, successfulOrders } });
  });

  router.post("/verification-request", async (req: Request, res: Response) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    if (currentUser.role !== "seller") return res.status(400).json({ error: "bad_request", message: "Only sellers can request trusted verification" });
    await req.app.locals.userCollection.updateOne({ uid: currentUser.uid }, { $set: { verificationRequested: true, verificationRequestedAt: new Date() } });
    const updatedUser = await req.app.locals.userCollection.findOne({ uid: currentUser.uid });
    req.session.currentUser = updatedUser;
    return res.status(200).json({ user: toClientUser(updatedUser), message: "Verification request submitted" });
  });

  router.put("/settings", async (req: Request, res: Response) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    }

    const theme = req.body?.theme;
    const language = String(req.body?.language || "").trim();
    const notifications = req.body?.notifications;
    if (!["dark", "light"].includes(theme) || !language || language.length > 40 || typeof notifications !== "boolean") {
      return res.status(400).json({ error: "bad_request", message: "Invalid settings" });
    }

    const settings = { theme, language, notifications };
    await req.app.locals.userCollection.updateOne({ uid: currentUser.uid }, { $set: { settings } });
    const updatedUser = await req.app.locals.userCollection.findOne({ uid: currentUser.uid });
    req.session.currentUser = updatedUser;
    return res.status(200).json({ user: toClientUser(updatedUser) });
  });

  // GET|POST /user/signout
  router.get("/signout", destroySession);
  router.post("/signout", destroySession);
}
