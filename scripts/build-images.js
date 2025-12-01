// scripts/build-images.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = 'public/images';
const SIZES = [640, 960, 1280, 1920];
const formats = [
  { ext: 'webp', options: { quality: 80 } },
  { ext: 'avif', options: { quality: 40 } }
];

async function processImage(filePath) {
  const rel = path.relative(SRC, filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  for (const width of SIZES) {
    for (const fmt of formats) {
      const out = path.join(dir, `${base}-${width}.${fmt.ext}`);
      try {
        // Only generate if file doesn't exist
        if (!fs.existsSync(out)) {
          await sharp(filePath).resize({ width, withoutEnlargement: true }).toFormat(fmt.ext, fmt.options).toFile(out);
          console.log('Generated:', out);
        } else {
          console.log('Skipped (exists):', out);
        }
      } catch (err) {
        console.error('Failed to generate:', out, err.message);
      }
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(png|jpg|jpeg|webp)$/i.test(entry)) processImage(full);
  }
}

(async () => { walk(SRC); })();
