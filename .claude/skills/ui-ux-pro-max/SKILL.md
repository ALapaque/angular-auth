---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design."
---

# UI/UX Pro Max - Design Intelligence

## When to Apply
Invoke whenever the task involves **UI structure, visual design decisions, interaction patterns, or UX quality control**.

## Priority-Ranked Rules

| Priority | Category | Key Checks |
|----------|----------|------------|
| 1 | Accessibility | 4.5:1 contrast, visible focus, keyboard nav, aria-labels, reduced-motion |
| 2 | Touch & Interaction | 44x44 targets, 8px spacing, loading feedback, press states in 80-150ms |
| 3 | Performance | Lazy-load, reserve space (CLS < 0.1), main thread < 16ms/frame |
| 4 | Style Selection | Match product type, consistency, SVG icons (no emoji), one icon family |
| 5 | Layout & Responsive | Mobile-first, no horizontal scroll, 4/8px spacing rhythm |
| 6 | Typography & Color | Base 16px, line-height 1.5-1.75, semantic tokens, measure 60-75ch |
| 7 | Animation | 150-300ms with ease-out, transform/opacity only, motion has meaning |
| 8 | Forms & Feedback | Visible labels, error near field, progressive disclosure |
| 9 | Navigation | Predictable back, deep-linking, nav max 5 items, active state clear |
| 10 | Charts & Data | Legends, tooltips, accessible color pairs, text alternatives |

## Pre-Delivery Checklist

### Visual Quality
- [ ] No emojis used as icons (SVG only)
- [ ] Consistent icon sizing via tokens
- [ ] Pressed states do not shift layout bounds
- [ ] Semantic theme tokens (no raw hex in components)

### Interaction
- [ ] Tappable elements provide pressed feedback
- [ ] Touch targets >=44x44pt
- [ ] Micro-interactions 150-300ms with ease-out/in
- [ ] Disabled states visually clear
- [ ] Focus rings visible and match visual order

### Light/Dark Mode
- [ ] Primary text >=4.5:1 in both modes
- [ ] Secondary text >=3:1 in both modes
- [ ] Dividers/borders distinguishable in both modes
- [ ] Both themes tested before delivery

### Layout
- [ ] Mobile-first at 375 / 768 / 1024 / 1440
- [ ] Safe-area respected
- [ ] 4/8px spacing rhythm enforced
- [ ] Long-form measure 60-75 chars

### Accessibility
- [ ] Meaningful images/icons have alt / aria-label
- [ ] Form fields have labels + helper + error messages
- [ ] Color is never the only indicator
- [ ] Reduced motion + dynamic text size supported
- [ ] Roles / states announced correctly

## Common "Not Pro Enough" Fixes
- Cramped feel -> section vertical padding 96-160px, card interior 32-48px, measure 65-75ch
- Weak hero -> display type 72-96px bold, one strong CTA + one secondary
- Flat visuals -> layered depth via elevation scale, gradient accent, glass (backdrop-filter) on 1-2 surfaces max
- Inconsistent icons -> one family (Lucide/Heroicons), fixed stroke-width 1.5-2px
- Generic palette -> pick a single distinctive accent, keep everything else neutral
- Docs feel like a wiki -> bento grid, kicker labels in mono, prose max-width 65-70ch

## Brutalism + Bento + Gradient Recipe (dev-tool)
- Display font: grotesk (Space Grotesk, Geist, Neue Haas) 700-800 weight
- Mono accents for UI labels, kbd, code identifiers
- Thick borders (1.5px), sharp radii (4-8px), high contrast
- Single vibrant two-tone gradient (e.g. violet to cyan) used sparingly: hero type, focus ring, 1-2 bento cards
- Bento grid: asymmetric, 2-3 sizes mixed, bold heading per cell
- Background: subtle dot grid or noise at ~3% opacity on hero only
