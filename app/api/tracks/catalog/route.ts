import { NextResponse } from "next/server";

import { getFavoriteCatalogSections } from "@/lib/favorites-store";
import { groupDefaultChineseLightMusic } from "@/lib/track-catalog";

export async function GET() {
  try {
    const defaultSections = groupDefaultChineseLightMusic();
    const favoriteSections = await getFavoriteCatalogSections();

    return NextResponse.json({
      defaultSections,
      favoriteSections,
    });
  } catch (error) {
    console.error("[tracks/catalog] GET failed:", error);
    return NextResponse.json({ error: "加载曲库失败" }, { status: 500 });
  }
}
