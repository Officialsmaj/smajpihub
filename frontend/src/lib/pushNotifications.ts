import { axiosClient } from "./axiosClient";

const decodeKey = (value: string) => {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

export const supportsPushNotifications = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const getPushState = async () => {
  if (!supportsPushNotifications()) return { supported: false, subscribed: false, permission: "unsupported" };
  const subscription = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
  return { supported: true, subscribed: Boolean(subscription), permission: Notification.permission };
};

export const enablePushNotifications = async () => {
  if (!supportsPushNotifications()) throw new Error("Phone notifications are not supported by this browser.");
  if (await Notification.requestPermission() !== "granted") throw new Error("Notification permission was not granted.");
  const { data } = await axiosClient.get<{ configured: boolean; publicKey: string }>("/notifications/push/config");
  if (!data.configured || !data.publicKey) throw new Error("Phone notifications are not configured on the server yet.");
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(data.publicKey) });
  await axiosClient.post("/notifications/push/subscribe", { subscription: subscription.toJSON() });
};

export const disablePushNotifications = async () => {
  if (!supportsPushNotifications()) return;
  const subscription = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
  if (subscription) {
    await axiosClient.post("/notifications/push/unsubscribe", { endpoint: subscription.endpoint }).catch(() => undefined);
    await subscription.unsubscribe();
  }
};
