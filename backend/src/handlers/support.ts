import { Request, Response, Router } from "express";

const clean = (value: unknown, max = 1000) => String(value || "").trim().slice(0, max);

export default function mountSupportEndpoints(router: Router) {
  router.post("/", async (req: Request, res: Response) => {
    const name = clean(req.body?.name || req.session.currentUser?.displayName || req.session.currentUser?.username, 100);
    const email = clean(req.body?.email, 120).toLowerCase();
    const topic = clean(req.body?.topic, 80);
    const message = clean(req.body?.message || req.body?.details, 1500);
    const source = clean(req.body?.source || "support", 40);
    const userId = req.session.currentUser?.uid || null;

    if (!name || !topic || message.length < 10 || (email && !email.includes("@"))) {
      return res.status(400).json({ error: "bad_request", message: "Complete the support request details." });
    }

    const request = {
      name,
      email,
      topic,
      message,
      source,
      userId,
      status: "open",
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await req.app.locals.supportCollection.insertOne(request);
    return res.status(201).json({ request: { ...request, _id: result.insertedId.toString() } });
  });
}
