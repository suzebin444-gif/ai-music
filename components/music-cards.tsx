"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Heart, Loader2 } from "lucide-react";

import { SectionWrapper } from "@/components/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { TrackActionButtons } from "@/components/track-action-buttons";
import { useFavorites } from "@/contexts/favorites-provider";
import {
  enrichPlayable,
  groupTracksByCategory,
  type CatalogSection,
  type CatalogTrack,
} from "@/lib/track-catalog";
import { cn } from "@/lib/utils";

function TrackCard({
  track,
  index,
}: {
  track: CatalogTrack;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="glass-card neon-border group overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-square overflow-hidden">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={`${track.title} 封面`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              track.gradient ?? "from-violet-600 to-cyan-600"
            )}
          />
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
        <TrackActionButtons track={track} />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{track.title}</h3>
            <p className="text-sm text-white/50">{track.artist}</p>
          </div>
          {track.duration && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-white/40">
              <Clock className="h-3 w-3" />
              {track.duration}
            </span>
          )}
        </div>
        {track.genre && (
          <p className="mt-1 text-xs text-violet-300/80">{track.genre}</p>
        )}
        {track.mood && track.mood.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {track.mood.map((m) => (
              <span
                key={m}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50"
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function CategorySection({ section }: { section: CatalogSection }) {
  return (
    <div className="mb-14 last:mb-0">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
            {section.category}
          </h3>
          {section.description && (
            <p className="mt-1 text-sm text-white/45">{section.description}</p>
          )}
        </div>
        <span className="text-xs text-white/35">{section.tracks.length} 首</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {section.tracks.map((track, index) => (
          <TrackCard key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
}

export function MusicCards() {
  const { favorites, loading } = useFavorites();

  const sections = useMemo(() => {
    if (favorites.length === 0) return [];
    return groupTracksByCategory(favorites.map(enrichPlayable));
  }, [favorites]);

  return (
    <SectionWrapper id="tracks" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <div className="mb-12 text-center">
        <Badge variant="neon" className="mb-4">
          我的收藏
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">情绪精选曲目</h2>
        <p className="mt-3 text-white/50">
          此处仅展示你收藏的曲目，按情绪分类汇总
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          加载收藏…
        </div>
      ) : sections.length > 0 ? (
        <div>
          <div className="mb-8 flex items-center gap-2">
            <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
            <h3 className="text-lg font-medium text-white/90">按收藏分类</h3>
            <span className="text-xs text-white/35">共 {favorites.length} 首</span>
          </div>
          {sections.map((section) => (
            <CategorySection key={section.category} section={section} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Heart className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <p className="text-base text-white/55">还没有收藏任何曲目</p>
          <p className="mt-2 text-sm text-white/40">
            在「情绪推荐」或「Spotify 搜索」中点击爱心，收藏后会自动出现在这里
          </p>
        </div>
      )}
    </SectionWrapper>
  );
}
