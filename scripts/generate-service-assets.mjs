import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "services");
mkdirSync(outDir, { recursive: true });

const services = [
  ["Netflix", "netflix", "#E50914", "N"],
  ["Spotify Premium", "spotify-premium", "#1DB954", "S"],
  ["Prime Video", "prime-video", "#00A8E1", "P"],
  ["SonyLIV", "sonyliv", "#582C83", "SL"],
  ["YouTube Premium", "youtube-premium", "#FF0000", "YT"],
  ["Crunchyroll", "crunchyroll", "#F47521", "C"],
  ["Zee5", "zee5", "#6D1DFF", "Z5"],
  ["Free Fire Topup", "free-fire-topup", "#FFB000", "FF"],
  ["Instagram Growth", "instagram-growth", "#D62976", "IG"],
  ["Facebook Growth", "facebook-growth", "#1877F2", "FB"],
  ["TikTok Growth", "tiktok-growth", "#111111", "TT"],
];

for (const [name, slug, color, initials] of services) {
  writeFileSync(join(outDir, `${slug}-logo.svg`), logoSvg(name, color, initials));
  writeFileSync(join(outDir, `${slug}-banner.svg`), bannerSvg(name, color));
}

console.log(`Generated ${services.length * 2} service assets in public/services.`);

function logoSvg(name, color, initials) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapeXml(name)} logo">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="#159FD3"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="#ffffff"/>
  <rect x="34" y="34" width="444" height="444" rx="96" fill="url(#g)"/>
  <circle cx="384" cy="126" r="74" fill="#ffffff" opacity=".16"/>
  <circle cx="126" cy="384" r="96" fill="#ffffff" opacity=".12"/>
  <text x="256" y="276" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${initials.length > 1 ? 112 : 164}" font-weight="900" fill="#ffffff">${escapeXml(initials)}</text>
</svg>`;
}

function bannerSvg(name, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(name)} banner background">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#E6F7FD"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${color}" stop-opacity=".26"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="720" fill="url(#bg)"/>
  <circle cx="950" cy="120" r="260" fill="url(#glow)"/>
  <circle cx="170" cy="630" r="290" fill="#159FD3" opacity=".12"/>
  <circle cx="1040" cy="610" r="170" fill="${color}" opacity=".10"/>
  <path d="M0 520C210 470 330 580 530 520C760 450 875 390 1200 470V720H0Z" fill="${color}" opacity=".08"/>
  <path d="M0 590C250 540 390 650 620 585C835 525 980 500 1200 560V720H0Z" fill="#159FD3" opacity=".10"/>
</svg>`;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);
}
