import { featuredTracks } from "@/lib/music-data";
import type { DeepseekMoodPayload, MoodRecommendResponse } from "@/lib/mood-types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

function buildCatalogPrompt() {
  const catalog = featuredTracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    style: t.style,
    category: t.category,
    mood: t.mood,
    scenes: t.scenes,
    platform: t.platform,
  }));

  return `你是精通华语流行音乐（网易云音乐、QQ音乐、酷狗音乐歌单风格）的情绪推荐 AI。

根据用户的中文心情、场景描述，完成情绪分析、撰写推荐文案，并从曲库中选出情绪高度一致的 4 首华语歌曲。

曲库（只能推荐以下 trackId，均为中文歌曲）：
${JSON.stringify(catalog, null, 2)}

必须严格返回 JSON，不要 markdown：
{
  "label": "情绪标签，中文有诗意，如「心碎余温 · 华语抒情」",
  "tags": ["标签1", "标签2", "标签3", "标签4"],
  "energy": 0-100 整数,
  "valence": 0-100 整数,
  "copy": "80-150 字中文推荐文案。第二人称「你」。文案情绪必须与推荐歌曲一致：伤感场景写伤感，甜蜜场景写甜蜜，学习场景写专注，不可反差过大。可提及「华语」「网易云/QQ音乐」氛围，但不要列具体歌名。",
  "recommendations": [
    { "trackId": "曲库 id", "match": 78-99 整数 }
  ]
}

核心规则：
1. recommendations 恰好 4 首，trackId 来自曲库、不重复，match 降序
2. 情绪一致性（最重要）：
   - 用户描述伤感/失恋/分手 → 只选 category「失恋疗愈」「深夜情绪」或 mood 含伤感/孤独 的歌，禁止选甜蜜/热血类
   - 用户描述恋爱/浪漫/甜蜜 → 只选「浪漫甜蜜」「治愈温暖」类，禁止选伤感失恋类
   - 用户描述学习/专注/工作 → 优先「自习轻音乐」或低能量治愈类，禁止选高能量摇滚
   - 用户描述运动/励志/热血 → 只选「励志力量」类
3. 优先选择曲库 scenes/mood 与用户描述关键词重叠最多的歌曲
4. tags 3-6 个，含华语风格或歌手类型标签
5. copy 与所选 4 首歌的整体氛围统一`;
}

function clampPercent(n: unknown): number {
  const num = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(num)) return 50;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function parsePayload(content: string): DeepseekMoodPayload {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    : trimmed;

  const parsed = JSON.parse(jsonText) as DeepseekMoodPayload;

  if (
    !parsed.label ||
    !Array.isArray(parsed.tags) ||
    !parsed.copy ||
    !parsed.recommendations
  ) {
    throw new Error("Invalid DeepSeek response shape");
  }

  return parsed;
}

function mapToResponse(payload: DeepseekMoodPayload): MoodRecommendResponse {
  const trackMap = new Map(featuredTracks.map((t) => [t.id, t]));

  const recommendations = payload.recommendations
    .map((rec) => {
      const track = trackMap.get(String(rec.trackId));
      if (!track) return null;
      return {
        ...track,
        match: clampPercent(rec.match),
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0))
    .slice(0, 4);

  if (recommendations.length === 0) {
    throw new Error("No valid track recommendations");
  }

  return {
    analysis: {
      label: String(payload.label),
      tags: payload.tags.map(String).slice(0, 6),
      energy: clampPercent(payload.energy),
      valence: clampPercent(payload.valence),
    },
    copy: String(payload.copy).trim(),
    recommendations,
  };
}

export async function analyzeMoodWithDeepseek(
  mood: string
): Promise<MoodRecommendResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const model = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildCatalogPrompt() },
        { role: "user", content: mood },
      ],
      response_format: { type: "json_object" },
      temperature: 0.55,
      max_tokens: 1400,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from DeepSeek");
  }

  const payload = parsePayload(content);
  return mapToResponse(payload);
}
