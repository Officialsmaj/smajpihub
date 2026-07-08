import { useEffect, useRef, useState } from "react";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
};

const PULL_THRESHOLD = 72;
const MAX_PULL = 96;
const MIN_VISIBLE_REFRESH_MS = 350;

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
};

const isMobilePullDevice = () =>
  window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

const PullToRefresh = ({ onRefresh, disabled = false }: PullToRefreshProps) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const refreshRef = useRef(onRefresh);

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    if (disabled || typeof window === "undefined" || !isMobilePullDevice()) return;

    const resetPull = () => {
      pullingRef.current = false;
      pullRef.current = 0;
      setPull(0);
    };

    const touchStart = (event: TouchEvent) => {
      if (refreshingRef.current || event.touches.length !== 1 || isInteractiveTarget(event.target)) return;
      startYRef.current = event.touches[0].clientY;
      pullingRef.current = false;
      pullRef.current = 0;
    };

    const touchMove = (event: TouchEvent) => {
      if (refreshingRef.current || event.touches.length !== 1 || window.scrollY > 0) return;
      const delta = event.touches[0].clientY - startYRef.current;
      if (delta <= 0) return;
      pullingRef.current = true;
      const nextPull = Math.min(MAX_PULL, delta * 0.5);
      pullRef.current = nextPull;
      setPull(nextPull);
      event.preventDefault();
    };

    const touchEnd = () => {
      if (!pullingRef.current) return;
      const shouldRefresh = pullRef.current >= PULL_THRESHOLD;
      if (!shouldRefresh) {
        resetPull();
        return;
      }
      pullingRef.current = false;
      setPull(54);
      setRefreshing(true);
      refreshingRef.current = true;
      const startedAt = Date.now();
      Promise.resolve(refreshRef.current())
        .catch(() => undefined)
        .finally(() => {
          const remaining = MIN_VISIBLE_REFRESH_MS - (Date.now() - startedAt);
          window.setTimeout(() => {
            setRefreshing(false);
            refreshingRef.current = false;
            resetPull();
          }, Math.max(0, remaining));
        });
    };

    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("touchcancel", resetPull, { passive: true });
    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", resetPull);
    };
  }, [disabled]);

  if (!pull && !refreshing) return null;

  const progress = refreshing ? 1 : Math.min(1, pull / PULL_THRESHOLD);

  return (
    <div
      className={`mobile-pull-refresh ${refreshing ? "refreshing" : ""}`}
      style={{ transform: `translateY(${Math.max(0, pull - 44)}px)`, opacity: Math.max(0.35, progress) }}
      aria-hidden="true"
    >
      <span />
    </div>
  );
};

export default PullToRefresh;
