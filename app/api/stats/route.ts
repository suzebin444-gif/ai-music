import { NextResponse } from "next/server";

import { getPublicStats } from "@/lib/stats-store";

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "无法加载统计数据" }, { status: 500 });
  }
}
