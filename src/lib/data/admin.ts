import { createAdminClient } from "@/lib/supabase/admin";
import { getRedis } from "@/lib/ai/cache";
import type { Product, Review } from "@/lib/types";

export type AdminOrder = {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  phone: string;
  payment_method: string | null;
  note: string | null;
  cart_items: unknown;
  total_amount: number | null;
  whatsapp_sent: boolean | null;
  status: "new" | "processing" | "completed" | "cancelled" | string;
  created_at: string;
  updated_at: string | null;
};

export type AdminMetrics = {
  products: number;
  plans: number;
  orders: number;
  revenue: number;
  grossProfit: number;
  pendingReviews: number;
};

export type AdminDailyOrder = {
  date: string;
  orders: number;
  revenue: number;
  productOrders: Record<string, number>;
};

type OrderCartItem = {
  finalPrice?: number;
  actualPrice?: number;
  quantity?: number;
};

const ADMIN_DASHBOARD_CACHE_KEY = "ott:admin:dashboard:v1";
const ADMIN_ORDERS_CACHE_PREFIX = "ott:admin:orders:v1:";
const ADMIN_REVIEWS_CACHE_PREFIX = "ott:admin:reviews:v1:";
const ADMIN_LIST_CACHE_TTL = 60 * 60 * 24;

export async function invalidateAdminDashboardCache() {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(ADMIN_DASHBOARD_CACHE_KEY);
}

export async function invalidateAdminListCache() {
  const redis = getRedis();
  if (!redis) return;
  const keys = await redis.keys(`${ADMIN_ORDERS_CACHE_PREFIX}*`);
  keys.push(...(await redis.keys(`${ADMIN_REVIEWS_CACHE_PREFIX}*`)));
  if (keys.length) await redis.del(...keys);
}

export async function getAdminProducts() {
  const supabase = createAdminClient();
  if (!supabase) return [] as Product[];

  const { data, error } = await supabase
    .from("products")
    .select("*, plans(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "plans", ascending: true });

  if (error) return [];
  return data as Product[];
}

type AdminOrderFilters = {
  query?: string | null;
  from?: string | null;
  to?: string | null;
};

type AdminListPageFilters = AdminOrderFilters & {
  page?: number;
  pageSize?: number;
  status?: string | null;
  product?: string | null;
};

export type AdminListPage<T> = {
  data: T[];
  totalCount: number;
};

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const cacheKey = adminListCacheKey(ADMIN_ORDERS_CACHE_PREFIX, filters);
  const redis = getRedis();
  const cached = await redis?.get<AdminOrder[]>(cacheKey);
  if (cached) return cached;

  const supabase = createAdminClient();
  if (!supabase) return [] as AdminOrder[];

  let builder = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);

  const query = filters.query?.trim();
  if (query) builder = builder.or(`customer_name.ilike.%${query}%,phone.ilike.%${query}%,status.ilike.%${query}%`);
  if (filters.from) builder = builder.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) builder = builder.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const { data, error } = await builder;
  if (error) return [];
  const payload = data as AdminOrder[];
  await redis?.set(cacheKey, payload, { ex: ADMIN_LIST_CACHE_TTL });
  return payload;
}

export async function getAdminOrdersPage(filters: AdminListPageFilters = {}): Promise<AdminListPage<AdminOrder>> {
  const cacheKey = adminListPageCacheKey(ADMIN_ORDERS_CACHE_PREFIX, filters);
  const redis = getRedis();
  const cached = await redis?.get<AdminListPage<AdminOrder>>(cacheKey);
  if (cached) return cached;

  const supabase = createAdminClient();
  if (!supabase) return { data: [], totalCount: 0 };

  const pageSize = clampPageSize(filters.pageSize);
  const page = Math.max(1, filters.page ?? 1);
  const fromIndex = (page - 1) * pageSize;
  const toIndex = fromIndex + pageSize - 1;

  let builder = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(fromIndex, toIndex);

  const query = filters.query?.trim();
  if (query) builder = builder.or(`customer_name.ilike.%${query}%,phone.ilike.%${query}%,status.ilike.%${query}%`);
  if (filters.from) builder = builder.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) builder = builder.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const { data, error, count } = await builder;
  if (error) return { data: [], totalCount: 0 };
  const payload = { data: data as AdminOrder[], totalCount: count ?? 0 };
  await redis?.set(cacheKey, payload, { ex: ADMIN_LIST_CACHE_TTL });
  return payload;
}

export async function getAdminReviews() {
  const cacheKey = adminListCacheKey(ADMIN_REVIEWS_CACHE_PREFIX);
  const redis = getRedis();
  const cached = await redis?.get<Review[]>(cacheKey);
  if (cached) return cached;

  const supabase = createAdminClient();
  if (!supabase) return [] as Review[];

  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) return [];
  const payload = data.map((review) => ({ ...review, product_name: review.products?.name })) as Review[];
  await redis?.set(cacheKey, payload, { ex: ADMIN_LIST_CACHE_TTL });
  return payload;
}

