"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssistant } from "@/contexts/assistant-provider";

const navLinks = [
  { label: "体验", href: "#mood" },
  { label: "推荐", href: "#recommend" },
  { label: "Spotify", href: "#spotify" },
  { label: "曲库", href: "#tracks" },
  { label: "评价", href: "#reviews" },
  { label: "报告", href: "#report" },
];

export function Navbar() {
  const { open } = useAssistant();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6"
    >
      <nav className="glass-nav mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 md:px-6">
        <a
          href="#"
          className="group flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(139,92,246,0.55)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            SQ<span className="gradient-text">MUSIC</span>
          </span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm text-white/55 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-violet-400 after:to-cyan-400 after:transition-all after:duration-300 hover:text-white hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex gap-1.5"
            onClick={open}
          >
            <Bot className="h-3.5 w-3.5" />
            小斌
          </Button>
          <Button variant="default" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#mood">开始探索</a>
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
