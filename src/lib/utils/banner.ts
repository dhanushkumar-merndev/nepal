export function makeBannerSvg({
  name,
  primaryColor,
  secondaryColor = "#159FD3",
  backgroundColor = "#E6F7FD",
}: {
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
}) {
  const primary = sanitizeColor(primaryColor);
  const secondary = sanitizeColor(secondaryColor);
  const background = sanitizeColor(backgroundColor);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${escapeXml(name)} banner background">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${background}"/>
    </linearGradient>
    <radialGradient id="primaryGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${primary}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="secondaryGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${secondary}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${secondary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="720" fill="url(#bg)"/>
  <circle cx="930" cy="130" r="280" fill="url(#primaryGlow)"/>
  <circle cx="180" cy="620" r="330" fill="url(#secondaryGlow)"/>
  <circle cx="1040" cy="620" r="190" fill="${primary}" opacity=".10"/>
  <path d="M0 510C230 455 350 575 560 512C770 448 905 390 1200 462V720H0Z" fill="${primary}" opacity=".08"/>
  <path d="M0 590C270 535 420 650 650 585C850 530 980 500 1200 560V720H0Z" fill="${secondary}" opacity=".10"/>
</svg>`;
}

function sanitizeColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#159FD3";
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}
