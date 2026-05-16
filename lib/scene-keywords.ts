const SCENE_PRESETS: Record<string, string> = {
  深夜学习: "深夜学习 lofi 轻音乐 纯音乐",
  咖啡工作: "咖啡馆 工作 背景音乐 lofi",
  雨夜独处: "雨夜 独处 钢琴 轻音乐",
  晨间专注: "晨间 专注 轻音乐 纯音乐",
  睡前放松: "睡前 放松 睡眠 轻音乐",
  赛博都市: "赛博朋克 都市 lofi 电子",
};

const MOOD_KEYWORDS: Record<string, string> = {
  深夜: "深夜",
  学习: "学习",
  工作: "工作",
  专注: "专注",
  睡眠: "睡眠",
  冥想: "冥想",
  放松: "放松",
  治愈: "治愈",
  咖啡: "咖啡",
  雨: "雨夜",
  城市: "都市",
  赛博: "赛博",
  浪漫: "浪漫",
  独处: "独处",
};

/** 场景化华语 / LoFi 搜索词 */
export function buildChineseSceneQuery(input: string): string {
  const trimmed = input.trim();
  if (SCENE_PRESETS[trimmed]) return SCENE_PRESETS[trimmed];

  const parts = new Set<string>([trimmed, "lofi", "轻音乐"]);
  for (const [zh, tag] of Object.entries(MOOD_KEYWORDS)) {
    if (trimmed.includes(zh)) parts.add(tag);
  }

  return Array.from(parts).filter(Boolean).join(" ");
}
