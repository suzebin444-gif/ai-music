import type { SceneSearchTrack } from "@/lib/scene-search-types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DEFAULT_COVER =
  "https://y.gtimg.cn/mediastyle/global/img/cover_m.png";

type QQSearchSong = {
  mid?: string;
  name?: string;
  title?: string;
  singer?: Array<{ name?: string }>;
  album?: { mid?: string; pmid?: string; name?: string };
};

type QQSearchResponse = {
  code?: number;
  req_1?: {
    data?: {
      body?: {
        song?: {
          list?: QQSearchSong[];
        };
      };
    };
  };
};

export function buildQQMusicSearchUrl(title: string, artist: string): string {
  const keyword = `${title} ${artist}`.trim();
  return `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(keyword)}`;
}

export function buildQQSongUrl(songmid: string): string {
  return `https://y.qq.com/n/yqq/song/${songmid}.html`;
}

function buildQQCoverUrl(albumMid?: string): string {
  if (!albumMid) return DEFAULT_COVER;
  const mid = albumMid.replace(/_\d+$/, "");
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg`;
}

/** QQ 音乐搜索（musicu 接口） */
export async function searchTracksQQ(
  keyword: string,
  limit = 12
): Promise<SceneSearchTrack[]> {
  const payload = {
    req_1: {
      module: "music.search.SearchCgiService",
      method: "DoSearchForQQMusicDesktop",
      param: {
        query: keyword,
        page_num: 1,
        num_per_page: limit,
        search_type: 0,
      },
    },
  };

  try {
    const response = await fetch(
      `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(JSON.stringify(payload))}`,
      {
        headers: {
          Referer: "https://y.qq.com",
          "User-Agent": UA,
        },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(12_000),
      }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as QQSearchResponse;
    const list = data.req_1?.data?.body?.song?.list ?? [];
    if (list.length === 0) return [];

    const tracks: SceneSearchTrack[] = [];

    for (const song of list) {
      const mid = song.mid;
      const name = (song.name || song.title || "").trim();
      if (!mid || !name) continue;

      const artist =
        song.singer?.map((s) => s.name).filter(Boolean).join(" / ") ||
        "未知歌手";
      const qqMusicUrl = buildQQSongUrl(mid);
      const coverUrl = buildQQCoverUrl(song.album?.mid ?? song.album?.pmid);

      tracks.push({
        id: `qq-${mid}`,
        name,
        artist,
        coverUrl,
        spotifyUrl: qqMusicUrl,
        qqMusicUrl,
        neteaseUrl: `https://music.163.com/#/search/m/?s=${encodeURIComponent(`${name} ${artist}`)}&type=1`,
      });
    }

    return tracks;
  } catch {
    return [];
  }
}
