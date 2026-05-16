"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { PlayableTrack } from "@/lib/player-types";

type PlayerContextValue = {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  playTrack: (track: PlayableTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  clearError: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsPlaying(false);
      setError("无法播放试听，请换一首或前往外部链接");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback((track: PlayableTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track.previewUrl) {
      setCurrentTrack(track);
      setIsPlaying(false);
      setError("该曲目暂无试听片段");
      return;
    }

    setError(null);
    setCurrentTrack(track);

    if (audio.src !== track.previewUrl) {
      audio.src = track.previewUrl;
      setProgress(0);
      setDuration(0);
    }

    void audio.play().catch(() => {
      setIsPlaying(false);
      setError("播放被浏览器阻止，请先与页面交互后再试");
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (!currentTrack.previewUrl) {
      setError("该曲目暂无试听片段");
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play().catch(() => {
        setError("播放失败，请重试");
      });
    }
  }, [currentTrack, isPlaying]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        error,
        playTrack,
        togglePlay,
        pause,
        clearError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return ctx;
}
