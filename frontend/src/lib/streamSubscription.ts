import { axiosClient } from "./axiosClient";

export type StreamPlanId = "free" | "plus" | "family";

export type StreamPlan = {
  id: StreamPlanId;
  name: string;
  priceUsd: number;
  pricePi: number;
  piRateUsed: number;
  features: string[];
};

export type StreamSubscription = {
  plan: StreamPlanId;
  status: "active" | "expired" | "cancelled";
  startedAt: string | null;
  expiresAt: string | null;
  priceUsd: number;
  pricePi: number;
  piRateUsed: number;
};

export type StreamSubscriptionResponse = {
  plans: StreamPlan[];
  subscription: StreamSubscription;
};

export const getStreamSubscription = async () =>
  (await axiosClient.get<StreamSubscriptionResponse>("/stream/subscription")).data;

export const startStreamSubscriptionCheckout = async (plan: StreamPlanId) =>
  (await axiosClient.post<{ subscription: StreamSubscription; message: string }>("/stream/subscription/checkout", { plan })).data;

export const cancelStreamSubscription = async () =>
  (await axiosClient.post<{ subscription: StreamSubscription; message: string }>("/stream/subscription/cancel")).data;
