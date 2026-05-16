import { NextResponse } from "next/server";

import { addFavorite, getFavorites, removeFavorite } from "@/lib/favorites-store";
import type { PlayableTrack } from "@/lib/player-types";
import { getOrCreateSessionId, getSessionId } from "@/lib/session";

function isPlayableTrack(value: unknown): value is PlayableTrack {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.artist === "string" &&
    typeof t.source === "string"
  );
}

export async function GET() {
  try {
    const { sessionId } = await getOrCreateSessionId();
    const favorites = await getFavorites(sessionId);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("[favorites] GET failed:", error);
    return NextResponse.json({ error: "加载收藏失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await getOrCreateSessionId();
    const body = (await request.json()) as { track?: unknown };

    if (!isPlayableTrack(body.track)) {
      return NextResponse.json({ error: "曲目信息无效" }, { status: 400 });
    }

    const favorites = await addFavorite(sessionId, body.track);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("[favorites] POST failed:", error);
    return NextResponse.json({ error: "收藏失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return NextResponse.json({ favorites: [] });
    }

    const body = (await request.json()) as { id?: string };
    if (!body.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "缺少曲目 ID" }, { status: 400 });
    }

    const favorites = await removeFavorite(sessionId, body.id);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("[favorites] DELETE failed:", error);
    return NextResponse.json({ error: "取消收藏失败" }, { status: 500 });
  }
}
