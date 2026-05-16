import type { Track } from "@/lib/music-data";

export type MoodAnalysis = {
  label: string;
  tags: string[];
  energy: number;
  valence: number;
};

export type MoodRecommendResponse = {
  analysis: MoodAnalysis;
  recommendations: Track[];
  copy: string;
};

export type DeepseekMoodPayload = {
  label: string;
  tags: string[];
  energy: number;
  valence: number;
  copy: string;
  recommendations: Array<{
    trackId: string;
    match: number;
  }>;
};
