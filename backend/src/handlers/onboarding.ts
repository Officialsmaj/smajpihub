import { Request, Response, Router } from "express";

const clean = (value: unknown, max = 500) => String(value || "").trim().slice(0, max);

export default function mountOnboardingEndpoints(router: Router) {
  router.post("/", async (req: Request, res: Response) => {
    const fullName = clean(req.body?.fullName || req.body?.name, 100);
    const email = clean(req.body?.email, 120).toLowerCase();
    const applicationType = clean(req.body?.applicationType || req.body?.track, 60);
    const location = clean(req.body?.location, 100);
    const details = clean(req.body?.details, 1200);

    if (!fullName || !email || !applicationType || !location || details.length < 20 || !email.includes("@")) {
      return res.status(400).json({ error: "bad_request", message: "Complete the onboarding application details." });
    }

    const application = {
      fullName,
      email,
      applicationType,
      location,
      details,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await req.app.locals.onboardingCollection.insertOne(application);
    return res.status(201).json({ application: { ...application, _id: result.insertedId.toString() } });
  });
}
