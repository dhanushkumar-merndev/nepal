export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Coming Soon";

export type Plan = {
  id: string;
  product_id: string;
  name: string;
  duration: string | null;
  real_price: number;
  offer_price: number | null;
  features: string[];
  stock_status: StockStatus;
  is_active: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  image_url: string | null;
  stock_status: StockStatus;
  is_best_seller: boolean;
  is_active: boolean;
  sort_order: number;
  rating?: number;
  review_count?: number;
  plans: Plan[];
};

export type Review = {
  id: string;
  product_id: string;
  product_name?: string;
  customer_name: string;
  customer_email?: string;
  customer_avatar_url: string | null;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type CartItem = {
  productId: string;
  productName: string;
  planId: string;
  planName: string;
  realPrice: number;
  offerPrice: number | null;
  finalPrice: number;
  quantity: number;
  imageUrl?: string | null;
};
