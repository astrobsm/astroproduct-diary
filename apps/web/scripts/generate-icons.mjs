// One-off icon rasteriser: turns the brand SVGs into the PNG sizes PWAs need
// (Android/Chrome manifest icons + iOS apple-touch-icon). Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const brand = path.resolve(here, "..", "public", "brand");

const iconSvg = await readFile(path.join(brand, "astrobsm-icon.svg"));
const maskableSvg = await readFile(path.join(brand, "astrobsm-maskable.svg"));

const NAVY = { r: 46, g: 47, b: 160, alpha: 1 };

async function render(svg, size, out, { flatten = false } = {}) {
  let pipe = sharp(svg, { density: 384 }).resize(size, size, { fit: "contain" });
  if (flatten) pipe = pipe.flatten({ background: NAVY });
  await pipe.png().toFile(path.join(brand, out));
  console.log("wrote", out, `${size}x${size}`);
}

// Standard "any" icons (transparent corners preserved)
await render(iconSvg, 192, "icon-192.png");
await render(iconSvg, 512, "icon-512.png");
// Maskable icons (full-bleed navy, safe-zone content)
await render(maskableSvg, 192, "icon-maskable-192.png");
await render(maskableSvg, 512, "icon-maskable-512.png");
// iOS home-screen icon — must be an opaque square PNG (no alpha)
await render(maskableSvg, 180, "apple-touch-icon.png", { flatten: true });

console.log("Icon generation complete.");
