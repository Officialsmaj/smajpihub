import { axiosClient } from "./axiosClient";

const isInlineImage = (value: string) => value.startsWith("data:image/");

export const uploadImage = async (image: string, purpose: string) => {
  if (!image || !isInlineImage(image)) return image;
  const { data } = await axiosClient.post<{ url: string }>("/uploads/image", { image, purpose });
  return data.url;
};

export const uploadImages = async (images: string[], purpose: string) => {
  const cleanImages = images.filter(Boolean).slice(0, 5);
  return Promise.all(cleanImages.map((image) => uploadImage(image, purpose)));
};
