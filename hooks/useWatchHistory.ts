"use client";

import { useState, useEffect, useCallback } from "react";
import { Anime, Episode } from "@/lib/api/types";

export interface WatchHistoryItem {
  anime: Anime;
  episode: Episode;
  timestamp: number;
  duration: number;
  updatedAt: number;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("kumo-watch-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Defer state update to avoid "setState in effect" warning
        setTimeout(() => setHistory(parsed), 0);
      } catch (e) {
        console.error("Failed to load watch history", e);
      }
    }
  }, []);

  const saveProgress = useCallback((anime: Anime, episode: Episode, timestamp: number, duration: number) => {
    const newItem: WatchHistoryItem = {
      anime,
      episode,
      timestamp,
      duration,
      updatedAt: Date.now(),
    };
 
    setHistory((prev) => {
      // Remove existing entry for this anime to avoid duplicates
      const filtered = prev.filter((item) => item.anime.id !== anime.id);
      const updated = [newItem, ...filtered].slice(0, 20); // Keep last 20
      localStorage.setItem("kumo-watch-history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getProgress = useCallback((animeId: string) => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("kumo-watch-history") : null;
    if (!saved) return undefined;
    try {
        const history: WatchHistoryItem[] = JSON.parse(saved);
        return history.find((item) => item.anime.id === animeId);
    } catch {
        return undefined;
    }
  }, []);

  const removeFromHistory = useCallback((animeId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.anime.id !== animeId);
      localStorage.setItem("kumo-watch-history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("kumo-watch-history");
  }, []);

  return { history, saveProgress, getProgress, removeFromHistory, clearHistory };
}
