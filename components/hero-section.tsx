"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Waves } from "lucide-react";

import { HeroStats } from "@/components/hero-stats";
import { MusicWaveform } from "@/components/music-waveform";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MotionDiv = motion.div;

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 md:px-6">
      {/* Hero ambient waveform */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] flex justify-center opacity-30">
        <MusicWaveform variant="hero" bars={48} className="max-w-4xl w-full" />
      </div>

      <MotionDiv
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative mb-8"
      >
        <Badge
          variant="neon"
          className="gap-1.5 border-cyan-400/20 px-4 py-1.5 text-xs shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        >
          <Waves className="h-3 w-3" />
          AI 情绪音乐引擎 · Beta
        </Badge>
      </MotionDiv>

      <motion.h1
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl text-center text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-7xl"
      >
        <span className="gradient-text-shine">用情绪，</span>
        <br />
        <span className="text-white">发现你的下一首歌</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="relative mt-6 max-w-xl text-center text-base leading-relaxed text-white/55 md:text-lg"
      >
        描述此刻的心情，AI 将为你构建专属声场。
        <span className="text-white/35"> Apple 级质感 · Spotify 级沉浸 · Linear 级动效</span>
      </motion.p>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Button size="lg" asChild>
          <a href="#mood">
            开始情绪探索
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="lg" className="neon-border">
          <Play className="h-4 w-4 fill-current" />
          试听精选
        </Button>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="relative mt-14"
      >
        <MusicWaveform variant="mini" bars={20} className="opacity-60" />
      </MotionDiv>

      <HeroStats />

      <MotionDiv
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="glass-panel flex h-10 w-6 items-start justify-center rounded-full p-1.5">
          <MotionDiv
            animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="h-2 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
          />
        </div>
      </MotionDiv>
    </section>
  );
}
