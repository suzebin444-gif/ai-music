import { readJsonFile, tryWriteJsonFile, writeJsonFile } from "@/lib/json-store";
import { testimonials } from "@/lib/music-data";
import type { Review, ReviewInput } from "@/lib/review-types";

const FILE = "reviews.json";
const EXCLUDED_NAMES = ["佐藤美咲", "佐藤"];

function isExcludedReview(review: Review): boolean {
  return EXCLUDED_NAMES.some((name) => review.name.includes(name));
}

function seedReviews(): Review[] {
  const now = Date.now();
  return testimonials.map((item, index) => ({
    id: `seed-${item.id}`,
    name: item.name,
    role: item.role,
    content: item.content,
    rating: item.rating,
    createdAt: new Date(now - (testimonials.length - index) * 86_400_000).toISOString(),
  }));
}

function sortReviews(reviews: Review[]): Review[] {
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listReviews(): Promise<Review[]> {
  let existing = await readJsonFile<Review[]>(FILE, []);

  if (existing.length === 0) {
    const seeded = seedReviews();
    await tryWriteJsonFile(FILE, seeded);
    return seeded;
  }

  const filtered = existing.filter((r) => !isExcludedReview(r));
  if (filtered.length !== existing.length) {
    await writeJsonFile(FILE, filtered);
  }

  return sortReviews(filtered);
}

export async function listReviewsForSession(sessionId: string): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((r) => r.sessionId === sessionId);
}

export async function addReview(
  input: ReviewInput,
  sessionId?: string
): Promise<Review> {
  const reviews = await listReviews();
  const review: Review = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    role: input.role?.trim() || "访客",
    content: input.content.trim(),
    rating: input.rating,
    createdAt: new Date().toISOString(),
    sessionId,
  };

  const next = [review, ...reviews];
  await writeJsonFile(FILE, next);
  return review;
}
