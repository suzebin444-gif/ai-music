export type ResolvedStreaming = {
  previewUrl?: string;
  coverUrl?: string;
  neteaseUrl?: string;
  qqMusicUrl?: string;
  appleMusicUrl?: string;
  neteaseId?: number;
  source: "netease" | "itunes" | "catalog" | "none";
};
