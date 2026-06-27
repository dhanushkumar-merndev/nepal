import { NextResponse } from "next/server";
import { z } from "zod";
import { invalidateProductContextCache } from "@/lib/ai/cache";
import { isAdminRequest } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeBannerSvg } from "@/lib/utils/banner";

const bannerSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const bucket = "product-images";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bannerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  const { data: bucketData } = await supabase.storage.getBucket(bucket);
  if (!bucketData) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && !error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const svg = makeBannerSvg(parsed.data);
  await removeBannerFiles(parsed.data.slug);
  const path = `products/${parsed.data.slug}/banner.svg`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, svg, {
    upsert: true,
    contentType: "image/svg+xml",
    cacheControl: "60",
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const imageUrl = `${supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  const { data, error } = await supabase
    .from("products")
    .update({ image_url: imageUrl })
    .eq("id", parsed.data.productId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await invalidateProductContextCache();
  return NextResponse.json({ data, imageUrl, message: "Banner generated and product updated." });
}

async function removeBannerFiles(slug: string) {
  const supabase = createAdminClient();
  if (!supabase) return;
  const folder = `products/${slug}`;
  const { data } = await supabase.storage.from(bucket).list(folder);
  const files = (data ?? [])
    .filter((item) => item.name.startsWith("banner"))
    .map((item) => `${folder}/${item.name}`);
  if (files.length) await supabase.storage.from(bucket).remove(files);
}
