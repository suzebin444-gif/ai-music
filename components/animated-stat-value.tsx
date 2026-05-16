"use client";

import { useEffect, useRef, useState } from "react";

export type StatFormat = "mood" | "tracks" | "percent";

function formatValue(value: number, format: StatFormat): string {
  if (format === "percent") {
    const rounded =
      value >= 99 ? Math.round(value) : Math.round(value * 10) / 10;
    return `${rounded}%`;
  }
  if (format === "tracks") {
    if (value >= 1_000_000) {
      const m = value / 1_000_000;
      return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M+`;
    }
    if (value >= 1_000) {
      const k = value / 1_000;
      return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K+`;
    }
    return `${Math.round(value)}+`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K+`;
  }
  return `${Math.round(value)}+`;
}

type AnimatedStatValueProps = {
  value: number;
  format: StatFormat;
  className?: string;
  duration?: number;
};

export function AnimatedStatValue({
  value,
  format,
  className,
  duration = 1400,
}: AnimatedStatValueProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (value - from) * eased;
      setDisplay(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className} aria-live="polite">
      {formatValue(display, format)}
    </span>
  );
}
