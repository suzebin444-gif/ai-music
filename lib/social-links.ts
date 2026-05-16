export type SocialPlatform = {
  id: "douyin" | "xiaohongshu" | "wechat";
  label: string;
  href: string;
  /** 外链；微信可为公众号介绍页或扫码页 */
  external?: boolean;
};

/** 在 .env.local 配置各平台主页链接 */
export function getSocialPlatforms(): SocialPlatform[] {
  return [
    {
      id: "douyin",
      label: "抖音",
      href:
        process.env.NEXT_PUBLIC_DOUYIN_URL?.trim() ||
        "https://www.douyin.com/search/SQMUSIC",
      external: true,
    },
    {
      id: "xiaohongshu",
      label: "小红书",
      href:
        process.env.NEXT_PUBLIC_XIAOHONGSHU_URL?.trim() ||
        "https://www.xiaohongshu.com/search_result?keyword=SQMUSIC",
      external: true,
    },
    {
      id: "wechat",
      label: "微信",
      href:
        process.env.NEXT_PUBLIC_WECHAT_URL?.trim() ||
        "https://weixin.qq.com/",
      external: true,
    },
  ];
}

export const WECHAT_OFFICIAL_NAME =
  process.env.NEXT_PUBLIC_WECHAT_NAME?.trim() || "SQMUSIC";
