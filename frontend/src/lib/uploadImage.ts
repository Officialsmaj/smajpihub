import { axiosClient } from "./axiosClient";
import { isAxiosError } from "axios";

const isInlineImage = (value: string) => value.startsWith("data:image/");

export const uploadImage = async (image: string, purpose: string) => {
  if (!image || !isInlineImage(image)) return image;
  try {
    const { data } = await axiosClient.post<{ url: string }>("/uploads/image", { image, purpose });
    return data.url;
  } catch (err: unknown) {
    if (isAxiosError<{ message?: string }>(err)) {
      throw new Error(err.response?.data?.message || "Could not upload image. Try a smaller JPG, PNG, or WebP file.");
    }
    throw new Error("Could not upload image. Try a smaller JPG, PNG, or WebP file.");
  }
};

export const uploadImages = async (images: string[], purpose: string) => {
  const cleanImages = images.filter(Boolean).slice(0, 5);
  return Promise.all(cleanImages.map((image) => uploadImage(image, purpose)));
};
