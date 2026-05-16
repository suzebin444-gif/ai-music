"use client";

import type { ReactNode } from "react";

import { AssistantProvider } from "@/contexts/assistant-provider";
import { FavoritesProvider } from "@/contexts/favorites-provider";
import { PlayerProvider } from "@/contexts/player-provider";
import { AssistantXiaobin } from "@/components/assistant-xiaobin";
import { MusicPlayerBar } from "@/components/music-player-bar";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <FavoritesProvider>
        <AssistantProvider>
          {children}
          <MusicPlayerBar />
          <AssistantXiaobin />
        </AssistantProvider>
      </FavoritesProvider>
    </PlayerProvider>
  );
}
