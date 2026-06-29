import { NextResponse } from "next/server";

import { invalidateProductContextCache, invalidatePublicProductsCache } from "@/lib/ai/cache";
import { isAdminRequest } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateAdminListCache } from "@/lib/data/admin";

const bucket = "product-images";
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await request.formData();
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "product").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const assetType = formData.get("assetType") === "banner" ? "banner" : "logo";
  const file = formData.get("file");

  if (!productId || !(file instanceof File)) {
    return NextResponse.json({ error: "Product id and image file are required." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Use a PNG, JPEG, WebP, or SVG image." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  const { data: bucketData } = await supabase.storage.getBucket(bucket);
  if (!bucketData) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && !error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await removeAssetFiles(slug, assetType);

  const path = `products/${slug}/${assetType}${extensionFor(file.type)}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const publicUrl = `${supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  const column = assetType === "banner" ? "image_url" : "logo_url";
  const { data, error } = await supabase.from("products").update({ [column]: publicUrl }).eq("id", productId).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await invalidateProductContextCache();
  await invalidatePublicProductsCache();
  await invalidateAdminListCache();
  return NextResponse.json({ data, publicUrl });
}

async function removeAssetFiles(slug: string, assetType: "logo" | "banner") {
  const supabase = createAdminClient();
  if (!supabase) return;
  const folder = `products/${slug}`;
  const { data } = await supabase.storage.from(bucket).list(folder);
  const files = (data ?? [])
    .filter((item) => item.name.startsWith(assetType))
    .map((item) => `${folder}/${item.name}`);
  if (files.length) await supabase.storage.from(bucket).remove(files);
}

function extensionFor(contentType: string) {
  if (contentType === "image/svg+xml") return ".svg";
  if (contentType === "image/webp") return ".webp";
  if (contentType === "image/jpeg") return ".jpg";
  return ".png";
}
