---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web and mobile applications. Contains 50+ styles, 161 color palettes, 57 font pairings, 161 product types with reasoning rules, 99 UX guidelines, and 25 chart types across 10 technology stacks. Searchable database with priority-based recommendations.

## When to Apply

This Skill should be used when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**.

### Must Use

- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts, etc.)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for user experience, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)
- Improving perceived quality, clarity, or usability of interfaces

### Recommended

- UI looks "not professional enough" but the reason is unclear
- Receiving feedback on usability or experience
- Pre-launch UI quality optimization
- Aligning cross-platform design (Web / iOS / Android)
- Building design systems or reusable component libraries

### Skip

- Pure backend logic development
- Only involving API or database design
- Performance optimization unrelated to the interface
- Infrastructure or DevOps work
- Non-visual scripts or automation tasks

**Decision criteria**: If the task will change how a feature **looks, feels, moves, or is interacted with**, this Skill should be used.

## Rule Categories by Priority

| Priority | Category | Impact | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | Min size 44x44px, 8px+ spacing, Loading feedback | Reliance on hover only, Instant state changes (0ms) |
| 3 | Performance | HIGH | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | Match product type, Consistency, SVG icons (no emoji) | Mixing flat & skeuomorphic randomly, Emoji as icons |
| 5 | Layout & Responsive | HIGH | Mobile-first breakpoints, Viewport meta, No horizontal scroll | Horizontal scroll, Fixed px container widths, Disable zoom |
| 6 | Typography & Color | MEDIUM | Base 16px, Line-height 1.5, Semantic color tokens | Text < 12px body, Gray-on-gray, Raw hex in components |
| 7 | Animation | MEDIUM | Duration 150-300ms, Motion conveys meaning, Spatial continuity | Decorative-only animation, Animating width/height, No reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, Error near field, Helper text, Progressive disclosure | Placeholder-only label, Errors only at top, Overwhelm upfront |
| 9 | Navigation Patterns | HIGH | Predictable back, Bottom nav <=5, Deep linking | Overloaded nav, Broken back behavior, No deep links |
| 10 | Charts & Data | LOW | Legends, Tooltips, Accessible colors | Relying on color alone to convey meaning |

## Quick Reference Highlights

Full rule set preserved in the shipped skill; key items for web/library-showcase work:

- **Typography**: base 16px, line-height 1.5-1.75, readable measure 60-75 chars, font-scale (e.g. 12/14/16/18/24/32), font-pairing with matching personalities.
- **Color**: semantic tokens (primary / surface / on-surface / muted / destructive), 4.5:1 contrast AA, dark mode as co-designed variant not inversion.
- **Spacing**: 4/8px incremental scale, consistent max-width (max-w-6xl / 7xl) on desktop, mobile-first breakpoints 375/768/1024/1440.
- **Interaction**: 44x44 touch targets, 150-300ms micro-interactions with ease-out, focus rings always visible, pressed feedback within 80-150ms.
- **Animation**: transform/opacity only, motion expresses cause-effect, exit 60-70% of enter duration, respect prefers-reduced-motion.
- **Style for dev-tool / SaaS**: minimalism + bento/dashboard structure, SVG icons (Lucide/Heroicons), subtle shadows, restrained primary color with neutral surfaces.

## Intended Workflow (with scripts)

If the supporting scripts are shipped alongside this SKILL.md:

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <style|color|typography|ux|landing|product|chart|web|prompt>
```

When scripts are not installed, apply the embedded priority-ranked rules above directly.

## Pre-Delivery Checklist (Web)

### Visual Quality
- [ ] No emojis used as icons (SVG only, one icon family)
- [ ] Consistent icon sizing via tokens (icon-sm/md/lg)
- [ ] Pressed states do not shift layout bounds
- [ ] Semantic theme tokens (no raw hex in components)

### Interaction
- [ ] All tappable/clickable elements provide pressed feedback
- [ ] Touch targets >=44x44pt
- [ ] Micro-interactions 150-300ms with ease-out entering, ease-in exiting
- [ ] Disabled states visually clear and non-interactive
- [ ] Focus rings visible and order matches visual order

### Light/Dark Mode
- [ ] Primary text >=4.5:1 in both modes
- [ ] Secondary text >=3:1 in both modes
- [ ] Dividers/borders distinguishable in both modes
- [ ] Both themes tested before delivery

### Layout
- [ ] Mobile-first, verified at 375 / 768 / 1024 / 1440
- [ ] Safe-area respected (where applicable)
- [ ] 4/8px spacing rhythm across component/section/page
- [ ] Long-form measure 60-75 chars on desktop

### Accessibility
- [ ] Meaningful images/icons have alt / aria-label
- [ ] Form fields have labels, hints, error messages near the field
- [ ] Color is never the only indicator
- [ ] Reduced motion and dynamic text size supported
- [ ] Roles/states (selected, disabled, expanded) announced correctly
