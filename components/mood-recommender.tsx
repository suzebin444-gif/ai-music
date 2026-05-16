"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  ExternalLink,
  Loader2,
  Quote,
  Sparkles,
  Zap,
} from "lucide-react";
import { SectionWrapper } from "@/components/section-wrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrackActionButtons } from "@/components/track-action-buttons";
import { moodPresets, type Track } from "@/lib/music-data";
import { moodTrackToPlayable } from "@/lib/track-utils";
import type { MoodAnalysis } from "@/lib/mood-types";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

function EnergyBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-white/50">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
        />
      </div>
    </div>
  );
}

function StreamingLinks({ track }: { track: Track }) {
  const links = [
    { label: "网易云", href: track.neteaseUrl, color: "text-red-300" },
    { label: "QQ音乐", href: track.qqMusicUrl, color: "text-green-300" },
    { label: "Apple", href: track.appleMusicUrl, color: "text-white/60" },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] transition-colors hover:bg-white/10",
            link.color
          )}
        >
          {link.label}
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ))}
    </div>
  );
}

function RecommendationCard({ track, index }: { track: Track; index: number }) {
  const playable = moodTrackToPlayable(track);

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card neon-border flex gap-4 rounded-xl p-4"
    >
      <div
        className={cn(
          "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg",
          !track.coverUrl && `bg-gradient-to-br ${track.gradient}`
        )}
      >
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={`${track.title} 封面`}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <TrackActionButtons track={playable} variant="inline" className="scale-90" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{track.title}</p>
            <p className="truncate text-sm text-white/50">{track.artist}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-cyan-400">{track.match}%</p>
            <p className="text-xs text-white/40">匹配度</p>
          </div>
        </div>
        <StreamingLinks track={track} />
      </div>
    </MotionDiv>
  );
}

export function MoodRecommender() {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [copy, setCopy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<"deepseek" | "fallback" | null>(null);
  const [streamingNote, setStreamingNote] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    setAnalyzed(false);
    setError(null);
    setWarning(null);
    setSource(null);
    setCopy(null);
    setStreamingNote(null);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = (await res.json()) as {
        analysis?: MoodAnalysis;
        recommendations?: Track[];
        copy?: string;
        error?: string;
        warning?: string;
        source?: "deepseek" | "fallback";
        streaming?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "分析失败，请稍后重试");
        return;
      }
      if (!data.analysis || !data.recommendations || !data.copy) {
        setError("返回数据异常，请重试");
        return;
      }
      setAnalysis(data.analysis);
      setRecommendations(data.recommendations);
      setCopy(data.copy);
      setWarning(data.warning ?? null);
      setSource(data.source ?? null);
      setStreamingNote(
        data.streaming === "netease-api+itunes"
          ? "已匹配网易云试听 / Apple Music 预览"
          : "已匹配 Apple Music 试听，可跳转网易云 / QQ 音乐搜索"
      );
      setAnalyzed(true);
    } catch {
      setError("网络错误，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionWrapper id="mood" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <div className="mb-12 text-center">
          <Badge variant="default" className="mb-4">
            <Brain className="mr-1 h-3 w-3" />
            情绪输入
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            告诉 AI，你此刻的感受
          </h2>
          <p className="mt-3 text-white/50">
            由 DeepSeek 解析情绪，从华语曲库匹配，并解析网易云 / QQ 音乐 / Apple 播放链接
          </p>
        </div>
        <div className="glass-panel neon-glow-strong neon-border mx-auto max-w-2xl rounded-3xl p-6 md:p-8">
          <Textarea
            placeholder="例如：刚分手，深夜很难过，想听华语慢歌…"
            value={mood}
            onChange={(e) => {
              setMood(e.target.value);
              setAnalyzed(false);
              setError(null);
            }}
            className="min-h-[140px] text-base"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {moodPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setMood(preset);
                  setAnalyzed(false);
                  setError(null);
                }}
                className="preset-pill rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handleAnalyze}
            disabled={loading || !mood.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在解析情绪与播放链接…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                生成情绪推荐
              </>
            )}
          </Button>
        </div>
      </SectionWrapper>
      <SectionWrapper id="recommend" className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <AnimatePresence mode="wait">
          {analyzed && analysis && copy && (
            <MotionDiv
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">AI 推荐结果</h3>
                    <p className="text-sm text-white/50">
                      {source === "deepseek" ? "由 DeepSeek 生成" : "本地备用推荐"}
                      {streamingNote ? ` · ${streamingNote}` : ""}
                    </p>
                  </div>
                </div>
                {warning && (
                  <p className="text-xs text-amber-400/90">{warning}</p>
                )}
              </div>
              <MotionDiv
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel relative overflow-hidden rounded-2xl border border-violet-400/20 p-6 md:p-8 neon-glow"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
                    <Quote className="h-4 w-4" />
                    AI 推荐文案
                  </div>
                  <p className="text-base leading-relaxed text-white/80 md:text-lg">
                    {copy}
                  </p>
                </div>
              </MotionDiv>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-panel rounded-2xl p-6 neon-glow">
                  <p className="text-sm text-white/40">情绪分析</p>
                  <p className="mt-2 text-2xl font-semibold gradient-text">
                    {analysis.label}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-6 space-y-4">
                    <EnergyBar label="能量值 Energy" value={analysis.energy} />
                    <EnergyBar label="情感倾向 Valence" value={analysis.valence} />
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm text-white/40">推荐音乐</p>
                  <div className="space-y-3">
                    {recommendations.map((track, i) => (
                      <RecommendationCard key={track.id} track={track} index={i} />
                    ))}
                  </div>
                </div>
              </div>
            </MotionDiv>
          )}
          {!analyzed && !loading && !error && (
            <MotionDiv
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel flex flex-col items-center justify-center rounded-2xl border-dashed py-16"
            >
              <Brain className="mb-4 h-12 w-12 text-white/20" />
              <p className="text-white/40">
                输入情绪后，将呈现分析、华语推荐与播放链接
              </p>
            </MotionDiv>
          )}
        </AnimatePresence>
      </SectionWrapper>
    </>
  );
}
