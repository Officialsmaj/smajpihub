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
  router.post("/image", async (req: Request, res: Response) => {
    if (!req.session.currentUser) {
      return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
    }

    const image = String(req.body?.image || req.body?.dataUrl || "");
    const purpose = String(req.body?.purpose || "image").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) || "image";

    if (!isDataImage(image)) {
      return res.status(400).json({ error: "bad_request", message: "Upload a valid image file." });
    }

    if (image.length > 6_500_000) {
      return res.status(413).json({ error: "payload_too_large", message: "Image must be smaller than 5 MB." });
    }

    if (env.cloudinary_cloud_name && env.cloudinary_upload_preset) {
      try {
        const upload = await uploadToCloudinary(image, purpose);
        return res.status(201).json(upload);
      } catch (err) {
        console.error("Image upload failed:", err);
        return res.status(502).json({ error: "upload_failed", message: "Image storage is temporarily unavailable." });
      }
    }

    // Local development fallback. Production should configure Cloudinary so MongoDB stores compact URLs.
    return res.status(201).json({ url: image, storage: "inline-dev" });
  });
}
