import { buildLofiSearchQuery } from "@/lib/spotify";
import type { SpotifySearchResponse, SpotifyTrackResult } from "@/lib/spotify-types";

type iTunesSearchResponse = {
  resultCount: number;
  results?: Array<{
    trackId: number;
    trackName: string;
    artistName: string;
    trackViewUrl: string;
    previewUrl?: string;
    artworkUrl100?: string;
    artworkUrl600?: string;
  }>;
};

function upscaleArtwork(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/100x100bb\.jpg$/, "600x600bb.jpg");
}

type iTunesSongResult = {
  previewUrl?: string;
  coverUrl?: string;
  appleMusicUrl: string;
};

/** 按歌名 + 歌手在 Apple Music / iTunes 搜索，获取试听与封面 */
export async function searchSongItunes(
  title: string,
  artist: string
): Promise<iTunesSongResult | null> {
  const term = `${title} ${artist}`.trim();
  const params = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: "5",
    country: "CN",
  });

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?${params}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    );
    if (!response.ok) return null;

    const data = (await response.json()) as iTunesSearchResponse;
    const results = data.results ?? [];
    if (results.length === 0) return null;

    const t = title.trim().toLowerCase();
    const a = artist.split(/[/、,，]/)[0]?.trim().toLowerCase() ?? "";

    const best =
      results.find(
        (r) =>
          r.trackName?.toLowerCase().includes(t) &&
          (a ? r.artistName?.toLowerCase().includes(a) : true)
      ) ?? results[0];

    if (!best.trackViewUrl) return null;

    return {
      previewUrl: best.previewUrl,
      coverUrl: upscaleArtwork(best.artworkUrl100),
      appleMusicUrl: best.trackViewUrl,
    };
  } catch {
    return null;
  }
}

export async function searchLofiTracksItunes(
  input: string,
  limit = 12
): Promise<SpotifySearchResponse> {
  const searchQuery = buildLofiSearchQuery(input);
  const params = new URLSearchParams({
    term: searchQuery,
    media: "music",
    entity: "song",
    limit: String(limit),
  });

  const response = await fetch(
    `https://itunes.apple.com/search?${params}`,
    { next: { revalidate: 0 } }
  );

  if (!response.ok) {
    throw new Error(`iTunes search failed ${response.status}`);
  }

  const data = (await response.json()) as iTunesSearchResponse;
  const tracks = (data.results ?? [])
    .map((item) => {
      const coverUrl = upscaleArtwork(item.artworkUrl100);
      if (!coverUrl || !item.trackName || !item.artistName) return null;

      return {
        id: `itunes-${item.trackId}`,
        name: item.trackName,
        artist: item.artistName,
        coverUrl,
        spotifyUrl: item.trackViewUrl,
        previewUrl: item.previewUrl,
      };
    })
    .filter((t) => t !== null);

  if (tracks.length === 0) {
    throw new Error("No tracks found on iTunes");
  }

  return {
    query: input.trim(),
    searchQuery,
    tracks,
  };
}
