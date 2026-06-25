import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

loadEnv(".env.local");
loadEnv(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const bucket = "product-images";

const products = [
  product("Netflix", "netflix", "OTT & Streaming", "Subscription activation support for premium streaming plans.", "netflix", "In Stock", true, [
    plan("1 Month", "30 days", 499, 299, "In Stock"),
    plan("3 Months", "90 days", 1299, 849, "Low Stock"),
  ]),
  product("Prime Video", "prime-video", "OTT & Streaming", "Streaming activation support for movies, series, and originals.", "primevideo", "In Stock", false, [
    plan("1 Month", "30 days", 399, 249, "In Stock"),
  ]),
  product("SonyLIV", "sonyliv", "OTT & Streaming", "Digital subscription support for sports, movies, and shows.", "sonyliv", "Low Stock", false, [
    plan("1 Month", "30 days", 599, 449, "Low Stock"),
  ]),
  product("YouTube Premium", "youtube-premium", "OTT & Streaming", "Ad-free entertainment setup and renewal assistance.", "youtube", "In Stock", false, [
    plan("1 Month", "30 days", 499, 349, "In Stock"),
  ]),
  product("Crunchyroll", "crunchyroll", "OTT & Streaming", "Anime streaming subscription activation support.", "crunchyroll", "In Stock", false, [
    plan("1 Month", "30 days", 499, 399, "In Stock"),
  ]),
  product("Zee5", "zee5", "OTT & Streaming", "Digital subscription support for Zee5 movies and shows.", "zee5", "In Stock", false, [
    plan("1 Month", "30 days", 399, 299, "In Stock"),
  ]),
  product("Spotify Premium", "spotify-premium", "Music", "Music subscription renewal and activation assistance.", "spotify", "Low Stock", true, [
    plan("1 Month", "30 days", 699, 499, "Low Stock"),
  ]),
  product("Free Fire Topup", "free-fire-topup", "Gaming", "Quick gaming topup support with WhatsApp confirmation.", "garena", "In Stock", false, [
    plan("Basic Topup", null, 299, 249, "In Stock"),
  ]),
  product("Instagram Growth", "instagram-growth", "Social Growth", "Organic profile growth support and content promotion assistance.", "instagram", "Coming Soon", false, [
    plan("Audience Reach Package", "7 days", 999, null, "Coming Soon", ["Profile improvement support", "Content promotion assistance"]),
  ]),
  product("Facebook Growth", "facebook-growth", "Social Growth", "Organic page improvement and audience reach support.", "facebook", "Coming Soon", false, [
    plan("Profile Improvement Support", "7 days", 899, null, "Coming Soon", ["Organic profile growth support", "Audience reach package"]),
  ]),
  product("TikTok Growth", "tiktok-growth", "Social Growth", "Organic profile growth support for short-form content.", "tiktok", "Coming Soon", false, [
    plan("Content Promotion Assistance", "7 days", 899, null, "Coming Soon", ["Content promotion assistance", "Profile improvement support"]),
  ]),
];

await ensureBucket();
await clearDemoData();

const productRows = [];

for (let index = 0; index < products.length; index += 1) {
  const item = products[index];
  const logoUrl = await uploadLogo(item);
  const bannerUrl = await uploadBanner(item);

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .upsert(
      {
        name: item.name,
        slug: item.slug,
        category: item.category,
        description: item.description,
        logo_url: logoUrl,
        image_url: bannerUrl,
        stock_status: item.stock_status,
        is_best_seller: item.is_best_seller,
        is_active: true,
        sort_order: index + 1,
      },
      { onConflict: "slug" },
    )
    .select()
    .single();

  if (productError) throw productError;
  productRows.push(productRow);

  for (let planIndex = 0; planIndex < item.plans.length; planIndex += 1) {
    const planItem = item.plans[planIndex];
    const { data: existing } = await supabase
      .from("plans")
      .select("id")
      .eq("product_id", productRow.id)
      .eq("name", planItem.name)
      .maybeSingle();

    const payload = {
      product_id: productRow.id,
      name: planItem.name,
      duration: planItem.duration,
      real_price: planItem.real_price,
      offer_price: planItem.offer_price,
      features: planItem.features,
      stock_status: planItem.stock_status,
      is_active: true,
      sort_order: planIndex + 1,
    };

    const query = existing
      ? supabase.from("plans").update(payload).eq("id", existing.id)
      : supabase.from("plans").insert(payload);
    const { error } = await query;
    if (error) throw error;
  }
}

await seedReviews(productRows);
await seedOrders(productRows);
await seedSettings();

console.log("Seed complete: products, storage images, reviews, orders, and settings added.");

function product(name, slug, category, description, iconSlug, stockStatus, bestSeller, plans) {
  return { name, slug, category, description, iconSlug, stock_status: stockStatus, is_best_seller: bestSeller, plans };
}

function plan(name, duration, realPrice, offerPrice, stockStatus, features = ["Fast activation", "Renewal assistance", "Nepal support"]) {
  return {
    name,
    duration,
    real_price: realPrice,
    offer_price: offerPrice,
    stock_status: stockStatus,
    features,
  };
}

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return;
  const { error } = await supabase.storage.createBucket(bucket, { public: true });
  if (error && !error.message.includes("already exists")) throw error;
}

