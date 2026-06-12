import { Router, Request, Response } from "express";

import platformAPIClient from "../services/platformAPIClient";

type VerifiedPiUser = {
  uid?: string;
  username?: string;
};

const toClientUser = (user: any) => user ? ({
  uid: user.uid,
  username: user.username,
  piUsername: user.piUsername,
  displayName: user.displayName,
  country: user.country,
  role: user.role,
  roles: user.roles,
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

  try {
    let currentUser = await userCollection.findOne({ uid: normalizedUser.uid });

    if (currentUser) {
      const role = currentUser.role === "seller" ? "seller" : "buyer";
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
            role,
            roles: [role],
            createdAt: currentUser.createdAt || new Date(),
            accessToken: auth.accessToken,
          },
        },
      );

      currentUser = await userCollection.findOne({ _id: currentUser._id });
    } else {
      const insertResult = await userCollection.insertOne({
        username: normalizedUser.username,
        piUsername: normalizedUser.username,
        uid: normalizedUser.uid,
        displayName: normalizedUser.username,
        country: "",
        role: "buyer",
        roles: ["buyer"],
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

    const displayName = String(req.body?.displayName || "").trim();
    const country = String(req.body?.country || "").trim();
    const role = req.body?.role;

    if (!displayName || displayName.length > 80 || country.length > 80 || !["buyer", "seller"].includes(role)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid profile details" });
    }

    await userCollection.updateOne(
      { uid: currentUser.uid },
      { $set: { displayName, country, role, roles: [role] } },
    );

    const updatedUser = await userCollection.findOne({ uid: currentUser.uid });
    req.session.currentUser = updatedUser;
    return res.status(200).json({ user: toClientUser(updatedUser) });
  });

  // GET|POST /user/signout
  router.get("/signout", destroySession);
  router.post("/signout", destroySession);
}
