import { promises as fs, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";

const execFileAsync = promisify(execFile);

const BUCKET = "product-images";
const LOGO_MAX_DIM = 400;
const QUALITY = 80;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,logo_url,image_url")
    .order("name");

  if (error) throw new Error(error.message);

  const workspaceTmp = await fs.mkdtemp(path.join(os.tmpdir(), "product-image-migrate-"));
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const filteredProducts = products.filter((product) => {
      if (args.product && product.slug !== args.product && product.id !== args.product) return false;
      return true;
    });

    for (const product of filteredProducts) {
      const assets = [
        { assetType: "logo", column: "logo_url", url: product.logo_url },
        { assetType: "banner", column: "image_url", url: product.image_url },
      ];

      for (const asset of assets) {
        if (args.only !== "all" && asset.assetType !== args.only) continue;
        if (!asset.url) continue;

        const label = `${product.slug}/${asset.assetType}`;

        try {
          const storagePath = extractStoragePath(asset.url);
          if (!storagePath) {
            console.log(`skip ${label}: unsupported URL`);
            skipped += 1;
            continue;
          }

          if (storagePath.endsWith(".svg")) {
            console.log(`skip ${label}: SVG left as-is`);
            skipped += 1;
            continue;
          }

          const { data: download, error: downloadError } = await supabase.storage.from(BUCKET).download(storagePath);
          if (downloadError || !download) {
            throw new Error(downloadError?.message || "Download failed.");
          }

          const originalBuffer = Buffer.from(await download.arrayBuffer());
          const originalSize = originalBuffer.byteLength;
          const originalExt = path.extname(storagePath) || ".img";
          const originalFile = path.join(workspaceTmp, `${product.slug}-${asset.assetType}${originalExt}`);
          const outputFile = path.join(workspaceTmp, `${product.slug}-${asset.assetType}.webp`);

          await fs.writeFile(originalFile, originalBuffer);
          await compressWithMagick(originalFile, outputFile, asset.assetType);

          const compressedBuffer = await fs.readFile(outputFile);
          const compressedSize = compressedBuffer.byteLength;

          if (compressedSize >= originalSize) {
            console.log(`skip ${label}: ${formatKb(originalSize)} -> ${formatKb(compressedSize)} (not smaller)`);
            skipped += 1;
            continue;
          }

          const nextPath = `products/${product.slug}/${asset.assetType}.webp`;
          const nextUrl = `${supabase.storage.from(BUCKET).getPublicUrl(nextPath).data.publicUrl}?v=${Date.now()}`;

          console.log(
            `${args.dryRun ? "dry-run" : "update"} ${label}: ${formatKb(originalSize)} -> ${formatKb(compressedSize)}`
          );

          if (!args.dryRun) {
            await removeAssetFiles(supabase, product.slug, asset.assetType);

            const { error: uploadError } = await supabase.storage.from(BUCKET).upload(nextPath, compressedBuffer, {
              upsert: true,
              contentType: "image/webp",
              cacheControl: "60",
            });
            if (uploadError) throw new Error(uploadError.message);

            const { error: updateError } = await supabase
              .from("products")
              .update({ [asset.column]: nextUrl })
              .eq("id", product.id);
            if (updateError) throw new Error(updateError.message);
          }

          updated += 1;
        } catch (assetError) {
          failed += 1;
          console.error(`fail ${label}: ${assetError instanceof Error ? assetError.message : String(assetError)}`);
        }
      }
    }
  } finally {
    await fs.rm(workspaceTmp, { recursive: true, force: true });
  }

  console.log("");
  console.log(`finished: updated=${updated} skipped=${skipped} failed=${failed} dryRun=${args.dryRun}`);
  if (failed > 0) process.exitCode = 1;
}

function parseArgs(args) {
  return args.reduce(
    (acc, arg) => {
      if (arg === "--dry-run") acc.dryRun = true;
      else if (arg.startsWith("--product=")) acc.product = arg.slice("--product=".length);
      else if (arg.startsWith("--only=")) {
        const value = arg.slice("--only=".length);
        if (value === "logo" || value === "banner" || value === "all") acc.only = value;
      }
      return acc;
    },
    { dryRun: false, product: "", only: "all" }
  );
}

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  try {
    const raw = readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

function extractStoragePath(url) {
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const renderMarker = `/storage/v1/render/image/public/${BUCKET}/`;
    if (parsed.pathname.includes(marker)) {
      return decodeURIComponent(parsed.pathname.split(marker)[1] || "");
    }
    if (parsed.pathname.includes(renderMarker)) {
      return decodeURIComponent(parsed.pathname.split(renderMarker)[1] || "");
    }
    return "";
  } catch {
    return "";
  }
}

async function compressWithMagick(inputFile, outputFile, assetType) {
  const maxDim = assetType === "logo" ? LOGO_MAX_DIM : 1200;
  const resizeArg = `${maxDim}x${maxDim}>`;

  await execFileAsync("magick", [
    inputFile,
    "-auto-orient",
    "-strip",
    "-resize",
    resizeArg,
    "-quality",
    String(QUALITY),
    outputFile,
  ]);
}

async function removeAssetFiles(supabase, slug, assetType) {
  const folder = `products/${slug}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(folder);
  if (error) throw new Error(error.message);

  const files = (data ?? [])
    .filter((item) => item.name.startsWith(assetType))
    .map((item) => `${folder}/${item.name}`);

  if (!files.length) return;

  const { error: removeError } = await supabase.storage.from(BUCKET).remove(files);
  if (removeError) throw new Error(removeError.message);
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

await main();
