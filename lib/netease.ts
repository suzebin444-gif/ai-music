import type { ResolvedStreaming } from "@/lib/music-resolve-types";
import type { SceneSearchTrack } from "@/lib/scene-search-types";
import { buildQQMusicSearchUrl } from "@/lib/qqmusic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DEFAULT_COVER =
  "https://y.gtimg.cn/mediastyle/global/img/cover_m.png";

type NeteaseSearchSong = {
  id: number;
  name: string;
  ar?: Array<{ name: string }>;
  al?: { picUrl?: string };
};

type NeteaseSearchResponse = {
  result?: {
    songs?: NeteaseSearchSong[];
  };
  code?: number;
};

type NeteaseUrlResponse = {
  data?: Array<{ url?: string | null; id?: number }>;
  code?: number;
};

type NeteaseWebSong = {
  id: number;
  name: string;
  artists?: Array<{ name: string; img1v1Url?: string }>;
  album?: { id: number; name?: string; picId?: number };
};

type NeteaseWebSearchResponse = {
  result?: {
    songs?: NeteaseWebSong[];
  };
};

type NeteaseWebUrlResponse = {
  data?: Array<{ id: number; url?: string | null }>;
};

export function getNeteaseApiBase(): string | null {
  const base = process.env.NETEASE_API_URL?.trim();
  if (!base) return null;
  return base.replace(/\/$/, "");
}

export function buildNeteaseSearchUrl(keyword: string): string {
  return `https://music.163.com/#/search/m/?s=${encodeURIComponent(keyword)}&type=1`;
}

export function buildNeteaseSongUrl(songId: number): string {
  return `https://music.163.com/#/song?id=${songId}`;
}

