"use client";

import { Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayableTrack } from "@/lib/player-types";
import { useFavorites } from "@/contexts/favorites-provider";
import { usePlayer } from "@/contexts/player-provider";

type TrackActionButtonsProps = {
  track: PlayableTrack;
  variant?: "overlay" | "inline";
  className?: string;
};

export function TrackActionButtons({
  track,
  variant = "overlay",
  className,
}: TrackActionButtonsProps) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  const active = currentTrack?.id === track.id && isPlaying;
  const favorited = isFavorite(track.id);

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          type="button"
          onClick={() => playTrack(track)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200 transition-colors hover:bg-violet-500/35"
          aria-label={active ? "暂停" : "播放"}
        >
          <Play className={cn("h-4 w-4", active && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={() => void toggleFavorite(track)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            favorited
              ? "bg-rose-500/25 text-rose-300"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          )}
          aria-label={favorited ? "取消收藏" : "收藏"}
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => playTrack(track)}
        className={cn(
          "absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/80 to-cyan-500/80 opacity-0 shadow-[0_0_32px_rgba(139,92,246,0.5)] backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100",
          active && "opacity-100 scale-100",
          className
        )}
        aria-label={active ? "暂停" : "播放"}
      >
        <Play className={cn("h-6 w-6 fill-white text-white", active && "opacity-80")} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          void toggleFavorite(track);
        }}
        className={cn(
          "absolute right-3 top-3 rounded-full p-2 backdrop-blur-sm transition-all",
          favorited
            ? "bg-rose-500/40 text-rose-200 opacity-100"
            : "bg-black/30 text-white/80 opacity-0 group-hover:opacity-100"
        )}
        aria-label={favorited ? "取消收藏" : "收藏"}
      >
        <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      </button>
    </>
  );
}
