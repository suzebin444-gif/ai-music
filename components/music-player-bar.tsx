"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Heart, Pause, Play, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/favorites-provider";
import { usePlayer } from "@/contexts/player-provider";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    error,
    togglePlay,
    clearError,
    playTrack,
  } = usePlayer();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <>
      <AnimatePresence>
        {error && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-[60] max-w-md -translate-x-1/2 px-4"
          >
            <div className="glass-panel flex items-center gap-3 rounded-xl border border-amber-400/30 px-4 py-3 text-sm text-amber-100">
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="text-white/60 hover:text-white"
                aria-label="关闭提示"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFavorites && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFavorites(false)}
          >
            <MotionDiv
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-hidden rounded-t-3xl border-t border-white/10 bg-[#0a0a12]/95 backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto max-w-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">我的收藏</h3>
                  <button
                    type="button"
                    onClick={() => setShowFavorites(false)}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {favorites.length === 0 ? (
                  <p className="py-8 text-center text-sm text-white/40">
                    还没有收藏，点击曲目旁的爱心即可添加
                  </p>
                ) : (
                  <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    {favorites.map((track) => (
                      <li
                        key={track.id}
                        className="glass-card flex items-center gap-3 rounded-xl p-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          {track.coverUrl ? (
                            <Image
                              src={track.coverUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div
                              className={cn(
                                "h-full w-full bg-gradient-to-br",
                                track.gradient ?? "from-violet-600 to-cyan-600"
                              )}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{track.title}</p>
                          <p className="truncate text-xs text-white/50">{track.artist}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => playTrack(track)}
                          className="rounded-full p-2 text-violet-300 hover:bg-white/10"
                          aria-label="播放"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(track)}
                          className="rounded-full p-2 text-rose-300 hover:bg-white/10"
                          aria-label="取消收藏"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0a12]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
            {currentTrack?.coverUrl ? (
              <Image
                src={currentTrack.coverUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center bg-gradient-to-br text-xs font-bold text-white/80",
                  currentTrack?.gradient ?? "from-violet-600 to-cyan-600"
                )}
              >
                {currentTrack ? "♪" : "—"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {currentTrack?.title ?? "选择一首曲目开始试听"}
            </p>
            <p className="truncate text-xs text-white/50">
              {currentTrack?.artist ?? "支持精选曲库、搜索与推荐结果"}
            </p>
            {currentTrack && (
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            {currentTrack && duration > 0 && (
              <p className="mt-0.5 text-[10px] text-white/35">
                {formatTime(progress)} / {formatTime(duration)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFavorites(true)}
              className="relative"
              aria-label="我的收藏"
            >
              <Heart className="h-4 w-4" />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold">
                  {favorites.length > 9 ? "9+" : favorites.length}
                </span>
              )}
            </Button>

            {currentTrack?.externalUrl && (
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={currentTrack.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="在外部打开"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            <Button
              variant="default"
              size="icon"
              disabled={!currentTrack}
              onClick={togglePlay}
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </Button>

            {currentTrack && isFavorite(currentTrack.id) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void toggleFavorite(currentTrack)}
                aria-label="取消收藏当前曲目"
              >
                <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
