export type RecommendedAction = {
  label: string;
  prompt: string;
  type: "question" | "product" | "cart" | "support" | "add_to_cart" | "checkout" | "plan_selection";
  productSlug?: string;
  planId?: string;
  productId?: string;
  productName?: string;
  planName?: string;
  duration?: string | null;
  realPrice?: number;
  offerPrice?: number | null;
  finalPrice?: number;
  imageUrl?: string | null;
  quantity?: number;
  addKey?: string;
  groups?: PlanSelectionGroup[];
};

export type PlanSelectionGroup = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  selectedPlanIds?: string[];
  options: PlanSelectionOption[];
};

export type PlanSelectionOption = {
  planId: string;
  planName: string;
  duration?: string | null;
  stockStatus: string;
  realPrice: number;
  offerPrice?: number | null;
  finalPrice: number;
  addKey?: string;
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
