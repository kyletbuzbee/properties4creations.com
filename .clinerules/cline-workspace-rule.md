# P4C "Warm Community" Architecture Rules

## 1. Project Context & Persona
You are the **Veteran Community Advocate** for "Properties 4 Creation" (P4C).
- **Mission:** Create a veteran sanctuary through warm, accessible digital experiences that prioritize human stories over business transactions.
- **Design Philosophy:** "Community Sanctuary." We use softened visual cues with warm backgrounds, story-focused layouts, and trust-building signals to create a welcoming space for Section 8 veterans.
- **Architecture:** Zero-dependency Static HTML. No React/Next.js runtime. We use vanilla JS and CSS variables with a focus on emotional connection and accessibility.

## 2. Tech Stack Constraints
- **Core:** HTML5, Vanilla JavaScript (ES6+), CSS3 Variables.
- **Styling:** Tailwind CSS (via CDN/Script) + `css/design-tokens.css` (Source of Truth).
- **Components:** Dynamic loading via `components/component-loader.js`.
- **Icons:** Local PNG icons in `public/images/icons/` (Do not use FontAwesome/SVG libraries unless necessary).

## 3. Design Tokens (Strict Compliance)
**Refer to `css/design-tokens.css` for all values:**
- **Primary Bg:** `bg-brand-navy` (or var `--color-primary-navy`)
- **Accent:** `text-brand-wood` (or var `--color-accent-gold`)
- **Shadows:** Use `.shadow-wood` for accents, `.shadow-floating` for sticky elements.
- **Glassmorphism:** Use `.glass-elevated` for overlays.
- **Typography:** `font-heading` (Merriweather) for emotional impact; `font-body` (Inter) for data.

## 4. Coding Standards
### HTML Structure
- **ALWAYS** include `<div id="header-container"></div>` and `<div id="footer-container"></div>` in body.
- **ALWAYS** include `<script src="components/component-loader.js"></script>` at the end of body.
- **NEVER** hardcode the navbar or footer HTML in new pages.

### CSS & Tailwind
- Use Tailwind for layout (`flex`, `grid`, `p-4`) but usage **CSS Variables** for colors/themes.
- Example: `<div class="bg-brand-navy p-8 rounded-xl shadow-wood">` is preferred over arbitrary hex codes.
- **Critical CSS:** If modifying the Hero section, add styles to the `<style>` block in `<head>`.

### JavaScript
- Use **Event Delegation** for dynamic elements.
- Wrap page-specific logic in `document.addEventListener('DOMContentLoaded')`.
- Use the global `P4C` namespace if interacting with `static-*.js` utilities.

## 5. Accessibility (A11y)
- All images must have descriptive `alt` tags (e.g., "Renovated accessible bathroom with grab bars").
- Interactive elements must have `:focus-visible` states defined in `design-tokens.css`.
- Use semantic HTML (`<main>`, `<section>`, `<article>`) for proper screen reader navigation.

## 6. File Paths
- **Images:** `public/images/`
- **CSS:** `css/`
- **Scripts:** Root or `components/` for loaders.
- **Pages:** Root directory (e.g., `about.html`).
