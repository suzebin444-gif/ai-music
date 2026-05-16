import { searchSongItunes } from "@/lib/itunes";
import { buildNeteaseSearchUrl, resolveFromNetease } from "@/lib/netease";
import type { ResolvedStreaming } from "@/lib/music-resolve-types";
import { buildQQMusicSearchUrl } from "@/lib/qqmusic";
import type { Track } from "@/lib/music-data";

export async function resolveTrackStreaming(
  title: string,
  artist: string,
  fallbackPreview?: string
): Promise<ResolvedStreaming> {
  const qqMusicUrl = buildQQMusicSearchUrl(title, artist);
  const neteaseSearchUrl = buildNeteaseSearchUrl(`${title} ${artist}`);

  const netease = await resolveFromNetease(title, artist);
  const itunes = await searchSongItunes(title, artist);

  if (netease?.previewUrl) {
    return {
      previewUrl: netease.previewUrl,
      coverUrl: netease.coverUrl ?? itunes?.coverUrl,
      neteaseUrl: netease.neteaseUrl ?? neteaseSearchUrl,
      qqMusicUrl,
      appleMusicUrl: itunes?.appleMusicUrl,
      neteaseId: netease.neteaseId,
      source: "netease",
    };
  }

  if (itunes) {
    return {
      previewUrl: itunes.previewUrl ?? fallbackPreview,
      coverUrl: itunes.coverUrl,
      neteaseUrl: netease?.neteaseUrl ?? neteaseSearchUrl,
      qqMusicUrl,
      appleMusicUrl: itunes.appleMusicUrl,
      source: "itunes",
    };
  }

  if (netease?.neteaseUrl) {
    return {
      coverUrl: netease.coverUrl,
      neteaseUrl: netease.neteaseUrl,
      qqMusicUrl,
      previewUrl: fallbackPreview,
      source: "netease",
    };
  }

  return {
    previewUrl: fallbackPreview,
    neteaseUrl: neteaseSearchUrl,
    qqMusicUrl,
    source: fallbackPreview ? "catalog" : "none",
  };
}

export async function enrichTrackWithStreaming(track: Track): Promise<Track> {
  const resolved = await resolveTrackStreaming(
    track.title,
    track.artist,
    track.previewUrl
  );

  return {
    ...track,
    previewUrl: resolved.previewUrl ?? track.previewUrl,
    coverUrl: resolved.coverUrl ?? track.coverUrl,
    neteaseUrl: resolved.neteaseUrl,
    qqMusicUrl: resolved.qqMusicUrl,
    appleMusicUrl: resolved.appleMusicUrl,
    externalUrl:
      resolved.neteaseUrl ?? resolved.appleMusicUrl ?? resolved.qqMusicUrl,
  };
}

export async function enrichTracksWithStreaming(tracks: Track[]): Promise<Track[]> {
  return Promise.all(tracks.map((t) => enrichTrackWithStreaming(t)));
}
