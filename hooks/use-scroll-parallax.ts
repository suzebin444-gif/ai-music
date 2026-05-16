"use client";

import { useEffect, useState } from "react";

export function useScrollParallax() {
  const [scrollY, setScrollY] = useState(0);
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    let lastY = 0;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        setScrollY(y);
        setTilt((prev) => {
          const next = delta * 0.08;
          return prev * 0.7 + next * 0.3;
        });
        lastY = y;
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const maxShift = typeof window !== "undefined" ? window.innerHeight * 0.28 : 200;
  const parallaxY = Math.min(scrollY * 0.14, maxShift);

  return { scrollY, parallaxY, tilt: Math.max(-10, Math.min(10, tilt)) };
}
