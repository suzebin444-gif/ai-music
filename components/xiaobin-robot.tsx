"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type XiaobinRobotProps = {
  className?: string;
  /** 滚动时身体倾斜角度 */
  tilt?: number;
  /** 招手 / 活跃状态 */
  waving?: boolean;
  /** 对话面板内紧凑尺寸 */
  compact?: boolean;
};

export function XiaobinRobot({
  className,
  tilt = 0,
  waving = false,
  compact = false,
}: XiaobinRobotProps) {
  return (
    <motion.div
      className={cn("relative select-none", className)}
      style={{ rotate: tilt }}
      animate={
        waving
          ? { rotate: [tilt - 3, tilt + 3, tilt - 3] }
          : { y: [0, -5, 0] }
      }
      transition={
        waving
          ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-violet-500/25 blur-2xl",
          compact ? "scale-75" : "scale-100"
        )}
        aria-hidden
      />
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "relative drop-shadow-[0_8px_32px_rgba(139,92,246,0.45)]",
          compact ? "h-10 w-10" : "h-[88px] w-[76px] sm:h-[100px] sm:w-[86px]"
        )}
        aria-hidden
      >
        <defs>
          <linearGradient id="xb-body" x1="30" y1="55" x2="90" y2="130">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="xb-head" x1="25" y1="15" x2="95" y2="70">
            <stop offset="0%" stopColor="#e9e5ff" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <filter id="xb-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 天线 */}
        <motion.line
          x1="60"
          y1="8"
          x2="60"
          y2="22"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <circle cx="60" cy="6" r="5" fill="#22d3ee" filter="url(#xb-glow)" />

        {/* 左臂 */}
        <motion.g
          animate={
            waving
              ? { rotate: [-18, 22, -18] }
              : { rotate: [-6, 6, -6] }
          }
          transition={{ duration: waving ? 0.55 : 2.5, repeat: Infinity }}
          style={{ originX: "32px", originY: "72px" }}
        >
          <rect x="8" y="62" width="14" height="36" rx="7" fill="url(#xb-body)" opacity="0.9" />
          <circle cx="15" cy="102" r="8" fill="#8b5cf6" />
        </motion.g>

        {/* 右臂 */}
        <motion.g
          animate={
            waving
              ? { rotate: [18, -22, 18] }
              : { rotate: [6, -6, 6] }
          }
          transition={{ duration: waving ? 0.55 : 2.5, repeat: Infinity, delay: 0.1 }}
          style={{ originX: "88px", originY: "72px" }}
        >
          <rect x="98" y="62" width="14" height="36" rx="7" fill="url(#xb-body)" opacity="0.9" />
          <circle cx="105" cy="102" r="8" fill="#8b5cf6" />
        </motion.g>

        {/* 身体 */}
        <rect x="32" y="68" width="56" height="52" rx="16" fill="url(#xb-body)" />
        <rect x="44" y="82" width="32" height="22" rx="8" fill="#030308" fillOpacity="0.35" />
        <motion.circle
          cx="60"
          cy="92"
          r="6"
          fill="#22d3ee"
          filter="url(#xb-glow)"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />

        {/* 头部 */}
        <rect x="24" y="24" width="72" height="52" rx="18" fill="url(#xb-head)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

        {/* 眼睛 */}
        <motion.ellipse
          cx="46"
          cy="48"
          rx="9"
          ry="11"
          fill="#030308"
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.ellipse
          cx="74"
          cy="48"
          rx="9"
          ry="11"
          fill="#030308"
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}
        />
        <circle cx="49" cy="45" r="3.5" fill="#22d3ee" filter="url(#xb-glow)" />
        <circle cx="77" cy="45" r="3.5" fill="#22d3ee" filter="url(#xb-glow)" />

        {/* 嘴（微笑指示灯） */}
        <path
          d="M 48 58 Q 60 66 72 58"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 腿 */}
        <rect x="38" y="118" width="16" height="14" rx="6" fill="#7c3aed" />
        <rect x="66" y="118" width="16" height="14" rx="6" fill="#7c3aed" />
      </svg>
    </motion.div>
  );
}
