"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedStatValue, type StatFormat } from "@/components/animated-stat-value";

const MotionDiv = motion.div;

type PublicStats = {
  moodAnalyses: number;
  trackMatches: number;
  satisfaction: number;
};

const STAT_CONFIG: {
  key: keyof PublicStats;
  label: string;
  format: StatFormat;
  variant?: "spectrum";
}[] = [
  { key: "moodAnalyses", label: "情绪解析", format: "mood" },
  { key: "trackMatches", label: "曲目匹配", format: "tracks", variant: "spectrum" },
  { key: "satisfaction", label: "满意度", format: "percent" },
];

const FALLBACK: PublicStats = {
  moodAnalyses: 50_000,
  trackMatches: 12_000_000,
  satisfaction: 98,
};

function SpectrumBackdrop() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-end justify-center gap-1 overflow-hidden rounded-2xl px-3 pb-2 opacity-40"
      aria-hidden
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-t-sm bg-gradient-to-t from-violet-600/80 to-cyan-400/90"
          animate={{
            height: ["28%", `${42 + (i % 5) * 10}%`, "32%", `${55 + (i % 3) * 8}%`, "28%"],
          }}
          transition={{
            duration: 1.4 + (i % 4) * 0.25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
          style={{ height: "35%" }}
        />
      ))}
    </motion.div>
  );
}

export function HeroStats() {
  const [stats, setStats] = useState<PublicStats>(FALLBACK);
  const [pulseKey, setPulseKey] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as PublicStats;
      setStats((prev) => {
        if (
          prev.moodAnalyses !== data.moodAnalyses ||
          prev.trackMatches !== data.trackMatches ||
          prev.satisfaction !== data.satisfaction
        ) {
          setPulseKey((k) => k + 1);
        }
        return data;
      });
    } catch {
      /* keep previous */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 18_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.85, duration: 1 }}
      className="relative mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 md:gap-6"
    >
      {STAT_CONFIG.map((stat, i) => (
        <MotionDiv
          key={stat.label}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 + i * 0.1 }}
          whileHover={{ y: -4 }}
          className={cn(
            "glass-card neon-border relative overflow-hidden rounded-2xl p-4 text-center md:p-6",
            stat.variant === "spectrum" && "neon-glow"
          )}
        >
          {stat.variant === "spectrum" && <SpectrumBackdrop />}
          <MotionDiv
            key={`${stat.key}-${pulseKey}`}
            animate={
              pulseKey > 0
                ? { scale: [1, 1.04, 1], opacity: [1, 0.85, 1] }
                : undefined
            }
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <div className="text-2xl font-bold gradient-text md:text-3xl tabular-nums">
              <AnimatedStatValue
                value={stats[stat.key]}
                format={stat.format}
              />
            </div>
            <p className="mt-1 text-xs text-white/45 md:text-sm">{stat.label}</p>
          </MotionDiv>
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}
