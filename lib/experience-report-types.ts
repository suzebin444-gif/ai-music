import type { MoodAnalysis } from "@/lib/mood-types";
import type { PlayableTrack } from "@/lib/player-types";
import type { Review } from "@/lib/review-types";

export type MoodHistoryEntry = {
  id: string;
  sessionId: string;
  moodInput: string;
  analysis: MoodAnalysis;
  copy: string;
  recommendations: Array<{
    title: string;
    artist: string;
    match?: number;
    category?: string;
    genre?: string;
  }>;
  source: "deepseek" | "fallback";
  createdAt: string;
};

export type ListeningProfile = {
  topCategories: Array<{ name: string; count: number }>;
  topGenres: Array<{ name: string; count: number }>;
  topMoods: Array<{ name: string; count: number }>;
  avgEnergy: number | null;
  avgValence: number | null;
  favoriteCount: number;
  moodSessionCount: number;
};

export type ExperienceReport = {
  generatedAt: string;
  sessionId: string;
  summary: string | null;
  moodEntries: MoodHistoryEntry[];
  favorites: PlayableTrack[];
  reviews: Review[];
  feedbackNote: string;
  listeningProfile: ListeningProfile;
};
