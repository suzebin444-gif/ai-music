import type { ExperienceReport } from "@/lib/experience-report-types";
import { deepseekChat, getDeepseekConfig } from "@/lib/deepseek-client";
import { readDeepseekErrorMessage } from "@/lib/deepseek-errors";

function formatReportContext(report: ExperienceReport): string {
  const { listeningProfile: p, moodEntries, favorites, reviews, feedbackNote } =
    report;

  return JSON.stringify(
    {
      收藏曲目数: p.favoriteCount,
      情绪分析次数: p.moodSessionCount,
      偏好分类: p.topCategories,
      偏好风格: p.topGenres,
      偏好情绪标签: p.topMoods,
      平均能量: p.avgEnergy,
      平均情感倾向: p.avgValence,
      收藏列表: favorites.slice(0, 12).map((t) => ({
        歌名: t.title,
        歌手: t.artist,
        分类: t.category,
      })),
      AI情绪记录: moodEntries.slice(0, 5).map((e) => ({
        输入: e.moodInput,
        标签: e.analysis.label,
        能量: e.analysis.energy,
        情感: e.analysis.valence,
        文案摘要: e.copy.slice(0, 120),
        推荐: e.recommendations.slice(0, 3).map((r) => r.title),
      })),
      用户评价: reviews.map((r) => ({
        评分: r.rating,
        内容: r.content,
      })),
      补充反馈: feedbackNote || "无",
    },
    null,
    2
  );
}

export async function generateReportSummary(
  report: ExperienceReport
): Promise<{ summary: string; model: string }> {
  const { model } = getDeepseekConfig();

  const response = await deepseekChat(
    [
      {
        role: "system",
        content: `你是 SQMUSIC 平台的体验分析师。根据用户在本站的行为数据，撰写一份中文「音乐体验报告」摘要（300–450 字）。

结构建议：
1. 整体聆听画像（1–2 句）
2. 情绪与 AI 推荐特点（结合情绪记录）
3. 收藏偏好与曲风倾向
4. 对平台体验的肯定与一条温和建议

语气：专业、温暖、第二人称「你」。不要编造数据中不存在的具体歌名（收藏与推荐列表除外）。`,
      },
      {
        role: "user",
        content: `请根据以下用户数据生成体验报告摘要：\n${formatReportContext(report)}`,
      },
    ],
    { temperature: 0.65, max_tokens: 800 }
  );

  if (!response.ok) {
    const detail = await readDeepseekErrorMessage(response);
    throw new Error(`DeepSeek 请求失败 (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("DeepSeek 返回内容为空");
  return { summary: text, model };
}