async function clearDemoData() {
  await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("plans").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("settings")
    .delete()
    .in("key", ["home_reviews_mode", "home_review_ids", "support_email", "payment_instructions"]);
}

async function uploadLogo(item) {
  // Remove old SVG logo from storage
  await supabase.storage.from(bucket).remove([`products/${item.slug}/logo.svg`]);

  const filePath = join(process.cwd(), "public", "services", `${item.slug}-logo.png`);
  const body = readFileSync(filePath);
  const storagePath = `products/${item.slug}/logo.png`;
  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    upsert: true,
    contentType: "image/png",
  });
  if (error) throw error;
  return publicUrl(storagePath);
}

async function uploadBanner(item) {
  const body = readFileSync(join(process.cwd(), "public", "services", `${item.slug}-banner.svg`), "utf8");
  const path = `products/${item.slug}/banner-bg-v2.svg`;
  await supabase.storage.from(bucket).remove([`products/${item.slug}/banner.svg`]);
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    upsert: true,
    contentType: "image/svg+xml",
    cacheControl: "60",
  });
  if (error) throw error;
  return publicUrl(path);
}

function publicUrl(path) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function seedReviews(rows) {
  const samples = [
    ["Aarav Sharma", "Fast activation and clear support on WhatsApp.", 5],
    ["Nisha Thapa", "Spotify renewal was simple and quick.", 5],
    ["Rabin Gurung", "Good price and helpful checkout process.", 4],
    ["Sanjana K.C.", "Netflix plan was activated without confusion.", 5],
    ["Bikash Rai", "The team explained stock and payment clearly.", 4],
    ["Priya Lama", "Nice support for YouTube Premium renewal.", 5],
  ];

  for (let index = 0; index < samples.length; index += 1) {
    const [name, comment, rating] = samples[index];
    const productRow = rows[index % rows.length];
    const { error } = await supabase.from("reviews").insert({
      product_id: productRow.id,
      customer_name: name,
      customer_email: `demo${index + 1}@example.com`,
      customer_avatar_url: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
      rating,
      comment,
      status: "approved",
    });
    if (error) throw error;
  }
}

async function seedOrders(rows) {
  const orderProducts = rows.slice(0, 3);
  for (let index = 0; index < orderProducts.length; index += 1) {
    const productRow = orderProducts[index];
    const { data: plans } = await supabase.from("plans").select("*").eq("product_id", productRow.id).limit(1);
    const planRow = plans?.[0];
    if (!planRow) continue;
    const finalPrice = Number(planRow.offer_price ?? planRow.real_price);
    const { error } = await supabase.from("orders").insert({
      customer_name: ["Demo Customer", "Sagar M.", "Anita P."][index],
      phone: ["9800000001", "9800000002", "9800000003"][index],
      payment_method: ["eSewa", "Khalti", "Manual Confirmation"][index],
      note: "Demo order for admin preview.",
      cart_items: [
        {
          productId: productRow.id,
          productName: productRow.name,
          planId: planRow.id,
          planName: planRow.name,
          realPrice: Number(planRow.real_price),
          offerPrice: planRow.offer_price ? Number(planRow.offer_price) : null,
          finalPrice,
          quantity: 1,
          imageUrl: productRow.image_url,
        },
      ],
      total_amount: finalPrice,
      whatsapp_sent: true,
      status: "new",
    });
    if (error) throw error;
  }
}

async function seedSettings() {
  const settings = [
    { key: "home_reviews_mode", value: "auto" },
    { key: "support_email", value: "support@ottsubscriptionnepal.com" },
    { key: "payment_instructions", value: "Checkout creates a WhatsApp order message for confirmation." },
  ];
  const { error } = await supabase.from("settings").upsert(settings, { onConflict: "key" });
  if (error) throw error;
}

function loadEnv(file) {
  try {
    const env = readFileSync(join(process.cwd(), file), "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index);
      const value = trimmed.slice(index + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Optional env file.
  }
}
