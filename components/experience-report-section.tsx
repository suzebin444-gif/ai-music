"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Loader2,
  Presentation,
  Sparkles,
} from "lucide-react";

import { SectionWrapper } from "@/components/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceReport } from "@/lib/experience-report-types";
import { exportExperienceReportPptx } from "@/lib/export-experience-pptx";

const MotionDiv = motion.div;
const PREVIEW_ID = "experience-report-preview";

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <MotionDiv
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center"
    >
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/45">{label}</p>
    </MotionDiv>
  );
}

function ReportPreview({ report }: { report: ExperienceReport }) {
  const { listeningProfile: p } = report;

  return (
    <div
      id={PREVIEW_ID}
      className="rounded-2xl border border-violet-500/20 bg-[#080810] p-6 md:p-8 text-[#f4f4f8]"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-semibold">
            SQ<span className="text-[#a78bfa]">MUSIC</span> 体验报告
          </h3>
          <p className="mt-1 text-xs text-white/40">
            {new Date(report.generatedAt).toLocaleString("zh-CN")}
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          个人数据
        </Badge>
      </div>

      {report.summary && (
        <div className="mb-6">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-[#c4b5fd]">
            <Sparkles className="h-4 w-4" />
            AI 体验摘要
          </h4>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
            {report.summary}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#67e8f9]">
          <BarChart3 className="h-4 w-4" />
          听歌喜好
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="收藏曲目" value={p.favoriteCount} />
          <StatChip label="情绪分析" value={p.moodSessionCount} />
          <StatChip
            label="平均能量"
            value={p.avgEnergy ?? "—"}
          />
          <StatChip
            label="情感倾向"
            value={p.avgValence ?? "—"}
          />
        </div>
        <div className="mt-4 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
          <p>
            <span className="text-white/40">偏好分类：</span>
            {p.topCategories.length
              ? p.topCategories.map((c) => c.name).join("、")
              : "暂无"}
          </p>
          <p>
            <span className="text-white/40">偏好风格：</span>
            {p.topGenres.length
              ? p.topGenres.map((g) => g.name).join("、")
              : "暂无"}
          </p>
          <p>
            <span className="text-white/40">情绪标签：</span>
            {p.topMoods.length
              ? p.topMoods.map((m) => m.name).join("、")
              : "暂无"}
          </p>
        </div>
      </div>

      {report.favorites.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-white/80">收藏曲目</h4>
          <ul className="space-y-1.5 text-sm text-white/65">
            {report.favorites.slice(0, 8).map((t) => (
              <li key={t.id}>
                {t.title}
                <span className="text-white/35"> — {t.artist}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.moodEntries.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-white/80">
            AI 情绪分析记录
          </h4>
          <ul className="space-y-3 text-sm">
            {report.moodEntries.slice(0, 4).map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-white/8 bg-white/3 p-3"
              >
                <p className="text-white/80">
                  「{e.moodInput}」→ {e.analysis.label}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-white/45">
                  {e.copy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(report.reviews.length > 0 || report.feedbackNote) && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-white/80">
            评价与反馈
          </h4>
          {report.reviews.map((r) => (
            <p key={r.id} className="mb-2 text-sm text-white/65">
              ★{r.rating} {r.name}：{r.content}
            </p>
          ))}
          {report.feedbackNote && (
            <p className="text-sm text-white/65">
              <span className="text-white/40">补充反馈：</span>
              {report.feedbackNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ExperienceReportSection() {
  const [report, setReport] = useState<ExperienceReport | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/experience-report");
      const data = (await res.json()) as {
        report?: ExperienceReport;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "加载失败");
      setReport(data.report ?? null);
      setFeedback(data.report?.feedbackNote ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载报告失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const handleSaveFeedback = async () => {
    setSavingFeedback(true);
    setError(null);
    try {
      const res = await fetch("/api/experience-report/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: feedback }),
      });
      const data = (await res.json()) as { note?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      setSuccess("反馈已保存，生成报告时将一并纳入");
      if (report) {
        setReport({ ...report, feedbackNote: data.note ?? feedback });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存反馈失败");
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/experience-report", { method: "POST" });
      const data = (await res.json()) as {
        report?: ExperienceReport;
        error?: string;
        ai?: { provider?: string; model?: string };
      };
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setReport(data.report ?? null);
      const modelHint = data.ai?.model ? `（${data.ai.model}）` : "";
      setSuccess(`AI 体验报告已生成${modelHint}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成报告失败");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPptx = async () => {
    if (!report) return;
    if (!report.summary) {
      setError("请先生成 AI 报告后再导出 PPT");
      return;
    }
    setExportingPptx(true);
    setError(null);
    try {
      await exportExperienceReportPptx(report);
      setSuccess("PPT 已下载");
    } catch (e) {
      setError(e instanceof Error ? e.message : "PPT 导出失败");
    } finally {
      setExportingPptx(false);
    }
  };

  const hasData =
    report &&
    (report.listeningProfile.favoriteCount > 0 ||
      report.moodEntries.length > 0 ||
      report.reviews.length > 0 ||
      feedback.trim().length > 0);

  return (
    <SectionWrapper
      id="report"
      className="relative px-4 py-24 md:px-6 md:py-32"
    >
      <div className="mx-auto max-w-4xl">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <Badge variant="default" className="mb-4">
            体验报告
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            你的<span className="gradient-text">音乐体验</span>档案
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 md:text-base">
            汇总 AI 情绪分析、收藏偏好与评价反馈，一键生成专属报告并导出 PPT。
          </p>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card neon-border mb-8 rounded-2xl p-6"
        >
          <label className="mb-2 block text-sm font-medium text-white/70">
            补充反馈意见（可选，将写入报告）
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="例如：希望增加更多 LoFi 场景、播放器体验很好……"
            rows={3}
            className="mb-3 resize-none"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={savingFeedback}
            onClick={() => void handleSaveFeedback()}
          >
            {savingFeedback ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            保存反馈
          </Button>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            type="button"
            size="lg"
            disabled={generating || loading || !hasData}
            onClick={() => void handleGenerate()}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            生成 AI 体验报告
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={exportingPptx || !report?.summary}
            onClick={() => void handleExportPptx()}
            className="gap-2"
          >
            {exportingPptx ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Presentation className="h-4 w-4" />
            )}
            导出 PPT
          </Button>
        </MotionDiv>

        {!hasData && !loading && (
          <p className="mb-6 text-center text-sm text-white/45">
            暂无数据：请先使用情绪推荐、收藏歌曲或提交评价后再生成报告。
          </p>
        )}

        {error && (
          <p className="mb-4 text-center text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-center text-sm text-emerald-400">{success}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : report ? (
          <ReportPreview report={report} />
        ) : null}
      </div>
    </SectionWrapper>
  );
}
