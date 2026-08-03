import { Request, Response, Router } from "express";

const serialize = (banner: Record<string, any>) => ({ ...banner, _id: banner._id.toString() });

export default function mountHeroBannerEndpoints(router: Router) {
  router.get("/", async (req: Request, res: Response) => {
    const placement = String(req.query.placement || "");
    if (!["dashboard", "store"].includes(placement)) return res.status(400).json({ error: "bad_request", message: "Choose dashboard or store." });
    const banners = await req.app.locals.heroBannerCollection.find({ placement, active: true }).sort({ order: 1 }).toArray();
    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).json({ banners: banners.map(serialize) });
  });
}
