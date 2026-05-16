import { NextResponse } from "next/server";

import { searchLofiTracksItunes } from "@/lib/itunes";
import { searchLofiTracks } from "@/lib/spotify";

function isSpotifyPremiumError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("premium") ||
    (lower.includes("403") && lower.includes("spotify"))
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim();

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: "请输入场景或情绪关键词" },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: "关键词过长，请控制在 100 字以内" },
        { status: 400 }
      );
    }

    try {
      const result = await searchLofiTracks(query);
      return NextResponse.json({ ...result, source: "spotify" });
    } catch (spotifyError) {
      const message =
        spotifyError instanceof Error ? spotifyError.message : "";

      if (message.includes("not configured")) {
        return NextResponse.json(
          { error: "Spotify API 未配置，请在 .env.local 中设置密钥" },
          { status: 503 }
        );
      }

      if (message.includes("401") || message.includes("invalid_client")) {
        return NextResponse.json(
          { error: "Spotify 密钥无效，请检查 Client ID 与 Client Secret" },
          { status: 401 }
        );
      }

      if (isSpotifyPremiumError(message)) {
        console.warn(
          "[spotify/search] Premium required, falling back to iTunes"
        );
        try {
          const result = await searchLofiTracksItunes(query);
          return NextResponse.json({
            ...result,
            source: "itunes",
            warning:
              "Spotify 开发模式需 Premium，当前通过 Apple Music 搜索展示真实曲目（封面、歌名、作者）",
          });
        } catch (fallbackError) {
          console.error("[spotify/search] iTunes fallback failed:", fallbackError);
          return NextResponse.json(
            {
              error:
                "Spotify 需开发者 Premium；备用搜索也失败，请检查网络后重试",
            },
            { status: 503 }
          );
        }
      }

      throw spotifyError;
    }
  } catch (error) {
    console.error("[spotify/search]", error);
    return NextResponse.json(
      { error: "搜索失败，请稍后重试" },
      { status: 500 }
    );
  }
}
