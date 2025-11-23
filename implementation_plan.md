# Implementation Plan

## [Overview]
Transform Properties 4 Creation from a "corporate investment firm" aesthetic to a "veteran sanctuary and community resource" by softening the visual design, changing layouts to emphasize human stories over price, centralizing hardcoded data, and adding trust signals. The current deep Navy-heavy styling feels intimidating to Section 8 veterans; warm beige backgrounds, story-focused property cards, and a welcoming split hero will create an accessible community feel while maintaining professional credibility.

Shift perception from "asset class for investors" to "housing support for families" through thoughtful UX changes that prioritize emotional connection over transaction focus.

## [Types]
No new type definitions, interfaces, or enums needed. Leverage existing property data structure and expand it minimally for transparency features.

Extend property object schema to include:
- story_description: String (70-90 words emphasizing safety/community benefits)
- renovation_standards: Array<String> (certification details)
- trust_badges: String[] (veteran-priority, ADA-compliant, etc.)

## [Files]
Modify existing:
- index.html: Replace full-width video hero with split layout (text left, porch family image right)
- projects.html: Restructure property cards to landscape orientation with story taking 60% width, price as subtle bottom detail
- public/search-index.json: Update synchronization with new centralized data source

Create new files:
- public/properties-data.json: Centralized property data powering both search results and property listings
- transparency.html: Dedicated page displaying renovation standards checklist (HVAC, Roof, Electrical, etc.)
- components/transparency.html: Component version for dynamic loading

Delete files:
- None; archive old versions if needed

Configuration files:
- none; update .clinerules to reference "Warm Community" persona

## [Functions]
Modify existing functions:
- static-search.js: Update data source reference from search-index.json to properties-data.json
- static-projects.js: Add renderPropertyCards(data) to dynamically populate from centralized data instead of hardcoded HTML
- component-loader.js: Extend to load transparency component in transparency.html

New functions:
- port:function fetchPropertyData(): Promise<Object[]> - Centralized data fetching with error handling
- port:function updateTrustBadges(): void - Updates live status badge in footer
- port:function renderStoryCards(properties: Array): void - Renders story-emphasized property cards

Remove functions:
- None; deprecate hardcoded rendering patterns

## [Classes]
New classes (CSS):
- .hero-split: Flex layout for 50/50 hero sections
- .card-landscape: 16:9 card ratio with story-left, image-right layout
- .trust-badge-live: Animated green dot with pulse for active Section 8 status
- .community-warm: Theme class reducing navy saturation by 40%

Modify existing classes:
- Replace .price-prominent with .price-subtle (smaller font, neutral color)
- Update .hero-corporate to .hero-community (beige background instead of navy gradient)

Remove classes:
- None; future-proof existing component classes

## [Dependencies]
New packages:
- None; maintain zero-dependency static architecture

Version changes:
- No changes to existing CDN dependencies

Integration requirements:
- Ensure compatibility with existing component-loader.js for dynamic content

## [Testing]
Manual QA testing strategy:
- Hero responsiveness: Verify split layout on mobile/tablet/desktop
- Property cards: Confirm story emphasis and price de-emphasis
- Data consistency: Verify search results match property listings exactly
- Accessibility: Screen reader navigation with new layout structures

Validation approach:
- Run validation-test.js for broken links on all changed pages
- Manual cross-browser testing on Chrome, Firefox, Safari
- Performance audit: Ensure new images don't increase page weight excessively

Automated testing:
- Update existing static-map-tests if structure changes
- Add basic data validation tests for properties-data.json integrity

## [Implementation Order]
1. Extract hardcoded property data from projects.html into public/properties-data.json, maintaining schema compatibility with search-index.json
2. Modify projects.html property cards to landscape layout (story front, price background) using existing component classes
3. Redesign index.html hero section to split layout: emotional copy left, high-res porch family image right
4. Update public/search-index.json to reference and validate against new centralized properties-data.json
5. Create transparency.html rendering renovation standards checklist and trust signals
6. Add live "Section 8 Vouchers Accepted" status badge to footer with dynamic color update
7. Update .clinerules to enforce "Warm Community Persona" for future code generation
8. Test data synchronization and component loading across all touched pages
