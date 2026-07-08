import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_STORAGE_PREFIX = "smaj_scroll:";

const getScrollKey = (pathname: string, search: string) => `${SCROLL_STORAGE_PREFIX}${pathname}${search}`;

const isReloadNavigation = () => {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return navigation?.type === "reload";
};

const useRouteScrollTop = () => {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const scrollKey = getScrollKey(pathname, search);
    const saveScroll = () => {
      try {
        window.sessionStorage.setItem(scrollKey, String(window.scrollY));
      } catch {
        // Ignore storage failures in constrained browsers.
      }
    };

    window.addEventListener("pagehide", saveScroll);
    window.addEventListener("beforeunload", saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener("pagehide", saveScroll);
      window.removeEventListener("beforeunload", saveScroll);
    };
  }, [pathname, search]);

  useEffect(() => {
    const scrollKey = getScrollKey(pathname, search);
    if (hash) {
      window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }

    const shouldRestore = navigationType === "POP" || isReloadNavigation();
    if (shouldRestore) {
      const stored = Number(window.sessionStorage.getItem(scrollKey) || "0");
      window.setTimeout(() => window.scrollTo({ top: Number.isFinite(stored) ? stored : 0, left: 0, behavior: "auto" }), 0);
      return;
    }

    window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
  }, [pathname, search, hash, navigationType]);
};

export default useRouteScrollTop;
