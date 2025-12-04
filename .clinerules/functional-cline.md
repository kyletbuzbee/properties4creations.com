🚀 Website Cohesion & Functionality Rollout Plan
Phase 1: File System Cleanup
Goal: Normalize all image assets.

Rename files (remove (1) and spaces):

public/images/banners/hero-about-banner (1)-640.webp → public/images/banners/hero-about-banner-640.webp

Repeat for all (1) variants across AVIF/WebP/JPG sets.

Confirm directories:

public/images/optimized/banners/

public/images/properties/before-after/

public/images/icons/icons.svg

Logo: Use brand_logo_UPDATED.svg or brand-logo-header.svg.

Phase 2: Front Matter Updates
Goal: Standardize banner references.

Edit page front matter:

src/pages/about.html → banner.image: "hero-about-banner.webp"

src/pages/contact.html → banner.image: "hero-contact-banner.webp"

src/pages/get-started.html → banner.image: "hero-get-started-banner.webp"

src/pages/impact.html → banner.image: "hero-impact-banner.webp"

src/pages/resources.html → banner.image: "hero-resources-banner.webp"

src/pages/transparency.html → banner.image: "hero-transparency-banner.webp"

src/pages/index.html → banner.image: "hero-home-banner.webp"

src/pages/projects.html → banner.image: "hero-projects-banner.webp"

Phase 3: Banner Partial Update
File: src/_includes/banner.njk

njk
<section class="page-banner relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
  <picture>
    <!-- AVIF -->
    <source srcset="/public/images/optimized/banners/{{ banner.image | replace('.webp','-1920.avif') }}" media="(min-width: 1280px)" type="image/avif">
    <source srcset="/public/images/optimized/banners/{{ banner.image | replace('.webp','-1280.avif') }}" media="(min-width: 960px)" type="image/avif">
    <source srcset="/public/images/optimized/banners/{{ banner.image | replace('.webp','-640.avif') }}" media="(min-width: 640px)" type="image/avif">

    <!-- WebP -->
    <source srcset="/public/images/optimized/banners/{{ banner.image | replace('.webp','-1920.webp') }}" media="(min-width: 1280px)" type="image/webp">
    <source srcset="/public/images/optimized/banners/{{ banner.image | replace('.webp','-1280.webp') }}" media="(min-width: 960px)" type="image/webp">
    <source srcset="/public/images/optimized/banners/{{ banner.image | replace('.webp','-640.webp') }}" media="(min-width: 640px)" type="image/webp">

    <!-- JPG fallback -->
    <img src="/public/images/optimized/banners/{{ banner.image | replace('.webp','.jpg') }}"
         alt="{{ banner.title }}"
         class="page-banner__bg-image w-full h-full object-cover"
         loading="eager">
  </picture>
</section>
Phase 4: Gallery Compare Slider
File: src/pages/gallery.html

html
<div class="compare-container relative w-full max-w-4xl mx-auto h-[350px] overflow-hidden rounded-xl shadow-lg group">
  <!-- After Image -->
  <picture>
    <source srcset="/public/images/properties/before-after/after_living_room-1920.avif" media="(min-width: 1280px)" type="image/avif">
    <source srcset="/public/images/properties/before-after/after_living_room-1280.avif" media="(min-width: 960px)" type="image/avif">
    <source srcset="/public/images/properties/before-after/after_living_room-640.avif" media="(min-width: 640px)" type="image/avif">
    <source srcset="/public/images/properties/before-after/after_living_room-1920.webp" media="(min-width: 1280px)" type="image/webp">
    <source srcset="/public/images/properties/before-after/after_living_room-1280.webp" media="(min-width: 960px)" type="image/webp">
    <source srcset="/public/images/properties/before-after/after_living_room-640.webp" media="(min-width: 640px)" type="image/webp">
    <img src="/public/images/properties/before-after/after_living_room.jpg"
         alt="Living room after renovation with new flooring and paint"
         class="w-full h-full object-cover">
  </picture>

  <!-- Before Image Overlay -->
  <div class="compare-overlay absolute inset-0 w-[50%] h-full z-10 border-r-2 border-white">
    <picture>
      <source srcset="/public/images/properties/before-after/patio_wood-1920.avif" media="(min-width: 1280px)" type="image/avif">
      <source srcset="/public/images/properties/before-after/patio_wood-1280.avif" media="(min-width: 960px)" type="image/avif">
      <source srcset="/public/images/properties/before-after/patio_wood-640.avif" media="(min-width: 640px)" type="image/avif">
      <source srcset="/public/images/properties/before-after/patio_wood-1920.webp" media="(min-width: 1280px)" type="image/webp">
      <source srcset="/public/images/properties/before-after/patio_wood-1280.webp" media="(min-width: 960px)" type="image/webp">
      <source srcset="/public/images/properties/before-after/patio_wood-640.webp" media="(min-width: 640px)" type="image/webp">
      <img src="/public/images/properties/before-after/patio_wood.jpg"
           alt="Patio before renovation showing worn wood flooring"
           class="w-full h-full object-cover">
    </picture>
  </div>

  <!-- Slider Control -->
  <input type="range"
         min="0"
         max="100"
         value="50"
         class="slider-control absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4"
         aria-label="Compare before and after images"
         tabindex="0">
