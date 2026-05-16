import type { Track } from "@/lib/music-data";

const SCENE_RULES: Array<{ pattern: RegExp; tags: string[]; weight: number }> = [
  { pattern: /失恋|分手|告别|心碎|眼泪|难过|伤心|遗憾|失去/, tags: ["失恋", "分手", "伤感", "遗憾"], weight: 3 },
  { pattern: /暗恋|喜欢|心动|表白|甜蜜|恋爱|约会|浪漫|想你/, tags: ["浪漫", "甜蜜", "暗恋", "恋爱"], weight: 3 },
  { pattern: /深夜|失眠|孤独|一个人|寂寞|emo|安静|独处/, tags: ["深夜", "孤独", "内省", "平静"], weight: 3 },
  { pattern: /学习|专注|工作|代码|考研|自习|读书|加班/, tags: ["专注", "学习", "安静", "钢琴"], weight: 3 },
  { pattern: /治愈|放松|平静|冥想|舒缓|解压|疲惫/, tags: ["治愈", "温柔", "平静", "空灵"], weight: 2.5 },
  { pattern: /运动|跑步|健身|热血|拼搏|奋斗|励志|加油/, tags: ["热血", "励志", "振奋", "力量"], weight: 3 },
  { pattern: /青春|校园|毕业|回忆|童年|夏天|年少/, tags: ["青春", "怀旧", "回忆"], weight: 2.5 },
  { pattern: /旅行|公路|城市|成都|故事|酒吧/, tags: ["叙事", "城市", "温暖", "民谣"], weight: 2 },
  { pattern: /古风|国风|江南|红尘|追剧|影视/, tags: ["古风", "国风", "影视"], weight: 2.5 },
  { pattern: /开心|快乐|幸福|阳光|元气/, tags: ["轻快", "温暖", "甜蜜", "快乐"], weight: 2 },
  { pattern: /雨|雨天|潮湿|阴天/, tags: ["伤感", "叙事", "沉静", "治愈"], weight: 1.5 },
];

function collectQueryTags(input: string): Map<string, number> {
  const tags = new Map<string, number>();
  const text = input.trim();

  for (const rule of SCENE_RULES) {
    if (rule.pattern.test(text)) {
      for (const tag of rule.tags) {
        tags.set(tag, (tags.get(tag) ?? 0) + rule.weight);
      }
    }
  }

  if (tags.size === 0) {
    tags.set("治愈", 1);
    tags.set("平静", 0.8);
  }

  return tags;
}

function scoreTrack(track: Track, queryTags: Map<string, number>): number {
  let score = 0;
  const corpus = [
    track.title,
    track.artist,
    track.genre,
    track.style ?? "",
    track.category,
    ...track.mood,
    ...(track.scenes ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const tagKeys = [...queryTags.keys()].join(" ");

  for (const [tag, weight] of queryTags) {
    const t = tag.toLowerCase();
    if (corpus.includes(t)) score += weight * 12;
    for (const m of track.mood) {
      if (m.includes(tag) || tag.includes(m)) score += weight * 8;
    }
    for (const s of track.scenes ?? []) {
      if (s.includes(tag) || tag.includes(s)) score += weight * 10;
    }
  }

  if (/学习|专注|工作/.test(tagKeys) && track.category === "自习轻音乐") score += 15;
  if (/失恋|分手/.test(tagKeys) && track.category === "失恋疗愈") score += 15;
  if (/浪漫|恋爱|甜蜜/.test(tagKeys) && track.category === "浪漫甜蜜") score += 15;
  if (/运动|热血|励志/.test(tagKeys) && track.category === "励志力量") score += 15;
  if (/深夜|孤独/.test(tagKeys) && track.category === "深夜情绪") score += 12;

  return score;
}

export function rankTracksForMood(catalog: Track[], input: string, limit = 4): Track[] {
  const queryTags = collectQueryTags(input);

  return [...catalog]
    .map((track) => {
      const raw = scoreTrack(track, queryTags);
      const match = Math.min(99, Math.max(72, Math.round(72 + raw * 1.8)));
      return { ...track, match };
    })
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0))
    .slice(0, limit);
}
