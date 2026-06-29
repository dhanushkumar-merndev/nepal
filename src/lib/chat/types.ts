export type RecommendedAction = {
  label: string;
  prompt: string;
  type: "question" | "product" | "cart" | "support" | "add_to_cart" | "checkout" | "plan_selection" | "compare_selection";
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
  serviceOptions?: CompareServiceOption[];
  collapsed?: boolean;
  pendingCartItems?: PendingCartItem[];
};

export type PendingCartItem = {
  productId: string;
  productName: string;
  planId: string;
  planName: string;
  realPrice: number;
  offerPrice?: number | null;
  finalPrice: number;
  quantity: number;
  imageUrl?: string | null;
  addKey?: string;
};

export type PlanSelectionGroup = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  selectionMode?: "auto" | "none";
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

export type CompareServiceOption = {
  productId: string;
  productName: string;
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
