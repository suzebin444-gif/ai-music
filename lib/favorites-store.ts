import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import {
  enrichPlayable,
  groupTracksByCategory,
  type CatalogSection,
} from "@/lib/track-catalog";
import type { PlayableTrack } from "@/lib/player-types";

type FavoritesData = {
  bySession: Record<string, PlayableTrack[]>;
};

const FILE = "favorites.json";

async function readAll(): Promise<FavoritesData> {
  return readJsonFile<FavoritesData>(FILE, { bySession: {} });
}

export async function getFavorites(sessionId: string): Promise<PlayableTrack[]> {
  const data = await readAll();
  return data.bySession[sessionId] ?? [];
}

export async function addFavorite(
  sessionId: string,
  track: PlayableTrack
): Promise<PlayableTrack[]> {
  const data = await readAll();
  const list = data.bySession[sessionId] ?? [];
  const enriched = enrichPlayable(track);

  if (list.some((t) => t.id === enriched.id)) {
    return list;
  }

  const next = [enriched, ...list].slice(0, 50);
  data.bySession[sessionId] = next;
  await writeJsonFile(FILE, data);
  return next;
}

export async function removeFavorite(
  sessionId: string,
  trackId: string
): Promise<PlayableTrack[]> {
  const data = await readAll();
  const list = data.bySession[sessionId] ?? [];
  const next = list.filter((t) => t.id !== trackId);
  data.bySession[sessionId] = next;
  await writeJsonFile(FILE, data);
  return next;
}

/** 汇总全站收藏，按分类聚合 */
export async function getFavoriteCatalogSections(): Promise<CatalogSection[]> {
  const data = await readAll();
  const countMap = new Map<
    string,
    { track: PlayableTrack; count: number }
  >();

  for (const list of Object.values(data.bySession)) {
    for (const raw of list) {
      const track = enrichPlayable(raw);
      const existing = countMap.get(track.id);
      if (existing) {
        existing.count += 1;
      } else {
        countMap.set(track.id, { track, count: 1 });
      }
    }
  }

  if (countMap.size === 0) return [];

  const tracks = [...countMap.values()].map(({ track, count }) => ({
    ...track,
    favoriteCount: count,
  }));

  return groupTracksByCategory(tracks);
}
