import { NextResponse } from "next/server";

import { analyzeMoodWithDeepseek } from "@/lib/deepseek";
import {
  analyzeMood,
  generateMoodCopy,
  getRecommendations,
} from "@/lib/music-data";
import { saveMoodHistoryEntry } from "@/lib/mood-history-store";
import { getOrCreateSessionId } from "@/lib/session";
import { enrichTracksWithStreaming } from "@/lib/track-resolver";
import { recordMoodAnalysis } from "@/lib/stats-store";

async function persistMoodResult(
  sessionId: string,
  moodInput: string,
  result: {
    analysis: { label: string; tags: string[]; energy: number; valence: number };
    copy: string;
    recommendations: Awaited<ReturnType<typeof enrichTracksWithStreaming>>;
    source: "deepseek" | "fallback";
  }
) {
  await saveMoodHistoryEntry(sessionId, {
    moodInput,
    analysis: result.analysis,
    copy: result.copy,
    recommendations: result.recommendations,
    source: result.source,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { mood?: string };
    const mood = body.mood?.trim();

    if (!mood || mood.length < 2) {
      return NextResponse.json(
        { error: "请至少输入 2 个字符描述你的情绪" },
        { status: 400 }
      );
    }

    if (mood.length > 500) {
      return NextResponse.json(
        { error: "情绪描述过长，请控制在 500 字以内" },
        { status: 400 }
      );
    }

    const { sessionId } = await getOrCreateSessionId();

    try {
      const result = await analyzeMoodWithDeepseek(mood);
      const recommendations = await enrichTracksWithStreaming(
        result.recommendations
      );
      await recordMoodAnalysis();
      await persistMoodResult(sessionId, mood, {
        analysis: result.analysis,
        copy: result.copy,
        recommendations,
        source: "deepseek",
      });

      return NextResponse.json({
        ...result,
        recommendations,
        source: "deepseek",
        catalog: "华语曲库 · 网易云/QQ音乐风格",
        streaming: process.env.NETEASE_API_URL
          ? "netease-api+itunes"
          : "itunes+search-links",
      });
    } catch (apiError) {
      console.error("[mood] DeepSeek failed, using fallback:", apiError);

      const analysis = analyzeMood(mood);
      const raw = getRecommendations(mood);
      const recommendations = await enrichTracksWithStreaming(raw);
      const copy = generateMoodCopy(mood, analysis.label, recommendations);
      await recordMoodAnalysis();
      await persistMoodResult(sessionId, mood, {
        analysis,
        copy,
        recommendations,
        source: "fallback",
      });

      return NextResponse.json({
        analysis,
        recommendations,
        copy,
        source: "fallback",
        warning: "AI 服务暂时不可用，已使用本地推荐",
        streaming: process.env.NETEASE_API_URL
          ? "netease-api+itunes"
          : "itunes+search-links",
      });
    }
  } catch {
    return NextResponse.json({ error: "请求处理失败" }, { status: 500 });
  }
}
