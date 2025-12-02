/**
 * Eleventy SSG Configuration
 * Handles static asset passthrough and template rendering.
 */
module.exports = function(eleventyConfig) {
  // 1. Passthrough Copy: Directly copy static assets to output
  eleventyConfig.addPassthroughCopy({ "public": "public" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // 2. Watch Targets: Rebuild 11ty when Tailwind finishes recompiling CSS
  eleventyConfig.addWatchTarget("./dist/css/");

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
