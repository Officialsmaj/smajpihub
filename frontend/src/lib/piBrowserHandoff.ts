export const PI_BROWSER_HANDOFF_EVENT = "smaj:pi-browser-handoff";

export type PiBrowserHandoffDetail = {
  reason?: string;
  path?: string;
};

export const requestPiBrowserHandoff = (reason = "Continue with Pi", path?: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PiBrowserHandoffDetail>(PI_BROWSER_HANDOFF_EVENT, {
      detail: {
        reason,
        path: path || `${window.location.pathname}${window.location.search}${window.location.hash}`,
      },
    })
  );
};

export const hasPiBrowserCapabilities = () => typeof window !== "undefined" && Boolean(window.Pi?.authenticate);
