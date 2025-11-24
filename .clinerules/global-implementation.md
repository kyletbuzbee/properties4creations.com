📏 Rules for Implementation
✅ Must Do
Use only design tokens from design-tokens.css for colors, spacing, typography, shadows

Use semantic classes (.text-primary, .bg-surface-light, .btn-primary) instead of inline styles

Ensure all interactive elements have visible focus states and keyboard accessibility

Use <picture> for all hero and property images with WebP fallback

Validate all JSON files for consistent field types and required metadata

🚫 Must Not Do
Do not use hardcoded colors, fonts, or spacing outside of token system

Do not reference or link to insights.html anywhere

Do not use (512) or “Austin” in any content or metadata

Do not inject inline styles or scripts unless absolutely necessary

Do not use deprecated or unstructured schema types (e.g., SingleFamilyResidence on homepage)

🧪 Final QA Checklist
[ ] Header/footer links updated and active state applied

[ ] All pages pass Lighthouse audit >90 (Performance, Accessibility, SEO)

[ ] All JSON files validated and normalized

[ ] All images optimized and lazy-loaded

[ ] All forms accessible and keyboard-navigable

[ ] All schema types correct and discoverable