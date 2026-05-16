import type { Track } from "@/lib/music-data";
import { trackToCatalogPlayable } from "@/lib/track-catalog";
import type { PlayableTrack } from "@/lib/player-types";
import type { SpotifyTrackResult } from "@/lib/spotify-types";

export function featuredToPlayable(track: Track): PlayableTrack {
  return trackToCatalogPlayable(track);
}

export function spotifyResultToPlayable(track: SpotifyTrackResult): PlayableTrack {
  const source = track.id.startsWith("itunes-") ? "itunes" : "spotify";
  return {
    id: track.id,
    title: track.name,
    artist: track.artist,
    coverUrl: track.coverUrl,
    previewUrl: track.previewUrl,
    externalUrl: track.spotifyUrl,
    source,
  };
}

export function moodTrackToPlayable(track: Track): PlayableTrack {
  const base = trackToCatalogPlayable(track);
  return {
    ...base,
    id: `mood-${track.id}`,
    source: "mood",
    externalUrl:
      track.externalUrl ??
      track.neteaseUrl ??
      track.appleMusicUrl ??
      track.qqMusicUrl,
    neteaseUrl: track.neteaseUrl,
    qqMusicUrl: track.qqMusicUrl,
    appleMusicUrl: track.appleMusicUrl,
  };
}
