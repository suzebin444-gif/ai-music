import type { SpotifySearchResponse, SpotifyTrackResult } from "@/lib/spotify-types";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";

const SCENE_KEYWORDS: Record<string, string> = {
  深夜: "night",
  学习: "study",
  工作: "focus",
  专注: "focus",
  睡眠: "sleep",
  冥想: "meditation",
  放松: "chill",
  治愈: "healing",
  运动: "workout",
  跑步: "running",
  咖啡: "coffee",
  雨: "rain",
  城市: "urban",
  赛博: "cyber",
  浪漫: "romantic",
  约会: "date",
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

type SpotifySearchApiResponse = {
  tracks?: {
    items?: Array<{
      id: string;
      name: string;
      preview_url?: string | null;
      external_urls?: { spotify?: string };
      artists?: Array<{ name: string }>;
      album?: {
        images?: Array<{ url: string; width?: number; height?: number }>;
      };
    }>;
  };
};

export function buildLofiSearchQuery(input: string): string {
  const trimmed = input.trim();
  const parts = new Set<string>(["lofi"]);

  for (const [zh, en] of Object.entries(SCENE_KEYWORDS)) {
    if (trimmed.includes(zh)) parts.add(en);
  }

  if (parts.size === 1 && trimmed) {
    parts.add(trimmed);
  }

  return Array.from(parts).join(" ");
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not configured");
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Spotify auth failed ${response.status}: ${err}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

type SpotifyTrackItem = NonNullable<
  NonNullable<SpotifySearchApiResponse["tracks"]>["items"]
>[number];

function mapTrack(item: SpotifyTrackItem): SpotifyTrackResult | null {
  const coverUrl = item.album?.images?.[0]?.url;
  const artist = item.artists?.map((a) => a.name).join(", ");

  if (!coverUrl || !artist || !item.name) return null;

  return {
    id: item.id,
    name: item.name,
    artist,
    coverUrl,
    spotifyUrl: item.external_urls?.spotify ?? `https://open.spotify.com/track/${item.id}`,
    previewUrl: item.preview_url ?? undefined,
  };
}

export async function searchLofiTracks(
  input: string,
  limit = 12
): Promise<SpotifySearchResponse> {
  const searchQuery = buildLofiSearchQuery(input);
  const token = await getAccessToken();

  const params = new URLSearchParams({
    q: searchQuery,
    type: "track",
    limit: String(limit),
    market: "US",
  });

  const response = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Spotify search failed ${response.status}: ${err}`);
  }

  const data = (await response.json()) as SpotifySearchApiResponse;
  const tracks = (data.tracks?.items ?? [])
    .map(mapTrack)
    .filter((t): t is SpotifyTrackResult => t !== null);

  if (tracks.length === 0) {
    throw new Error("No tracks found");
  }

  return {
    query: input.trim(),
    searchQuery,
    tracks,
  };
}
