import { NextResponse } from "next/server";

import { buildExperienceReport } from "@/lib/experience-report-builder";
import { generateReportSummary } from "@/lib/experience-report-ai";
import { getOrCreateSessionId } from "@/lib/session";

export async function GET() {
  try {
    const { sessionId } = await getOrCreateSessionId();
    const report = await buildExperienceReport(sessionId, null);
    return NextResponse.json({ report });
  } catch (error) {
    console.error("[experience-report] GET", error);
    return NextResponse.json({ error: "加载报告数据失败" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { sessionId } = await getOrCreateSessionId();
    const base = await buildExperienceReport(sessionId, null);

    if (
      base.listeningProfile.favoriteCount === 0 &&
      base.moodEntries.length === 0 &&
      base.reviews.length === 0 &&
      !base.feedbackNote.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "暂无足够数据生成报告。请先体验情绪推荐、收藏歌曲或提交评价。",
        },
        { status: 400 }
      );
    }

    const { summary, model } = await generateReportSummary(base);
    const report = await buildExperienceReport(sessionId, summary);

    return NextResponse.json({
      report,
      ai: { provider: "deepseek", model },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成报告失败";

    if (message.includes("DEEPSEEK_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "未配置 DeepSeek API。请在 .env.local 中设置 DEEPSEEK_API_KEY 与 DEEPSEEK_MODEL。",
        },
        { status: 503 }
      );
    }

    if (message.includes("DeepSeek")) {
      console.error("[experience-report] DeepSeek:", message);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    console.error("[experience-report] POST", error);
    return NextResponse.json({ error: "生成报告失败" }, { status: 500 });
  }
}
