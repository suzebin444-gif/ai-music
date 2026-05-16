"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#030308]" />

      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <div
          className="animate-aurora h-[140%] w-[140%] rounded-full opacity-60"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.15), rgba(6,182,212,0.12), rgba(59,130,246,0.08), rgba(124,58,237,0.15))",
          }}
        />
      </div>

      <div className="grid-overlay absolute inset-0 opacity-50" />

      <motion.div
        className="animate-pulse-glow absolute -left-40 top-[15%] h-[520px] w-[520px] rounded-full bg-violet-600/25 blur-[130px]"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="animate-pulse-glow absolute -right-32 top-[25%] h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[120px]"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[20%] top-[60%] h-[280px] w-[280px] rounded-full bg-fuchsia-600/10 blur-[90px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent"
        style={{ animation: "scanline 8s linear infinite" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/20 via-transparent to-[#030308]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.12),transparent)]" />

      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
