export const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
export const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";

export type DeepseekRole = "system" | "user" | "assistant";

export type DeepseekMessage = {
  role: DeepseekRole;
  content: string;
};

export function getDeepseekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }
  return {
    apiKey,
    model: process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_DEEPSEEK_MODEL,
  };
}

type ChatOptions = {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: "json_object" };
};

export async function deepseekChat(
  messages: DeepseekMessage[],
  options: ChatOptions = {}
): Promise<Response> {
  const { apiKey, model } = getDeepseekConfig();

  return fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      stream: options.stream ?? false,
      response_format: options.response_format,
    }),
  });
}
