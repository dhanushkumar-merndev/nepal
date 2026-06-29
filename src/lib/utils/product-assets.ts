type ProductAssetFields = {
  id?: string | null;
  updated_at?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
};

export function withAssetVersion(url?: string | null, versionSeed?: string | null) {
  if (!url) return url ?? null;

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("v")) {
      parsed.searchParams.set("v", versionSeed || "1");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function withCachedProductAssets<T extends ProductAssetFields>(product: T): T {
  const versionSeed = product.updated_at || product.id || "1";
  return {
    ...product,
    logo_url: withAssetVersion(product.logo_url, versionSeed),
    image_url: withAssetVersion(product.image_url, versionSeed),
  };
}
