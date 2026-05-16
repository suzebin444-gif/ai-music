"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import {
  DouyinIcon,
  WechatIcon,
  XiaohongshuIcon,
} from "@/components/social-icons";
import { getSocialPlatforms, WECHAT_OFFICIAL_NAME } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const ICONS = {
  douyin: DouyinIcon,
  xiaohongshu: XiaohongshuIcon,
  wechat: WechatIcon,
} as const;

const HOVER_STYLES = {
  douyin: "hover:border-white/25 hover:bg-white/10 hover:text-white hover:shadow-[0_0_16px_rgba(255,255,255,0.12)]",
  xiaohongshu:
    "hover:border-[#ff2442]/50 hover:bg-[#ff2442]/10 hover:text-[#ff6b81] hover:shadow-[0_0_16px_rgba(255,36,66,0.25)]",
  wechat:
    "hover:border-[#07c160]/50 hover:bg-[#07c160]/10 hover:text-[#2ee07a] hover:shadow-[0_0_16px_rgba(7,193,96,0.2)]",
} as const;

export function SocialLinks() {
  const platforms = getSocialPlatforms();
  const [wechatTip, setWechatTip] = useState(false);

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs text-white/35">关注我们</p>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => {
          const Icon = ICONS[platform.id];
          const isWechat = platform.id === "wechat";
          const useDefaultWechat =
            isWechat &&
            !process.env.NEXT_PUBLIC_WECHAT_URL?.trim();

          if (isWechat && useDefaultWechat) {
            return (
              <motion.div key={platform.id} className="relative">
                <button
                  type="button"
                  onClick={() => setWechatTip((v) => !v)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all duration-300",
                    HOVER_STYLES.wechat,
                    wechatTip && "border-[#07c160]/50 text-[#2ee07a]"
                  )}
                  aria-label={`${platform.label}：${WECHAT_OFFICIAL_NAME}`}
                  aria-expanded={wechatTip}
                >
                  <Icon />
                </button>
                <AnimatePresence>
                  {wechatTip && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="glass-panel absolute bottom-full left-0 z-10 mb-2 w-56 rounded-xl border border-[#07c160]/30 p-3 text-left shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => setWechatTip(false)}
                        className="absolute right-2 top-2 text-white/40 hover:text-white"
                        aria-label="关闭"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <p className="pr-6 text-sm font-medium text-[#2ee07a]">
                        微信公众号
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {WECHAT_OFFICIAL_NAME}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-white/45">
                        在微信搜索公众号名称关注我们，获取情绪歌单与更新。
                      </p>
                      {process.env.NEXT_PUBLIC_WECHAT_QR_URL?.trim() && (
                        <a
                          href={process.env.NEXT_PUBLIC_WECHAT_QR_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-cyan-400/90 hover:underline"
                        >
                          查看二维码 →
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          return (
            <a
              key={platform.id}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              title={platform.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all duration-300",
                HOVER_STYLES[platform.id]
              )}
              aria-label={`在${platform.label}关注 SQMUSIC`}
            >
              <Icon />
            </a>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-white/25">
        抖音 · 小红书 · 微信
      </p>
    </div>
  );
}
