import { NextResponse } from "next/server";

import { enrichTrackWithStreaming } from "@/lib/track-resolver";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      artist?: string;
    };

    const title = body.title?.trim();
    const artist = body.artist?.trim();

    if (!title || !artist) {
      return NextResponse.json(
        { error: "请提供 title 与 artist" },
        { status: 400 }
      );
    }

    const track = await enrichTrackWithStreaming({
      id: "resolve",
      title,
      artist,
      genre: "",
      style: "",
      duration: "",
      mood: [],
      scenes: [],
      category: "",
      gradient: "from-violet-600 to-cyan-600",
    });

    return NextResponse.json({ track });
  } catch (error) {
    console.error("[music/resolve] failed:", error);
    return NextResponse.json({ error: "解析播放链接失败" }, { status: 500 });
  }
}
