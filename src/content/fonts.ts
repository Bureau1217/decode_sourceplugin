// The panel's webfonts, bundled in public/fonts/ (both OFL) rather than
// loaded from Google Fonts: no request leaves the extension, and Google's
// page CSP can't block them. @font-face rules are ignored inside a shadow
// root, so they're declared on the page itself - the shadow tree can then
// use the families by name.
const FONT_FACES: Array<{ family: string; file: string; weight: number }> = [
  { family: "Martian Mono", file: "martian-mono-400", weight: 400 },
  { family: "Martian Mono", file: "martian-mono-500", weight: 500 },
  { family: "EB Garamond", file: "eb-garamond-400", weight: 400 },
  { family: "EB Garamond", file: "eb-garamond-700", weight: 700 },
];

export function injectFonts() {
  const styleId = "decode-fonts";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = FONT_FACES.map(
    ({ family, file, weight }) => `@font-face {
  font-family: "${family}";
  src: url("${chrome.runtime.getURL(`fonts/${file}.woff2`)}") format("woff2");
  font-weight: ${weight};
  font-style: normal;
  font-display: swap;
}`
  ).join("\n");
  document.head.appendChild(style);
}