export async function getAdminReviewsPage(filters: AdminListPageFilters = {}): Promise<AdminListPage<Review>> {
  const cacheKey = adminListPageCacheKey(ADMIN_REVIEWS_CACHE_PREFIX, filters);
  const redis = getRedis();
  const cached = await redis?.get<AdminListPage<Review>>(cacheKey);
  if (cached) return cached;

  const supabase = createAdminClient();
  if (!supabase) return { data: [], totalCount: 0 };

  const pageSize = clampPageSize(filters.pageSize);
  const page = Math.max(1, filters.page ?? 1);
  const fromIndex = (page - 1) * pageSize;
  const toIndex = fromIndex + pageSize - 1;

  let builder = supabase
    .from("reviews")
    .select("*, products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(fromIndex, toIndex);

  const query = filters.query?.trim();
  if (query) builder = builder.or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%,comment.ilike.%${query}%,status.ilike.%${query}%`);
  if (filters.status) builder = builder.eq("status", filters.status);
  if (filters.from) builder = builder.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) builder = builder.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const { data, error, count } = await builder;
  if (error) return { data: [], totalCount: 0 };
  const payload = {
    data: (data ?? []).map((review) => ({ ...review, product_name: review.products?.name })) as Review[],
    totalCount: count ?? 0,
  };
  await redis?.set(cacheKey, payload, { ex: ADMIN_LIST_CACHE_TTL });
  return payload;
}

export async function getAdminDashboardData() {
  const redis = getRedis();
  const cached = await redis?.get<{
    metrics: AdminMetrics;
    dailyOrders: AdminDailyOrder[];
  }>(ADMIN_DASHBOARD_CACHE_KEY);
  if (cached) return cached;

  const [products, orders, reviews] = await Promise.all([
    getAdminProducts(),
    getAdminOrders(),
    getAdminReviews(),
  ]);

  const plans = products.flatMap((product) => product.plans ?? []);
  const completedOrders = orders.filter((order) => order.status === "completed");
  const revenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const grossProfit = completedOrders.reduce((sum, order) => sum + getOrderGrossProfit(order), 0);
  const daily = new Map<string, AdminDailyOrder>();
  for (const order of orders) {
    const date = new Date(order.created_at).toISOString().slice(0, 10);
    const current = daily.get(date) ?? { date, orders: 0, revenue: 0, productOrders: {} };
    current.orders += 1;
    if (order.status === "completed") current.revenue += Number(order.total_amount ?? 0);
    for (const productName of getOrderProductNames(order)) {
      current.productOrders[productName] = (current.productOrders[productName] ?? 0) + 1;
    }
    daily.set(date, current);
  }

  const payload = {
    metrics: {
      products: products.length,
      plans: plans.length,
      orders: orders.length,
      revenue,
      grossProfit,
      pendingReviews: reviews.filter((review) => review.status === "pending").length,
    },
    dailyOrders: Array.from(daily.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-14),
  };

  await redis?.set(ADMIN_DASHBOARD_CACHE_KEY, payload, { ex: 60 });
  return payload;
}

export function getOrderGrossProfit(order: Pick<AdminOrder, "cart_items">) {
  if (!Array.isArray(order.cart_items)) return 0;

  return order.cart_items.reduce((sum, rawItem) => {
    if (!rawItem || typeof rawItem !== "object") return sum;
    const item = rawItem as OrderCartItem;
    const quantity = Number(item.quantity ?? 1);
    const sellPrice = Number(item.finalPrice ?? 0);
    const actualPrice = Number(item.actualPrice ?? 0);
    return sum + Math.max(sellPrice - actualPrice, 0) * quantity;
  }, 0);
}

function getOrderProductNames(order: Pick<AdminOrder, "cart_items">) {
  if (!Array.isArray(order.cart_items)) return [];
  const names = order.cart_items
    .map((rawItem) => {
      if (!rawItem || typeof rawItem !== "object") return "";
      const productName = (rawItem as { productName?: unknown }).productName;
      return typeof productName === "string" ? productName.trim() : "";
    })
    .filter(Boolean);
  return Array.from(new Set(names));
}

function adminListCacheKey(prefix: string, filters: AdminOrderFilters = {}) {
  const normalized = {
    q: filters.query?.trim().toLowerCase() || "",
    from: filters.from || "",
    to: filters.to || "",
  };
  return `${prefix}${Buffer.from(JSON.stringify(normalized)).toString("base64url")}`;
}

function adminListPageCacheKey(prefix: string, filters: AdminListPageFilters = {}) {
  const normalized = {
    q: filters.query?.trim().toLowerCase() || "",
    from: filters.from || "",
    to: filters.to || "",
    page: Math.max(1, filters.page ?? 1),
    pageSize: clampPageSize(filters.pageSize),
    status: filters.status || "",
    product: filters.product || "",
  };
  return `${prefix}page:${Buffer.from(JSON.stringify(normalized)).toString("base64url")}`;
}

function clampPageSize(value: number | undefined) {
  return Math.max(1, Math.min(value ?? 9, 100));
}