async function neteaseApiFetch<T>(path: string): Promise<T | null> {
  const base = getNeteaseApiBase();
  if (!base) return null;

  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function neteaseWebFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`https://music.163.com${path}`, {
      headers: {
        Referer: "https://music.163.com",
        "User-Agent": UA,
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function pickBestSong(
  songs: NeteaseSearchSong[],
  title: string,
  artist: string
): NeteaseSearchSong | null {
  if (songs.length === 0) return null;

  const t = title.trim().toLowerCase();
  const a = artist.split(/[/、,，]/)[0]?.trim().toLowerCase() ?? "";

  const scored = songs.map((song) => {
    const name = song.name.toLowerCase();
    const artistName = (song.ar?.[0]?.name ?? "").toLowerCase();
    let score = 0;
    if (name === t) score += 10;
    else if (name.includes(t) || t.includes(name)) score += 6;
    if (a && (artistName.includes(a) || a.includes(artistName))) score += 5;
    return { song, score };
  });

  scored.sort((x, y) => y.score - x.score);
  return scored[0]?.score > 0 ? scored[0].song : songs[0];
}

function normalizeCover(url?: string): string {
  if (!url) return DEFAULT_COVER;
  return url.replace(/^http:\/\//, "https://");
}

function formatArtists(ar?: Array<{ name: string }>): string {
  return ar?.map((a) => a.name).filter(Boolean).join(" / ") || "未知歌手";
}

async function fetchNeteasePreviewUrls(
  songIds: number[],
  useApi: boolean
): Promise<Map<number, string>> {
  const urlMap = new Map<number, string>();
  if (songIds.length === 0) return urlMap;

  if (useApi) {
    const urlRes = await neteaseApiFetch<NeteaseUrlResponse>(
      `/song/url?id=${songIds.join(",")}`
    );
    urlRes?.data?.forEach((item, index) => {
      const id = songIds[index];
      if (id && item.url?.startsWith("http")) urlMap.set(id, item.url);
    });
    if (urlMap.size > 0) return urlMap;
  }

  const webRes = await neteaseWebFetch<NeteaseWebUrlResponse>(
    `/api/song/enhance/player/url/v1?ids=[${songIds.join(",")}]&level=standard&encodeType=mp3`
  );
  webRes?.data?.forEach((item) => {
    if (item.id && item.url?.startsWith("http")) {
      urlMap.set(item.id, item.url.replace(/^http:\/\//, "https://"));
    }
  });

  return urlMap;
}

async function searchTracksNeteaseViaApi(
  keyword: string,
  limit: number
): Promise<SceneSearchTrack[]> {
  const search = await neteaseApiFetch<NeteaseSearchResponse>(
    `/cloudsearch?keywords=${encodeURIComponent(keyword)}&type=1&limit=${limit}`
  );

  const songs = search?.result?.songs;
  if (!songs?.length) return [];

  const urlMap = await fetchNeteasePreviewUrls(
    songs.map((s) => s.id),
    true
  );

  const tracks: SceneSearchTrack[] = [];

  for (const song of songs) {
    const artist = formatArtists(song.ar);
    const neteaseUrl = buildNeteaseSongUrl(song.id);

    tracks.push({
      id: `netease-${song.id}`,
      name: song.name,
      artist,
      coverUrl: normalizeCover(song.al?.picUrl),
      spotifyUrl: neteaseUrl,
      previewUrl: urlMap.get(song.id),
      neteaseUrl,
      qqMusicUrl: buildQQMusicSearchUrl(song.name, artist),
    });
  }

  return tracks;
}

/** 网易云 Web 搜索（无需自建 API） */
async function searchTracksNeteasePublic(
  keyword: string,
  limit: number
): Promise<SceneSearchTrack[]> {
  const search = await neteaseWebFetch<NeteaseWebSearchResponse>(
    `/api/search/get/web?csrf_token=&type=1&offset=0&limit=${limit}&total=true&s=${encodeURIComponent(keyword)}`
  );

  const songs = search?.result?.songs;
  if (!songs?.length) return [];

  const urlMap = await fetchNeteasePreviewUrls(
    songs.map((s) => s.id),
    false
  );

  const tracks: SceneSearchTrack[] = [];

  for (const song of songs) {
    const artist =
      song.artists?.map((a) => a.name).filter(Boolean).join(" / ") ||
      "未知歌手";
    const neteaseUrl = buildNeteaseSongUrl(song.id);
    const coverUrl = normalizeCover(song.artists?.[0]?.img1v1Url);

    tracks.push({
      id: `netease-${song.id}`,
      name: song.name,
      artist,
      coverUrl,
      spotifyUrl: neteaseUrl,
      previewUrl: urlMap.get(song.id),
      neteaseUrl,
      qqMusicUrl: buildQQMusicSearchUrl(song.name, artist),
    });
  }

  return tracks;
}

/** 场景化搜索：优先自建 API，否则走网易云 Web 接口 */
export async function searchTracksNetease(
  keyword: string,
  limit = 12
): Promise<SceneSearchTrack[]> {
  if (getNeteaseApiBase()) {
    const apiTracks = await searchTracksNeteaseViaApi(keyword, limit);
    if (apiTracks.length > 0) return apiTracks;
  }

  return searchTracksNeteasePublic(keyword, limit);
}

export async function resolveFromNetease(
  title: string,
  artist: string
): Promise<ResolvedStreaming | null> {
  const keyword = `${title} ${artist}`.trim();

  const search = await neteaseApiFetch<NeteaseSearchResponse>(
    `/cloudsearch?keywords=${encodeURIComponent(keyword)}&type=1&limit=8`
  );

  let songs = search?.result?.songs;

  if (!songs?.length) {
    const web = await neteaseWebFetch<NeteaseWebSearchResponse>(
      `/api/search/get/web?csrf_token=&type=1&offset=0&limit=8&total=true&s=${encodeURIComponent(keyword)}`
    );
    const webSongs = web?.result?.songs ?? [];
    songs = webSongs.map((s) => ({
      id: s.id,
      name: s.name,
      ar: s.artists?.map((a) => ({ name: a.name })),
      al: { picUrl: s.artists?.[0]?.img1v1Url },
    }));
  }

  if (!songs?.length) return null;

  const match = pickBestSong(songs, title, artist);
  if (!match) return null;

  const neteaseUrl = buildNeteaseSongUrl(match.id);
  const urlMap = await fetchNeteasePreviewUrls([match.id], Boolean(getNeteaseApiBase()));

  return {
    previewUrl: urlMap.get(match.id),
    coverUrl: normalizeCover(match.al?.picUrl),
    neteaseUrl,
    neteaseId: match.id,
    source: "netease",
  };
}
