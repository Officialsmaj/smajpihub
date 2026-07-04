import { Router, Request, Response } from "express";
import env from "../environments";

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

const isDataImage = (value: string) => /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
const isExistingImageReference = (value: string) => /^https:\/\/[^\s]+$/i.test(value) || isDataImage(value);

const uploadToCloudinary = async (image: string, purpose: string) => {
  const params = new URLSearchParams();
  params.set("file", image);
  params.set("upload_preset", env.cloudinary_upload_preset);
  params.set("folder", `${env.cloudinary_folder}/${purpose}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary_cloud_name}/image/upload`, {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as CloudinaryResponse;
  if (!data.secure_url) {
    throw new Error("Cloudinary did not return an image URL");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
    storage: "cloudinary",
  };
};

export default function mountUploadEndpoints(router: Router) {
  const cleanPurpose = (value: unknown) => String(value || "image").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) || "image";

  const uploadImageValue = async (image: string, purpose: string) => {
    if (!isDataImage(image)) {
      if (isExistingImageReference(image)) return { url: image, storage: "existing" };
      return null;
    }

    if (image.length > 6_500_000) {
      throw Object.assign(new Error("Image must be smaller than 5 MB."), { statusCode: 413 });
    }

    if (!env.cloudinary_cloud_name || !env.cloudinary_upload_preset) {
      return { url: image, storage: "inline-fallback" };
    }

    try {
      return await uploadToCloudinary(image, purpose);
    } catch (err) {
      console.error("Image upload failed:", err);
      return { url: image, storage: "inline-fallback", warning: "Cloudinary upload failed, using inline image." };
    }
  };

  router.post("/image", async (req: Request, res: Response) => {
    try {
      const upload = await uploadImageValue(String(req.body?.image || req.body?.dataUrl || ""), cleanPurpose(req.body?.purpose));
      if (!upload) return res.status(400).json({ error: "bad_request", message: "Upload a valid image file." });
      return res.status(201).json(upload);
    } catch (err: any) {
      if (err?.statusCode === 413) return res.status(413).json({ error: "payload_too_large", message: err.message });
      console.error("Image upload failed:", err);
      return res.status(500).json({ error: "upload_failed", message: "Image upload failed." });
    }
  });

  router.post("/images", async (req: Request, res: Response) => {
    try {
      const images: string[] = Array.isArray(req.body?.images) ? req.body.images.map((item: unknown) => String(item || "")).filter(Boolean).slice(0, 5) : [];
      if (!images.length) return res.status(400).json({ error: "bad_request", message: "Upload at least one image." });

      const uploads = await Promise.all(images.map((image) => uploadImageValue(image, cleanPurpose(req.body?.purpose))));
      if (uploads.some((upload) => !upload)) return res.status(400).json({ error: "bad_request", message: "Upload valid image files." });

      return res.status(201).json({ urls: uploads.map((upload) => upload!.url), uploads });
    } catch (err: any) {
      if (err?.statusCode === 413) return res.status(413).json({ error: "payload_too_large", message: err.message });
      console.error("Image upload failed:", err);
      return res.status(500).json({ error: "upload_failed", message: "Image upload failed." });
    }
  });
}
