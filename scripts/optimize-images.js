const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = 'public/images';
const OUTPUT_DIR = 'public/images/optimized';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Image optimization settings
const SIZES = [640, 960, 1280, 1920];
const FORMATS = ['webp', 'avif', 'jpg'];

async function optimizeImage(inputPath, outputPath, options) {
    try {
        const image = sharp(inputPath);

        // Get image metadata
        const metadata = await image.metadata();

        // Generate responsive images for each size
        for (const size of SIZES) {
            if (metadata.width >= size) {
                const width = Math.min(size, metadata.width);

                for (const format of FORMATS) {
                    const filename = path.basename(outputPath, path.extname(outputPath));
                    const dir = path.dirname(outputPath);
                    const ext = format;
                    const sizeFilename = `${filename}-${width}.${ext}`;
                    const sizePath = path.join(dir, sizeFilename);

                    let processor = image.clone().resize(width, null, {
                        fit: 'inside',
                        withoutEnlargement: true
                    });

                    if (format === 'webp') {
                        processor = processor.webp({ quality: 85, effort: 6 });
                    } else if (format === 'avif') {
                        processor = processor.avif({ quality: 80, effort: 9 });
                    } else if (format === 'jpg') {
                        processor = processor.jpeg({ quality: 85, mozjpeg: true });
                    }

                    await processor.toFile(sizePath);
                    console.log(`✅ Generated: ${sizePath}`);
                }
            }
        }

        // Generate original WebP version for direct replacement
        const originalWebpPath = outputPath.replace(path.extname(outputPath), '.webp');
        await image.clone().webp({ quality: 85, effort: 6 }).toFile(originalWebpPath);
        console.log(`✅ Generated WebP: ${originalWebpPath}`);

    } catch (error) {
        console.error(`❌ Error processing ${inputPath}:`, error.message);
    }
}

async function processDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            await processDirectory(itemPath);
        } else if (stat.isFile()) {
            // Check if it's an image file
            const ext = path.extname(itemPath).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.webp'].includes(ext)) {
                const relativePath = path.relative(INPUT_DIR, itemPath);
                const optimizedPath = path.join(OUTPUT_DIR, relativePath);

                // Ensure output subdirectory exists
                const outputSubDir = path.dirname(optimizedPath);
                if (!fs.existsSync(outputSubDir)) {
                    fs.mkdirSync(outputSubDir, { recursive: true });
                }

                console.log(`🔄 Processing: ${relativePath}`);
                await optimizeImage(itemPath, optimizedPath, {});
            }
        }
    }
}

async function generateImageManifest() {
    const manifestPath = path.join(OUTPUT_DIR, 'image-manifest.json');
    const manifest = {};

    function buildManifest(dir, currentPath = '') {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                buildManifest(itemPath, path.join(currentPath, item));
            } else if (stat.isFile()) {
                const ext = path.extname(itemPath).toLowerCase();
                if (['.webp', '.avif', '.jpg', '.jpeg'].includes(ext)) {
                    const relativePath = path.relative(OUTPUT_DIR, itemPath);
                    const baseName = path.basename(itemPath, ext);
                    const key = path.join(currentPath, baseName);

                    if (!manifest[key]) {
                        manifest[key] = {
                            original: path.join('images', currentPath, item),
                            variants: []
                        };
                    }

                    manifest[key].variants.push({
                        format: ext.slice(1),
                        path: relativePath,
                        size: stat.size
                    });
                }
            }
        }
    }

    buildManifest(OUTPUT_DIR);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Generated image manifest: ${manifestPath}`);
}

async function main() {
    console.log('🚀 Starting image optimization...');

    try {
        await processDirectory(INPUT_DIR);
        await generateImageManifest();

        console.log('🎉 Image optimization complete!');
        console.log(`📁 Optimized images saved to: ${OUTPUT_DIR}`);
        console.log('📋 Check image-manifest.json for srcset data');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { optimizeImage, processDirectory };