</div>
Phase 5: Page Functionality Fixes
Projects page (projects.html):

Add Leaflet assets in <head>.

Create public/properties-data.json.

Add passthrough copy in .eleventy.js.

Add loading="lazy" to thumbnails.

Add aria-label to filter selects.

Guard map init if L is undefined.

Contact page (contact.html):

Add progressive form submission handler.

Remove missing script reference.

Get Started page (get-started.html):

Normalize JSON‑LD URLs.

Add form submission handler.

Switch banner to .webp with <picture> fallback.

Impact page (impact.html):

Update links to folder routes.

Use <blockquote> with cite for testimonials.

Add JSON‑LD for stories.

Phase 6: Renovation Standards Page
File: standards.html

Convert checklist to <ul> with .list-check styles.

Add JSON‑LD for Organization + service guarantees.

Use .card-elevated for “Inspection Guarantee”.

Phase 7: Resources Page
File: resources.html

Add FAQPage JSON‑LD for HUD‑VASH and housing authority questions.

Normalize headings hierarchy.

Add rel="noopener" to external links.

Phase 8: Footer Cohesion
File: src/_includes/footer.njk

Wrap navs in <nav aria-label="Footer">.

Use <ul><li> for lists.

Add .badge variant for “Section 8 Vouchers Accepted”.

Phase 9: Performance & Reliability
Files:

tailwind.config.js → confirm content paths.

workbox-config.js → add runtime caching for /public/images/ and /videos/.

package.json → add build:data validation step.

Actions:

Preload fonts and critical CSS.

Lazy load non-hero images.

Phase 10: Accessibility Enhancements
Files:

base.njk → add skip-to-content link.

projects.html → add <label> for filter selects

what else?
Since you’ll be pasting this into Cline Grok Fast Coder 1 in VS Code, let’s extend the rollout plan with the remaining gaps beyond banners, gallery, and page fixes. These are the areas that still need attention to make the site fully functional, cohesive, and production‑ready:

🔧 Additional Phases Beyond Current Fixes
Phase 11: Accessibility & Usability
Skip link:

File: src/_includes/base.njk

Add:

html
<a href="#main" class="skip-to-content">Skip to Content</a>
<main id="main">
Focus styles: Ensure :focus-visible tokens are applied globally in components.css.

Form labels:

File: src/pages/projects.html

Wrap selects with <label for="bedrooms">Bedrooms</label> etc.

Phase 12: SEO & Structured Data
Canonical + OG tags:

File: src/_includes/base.njk

Add:

html
<link rel="canonical" href="{{ site.url }}{{ page.url }}">
<meta property="og:title" content="{{ pageTitle }}">
<meta property="og:description" content="{{ description }}">
<meta property="og:image" content="/public/images/social-share-default.webp">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta name="twitter:card" content="summary_large_image">
VideoObject schema:

File: src/pages/projects.html

Add JSON‑LD for banner video.

BreadcrumbList schema:

File: src/_includes/base.njk

Add JSON‑LD breadcrumbs for navigation consistency.

Phase 13: Performance & Reliability
Tailwind purge paths:

File: tailwind.config.js

Ensure:

js
module.exports = {
  content: ["./src/**/*.{njk,html,md}", "./dist/**/*.html"],
  theme: { extend: {} },
  plugins: []
}
Workbox caching:

File: workbox-config.js

Add runtime caching for /public/images/ and /videos/.

Preload fonts:

File: src/_includes/base.njk

Add <link rel="preload" href="/public/fonts/brand.woff2" as="font" type="font/woff2" crossorigin>.

Phase 14: Data Ops
Property JSON validation:

File: scripts/validate-properties.js

Example:

js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/properties-data.json'));
for (const [id, prop] of Object.entries(data)) {
  if (!prop.title || !prop.city || !prop.coords) {
    throw new Error(`Property ${id} missing required fields`);
  }
}
Build step:

File: package.json

Add "build:data": "node scripts/validate-properties.js" before build.

Phase 15: Testing & CI/CD
Accessibility tests:

File: tests/a11y.spec.ts

Use axe-core with Playwright.

Visual regression:

File: tests/visual.spec.ts

Snapshot banners, headers, filters.

Audit gate:

Integrate master audit script to fail builds on broken links/assets.

✅ Final Acceptance Criteria
All banners and gallery images load responsively with AVIF/WebP/JPG fallbacks.

Navigation routes are correct and consistent.

Projects page map and filters work with data.

Forms submit successfully with graceful error handling.

Renovation standards, impact, and resources pages have structured data.

Footer is unified and accessible.

Performance optimized with caching, lazy loading, and preloads.

Accessibility passes Lighthouse and axe-core tests.

SEO metadata and JSON‑LD are correct.

CI/CD gates prevent regressions.