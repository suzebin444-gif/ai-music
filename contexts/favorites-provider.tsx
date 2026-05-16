"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { PlayableTrack } from "@/lib/player-types";

type FavoritesContextValue = {
  favorites: PlayableTrack[];
  loading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (track: PlayableTrack) => Promise<void>;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<PlayableTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = (await res.json()) as { favorites?: PlayableTrack[] };
      setFavorites(data.favorites ?? []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((t) => t.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (track: PlayableTrack) => {
      const exists = favorites.some((t) => t.id === track.id);

      if (exists) {
        const res = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: track.id }),
        });
        const data = (await res.json()) as { favorites?: PlayableTrack[] };
        if (res.ok) setFavorites(data.favorites ?? []);
        return;
      }

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });
      const data = (await res.json()) as { favorites?: PlayableTrack[] };
      if (res.ok) setFavorites(data.favorites ?? []);
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, isFavorite, toggleFavorite, refresh }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
