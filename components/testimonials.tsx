"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Quote, Star } from "lucide-react";

import { SectionWrapper } from "@/components/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/lib/review-types";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} 星`}
        >
          <Star
            className={cn(
              "h-6 w-6",
              n <= value ? "fill-amber-400 text-amber-400" : "text-white/25"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ item, index }: { item: Review; index: number }) {
  const initials = item.name.slice(0, 2).toUpperCase();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="glass-card neon-border relative rounded-2xl p-6"
    >
      <Quote className="mb-4 h-8 w-8 text-violet-400/40" />
      <p className="text-sm leading-relaxed text-white/70">{item.content}</p>
      <div className="mt-4 flex gap-0.5">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-xs text-white/40">{item.role}</p>
        </div>
      </div>
    </MotionDiv>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = (await res.json()) as { reviews?: Review[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "加载失败");
      setReviews(data.reviews ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载评价失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, content, rating }),
      });
      const data = (await res.json()) as { review?: Review; error?: string };
      if (!res.ok) throw new Error(data.error ?? "提交失败");

      if (data.review) {
        setReviews((prev) => [data.review!, ...prev]);
      }
      setName("");
      setRole("");
      setContent("");
      setRating(5);
      setSuccess("感谢你的评价，已展示在下方列表中");
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionWrapper id="reviews" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <div className="mb-12 text-center">
        <Badge variant="default" className="mb-4">
          用户评价
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">聆听者的声音</h2>
        <p className="mt-3 text-white/50">
          体验 SQ-MUSIC 后，欢迎留下你的真实感受
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <form
          onSubmit={handleSubmit}
          className="glass-panel neon-border lg:col-span-2 rounded-2xl p-6 md:p-8"
        >
          <h3 className="text-lg font-semibold">写下你的评价</h3>
          <p className="mt-1 text-sm text-white/45">无需登录，提交后即可展示</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">昵称 *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的昵称"
                maxLength={24}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">身份（选填）</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="如：设计师、学生"
                maxLength={32}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">评分 *</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">评价内容 *</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你使用情绪推荐、试听或收藏的体验…"
                className="min-h-[120px]"
                maxLength={500}
                required
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-300">{error}</p>
          )}
          {success && (
            <p className="mt-4 text-sm text-cyan-300">{success}</p>
          )}

          <Button type="submit" className="mt-6 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                提交中…
              </>
            ) : (
              "发布评价"
            )}
          </Button>
        </form>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              加载评价中…
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border-dashed py-20 text-white/40">
              <Quote className="mb-3 h-10 w-10 opacity-30" />
              <p>暂无评价，成为第一个分享体验的人吧</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {reviews.map((item, index) => (
                <ReviewCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
