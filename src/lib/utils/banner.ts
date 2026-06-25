export function makeBannerSvg({
  name,
  primaryColor,
  secondaryColor = "#159FD3",
}: {
  name: string;
  primaryColor: string;
  secondaryColor?: string;
}) {
  const primary = sanitizeColor(primaryColor);
  const secondary = sanitizeColor(secondaryColor);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(name)} banner background">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#E6F7FD"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${primary}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="720" fill="url(#bg)"/>
  <circle cx="950" cy="120" r="260" fill="url(#glow)"/>
  <circle cx="170" cy="630" r="290" fill="${secondary}" opacity=".12"/>
  <circle cx="1040" cy="610" r="170" fill="${primary}" opacity=".10"/>
  <path d="M0 520C210 470 330 580 530 520C760 450 875 390 1200 470V720H0Z" fill="${primary}" opacity=".08"/>
  <path d="M0 590C250 540 390 650 620 585C835 525 980 500 1200 560V720H0Z" fill="${secondary}" opacity=".10"/>
</svg>`;
}

function sanitizeColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#159FD3";
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}
