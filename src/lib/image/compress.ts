export async function compressImage(file: File, maxDim: number, quality = 0.8): Promise<Blob> {
  const img = await createImageBitmap(file);
  const [sw, sh] = img.width > img.height
    ? [maxDim, Math.round((maxDim / img.width) * img.height)]
    : [Math.round((maxDim / img.height) * img.width), maxDim];

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, sw, sh);
  img.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/webp", quality);
  });
}

export function imageTransformUrl(url: string, width: number, quality = 80): string {
  if (!url.includes("supabase.co/storage")) return url;
  try {
    const u = new URL(url);
    const path = u.pathname.replace("/object/public/", "/render/image/public/").split("?")[0];
    u.pathname = path;
    u.search = "";
    u.searchParams.set("width", String(width));
    u.searchParams.set("quality", String(quality));
    u.searchParams.set("format", "webp");
    return u.toString();
  } catch {
    return url;
  }
}
