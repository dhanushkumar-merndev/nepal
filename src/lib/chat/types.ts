export type RecommendedAction = {
  label: string;
  prompt: string;
  type: "question" | "product" | "cart" | "support";
  productSlug?: string;
  planId?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  recommendedActions?: RecommendedAction[];
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};
