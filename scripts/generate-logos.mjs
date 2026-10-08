/**
 * Gera os logotipos vetoriais da KODA a partir do Plus Jakarta Sans.
 * A fonte é baixada em scripts/.cache (não versionada). Os SVG resultantes
 * trazem o texto convertido em caminhos, então não dependem da fonte em runtime.
 *
 * Família: Plus Jakarta Sans (OFL)
 * Direção A — Medium, tracking aberto
 * Direções B e C — SemiBold, tracking mais fechado
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openSync } from "fontkit";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CAP_UNITS = 745;

const GRAPHITE = "#171917";
const IVORY = "#F4F1E8";
const GREEN = "#526B50";

const medium = openSync(join(root, "scripts/.cache/PlusJakartaSans-Medium.ttf"));
const semibold = openSync(join(root, "scripts/.cache/PlusJakartaSans-SemiBold.ttf"));

function fmt(n) {
  const rounded = Math.round(n * 10000) / 10000;
  if (Object.is(rounded, -0) || rounded === 0) return "0";
  return String(rounded);
}

function layoutWord(font, text, trackingUnits) {
  const run = font.layout(text);
  let x = 0;
  const placed = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < run.glyphs.length; i += 1) {
    const glyph = run.glyphs[i];
    const pos = run.positions[i];
    const gx = x + pos.xOffset;
    const gy = pos.yOffset;
    const box = glyph.bbox;
    minX = Math.min(minX, box.minX + gx);
    maxX = Math.max(maxX, box.maxX + gx);
    minY = Math.min(minY, box.minY + gy);
    maxY = Math.max(maxY, box.maxY + gy);
    placed.push({ d: glyph.path.toSVG(), gx, gy });
    const gap = i < run.glyphs.length - 1 ? trackingUnits : 0;
    x += pos.xAdvance + gap;
  }

  return { placed, minX, minY, maxX, maxY };
}

function wordMetrics(word, cap) {
  const scale = cap / CAP_UNITS;
  return {
    scale,
    overTop: Math.max(0, word.maxY - CAP_UNITS) * scale,
    overBot: Math.max(0, -word.minY) * scale,
    width: (word.maxX - word.minX) * scale,
  };
}

function renderWord(word, originX, originY, cap, fill) {
  const scale = cap / CAP_UNITS;
  const paths = word.placed
    .map(
      (part) =>
        `<path d="${part.d}" transform="translate(${fmt(part.gx)} ${fmt(part.gy)})"/>`,
    )
    .join("");
  return `<g fill="${fill}" transform="translate(${fmt(originX)} ${fmt(originY + cap)}) scale(${fmt(scale)} ${fmt(-scale)}) translate(${fmt(-word.minX)} 0)">${paths}</g>`;
}

function symbolEstrutura(x, y, size, structure, module) {
  const s = size / 24;
  return `<g transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(s)})">
    <path fill="${structure}" d="M0 0H24V8H8V24H0Z"/>
    <path fill="${module}" d="M16 16H24V24H16Z"/>
  </g>`;
}

function symbolModular(x, y, size, bars, module) {
  const s = size / 24;
  return `<g transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(s)})">
    <path fill="${bars}" d="M0 0H24V6H0Z"/>
    <path fill="${bars}" d="M0 9H15V15H0Z"/>
    <path fill="${module}" d="M18 9H24V15H18Z"/>
    <path fill="${bars}" d="M0 18H24V24H0Z"/>
  </g>`;
}

function svgDoc(width, height, body, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(width)} ${fmt(height)}" fill="none" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  ${body}
</svg>
`;
}

function write(relativePath, contents) {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, "utf8");
}

function horizontalLockup({ symbol, word, cap, gap, structure, module, text, title }) {
  const metrics = wordMetrics(word, cap);
  const symbolSize = cap * 0.92;
  const symbolY = metrics.overTop + (cap - symbolSize) / 2;
  const width = symbolSize + gap + metrics.width;
  const height = metrics.overTop + cap + metrics.overBot;
  const body = [
    symbol(0, symbolY, symbolSize, structure, module),
    renderWord(word, symbolSize + gap, metrics.overTop, cap, text),
  ].join("\n  ");
  return svgDoc(width, height, body, title);
}

function stackedLockup({ symbol, word, cap, gap, symbolRatio, structure, module, text, title }) {
  const metrics = wordMetrics(word, cap);
  const symbolSize = metrics.width * symbolRatio;
  const width = Math.max(symbolSize, metrics.width);
  const height = metrics.overTop + symbolSize + gap + cap + metrics.overBot;
  const body = [
    symbol((width - symbolSize) / 2, metrics.overTop, symbolSize, structure, module),
    renderWord(word, (width - metrics.width) / 2, metrics.overTop + symbolSize + gap, cap, text),
  ].join("\n  ");
  return svgDoc(width, height, body, title);
}

function wordmarkOnly(word, cap, fill, title) {
  const metrics = wordMetrics(word, cap);
  const height = metrics.overTop + cap + metrics.overBot;
  const body = renderWord(word, 0, metrics.overTop, cap, fill);
  return svgDoc(metrics.width, height, body, title);
}

function productLockup({ symbol, master, product, masterCap, productCap, lineGap, columnGap, structure, module, masterFill, productFill, title }) {
  const masterMetrics = wordMetrics(master, masterCap);
  const productMetrics = wordMetrics(product, productCap);
  const textWidth = Math.max(masterMetrics.width, productMetrics.width);
  const block = masterCap + lineGap + productCap;
  const width = block + columnGap + textWidth;
  const height = masterMetrics.overTop + block + productMetrics.overBot;
  const textX = block + columnGap;
  const body = [
    symbol(0, masterMetrics.overTop, block, structure, module),
    renderWord(master, textX, masterMetrics.overTop, masterCap, masterFill),
    renderWord(
      product,
      textX,
      masterMetrics.overTop + masterCap + lineGap,
      productCap,
      productFill,
    ),
  ].join("\n  ");
  return svgDoc(width, height, body, title);
}

function isolatedSymbol(symbol, size, structure, module, title) {
  return svgDoc(size, size, symbol(0, 0, size, structure, module), title);
}

function monogramK(font, fill, title) {
  const word = layoutWord(font, "K", 0);
  const cap = 72;
  const metrics = wordMetrics(word, cap);
  const pad = 14;
  const side = pad * 2 + Math.max(metrics.width, cap + metrics.overTop + metrics.overBot);
  const inkH = metrics.overTop + cap + metrics.overBot;
  const originX = (side - metrics.width) / 2;
  const originY = (side - inkH) / 2 + metrics.overTop;
  return svgDoc(side, side, renderWord(word, originX, originY - metrics.overTop, cap, fill), title);
}

function faviconPlate(symbol, structure, module, title) {
  const plate = `<rect width="32" height="32" rx="6" fill="${GRAPHITE}"/>`;
  const mark = symbol(4, 4, 24, structure, module);
  return svgDoc(32, 32, `${plate}\n  ${mark}`, title);
}

const wordA = layoutWord(medium, "KODA", 110);
const wordB = layoutWord(semibold, "KODA", 28);
const wordC = layoutWord(semibold, "KODA", 28);
const gestao = layoutWord(medium, "Gestão", 12);
const barbearia = layoutWord(medium, "Barbearia", 12);
const varejo = layoutWord(medium, "Varejo", 12);

const cap = 72;
const gap = 30;
const stackGap = 26;

const wordACompact = layoutWord(semibold, "KODA", 8);
const wordAHorizontal = layoutWord(semibold, "KODA", 28);

const directionA = {
  primary: wordmarkOnly(wordA, cap, GRAPHITE, "KODA — wordmark de destaque"),
  horizontal: wordmarkOnly(wordAHorizontal, cap, GRAPHITE, "KODA — wordmark horizontal"),
  compact: wordmarkOnly(wordACompact, cap, GRAPHITE, "KODA — wordmark compacto"),
  symbol: monogramK(semibold, GRAPHITE, "KODA — monograma K"),
  "symbol-on-dark": monogramK(semibold, IVORY, "KODA — monograma K para fundo escuro"),
  monochrome: wordmarkOnly(wordA, cap, GRAPHITE, "KODA — wordmark monocromático"),
  "on-light": wordmarkOnly(wordA, cap, GRAPHITE, "KODA — wordmark para fundo claro"),
  "on-dark": wordmarkOnly(wordAHorizontal, cap, IVORY, "KODA — wordmark para fundo escuro"),
  favicon: faviconPlate(
    (x, y, size, structure) => {
      const word = layoutWord(semibold, "K", 0);
      const inner = 18;
      const metrics = wordMetrics(word, inner);
      const inkH = metrics.overTop + inner + metrics.overBot;
      const originX = x + (size - metrics.width) / 2;
      const originY = y + (size - inkH) / 2;
      return renderWord(word, originX, originY, inner, structure);
    },
    IVORY,
    IVORY,
    "KODA — favicon do wordmark",
  ),
};

const estrutura = {
  primary: stackedLockup({
    symbol: symbolEstrutura,
    word: wordB,
    cap,
    gap: stackGap,
    symbolRatio: 0.46,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — logotipo principal Estrutura",
  }),
  horizontal: horizontalLockup({
    symbol: symbolEstrutura,
    word: wordB,
    cap,
    gap,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — logotipo horizontal Estrutura",
  }),
  compact: horizontalLockup({
    symbol: symbolEstrutura,
    word: layoutWord(semibold, "KODA", 8),
    cap,
    gap: 14,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — logotipo compacto Estrutura",
  }),
  symbol: isolatedSymbol(symbolEstrutura, 32, GRAPHITE, GREEN, "KODA — símbolo Estrutura"),
  "symbol-on-dark": isolatedSymbol(symbolEstrutura, 32, IVORY, GREEN, "KODA — símbolo Estrutura para fundo escuro"),
  monochrome: horizontalLockup({
    symbol: symbolEstrutura,
    word: wordB,
    cap,
    gap,
    structure: GRAPHITE,
    module: GRAPHITE,
    text: GRAPHITE,
    title: "KODA — logotipo monocromático Estrutura",
  }),
  "on-light": horizontalLockup({
    symbol: symbolEstrutura,
    word: wordB,
    cap,
    gap,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — Estrutura para fundo claro",
  }),
  "on-dark": horizontalLockup({
    symbol: symbolEstrutura,
    word: wordB,
    cap,
    gap,
    structure: IVORY,
    module: GREEN,
    text: IVORY,
    title: "KODA — Estrutura para fundo escuro",
  }),
  favicon: faviconPlate(symbolEstrutura, IVORY, GREEN, "KODA — favicon Estrutura"),
};

const modular = {
  primary: stackedLockup({
    symbol: symbolModular,
    word: wordC,
    cap,
    gap: stackGap,
    symbolRatio: 0.5,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — logotipo principal Modular",
  }),
  horizontal: horizontalLockup({
    symbol: symbolModular,
    word: wordC,
    cap,
    gap,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — logotipo horizontal Modular",
  }),
  compact: horizontalLockup({
    symbol: symbolModular,
    word: layoutWord(semibold, "KODA", 8),
    cap,
    gap: 14,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — logotipo compacto Modular",
  }),
  symbol: isolatedSymbol(symbolModular, 32, GRAPHITE, GREEN, "KODA — símbolo Modular"),
  "symbol-on-dark": isolatedSymbol(symbolModular, 32, IVORY, GREEN, "KODA — símbolo Modular para fundo escuro"),
  monochrome: horizontalLockup({
    symbol: symbolModular,
    word: wordC,
    cap,
    gap,
    structure: GRAPHITE,
    module: GRAPHITE,
    text: GRAPHITE,
    title: "KODA — logotipo monocromático Modular",
  }),
  "on-light": horizontalLockup({
    symbol: symbolModular,
    word: wordC,
    cap,
    gap,
    structure: GRAPHITE,
    module: GREEN,
    text: GRAPHITE,
    title: "KODA — Modular para fundo claro",
  }),
  "on-dark": horizontalLockup({
    symbol: symbolModular,
    word: wordC,
    cap,
    gap,
    structure: IVORY,
    module: GREEN,
    text: IVORY,
    title: "KODA — Modular para fundo escuro",
  }),
  favicon: faviconPlate(symbolModular, IVORY, GREEN, "KODA — favicon Modular"),
};

const products = [
  ["gestao", gestao, "Gestão"],
  ["barbearia", barbearia, "Barbearia"],
  ["varejo", varejo, "Varejo"],
];

const conceptFiles = [
  ["public/brand/concepts/a-wordmark", directionA],
  ["public/brand/concepts/b-estrutura", estrutura],
  ["public/brand/concepts/c-modular", modular],
];

function writeSet(folder, files) {
  for (const [name, contents] of Object.entries(files)) {
    if (name === "favicon") {
      write(`${folder}/favicon.svg`, contents);
      continue;
    }
    write(`${folder}/logo-${name}.svg`, contents);
  }
}

for (const [folder, files] of conceptFiles) {
  writeSet(folder, files);
}

writeSet("public/brand", estrutura);

write("src/app/icon.svg", estrutura.favicon);

for (const [slug, word, label] of products) {
  write(
    `public/brand/concepts/c-modular/logo-${slug}.svg`,
    productLockup({
      symbol: symbolModular,
      master: wordC,
      product: word,
      masterCap: 48,
      productCap: 26,
      lineGap: 8,
      columnGap: 16,
      structure: GRAPHITE,
      module: GREEN,
      masterFill: GRAPHITE,
      productFill: GREEN,
      title: `KODA ${label}`,
    }),
  );
  write(
    `public/brand/logo-${slug}.svg`,
    productLockup({
      symbol: symbolEstrutura,
      master: wordB,
      product: word,
      masterCap: 48,
      productCap: 26,
      lineGap: 8,
      columnGap: 16,
      structure: GRAPHITE,
      module: GREEN,
      masterFill: GRAPHITE,
      productFill: GREEN,
      title: `KODA ${label}`,
    }),
  );
}

const grid = svgDoc(
  48,
  48,
  `<path d="M48 0H0V48" stroke="${GRAPHITE}" stroke-width="1"/>`,
  "Grade KODA",
);
write("public/brand/patterns/grid.svg", grid);

const modules = svgDoc(
  64,
  64,
  `<path fill="${GRAPHITE}" d="M8 8H16V16H8Z"/>
  <path fill="${GREEN}" d="M40 40H48V48H40Z"/>
  <path fill="${GRAPHITE}" fill-opacity="0.35" d="M40 12H44V16H40Z"/>
  <path fill="${GRAPHITE}" fill-opacity="0.35" d="M16 44H20V48H16Z"/>`,
  "Padrão de módulos KODA",
);
write("public/brand/patterns/modules.svg", modules);

const lines = svgDoc(
  80,
  48,
  `<path stroke="${GRAPHITE}" stroke-width="2" d="M0 8H80M0 24H52M0 40H80"/>
  <path fill="${GREEN}" d="M60 20H72V28H60Z"/>`,
  "Padrão de linhas KODA",
);
write("public/brand/patterns/lines.svg", lines);

write(
  "public/brand/patterns/grid-light.svg",
  svgDoc(48, 48, `<path d="M48 0H0V48" stroke="${IVORY}" stroke-width="1"/>`, "Grade KODA clara"),
);
write(
  "public/brand/patterns/modules-light.svg",
  svgDoc(
    64,
    64,
    `<path fill="${IVORY}" d="M8 8H16V16H8Z"/>
  <path fill="${GREEN}" d="M40 40H48V48H40Z"/>
  <path fill="${IVORY}" fill-opacity="0.45" d="M40 12H44V16H40Z"/>
  <path fill="${IVORY}" fill-opacity="0.45" d="M16 44H20V48H16Z"/>`,
    "Padrão de módulos KODA claro",
  ),
);
write(
  "public/brand/patterns/lines-light.svg",
  svgDoc(
    80,
    48,
    `<path stroke="${IVORY}" stroke-width="2" d="M0 8H80M0 24H52M0 40H80"/>
  <path fill="${GREEN}" d="M60 20H72V28H60Z"/>`,
    "Padrão de linhas KODA claro",
  ),
);

console.log("Logotipos gerados.");
