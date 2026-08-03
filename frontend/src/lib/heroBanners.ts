import { axiosClient } from "./axiosClient";

export type HeroBanner = {
  _id: string;
  placement: "dashboard" | "store";
  image: string;
  title: string;
  subtitle: string;
  search: string;
  active: boolean;
  order: number;
};

export const getHeroBanners = async (placement: HeroBanner["placement"]) => {
  const { data } = await axiosClient.get<{ banners: HeroBanner[] }>("/hero-banners", { params: { placement } });
  return data.banners;
};
