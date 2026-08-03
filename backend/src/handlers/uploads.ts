import { Router, Request, Response } from "express";
import { isBase64Image, resolveImageValue, safePurpose, uploadImageToCloudinary } from "../services/imageStorage";

export default function mountUploadEndpoints(router: Router) {
  const uploadImageValue = async (image: string, purpose: string) => {
    if (!isBase64Image(image)) {
      const url = await resolveImageValue(image, purpose);
      if (url) return { url, storage: "existing" };
      return null;
    }
    return uploadImageToCloudinary(image, purpose);
  };

  router.post("/image", async (req: Request, res: Response) => {
    try {
      const upload = await uploadImageValue(String(req.body?.image || req.body?.dataUrl || ""), safePurpose(req.body?.purpose));
      if (!upload) return res.status(400).json({ error: "bad_request", message: "Upload a valid image file." });
      return res.status(201).json(upload);
    } catch (err: any) {
      if (err?.statusCode === 413) return res.status(413).json({ error: "payload_too_large", message: err.message });
      if (err?.statusCode === 400) return res.status(400).json({ error: "bad_request", message: err.message });
      if (err?.statusCode === 503) return res.status(503).json({ error: "upload_unavailable", message: err.message });
      console.error("Image upload failed:", err);
      return res.status(500).json({ error: "upload_failed", message: "Image upload failed." });
    }
  });

  router.post("/images", async (req: Request, res: Response) => {
    try {
      const images: string[] = Array.isArray(req.body?.images) ? req.body.images.map((item: unknown) => String(item || "")).filter(Boolean).slice(0, 12) : [];
      if (!images.length) return res.status(400).json({ error: "bad_request", message: "Upload at least one image." });

      const uploads = await Promise.all(images.map((image) => uploadImageValue(image, safePurpose(req.body?.purpose))));
      if (uploads.some((upload) => !upload)) return res.status(400).json({ error: "bad_request", message: "Upload valid image files." });

      return res.status(201).json({ urls: uploads.map((upload) => upload!.url), uploads });
    } catch (err: any) {
      if (err?.statusCode === 413) return res.status(413).json({ error: "payload_too_large", message: err.message });
      if (err?.statusCode === 400) return res.status(400).json({ error: "bad_request", message: err.message });
      if (err?.statusCode === 503) return res.status(503).json({ error: "upload_unavailable", message: err.message });
      console.error("Image upload failed:", err);
      return res.status(500).json({ error: "upload_failed", message: "Image upload failed." });
    }
  });
}
