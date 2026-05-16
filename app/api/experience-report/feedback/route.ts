import { NextResponse } from "next/server";

import { setFeedbackNote } from "@/lib/report-feedback-store";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { note?: string };
    const note = body.note ?? "";

    if (note.length > 800) {
      return NextResponse.json(
        { error: "反馈内容不超过 800 字" },
        { status: 400 }
      );
    }

    const { sessionId } = await getOrCreateSessionId();
    const saved = await setFeedbackNote(sessionId, note);
    return NextResponse.json({ note: saved });
  } catch (error) {
    console.error("[experience-report/feedback]", error);
    return NextResponse.json({ error: "保存反馈失败" }, { status: 500 });
  }
}
