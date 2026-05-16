"use client";

import { Sparkles } from "lucide-react";

import { SocialLinks } from "@/components/social-links";

const footerLinks = {
  产品: ["情绪推荐", "曲库浏览", "播放列表", "API"],
  资源: ["设计系统", "文档", "博客", "更新日志"],
  关于: ["团队", "招聘", "联系", "隐私政策"],
};

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold">
                SQ<span className="text-violet-400">MUSIC</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              AI 驱动的情绪音乐推荐平台。用一句话描述心情，发现属于你的声场。
            </p>
            <SocialLinks />
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold text-white/80">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/40 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">© 2026 SQMUSIC. 作品集展示项目</p>
          <p className="text-xs text-white/30">
            Next.js · Tailwind · Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
