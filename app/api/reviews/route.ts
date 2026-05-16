import { NextResponse } from "next/server";

import { addReview, listReviews } from "@/lib/reviews-store";
import type { ReviewInput } from "@/lib/review-types";
import { getOrCreateSessionId } from "@/lib/session";

function validateReview(body: unknown): ReviewInput | string {
  if (!body || typeof body !== "object") return "无效的请求体";

  const { name, role, content, rating } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 24) {
    return "昵称需为 2–24 个字符";
  }
  if (role !== undefined && typeof role !== "string") {
    return "身份格式无效";
  }
  if (typeof role === "string" && role.length > 32) {
    return "身份不超过 32 个字符";
  }
  if (typeof content !== "string" || content.trim().length < 10 || content.trim().length > 500) {
    return "评价内容需为 10–500 个字符";
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "请选择 1–5 星评分";
  }

  return {
    name: name.trim(),
    role: typeof role === "string" ? role.trim() : undefined,
    content: content.trim(),
    rating,
  };
}

export async function GET() {
  try {
    const reviews = await listReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("[reviews] GET failed:", error);
    return NextResponse.json({ error: "加载评价失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateReview(body);
    if (typeof validated === "string") {
      return NextResponse.json({ error: validated }, { status: 400 });
    }

    const { sessionId } = await getOrCreateSessionId();
    const review = await addReview(validated, sessionId);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[reviews] POST failed:", error);
    return NextResponse.json({ error: "提交评价失败，请稍后重试" }, { status: 500 });
  }
}
