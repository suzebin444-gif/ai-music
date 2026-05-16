"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  Music2,
  Search,
} from "lucide-react";

import { SectionWrapper } from "@/components/section-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrackActionButtons } from "@/components/track-action-buttons";
import type { SpotifyTrackResult } from "@/lib/spotify-types";
import { spotifyResultToPlayable } from "@/lib/track-utils";

const MotionDiv = motion.div;

const SCENE_PRESETS = [
  "深夜学习",
  "咖啡工作",
  "雨夜独处",
  "晨间专注",
  "睡前放松",
  "赛博都市",
] as const;

function TrackCard({
  track,
  index,
}: {
  track: SpotifyTrackResult;
  index: number;
}) {
  const playable = spotifyResultToPlayable(track);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card neon-border group overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={track.coverUrl}
          alt={`${track.name} 封面`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        <TrackActionButtons track={playable} />
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          aria-label="在新窗口打开"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold">{track.name}</h3>
        <p className="mt-0.5 truncate text-sm text-white/50">{track.artist}</p>
      </div>
    </MotionDiv>
  );
}

export function SpotifySearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrackResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<"spotify" | "itunes" | null>(null);

  const handleSearch = async (value?: string) => {
    const q = (value ?? query).trim();
    if (!q) return;

    setQuery(q);
    setLoading(true);
    setError(null);
    setWarning(null);
    setSource(null);
    setSearched(false);

    try {
      const res = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = (await res.json()) as {
        tracks?: SpotifyTrackResult[];
        searchQuery?: string;
        error?: string;
        warning?: string;
        source?: "spotify" | "itunes";
      };

      if (!res.ok) {
        setError(data.error ?? "搜索失败，请稍后重试");
        setTracks([]);
        return;
      }

      setTracks(data.tracks ?? []);
      setSearchQuery(data.searchQuery ?? null);
      setWarning(data.warning ?? null);
      setSource(data.source ?? null);
      setSearched(true);
    } catch {
      setError("网络错误，请检查连接后重试");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionWrapper
      id="spotify"
      className="mx-auto max-w-6xl px-4 py-24 md:px-6"
    >
      <div className="mb-12 text-center">
        <Badge variant="neon" className="mb-4">
          <Music2 className="mr-1 h-3 w-3" />
          Spotify · LoFi
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          场景化 LoFi 搜索
        </h2>
        <p className="mt-3 text-white/50">
          输入场景如「深夜学习」，从 Spotify 实时匹配 LoFi 曲目
        </p>
      </div>

      <div className="glass-panel neon-glow mx-auto max-w-2xl rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="例如：深夜学习"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            搜索 LoFi
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SCENE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSearch(preset)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-white"
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
      </div>

      <AnimatePresence mode="wait">
        {searched && tracks.length > 0 && (
          <MotionDiv
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-12"
          >
            {searchQuery && (
              <p className="mb-2 text-center text-sm text-white/40">
                搜索词：
                <span className="text-cyan-400/90"> {searchQuery}</span>
                {source === "itunes" && (
                  <span className="text-white/30"> · via Apple Music</span>
                )}
              </p>
            )}
            {warning && (
              <p className="mb-6 text-center text-xs text-amber-400/90">
                {warning}
              </p>
            )}
            {searchQuery && !warning && <div className="mb-4" />}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {tracks.map((track, i) => (
                <TrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          </MotionDiv>
        )}

        {searched && tracks.length === 0 && !error && (
          <MotionDiv
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center text-white/40"
          >
            未找到相关曲目，请换个关键词试试
          </MotionDiv>
        )}

        {!searched && !loading && !error && (
          <MotionDiv
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel mt-12 flex flex-col items-center justify-center rounded-2xl border-dashed py-16"
          >
            <Music2 className="mb-4 h-12 w-12 text-white/20" />
            <p className="text-white/40">输入场景后，将展示 Spotify LoFi 曲目</p>
          </MotionDiv>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
