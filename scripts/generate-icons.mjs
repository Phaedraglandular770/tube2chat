import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconDir = join(__dirname, "../src/public/icon");

const svg = (size) => {
  const r = Math.round(size * 0.22); // corner radius
  const starScale = size / 128;

  // Play triangle: centered, slightly left to account for optical centering
  const cx = size * 0.5;
  const cy = size * 0.5;
  const triW = size * 0.36;
  const triH = size * 0.42;
  const tx1 = cx - triW * 0.4;
  const ty1 = cy - triH / 2;
  const tx2 = cx - triW * 0.4;
  const ty2 = cy + triH / 2;
  const tx3 = cx + triW * 0.6;
  const ty3 = cy;

  // Gemini star (4-pointed) — small, top-right corner
  const sw = size * 0.22;
  const scx = size * 0.78;
  const scy = size * 0.22;
  const starPath = `M${scx} ${scy - sw / 2}
    C${scx} ${scy - sw * 0.07} ${scx - sw * 0.43} ${scy} ${scx - sw / 2} ${scy}
    C${scx - sw * 0.07} ${scy} ${scx} ${scy + sw * 0.43} ${scx} ${scy + sw / 2}
    C${scx} ${scy + sw * 0.07} ${scx + sw * 0.43} ${scy} ${scx + sw / 2} ${scy}
    C${scx + sw * 0.07} ${scy} ${scx} ${scy - sw * 0.43} ${scx} ${scy - sw / 2}Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4285f4"/>
      <stop offset="60%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <polygon points="${tx1},${ty1} ${tx2},${ty2} ${tx3},${ty3}" fill="white" opacity="0.95"/>
  <path d="${starPath}" fill="white" opacity="0.9"/>
</svg>`;
};

const sizes = [16, 32, 48, 96, 128];

for (const size of sizes) {
  const buffer = Buffer.from(svg(size));
  await sharp(buffer).png().toFile(join(iconDir, `${size}.png`));
  console.log(`✓ ${size}x${size} generated`);
}
