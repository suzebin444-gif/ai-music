import type {
  ExperienceReport,
  ListeningProfile,
} from "@/lib/experience-report-types";
import { getFavorites } from "@/lib/favorites-store";
import { listMoodHistoryForSession } from "@/lib/mood-history-store";
import { getFeedbackNote } from "@/lib/report-feedback-store";
import { listReviewsForSession } from "@/lib/reviews-store";
import type { PlayableTrack } from "@/lib/player-types";

function countTop(
  items: Array<string | undefined>,
  limit = 5
): Array<{ name: string; count: number }> {
  const map = new Map<string, number>();
  for (const raw of items) {
    const name = raw?.trim();
    if (!name) continue;
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function buildListeningProfile(
  favorites: PlayableTrack[],
  moodEntries: ExperienceReport["moodEntries"]
): ListeningProfile {
  const categories = favorites.map((t) => t.category);
  const genres = favorites.map((t) => t.genre);
  const moods = favorites.flatMap((t) => t.mood ?? []);

  const energies = moodEntries.map((e) => e.analysis.energy);
  const valences = moodEntries.map((e) => e.analysis.valence);

  const avg = (nums: number[]) =>
    nums.length
      ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
      : null;

  return {
    topCategories: countTop(categories),
    topGenres: countTop(genres),
    topMoods: countTop(moods),
    avgEnergy: avg(energies),
    avgValence: avg(valences),
    favoriteCount: favorites.length,
    moodSessionCount: moodEntries.length,
  };
}

export async function buildExperienceReport(
  sessionId: string,
  summary: string | null = null
): Promise<ExperienceReport> {
  const [favorites, moodEntries, reviews, feedbackNote] = await Promise.all([
    getFavorites(sessionId),
    listMoodHistoryForSession(sessionId),
    listReviewsForSession(sessionId),
    getFeedbackNote(sessionId),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    sessionId,
    summary,
    moodEntries,
    favorites,
    reviews,
    feedbackNote,
    listeningProfile: buildListeningProfile(favorites, moodEntries),
  };
}
