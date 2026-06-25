import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function GET(request: Request) {
  // Check auth - this could be a cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  // Calculate 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffIso = thirtyDaysAgo.toISOString();

  // Find products that are soft-deleted and updated more than 30 days ago
  const { data: oldDeletedProducts, error: fetchError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("is_deleted", true)
    .lt("updated_at", cutoffIso);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!oldDeletedProducts || oldDeletedProducts.length === 0) {
    return NextResponse.json({ ok: true, message: "No old deleted products to clean up." });
  }

  // Hard delete them
  const idsToDelete = oldDeletedProducts.map((p) => p.id);
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Cleanup storage
  let storageCleanups = 0;
  for (const product of oldDeletedProducts) {
    if (product.slug) {
      await removeProductStorageFolder(product.slug).catch(console.error);
      storageCleanups++;
    }
  }

  return NextResponse.json({ 
    ok: true, 
    message: `Cleaned up ${idsToDelete.length} products.`,
    storageCleanups
  });
}
