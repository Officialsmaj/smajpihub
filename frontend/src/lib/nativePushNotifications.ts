import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import { axiosClient } from "./axiosClient";
import { requestNativePushRegistration } from "./nativeCapabilities";

const TOKEN_KEY = "smaj_fcm_token";
const OPT_OUT_KEY = "smaj_push_opt_out";
let registrationPromise: Promise<string> | null = null;

export const supportsNativePushNotifications = () => Capacitor.getPlatform() === "android";

export const getNativePushState = async () => {
  if (!supportsNativePushNotifications()) return { supported: false, subscribed: false };
  const permission = await PushNotifications.checkPermissions();
  const { value: token } = await Preferences.get({ key: TOKEN_KEY });
  const { data } = await axiosClient.get<{ subscribed: boolean }>("/notifications/push/native/status");
  return { supported: true, subscribed: permission.receive === "granted" && Boolean(token) && data.subscribed };
};

export const enableNativePushNotifications = () => {
  if (registrationPromise) return registrationPromise;
  registrationPromise = (async () => {
    const token = await requestNativePushRegistration();
    const { data } = await axiosClient.post<{ configured: boolean }>("/notifications/push/native/register", { token, platform: "android" });
    if (!data.configured) throw new Error("Android notifications are not configured on the server yet.");
    await Preferences.set({ key: TOKEN_KEY, value: token });
    await Preferences.remove({ key: OPT_OUT_KEY });
    return token;
  })().finally(() => { registrationPromise = null; });
  return registrationPromise;
};

export const ensureNativePushNotificationsEnabled = async () => {
  if (!supportsNativePushNotifications()) return false;
  const { value: optedOut } = await Preferences.get({ key: OPT_OUT_KEY });
  if (optedOut === "true") return false;
  await enableNativePushNotifications();
  return true;
};

export const refreshNativePushRegistration = async () => {
  if (!supportsNativePushNotifications()) return;
  const { value: previousToken } = await Preferences.get({ key: TOKEN_KEY });
  if (!previousToken) return;
  const permission = await PushNotifications.checkPermissions();
  if (permission.receive !== "granted") return;
  const token = await requestNativePushRegistration();
  await axiosClient.post("/notifications/push/native/register", { token, platform: "android" });
  if (token !== previousToken) {
    await axiosClient.post("/notifications/push/native/unregister", { token: previousToken }).catch(() => undefined);
  }
  await Preferences.set({ key: TOKEN_KEY, value: token });
};

export const disableNativePushNotifications = async () => {
  const { value: token } = await Preferences.get({ key: TOKEN_KEY });
  if (token) await axiosClient.post("/notifications/push/native/unregister", { token }).catch(() => undefined);
  await Preferences.remove({ key: TOKEN_KEY });
  await Preferences.set({ key: OPT_OUT_KEY, value: "true" });
};

export const unregisterNativePushOnLogout = async () => {
  const { value: token } = await Preferences.get({ key: TOKEN_KEY });
  if (token) await axiosClient.post("/notifications/push/native/unregister", { token }).catch(() => undefined);
  await Preferences.remove({ key: TOKEN_KEY });
};