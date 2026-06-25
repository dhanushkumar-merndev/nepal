import { copyFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const outDir = join(process.cwd(), "public", "services");
const logoSourceDir = join(process.cwd(), "public", "logo", "service_logo_pieces_final_fixed3");
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
  writeFileSync(join(outDir, `${slug}-banner.svg`), bannerSvg(name, color));
}

// Copy PNG logos from source folder, mapping display names to kebab-case slugs
for (const [name, slug] of services) {
  const pngFiles = readdirSync(logoSourceDir).filter(
    (f) => f.toLowerCase().startsWith(name.toLowerCase()) && extname(f).toLowerCase() === ".png",
  );
  const srcFile = pngFiles[0];
  if (srcFile) {
    copyFileSync(join(logoSourceDir, srcFile), join(outDir, `${slug}-logo.png`));
  }
}

const pngCount = services.filter(([name, slug]) =>
  existsSync(join(outDir, `${slug}-logo.png`)),
).length;

console.log(`Generated ${services.length} banners (SVG) and ${pngCount} logos (PNG) in public/services.`);

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
