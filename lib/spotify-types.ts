export type SpotifyTrackResult = {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string;
  previewUrl?: string;
};

export type SpotifySearchResponse = {
  query: string;
  searchQuery: string;
  tracks: SpotifyTrackResult[];
  source?: "spotify" | "itunes";
  warning?: string;
};
