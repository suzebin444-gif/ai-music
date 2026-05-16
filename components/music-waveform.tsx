"use client";

import { cn } from "@/lib/utils";

type MusicWaveformProps = {
  bars?: number;
  className?: string;
  barClassName?: string;
  variant?: "default" | "hero" | "mini";
};

const VARIANT_HEIGHT: Record<NonNullable<MusicWaveformProps["variant"]>, string> = {
  default: "h-10",
  hero: "h-16 md:h-20",
  mini: "h-6",
};

export function MusicWaveform({
  bars = 32,
  className,
  barClassName,
  variant = "default",
}: MusicWaveformProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-center gap-[3px]",
        VARIANT_HEIGHT[variant],
        className
      )}
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("waveform-bar", barClassName)}
          style={{
            height: "100%",
            animationDuration: `${0.7 + (i % 7) * 0.12}s`,
            animationDelay: `${(i % 12) * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}
