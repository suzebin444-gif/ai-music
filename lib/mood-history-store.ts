import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import type { MoodHistoryEntry } from "@/lib/experience-report-types";
import type { MoodAnalysis } from "@/lib/mood-types";
import type { Track } from "@/lib/music-data";

const FILE = "mood-history.json";
const MAX_PER_SESSION = 20;

type MoodHistoryData = {
  entries: MoodHistoryEntry[];
};

async function readAll(): Promise<MoodHistoryData> {
  return readJsonFile<MoodHistoryData>(FILE, { entries: [] });
}

export async function saveMoodHistoryEntry(
  sessionId: string,
  payload: {
    moodInput: string;
    analysis: MoodAnalysis;
    copy: string;
    recommendations: Track[];
    source: "deepseek" | "fallback";
  }
): Promise<void> {
  const data = await readAll();
  const entry: MoodHistoryEntry = {
    id: crypto.randomUUID(),
    sessionId,
    moodInput: payload.moodInput,
    analysis: payload.analysis,
    copy: payload.copy,
    recommendations: payload.recommendations.map((t) => ({
      title: t.title,
      artist: t.artist,
      match: t.match,
      category: t.category,
      genre: t.genre,
    })),
    source: payload.source,
    createdAt: new Date().toISOString(),
  };

  const others = data.entries.filter((e) => e.sessionId !== sessionId);
  const sessionEntries = data.entries
    .filter((e) => e.sessionId === sessionId)
    .concat(entry)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_PER_SESSION);

  await writeJsonFile(FILE, { entries: [...others, ...sessionEntries] });
}

export async function listMoodHistoryForSession(
  sessionId: string
): Promise<MoodHistoryEntry[]> {
  const data = await readAll();
  return data.entries
    .filter((e) => e.sessionId === sessionId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
