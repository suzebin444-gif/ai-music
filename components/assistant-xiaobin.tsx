"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown, Loader2, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { XiaobinRobot } from "@/components/xiaobin-robot";
import { useAssistant } from "@/contexts/assistant-provider";
import { useScrollParallax } from "@/hooks/use-scroll-parallax";
import type { AssistantMessage } from "@/lib/assistant-types";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

const WELCOME: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你好，我是小斌～可以问我怎么根据情绪选歌、平台功能，或聊聊你想听什么样的音乐。",
  createdAt: 0,
};

const QUICK_PROMPTS = [
  "怎么根据心情选歌？",
  "深夜学习适合听什么？",
  "网站有哪些功能？",
] as const;

function createId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AssistantXiaobin() {
  const { isOpen, close, toggle } = useAssistant();
  const { parallaxY, tilt } = useScrollParallax();
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(scrollToBottom);
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen, messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || loading) return;

      setError(null);
      setInput("");

      const userMsg: AssistantMessage = {
        id: createId(),
        role: "user",
        content,
        createdAt: Date.now(),
      };

      const assistantId = createId();
      const assistantPlaceholder: AssistantMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const history = [...messages.filter((m) => m.id !== "welcome"), userMsg];
      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setLoading(true);

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "发送失败");
        }

        if (!res.body) throw new Error("无响应数据");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;

            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data) as {
                content?: string;
                error?: string;
              };
              if (json.error) throw new Error(json.error);
              if (json.content) {
                accumulated += json.content;
                const snap = accumulated;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: snap } : m
                  )
                );
              }
            } catch (parseErr) {
              if (
                parseErr instanceof Error &&
                parseErr.message !== "Unexpected end of JSON input"
              ) {
                throw parseErr;
              }
            }
          }
        }

        if (!accumulated.trim()) {
          throw new Error("小斌没有返回内容，请重试");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "发送失败";
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 22 }}
      className="fixed right-3 z-[70] md:right-6"
      style={{ bottom: `calc(5.5rem + ${parallaxY}px)` }}
    >
      <motion.div
        className="flex w-[min(100vw-1.5rem,380px)] flex-col items-end gap-2"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* 提示气泡：未展开时显示 */}
        <AnimatePresence>
          {!isOpen && hovering && (
            <MotionDiv
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.92 }}
              className="glass-panel w-full max-w-[220px] self-end rounded-2xl rounded-br-md border border-violet-400/25 px-3 py-2 text-right text-xs text-white/75 shadow-lg"
            >
              点我开始对话
              <span className="mt-0.5 block text-[10px] text-cyan-400/70">
                页面可继续浏览
              </span>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* 机器人（始终在上方） */}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "group relative self-end rounded-3xl p-1 transition-transform duration-300",
            "hover:scale-[1.03] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030308]",
            isOpen && "ring-2 ring-violet-400/40"
          )}
          aria-expanded={isOpen}
          aria-label={isOpen ? "收起小斌对话" : "展开小斌对话"}
        >
          <motion.div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet-500/40 to-cyan-400/30 blur-md"
            animate={{ opacity: hovering || isOpen ? 0.95 : 0.5 }}
          />
          <motion.div className="relative rounded-2xl border border-white/15 bg-[#0a0a14]/90 px-2 pb-1 pt-2 backdrop-blur-xl">
            <XiaobinRobot tilt={tilt} waving={hovering || isOpen} />
            <p className="flex items-center justify-center gap-0.5 pb-1.5 text-[10px] font-medium text-white/50">
              小斌
              {isOpen ? (
                <ChevronDown className="h-3 w-3 text-cyan-400/80" />
              ) : null}
            </p>
          </motion.div>
        </button>

        {/* 对话框：紧挨机器人下侧展开，不遮挡整页 */}
        <AnimatePresence>
          {isOpen && (
            <MotionDiv
              initial={{ opacity: 0, y: -8, scaleY: 0.92 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ transformOrigin: "top right" }}
              className={cn(
                "glass-panel neon-glow-strong neon-border flex w-full flex-col overflow-hidden rounded-2xl shadow-2xl",
                "max-h-[min(52vh,420px)] min-h-[280px]"
              )}
              role="dialog"
              aria-label="小斌对话"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-sm font-medium">与小斌对话</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={close}
                  aria-label="收起对话"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </header>

              <motion.div
                ref={listRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <motion.div className="mt-0.5 shrink-0">
                        <XiaobinRobot compact className="pointer-events-none" />
                      </motion.div>
                    )}
                    <motion.div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-violet-600/90 to-cyan-600/80 text-white"
                          : "border border-white/10 bg-white/5 text-white/85"
                      )}
                    >
                      {msg.role === "assistant" && msg.id !== "welcome" && (
                        <span className="mb-0.5 block text-[10px] text-violet-300/80">
                          小斌
                        </span>
                      )}
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content ||
                          (loading && msg.role === "assistant" ? (
                            <Loader2 className="inline h-4 w-4 animate-spin text-white/50" />
                          ) : (
                            ""
                          ))}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {error && (
                <motion.div className="mx-3 mb-1 flex shrink-0 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <motion.div className="shrink-0 border-t border-white/10 px-3 py-2">
                <motion.div className="mb-2 flex flex-wrap gap-1">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={loading}
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55 transition-colors hover:border-violet-400/40 hover:text-white disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </motion.div>
                <form onSubmit={onSubmit} className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="输入消息…"
                    rows={1}
                    disabled={loading}
                    className="max-h-20 min-h-[40px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-400/25 disabled:opacity-60"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !input.trim()}
                    className="h-10 w-10 shrink-0"
                    aria-label="发送"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </motion.div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionDiv>
  );
}
