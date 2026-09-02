import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { PushNotifications } from "@capacitor/push-notifications";

const NativeRuntimeBridge = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    document.documentElement.dataset.nativeApp = Capacitor.getPlatform();
    let active = true;
    const cleanups: Array<() => Promise<void>> = [];

    const updateNetwork = (connected: boolean, connectionType: string) => {
      if (!active) return;
      document.documentElement.classList.toggle("smaj-offline", !connected);
      window.dispatchEvent(new CustomEvent("smaj:native-network", {
        detail: { connected, connectionType },
      }));
    };

    void Network.getStatus().then(status => updateNetwork(status.connected, status.connectionType));
    void Network.addListener("networkStatusChange", status =>
      updateNetwork(status.connected, status.connectionType)
    ).then(handle => cleanups.push(() => handle.remove()));

    void PushNotifications.addListener("pushNotificationReceived", notification => {
      window.dispatchEvent(new CustomEvent("smaj:native-push", { detail: notification }));
    }).then(handle => cleanups.push(() => handle.remove()));

    void PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
      const path = String(notification.data?.path || notification.data?.url || "");
      if (path.startsWith("/") && !path.startsWith("//")) {
        window.history.pushState(window.history.state, "", path);
        window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
      }
    }).then(handle => cleanups.push(() => handle.remove()));

    return () => {
      active = false;
      delete document.documentElement.dataset.nativeApp;
      void Promise.all(cleanups.map(cleanup => cleanup()));
    };
  }, []);

  return null;
};

export default NativeRuntimeBridge;
