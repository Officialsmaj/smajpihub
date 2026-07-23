import { useCallback, useEffect, useState } from "react";
import { fallbackSportsCatalog } from "../content/sportsData";
import { getSportsCatalog } from "../lib/sportsApi";
import type { SportsCatalog } from "../types/sports";

const FAVORITES_KEY = "smaj_sports_favorite_teams";

const readFavorites = () => {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return new Set(Array.isArray(value) ? value.filter(item => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
};

const useSportsCatalog = () => {
  const [catalog, setCatalog] = useState<SportsCatalog>(fallbackSportsCatalog);
  const [favorites, setFavorites] = useState<Set<string>>(readFavorites);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const next = await getSportsCatalog(signal);
      setCatalog(next);
      setUsingFallback(false);
      setLastUpdated(new Date(next.meta?.updatedAt || Date.now()));
    } catch (error) {
      if (signal?.aborted) return;
      setUsingFallback(true);
      setCatalog(current => (current.matches.length ? current : fallbackSportsCatalog));
      setLastUpdated(current => current || new Date());
      if (import.meta.env.DEV) console.warn("Sports API unavailable; using cached demo data.", error);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const interval = window.setInterval(
      () => void refresh(controller.signal),
      Math.max(30, catalog.meta?.refreshAfterSeconds || 45) * 1000
    );
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [catalog.meta?.refreshAfterSeconds, refresh]);

  const toggleFavorite = useCallback((teamId: string) => {
    setFavorites(current => {
      const next = new Set(current);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { catalog, favorites, loading, usingFallback, lastUpdated, refresh, toggleFavorite };
};

export default useSportsCatalog;
