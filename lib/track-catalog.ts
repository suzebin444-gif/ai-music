import { chineseMusicCatalog } from "@/lib/chinese-music-catalog";
import { lightMusicCategoryOrder, type Track } from "@/lib/music-data";
import type { PlayableTrack } from "@/lib/player-types";

export type CatalogTrack = PlayableTrack & {
  genre?: string;
  duration?: string;
  mood?: string[];
  favoriteCount?: number;
};

export type CatalogSection = {
  category: string;
  description: string;
  tracks: CatalogTrack[];
};

const CATEGORY_HINTS: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /study|lofi|focus|学习|专注|钢琴|石进/i, category: "自习轻音乐" },
  { pattern: /失恋|分手|体面|十年|泡沫/i, category: "失恋疗愈" },
  { pattern: /浪漫|告白|小幸运|晴天|恋爱/i, category: "浪漫甜蜜" },
  { pattern: /励志|追梦|孤勇者|光年/i, category: "励志力量" },
  { pattern: /成都|南山南|赵雷|陈鸿宇|民谣/i, category: "民谣叙事" },
  { pattern: /古风|知否|年轮|国风/i, category: "国风影视" },
  { pattern: /毛不易|深夜|孤独|消愁/i, category: "深夜情绪" },
  { pattern: /治愈|平凡|起风了|大鱼|周深/i, category: "治愈温暖" },
];

export function inferCategory(track: PlayableTrack): string {
  if (track.category) return track.category;

  const text = `${track.title} ${track.artist}`.toLowerCase();
  for (const { pattern, category } of CATEGORY_HINTS) {
    if (pattern.test(text)) return category;
  }
  return "热门收藏";
}

export function enrichPlayable(track: PlayableTrack): CatalogTrack {
  const fromCatalog = chineseMusicCatalog.find(
    (t) => `featured-${t.id}` === track.id || t.id === track.id.replace(/^featured-/, "")
  );

  return {
    ...track,
    category: track.category ?? fromCatalog?.category ?? inferCategory(track),
    genre: track.genre ?? fromCatalog?.genre,
    duration: track.duration ?? fromCatalog?.duration,
    mood: track.mood ?? fromCatalog?.mood,
    gradient: track.gradient ?? fromCatalog?.gradient,
    previewUrl: track.previewUrl ?? fromCatalog?.previewUrl,
  };
}

export function trackToCatalogPlayable(track: Track): CatalogTrack {
  return {
    id: `featured-${track.id}`,
    title: track.title,
    artist: track.artist,
    coverUrl: track.coverUrl,
    gradient: track.gradient,
    previewUrl: track.previewUrl,
    source: "featured",
    category: track.category,
    genre: track.genre,
    duration: track.duration,
    mood: track.mood,
    neteaseUrl: track.neteaseUrl,
    qqMusicUrl: track.qqMusicUrl,
    appleMusicUrl: track.appleMusicUrl,
    externalUrl: track.externalUrl,
  };
}

export function groupDefaultChineseLightMusic(): CatalogSection[] {
  const byCategory = new Map<string, CatalogTrack[]>();

  for (const track of chineseMusicCatalog) {
    const list = byCategory.get(track.category) ?? [];
    list.push(trackToCatalogPlayable(track));
    byCategory.set(track.category, list);
  }

  return lightMusicCategoryOrder
    .filter((c) => c !== "热门收藏" && byCategory.has(c))
    .map((category) => ({
      category,
      description: categoryDescriptions[category] ?? "",
      tracks: byCategory.get(category) ?? [],
    }));
}

const categoryDescriptions: Record<string, string> = {
  深夜情绪: "孤独、内省与深夜华语",
  失恋疗愈: "分手、遗憾与抒情流行",
  治愈温暖: "温柔治愈系华语",
  浪漫甜蜜: "恋爱、甜蜜与青春",
  民谣叙事: "城市民谣与故事感",
  励志力量: "热血、希望与力量",
  自习轻音乐: "专注学习背景乐",
  国风影视: "国风与影视原声",
  热门收藏: "来自大家收藏的热门曲目",
};

export function groupTracksByCategory(
  tracks: Array<CatalogTrack & { favoriteCount?: number }>
): CatalogSection[] {
  const byCategory = new Map<string, CatalogTrack[]>();

  for (const track of tracks) {
    const cat = track.category ?? inferCategory(track);
    const list = byCategory.get(cat) ?? [];
    list.push({ ...track, category: cat });
    byCategory.set(cat, list);
  }

  const categories = [
    ...lightMusicCategoryOrder.filter((c) => byCategory.has(c)),
    ...[...byCategory.keys()].filter(
      (c) => !lightMusicCategoryOrder.includes(c as (typeof lightMusicCategoryOrder)[number])
    ),
  ];

  return categories.map((category) => ({
    category,
    description: categoryDescriptions[category] ?? "根据收藏热度自动归类",
    tracks: (byCategory.get(category) ?? []).sort(
      (a, b) => (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0)
    ),
  }));
}
