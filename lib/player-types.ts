export type TrackSource =
  | "featured"
  | "spotify"
  | "itunes"
  | "netease"
  | "qq"
  | "mood";

export type PlayableTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  gradient?: string;
  previewUrl?: string;
  externalUrl?: string;
  neteaseUrl?: string;
  qqMusicUrl?: string;
  appleMusicUrl?: string;
  source: TrackSource;
  category?: string;
  genre?: string;
  duration?: string;
  mood?: string[];
};
