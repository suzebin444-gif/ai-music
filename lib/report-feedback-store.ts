import { readJsonFile, writeJsonFile } from "@/lib/json-store";

const FILE = "report-feedback.json";

type FeedbackData = {
  bySession: Record<string, { note: string; updatedAt: string }>;
};

async function readAll(): Promise<FeedbackData> {
  return readJsonFile<FeedbackData>(FILE, { bySession: {} });
}

export async function getFeedbackNote(sessionId: string): Promise<string> {
  const data = await readAll();
  return data.bySession[sessionId]?.note ?? "";
}

export async function setFeedbackNote(
  sessionId: string,
  note: string
): Promise<string> {
  const data = await readAll();
  data.bySession[sessionId] = {
    note: note.trim(),
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(FILE, data);
  return data.bySession[sessionId].note;
}
