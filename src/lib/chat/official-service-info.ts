type OfficialServiceInfo = {
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
};

const officialSources: Record<string, { label: string; url: string }> = {
  "prime video": {
    label: "Prime Video",
    url: "https://www.primevideo.com/",
  },
  netflix: {
    label: "Netflix",
    url: "https://www.netflix.com/",
  },
  "spotify premium": {
    label: "Spotify",
    url: "https://www.spotify.com/premium/",
  },
  "youtube premium": {
    label: "YouTube Premium",
    url: "https://www.youtube.com/premium",
  },
  sonyliv: {
    label: "SonyLIV",
    url: "https://www.sonyliv.com/",
  },
  crunchyroll: {
    label: "Crunchyroll",
    url: "https://www.crunchyroll.com/",
  },
  zee5: {
    label: "ZEE5",
    url: "https://www.zee5.com/",
  },
};

export async function getOfficialServiceInfo(productName: string): Promise<OfficialServiceInfo | null> {
  const key = normalizeProductKey(productName);
  const source = officialSources[key];
  if (!source) return null;

  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OttSubscriptionNepalBot/1.0; +https://www.ottsubscriptionnepal.shop)",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const html = await response.text();
    const summary = extractSummary(html);
    if (!summary) return null;

    const payload = {
      summary,
      sourceLabel: source.label,
      sourceUrl: source.url,
    } satisfies OfficialServiceInfo;
    return payload;
  } catch {
    return null;
  }
}

function extractSummary(html: string) {
  const candidates = [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
  ];

  for (const pattern of candidates) {
    const match = html.match(pattern);
    const content = sanitize(match?.[1]);
    if (content && content.length >= 30) return content;
  }

  return null;
}

function sanitize(value?: string) {
  if (!value) return "";
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProductKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}
