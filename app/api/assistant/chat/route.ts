import { XIAOBIN_SYSTEM_PROMPT } from "@/lib/assistant-prompt";
import type { AssistantChatRequest } from "@/lib/assistant-types";
import {
  deepseekChat,
  type DeepseekMessage,
} from "@/lib/deepseek-client";

const MAX_MESSAGES = 24;
const MAX_CONTENT_LENGTH = 2000;

function sanitizeMessages(
  raw: AssistantChatRequest["messages"]
): DeepseekMessage[] {
  const cleaned: DeepseekMessage[] = [];

  for (const msg of raw.slice(-MAX_MESSAGES)) {
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    const content = msg.content?.trim();
    if (!content || content.length > MAX_CONTENT_LENGTH) continue;
    cleaned.push({ role: msg.role, content });
  }

  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantChatRequest;
    const userMessages = sanitizeMessages(body.messages ?? []);

    if (userMessages.length === 0) {
      return Response.json(
        { error: "请输入消息后再发送" },
        { status: 400 }
      );
    }

    const last = userMessages[userMessages.length - 1];
    if (last.role !== "user") {
      return Response.json({ error: "无效的消息序列" }, { status: 400 });
    }

    const messages: DeepseekMessage[] = [
      { role: "system", content: XIAOBIN_SYSTEM_PROMPT },
      ...userMessages,
    ];

    const upstream = await deepseekChat(messages, {
      stream: true,
      temperature: 0.75,
      max_tokens: 1024,
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("[assistant/chat] DeepSeek error:", upstream.status, errText);
      if (upstream.status === 401) {
        return Response.json(
          { error: "DeepSeek API 密钥无效，请检查 .env.local" },
          { status: 401 }
        );
      }
      return Response.json(
        { error: "小斌暂时无法回复，请稍后重试" },
        { status: 502 }
      );
    }

    if (!upstream.body) {
      return Response.json({ error: "空响应" }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data) as {
                  choices?: Array<{
                    delta?: { content?: string };
                  }>;
                };
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content: chunk })}\n\n`
                    )
                  );
                }
              } catch {
                /* skip malformed chunk */
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[assistant/chat] stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "流式传输中断" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DEEPSEEK_API_KEY")) {
      return Response.json(
        {
          error: "未配置 DeepSeek API，请在 .env.local 中设置 DEEPSEEK_API_KEY",
        },
        { status: 503 }
      );
    }
    console.error("[assistant/chat]", error);
    return Response.json({ error: "请求处理失败" }, { status: 500 });
  }
}
