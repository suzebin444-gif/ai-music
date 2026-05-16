import { buildChineseSceneQuery } from "@/lib/scene-keywords";
import { searchLofiTracksItunes } from "@/lib/itunes";
import { searchTracksNetease } from "@/lib/netease";
import { buildQQMusicSearchUrl, searchTracksQQ } from "@/lib/qqmusic";
import { searchLofiTracks } from "@/lib/spotify";
import type {
  SceneSearchResponse,
  SceneSearchTrack,
} from "@/lib/scene-search-types";

function enrichWithChineseLinks(
  tracks: SceneSearchTrack[]
): SceneSearchTrack[] {
  return tracks.map((track) => ({
    ...track,
    neteaseUrl:
      track.neteaseUrl ??
      `https://music.163.com/#/search/m/?s=${encodeURIComponent(`${track.name} ${track.artist}`)}&type=1`,
    qqMusicUrl:
      track.qqMusicUrl ?? buildQQMusicSearchUrl(track.name, track.artist),
  }));
}

function normalizeTitle(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

/** 用 QQ 精确歌曲链接补充网易云结果 */
function mergeQQSongLinks(
  tracks: SceneSearchTrack[],
  qqTracks: SceneSearchTrack[]
): SceneSearchTrack[] {
  if (qqTracks.length === 0) return tracks;

  const qqByTitle = new Map<string, SceneSearchTrack>();
  for (const q of qqTracks) {
    qqByTitle.set(normalizeTitle(q.name), q);
  }

  return tracks.map((track) => {
    const qq = qqByTitle.get(normalizeTitle(track.name));
    if (!qq?.qqMusicUrl) return track;
    return { ...track, qqMusicUrl: qq.qqMusicUrl };
  });
}

function isSpotifyPremiumError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("premium") ||
    (lower.includes("403") && lower.includes("spotify"))
  );
}

export async function searchSceneTracks(
  input: string
): Promise<SceneSearchResponse> {
  const query = input.trim();
  const searchQuery = buildChineseSceneQuery(query);
  const [neteaseTracks, qqTracks] = await Promise.all([
    searchTracksNetease(searchQuery, 12),
    searchTracksQQ(searchQuery, 12),
  ]);

  if (neteaseTracks.length > 0) {
    return {
      query,
      searchQuery,
      tracks: mergeQQSongLinks(neteaseTracks, qqTracks),
      source: "netease",
    };
  }

  if (qqTracks.length > 0) {
    return {
      query,
      searchQuery,
      tracks: qqTracks,
      source: "qq",
      warning: "网易云未找到匹配，已展示 QQ 音乐搜索结果",
    };
  }

  const fallbackHint = "网易云与 QQ 音乐均未找到曲目。";

  try {
    const result = await searchLofiTracks(query);
    return {
      ...result,
      tracks: enrichWithChineseLinks(result.tracks),
      source: "spotify",
      warning: `${fallbackHint} 已回退 Spotify。`,
    };
  } catch (spotifyError) {
    const message = spotifyError instanceof Error ? spotifyError.message : "";
    if (isSpotifyPremiumError(message) || message.includes("not configured")) {
      const itunes = await searchLofiTracksItunes(query);
      return {
        ...itunes,
        searchQuery,
        tracks: enrichWithChineseLinks(itunes.tracks),
        source: "itunes",
        warning: `${fallbackHint} 已回退 Apple Music 搜索。`,
      };
    }
    throw spotifyError;
  }
}
