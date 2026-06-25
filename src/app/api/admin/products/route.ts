import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/validators/product";
import { invalidateProductContextCache } from "@/lib/ai/cache";
import { isAdminRequest } from "@/lib/auth/admin";
import { invalidateAdminDashboardCache } from "@/lib/data/admin";

const bucket = "product-images";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ data: [], fallback: true });
  const { data, error } = await supabase.from("products").select("*").order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });
  const { data, error } = await supabase.from("products").insert(parsed.data).select().single();
  if (error) return productErrorResponse(error);
  await invalidateProductContextCache();
  await invalidateAdminDashboardCache();
  return NextResponse.json({ data, message: "Product updated and AI cache refreshed." });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  const { data: existing } = await supabase
    .from("products")
    .select("slug,logo_url,image_url")
    .eq("id", body.id)
    .single();

  const { data, error } = await supabase.from("products").update(parsed.data).eq("id", body.id).select().single();
  if (error) return productErrorResponse(error);

  let payload = data;
  if (existing?.slug && data.slug && existing.slug !== data.slug) {
    const movedUrls = await moveProductStorageFolder(existing.slug, data.slug, {
      logo_url: data.logo_url,
      image_url: data.image_url,
    });
    if (Object.keys(movedUrls).length) {
      const { data: updated } = await supabase
        .from("products")
        .update(movedUrls)
        .eq("id", body.id)
        .select()
        .single();
      if (updated) payload = updated;
    }
  }

  await invalidateProductContextCache();
  await invalidateAdminDashboardCache();
  return NextResponse.json({ data: payload, message: "Product updated and AI cache refreshed." });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });
  const { error } = await supabase.from("products").update({ is_deleted: true, is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateProductContextCache();
  await invalidateAdminDashboardCache();
  return NextResponse.json({ ok: true, message: "Product updated and AI cache refreshed." });
}

function productErrorResponse(error: { code?: string; message: string }) {
  if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: "A product with this name/slug already exists." }, { status: 409 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}

async function moveProductStorageFolder(
  oldSlug: string,
  newSlug: string,
  urls: { logo_url?: string | null; image_url?: string | null },
) {
  const supabase = createAdminClient();
  if (!supabase) return {};
  const oldFolder = `products/${oldSlug}`;
  const newFolder = `products/${newSlug}`;
  const { data } = await supabase.storage.from(bucket).list(oldFolder);
  const files = data ?? [];
  if (!files.length) return {};

  await removeProductStorageFolder(newSlug);

  const movedNames: string[] = [];
  for (const file of files) {
    const from = `${oldFolder}/${file.name}`;
    const to = `${newFolder}/${file.name}`;
    const { error } = await supabase.storage.from(bucket).move(from, to);
    if (!error) movedNames.push(file.name);
  }

  const updates: { logo_url?: string; image_url?: string } = {};
  const logoName = movedNames.find((name) => name.startsWith("logo."));
  const bannerName = movedNames.find((name) => name.startsWith("banner."));
  if (logoName && urls.logo_url?.includes(`/products/${oldSlug}/`)) {
    updates.logo_url = supabase.storage.from(bucket).getPublicUrl(`${newFolder}/${logoName}`).data.publicUrl;
  }
  if (bannerName && urls.image_url?.includes(`/products/${oldSlug}/`)) {
    updates.image_url = supabase.storage.from(bucket).getPublicUrl(`${newFolder}/${bannerName}`).data.publicUrl;
  }
  return updates;
}

async function removeProductStorageFolder(slug: string) {
  const supabase = createAdminClient();
  if (!supabase) return;
  const folder = `products/${slug}`;
  const files = await collectStorageFiles(folder);
  if (files.length) await supabase.storage.from(bucket).remove(files);
}

async function collectStorageFiles(folder: string): Promise<string[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.storage.from(bucket).list(folder);
  const entries = data ?? [];
  const files: string[] = [];

  for (const entry of entries) {
    const path = `${folder}/${entry.name}`;
    if (entry.id || entry.metadata) {
      files.push(path);
    } else {
      files.push(...(await collectStorageFiles(path)));
    }
  }

  return files;
}
