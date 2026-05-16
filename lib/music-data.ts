import { chineseMusicCatalog } from "@/lib/chinese-music-catalog";
import { rankTracksForMood } from "@/lib/mood-matching";

export type Track = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  style: string;
  duration: string;
  mood: string[];
  scenes: string[];
  category: string;
  platform?: "网易云音乐" | "QQ音乐" | "酷狗音乐";
  gradient: string;
  coverUrl?: string;
  previewUrl?: string;
  neteaseUrl?: string;
  qqMusicUrl?: string;
  appleMusicUrl?: string;
  externalUrl?: string;
  match?: number;
};

/** AI 推荐与情绪匹配使用的华语曲库 */
export const featuredTracks: Track[] = chineseMusicCatalog;

/** @deprecated 收藏分类展示用 */
export const chineseLightMusic = chineseMusicCatalog;

export const lightMusicCategoryOrder = [
  "深夜情绪",
  "失恋疗愈",
  "治愈温暖",
  "浪漫甜蜜",
  "民谣叙事",
  "励志力量",
  "自习轻音乐",
  "国风影视",
  "热门收藏",
] as const;

export const moodPresets = [
  "深夜独处，有点孤独",
  "失恋了，想听伤感的歌",
  "治愈放松，想安静下来",
  "恋爱甜蜜，心情很好",
  "专注学习，需要背景音乐",
  "运动健身，需要热血节奏",
] as const;

export const testimonials = [
  {
    id: "1",
    name: "林雨桐",
    role: "视觉设计师",
    avatar: "LY",
    content:
      "情绪输入后推荐的曲目精准到让人起鸡皮疙瘩。界面质感像 Apple 发布会，但更有未来感。",
    rating: 5,
  },
  {
    id: "2",
    name: "Marcus Chen",
    role: "独立音乐人",
    avatar: "MC",
    content:
      "作为作品集展示非常合适。毛玻璃、动态背景、推荐动效——每个细节都在讲故事。",
    rating: 5,
  },
];

export function getRecommendations(input: string): Track[] {
  return rankTracksForMood(featuredTracks, input, 4);
}

export function analyzeMood(input: string): {
  label: string;
  tags: string[];
  energy: number;
  valence: number;
} {
  let label = "情绪光谱 · 华语声场";
  const tags = ["华语流行", "情绪映射"];

  if (/失恋|分手|告别|心碎|眼泪|难过|伤心/.test(input)) {
    label = "心碎余温 · 华语抒情";
    tags.push("失恋", "抒情", "陈奕迅", "毛不易");
  } else if (/暗恋|喜欢|恋爱|约会|浪漫|甜蜜|表白/.test(input)) {
    label = "心动频率 · 甜蜜华语";
    tags.push("浪漫", "甜蜜", "周杰伦", "田馥甄");
  } else if (/深夜|失眠|孤独|一个人|寂寞|emo/.test(input)) {
    label = "深夜独白 · 低饱和静谧";
    tags.push("深夜", "孤独", "毛不易", "民谣");
  } else if (/学习|专注|工作|代码|考研|自习/.test(input)) {
    label = "深度专注 · 轻音乐声墙";
    tags.push("专注", "轻音乐", "钢琴", "纯音乐");
  } else if (/治愈|放松|平静|冥想|疲惫/.test(input)) {
    label = "治愈光谱 · 柔光流动";
    tags.push("治愈", "温暖", "朴树", "周深");
  } else if (/运动|跑步|健身|热血|拼搏|励志|奋斗/.test(input)) {
    label = "动能矩阵 · 华语热血";
    tags.push("励志", "摇滚", "力量", "热血");
  } else if (/青春|校园|毕业|回忆|夏天/.test(input)) {
    label = "青春切片 · 怀旧华语";
    tags.push("青春", "怀旧", "周杰伦", "民谣");
  } else if (/古风|国风|江南|追剧/.test(input)) {
    label = "国风意境 · 影视声场";
    tags.push("国风", "影视", "古风", "抒情");
  } else if (/旅行|城市|成都|故事/.test(input)) {
    label = "城市叙事 · 民谣漫游";
    tags.push("民谣", "城市", "赵雷", "叙事");
  }

  const energy = /运动|热血|励志|振奋|拼搏/.test(input)
    ? 88
    : /平静|治愈|冥想|深夜|学习|专注/.test(input)
      ? 22
      : /失恋|难过|伤心|孤独/.test(input)
        ? 35
        : 55;

  const valence = /开心|快乐|幸福|甜蜜|恋爱|浪漫/.test(input)
    ? 82
    : /失恋|难过|伤心|孤独|分手/.test(input)
      ? 28
      : 55;

  if (input.trim().length < 3) {
    label = "等待情绪输入…";
    tags.length = 1;
    tags[0] = "待分析";
  }

  return { label, tags: tags.slice(0, 6), energy, valence };
}

export function generateMoodCopy(
  input: string,
  label: string,
  tracks: Track[]
): string {
  const top = tracks[0];
  const names = tracks
    .slice(0, 2)
    .map((t) => `《${t.title}》`)
    .join("、");
  const moodHint = top
    ? `为你挑选了 ${names} 等华语曲目，${top.artist} 的声线尤其贴合此刻。`
  : "这些华语旋律会轻轻托住你此刻的情绪。";

  if (/失恋|分手|心碎|难过/.test(input)) {
    return `那些没说出口的话，就交给旋律慢慢消化。${moodHint}在网易云与 QQ 音乐里陪伴过无数人的深夜，今天也陪你把情绪安放好。`;
  }
  if (/暗恋|恋爱|浪漫|甜蜜/.test(input)) {
    return `心动不需要太喧闹的编曲。${moodHint}让温柔的人声替你说出那些害羞的喜欢。`;
  }
  if (/深夜|孤独|失眠/.test(input)) {
    return `城市熄灯以后，只剩你和耳机。${moodHint}低频与钢琴会铺出一条安静的退路。`;
  }
  if (/学习|专注|工作/.test(input)) {
    return `把注意力留给眼前的事。${moodHint}轻音乐与人声较少的编配，不会抢走你的思绪。`;
  }
  if (/治愈|放松|平静/.test(input)) {
    return `呼吸放慢的这一刻，${moodHint}柔软的华语音色像温水拂过神经。`;
  }
  if (/运动|热血|励志/.test(input)) {
    return `节拍已经就位。${moodHint}鼓点与人声会推着你向前，直到畅快落下。`;
  }

  return `「${label}」——这是你此刻的情绪光谱。${moodHint}闭上眼，让华语声场带你进入专属氛围。`;
}
