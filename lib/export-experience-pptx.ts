import type { ExperienceReport } from "@/lib/experience-report-types";

function topList(
  items: Array<{ name: string; count: number }>,
  empty = "暂无"
): string {
  if (!items.length) return empty;
  return items.map((i) => `${i.name}（${i.count}）`).join("、");
}

export async function exportExperienceReportPptx(
  report: ExperienceReport,
  filename = "sqmusic-experience-report.pptx"
): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.author = "SQMUSIC";
  pptx.title = "音乐体验报告";

  const dateStr = new Date(report.generatedAt).toLocaleString("zh-CN");
  const { listeningProfile: p } = report;

  let slide = pptx.addSlide();
  slide.addText("SQMUSIC 音乐体验报告", {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 1,
    fontSize: 32,
    bold: true,
    color: "7030A0",
  });
  slide.addText(`生成时间：${dateStr}`, {
    x: 0.5,
    y: 2.4,
    w: 9,
    fontSize: 14,
    color: "666666",
  });

  if (report.summary) {
    slide = pptx.addSlide();
    slide.addText("AI 体验摘要", {
      x: 0.5,
      y: 0.4,
      w: 9,
      fontSize: 24,
      bold: true,
      color: "7030A0",
    });
    slide.addText(report.summary, {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 5.5,
      fontSize: 13,
      valign: "top",
      color: "333333",
    });
  }

  slide = pptx.addSlide();
  slide.addText("听歌喜好画像", {
    x: 0.5,
    y: 0.4,
    w: 9,
    fontSize: 24,
    bold: true,
    color: "7030A0",
  });
  const profileLines = [
    `收藏曲目：${p.favoriteCount} 首`,
    `情绪分析：${p.moodSessionCount} 次`,
    p.avgEnergy != null ? `平均能量指数：${p.avgEnergy}` : null,
    p.avgValence != null ? `平均情感倾向：${p.avgValence}` : null,
    `偏好分类：${topList(p.topCategories)}`,
    `偏好风格：${topList(p.topGenres)}`,
    `情绪标签：${topList(p.topMoods)}`,
  ]
    .filter(Boolean)
    .join("\n");
  slide.addText(profileLines, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 5,
    fontSize: 14,
    valign: "top",
  });

  if (report.favorites.length) {
    slide = pptx.addSlide();
    slide.addText("收藏曲目", {
      x: 0.5,
      y: 0.4,
      w: 9,
      fontSize: 24,
      bold: true,
      color: "7030A0",
    });
    const favLines = report.favorites
      .slice(0, 12)
      .map((t, i) => `${i + 1}. ${t.title} — ${t.artist}`)
      .join("\n");
    slide.addText(favLines, {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 5.5,
      fontSize: 13,
      valign: "top",
    });
  }

  if (report.moodEntries.length) {
    slide = pptx.addSlide();
    slide.addText("AI 情绪分析记录", {
      x: 0.5,
      y: 0.4,
      w: 9,
      fontSize: 24,
      bold: true,
      color: "7030A0",
    });
    const moodLines = report.moodEntries
      .slice(0, 5)
      .map(
        (e, i) =>
          `${i + 1}. 「${e.moodInput}」→ ${e.analysis.label}（能量 ${e.analysis.energy}）`
      )
      .join("\n");
    slide.addText(moodLines, {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 5.5,
      fontSize: 12,
      valign: "top",
    });
  }

  if (report.reviews.length || report.feedbackNote) {
    slide = pptx.addSlide();
    slide.addText("用户评价与反馈", {
      x: 0.5,
      y: 0.4,
      w: 9,
      fontSize: 24,
      bold: true,
      color: "7030A0",
    });
    const reviewLines = report.reviews
      .map((r) => `★${r.rating} ${r.name}：${r.content}`)
      .join("\n");
    const feedback = report.feedbackNote
      ? `补充反馈：${report.feedbackNote}`
      : "";
    slide.addText([reviewLines, feedback].filter(Boolean).join("\n\n"), {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 5.5,
      fontSize: 12,
      valign: "top",
    });
  }

  await pptx.writeFile({ fileName: filename });
}
