import { Request, Response, Router } from "express";
import { resolveCurrentUser } from "../services/auth";

const clean = (value: unknown, max = 500) => String(value || "").trim().slice(0, max);
const safeImageUrl = (value: unknown) => {
  const url = clean(value, 1200);
  return /^https:\/\//i.test(url) ? url : "";
};
const serialize = (item: Record<string, any>) => ({ ...item, _id: item._id.toString() });

export default function mountAmbassadorEndpoints(router: Router) {
  router.get("/me", async (req: Request, res: Response) => {
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(401).json({ error: "unauthorized", message: "Sign in to view your ambassador application." });
    const application = await req.app.locals.ambassadorCollection.findOne({ userId: user.uid });
    return res.status(200).json({ application: application ? serialize(application) : null });
  });

  router.get("/", async (req: Request, res: Response) => {
    const query: Record<string, any> = { status: "approved" };
    const countryCode = clean(req.query.countryCode, 2).toUpperCase();
    const service = clean(req.query.service, 60);
    if (countryCode) query.countryCode = countryCode;
    if (service && service !== "all") query.services = service;
    const ambassadors = await req.app.locals.ambassadorCollection.find(query).sort({ approvedAt: -1, createdAt: -1 }).toArray();
    return res.status(200).json({ ambassadors: ambassadors.map((item: Record<string, any>) => ({
      _id: item._id.toString(),
      displayName: item.displayName,
      countryName: item.countryName,
      countryCode: item.countryCode,
      countryFlag: item.countryFlag,
      regionName: item.regionName,
      services: item.services,
      approvedAt: item.approvedAt,
    })) });
  });

  router.post("/", async (req: Request, res: Response) => {
    const user = await resolveCurrentUser(req);
    if (!user) return res.status(401).json({ error: "unauthorized", message: "Sign in to apply as an ambassador." });

    const displayName = clean(req.body?.displayName || user.displayName || user.username, 100);
    const email = clean(req.body?.email, 120).toLowerCase();
    const phone = clean(req.body?.phone, 40);
    const countryCode = clean(req.body?.countryCode, 2).toUpperCase();
    const countryName = clean(req.body?.countryName, 100);
    const countryFlag = clean(req.body?.countryFlag, 8);
    const regionCode = clean(req.body?.regionCode, 20);
    const regionName = clean(req.body?.regionName, 120);
    const message = clean(req.body?.message, 1500);
    const services = Array.isArray(req.body?.services) ? [...new Set(req.body.services.map((value: unknown) => clean(value, 60)).filter(Boolean))].slice(0, 20) : [];
    const idFrontUrl = safeImageUrl(req.body?.idFrontUrl);
    const idBackUrl = safeImageUrl(req.body?.idBackUrl);
    const selfieUrl = safeImageUrl(req.body?.selfieUrl);

    if (!displayName || !email.includes("@") || !phone || countryCode.length !== 2 || !countryName || !regionName || !services.length || message.length < 20 || !idFrontUrl || !idBackUrl || !selfieUrl) {
      return res.status(400).json({ error: "bad_request", message: "Complete every field, choose a country and region, and provide all three identity images." });
    }

    const now = new Date();
    const application = {
      userId: user.uid,
      displayName,
      email,
      phone,
      countryCode,
      countryName,
      countryFlag,
      regionCode,
      regionName,
      services,
      message,
      identity: { idFrontUrl, idBackUrl, selfieUrl },
      status: "pending",
      updatedAt: now,
    };
    const existing = await req.app.locals.ambassadorCollection.findOne({ userId: user.uid });
    await req.app.locals.ambassadorCollection.updateOne(
      { userId: user.uid },
      { $set: application, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    const saved = await req.app.locals.ambassadorCollection.findOne({ userId: user.uid });
    return res.status(existing ? 200 : 201).json({ application: serialize(saved) });
  });
}
