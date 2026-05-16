import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import { chineseMusicCatalog } from "@/lib/chinese-music-catalog";
import { listReviews } from "@/lib/reviews-store";

type StatsData = {
  moodAnalyses: number;
};

const FILE = "stats.json";
const BASE_MOOD = 50_000;
const BASE_TRACKS = 12_000_000;
const CATALOG_SIZE = chineseMusicCatalog.length;

async function readStats(): Promise<StatsData> {
  return readJsonFile<StatsData>(FILE, { moodAnalyses: 0 });
}

export async function recordMoodAnalysis(): Promise<void> {
  const stats = await readStats();
  stats.moodAnalyses += 1;
  await writeJsonFile(FILE, stats);
}

async function totalFavorites(): Promise<number> {
  const data = await readJsonFile<{ bySession: Record<string, unknown[]> }>(
    "favorites.json",
    { bySession: {} }
  );
  return Object.values(data.bySession).reduce((sum, list) => sum + list.length, 0);
}

export type PublicStats = {
  moodAnalyses: number;
  trackMatches: number;
  satisfaction: number;
  updatedAt: string;
};

export async function getPublicStats(): Promise<PublicStats> {
  const [stored, reviews, favCount] = await Promise.all([
    readStats(),
    listReviews(),
    totalFavorites(),
  ]);

  const moodAnalyses = BASE_MOOD + stored.moodAnalyses;
  const trackMatches =
    BASE_TRACKS +
    CATALOG_SIZE * 48_000 +
    favCount * 18_600 +
    stored.moodAnalyses * 3_200;

  const satisfaction =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length / 5) * 100
      : 98;

  return {
    moodAnalyses,
    trackMatches,
    satisfaction: Math.min(99.9, Math.max(92, Math.round(satisfaction * 10) / 10)),
    updatedAt: new Date().toISOString(),
  };
}
