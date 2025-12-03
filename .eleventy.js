/**
 * Eleventy SSG Configuration
 * Handles static asset passthrough and template rendering.
 */
module.exports = function (eleventyConfig) {
  // 1. Passthrough Copy: Directly copy static assets to output
  eleventyConfig.addPassthroughCopy({ "public": "public" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // 2. Watch Targets: Rebuild 11ty when Tailwind finishes recompiling CSS
  eleventyConfig.addWatchTarget("./dist/css/");

  // 3. Responsive Image Shortcode
  eleventyConfig.addShortcode("respimg", function (src, alt, className = "", loading = "lazy") {
    // Try to load optimized images manifest
    let manifest = {};
    try {
      manifest = require('./public/images/optimized/image-manifest.json');
    } catch (e) {
      // Fall back to original behavior if manifest doesn't exist
      return `<img src="/public/${src}" alt="${alt}" class="${className}" loading="${loading}">`;
    }

    // Extract base path without extension
    const basePath = src.replace(/\.[^/.]+$/, "");
    const variants = manifest[basePath];

    if (!variants) {
      // Fall back to WebP if available, otherwise original
      const webpSrc = `/public/${basePath}.webp`;
      return `<img src="${webpSrc}" alt="${alt}" class="${className}" loading="${loading}">`;
    }

    // Build srcset for each format
    const srcsets = {};
    ['webp', 'avif', 'jpg'].forEach(format => {
      const formatVariants = variants.variants.filter(v => v.format === format);
      if (formatVariants.length > 0) {
        const srcset = formatVariants
          .map(v => `/public/images/optimized/${v.path} ${v.path.match(/-(\d+)\./)?.[1] || ''}w`)
          .join(', ');
        srcsets[format] = srcset;
      }
    });

    // Build picture element
    let pictureHtml = '<picture>';

    if (srcsets.avif) {
      pictureHtml += `<source srcset="${srcsets.avif}" type="image/avif">`;
    }
    if (srcsets.webp) {
      pictureHtml += `<source srcset="${srcsets.webp}" type="image/webp">`;
    }

    // Fallback to optimized JPG or original
    const fallbackSrc = variants.variants.find(v => v.format === 'jpg')?.path ||
      variants.variants.find(v => v.format === 'jpeg')?.path ||
      src;

    pictureHtml += `<img src="/public/images/optimized/${fallbackSrc}" alt="${alt}" class="${className}" loading="${loading}">`;
    pictureHtml += '</picture>';

    return pictureHtml;
  });

  // 4. SVG Icon Shortcode
  eleventyConfig.addShortcode("icon", function (name, className = "") {
    const aria = 'aria-hidden="true"';
    return `<svg class="w-6 h-6 ${className}" ${aria} role="img">
      <use href="/public/images/icons/icons.svg#${name}"></use>
    </svg>`;
  });

  return {
    dir: {
      input: "src",      // Source code location
      output: "dist",    // Build destination
      includes: "_includes", // Layouts and partials
      data: "_data"      // Global data files
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
