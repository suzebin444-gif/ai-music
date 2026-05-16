export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: number;
};

export type AssistantChatRequest = {
  messages: Array<{ role: AssistantRole; content: string }>;
};
