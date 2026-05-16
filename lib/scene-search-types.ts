export type SceneSearchSource = "netease" | "qq" | "itunes" | "spotify";

export type SceneSearchTrack = {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  /** 主跳转链接（网易云 / QQ / Apple / Spotify） */
  spotifyUrl: string;
  previewUrl?: string;
  neteaseUrl?: string;
  qqMusicUrl?: string;
};

export type SceneSearchResponse = {
  query: string;
  searchQuery: string;
  tracks: SceneSearchTrack[];
  source?: SceneSearchSource;
  warning?: string;
};

/** @deprecated 使用 SceneSearchTrack */
export type SpotifyTrackResult = SceneSearchTrack;

/** @deprecated 使用 SceneSearchResponse */
export type SpotifySearchResponse = SceneSearchResponse & {
  source?: SceneSearchSource;
};
