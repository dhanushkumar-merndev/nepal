import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateProductContextCache } from "@/lib/ai/cache";
import { invalidateAdminDashboardCache } from "@/lib/data/admin";

async function collectStorageFiles(folder: string): Promise<string[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.storage.from("product-images").list(folder);
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

async function removeProductStorageFolder(slug: string) {
  const supabase = createAdminClient();
  if (!supabase) return;
  const folder = `products/${slug}`;
  const files = await collectStorageFiles(folder);
  if (files.length) await supabase.storage.from("product-images").remove(files);
}
export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });
  
  const { data: existing } = await supabase.from("products").select("slug").eq("id", id).single();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  if (existing?.slug) await removeProductStorageFolder(existing.slug);
  await invalidateProductContextCache();
  await invalidateAdminDashboardCache();
  
  return NextResponse.json({ ok: true, message: "Product permanently deleted." });
}
