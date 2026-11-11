# SaarangIdea
# Shaastra 2026 — Component Redesign

Redesign two components from the Shaastra IIT Madras tech fest website, elevating them with a premium, modern aesthetic while maintaining clarity and usability. The constraint: pure vanilla stack only — no React, no Tailwind, no bundlers.

---

## Components

### 1. Immersive Landing Hero

A full-screen canvas-driven hero section that sets the visual tone of the entire page.

- **140-particle drifting constellation** rendered on `<canvas>` with `requestAnimationFrame`
- Nearby particles connect with faint lines; the field reacts to cursor movement (repel/attract)
- Pauses animation on tab hide via the Page Visibility API
- Device Pixel Ratio capped at 2 for performance
- Respects `prefers-reduced-motion` for accessibility
- Large **"SHAASTRA"** headline with staggered letter-by-letter CSS reveal (`cubic-bezier` easing)
- Tagline + magnetic hover CTA button

### 2. Morphing Sticky Navigation

A pill-shaped nav bar that morphs between two states as the user scrolls.

- **Wide + translucent** at the top of the page (1040px max, `backdrop-filter: blur(12px)`)
- **Compact glossy capsule** on scroll past 40px (540px max, 24px blur, deep elevation shadows)
- Scroll-direction awareness — hides on scroll-down, snaps back on scroll-up
- Sliding active-section indicator driven by `IntersectionObserver` — glides between links with sub-pixel accuracy using `offsetLeft` / `offsetWidth`
- Font & resize recalibration: auto-adjusts when custom fonts load or on window resize
- Mobile: collapses into a hamburger that expands the pill smoothly

---

## Visual Direction

**Liquid Chrome** — a dark, premium aesthetic inspired by high-end product interfaces.

| Token | Value |
|---|---|
| Base background | `#07080a` (near-black) |
| Accent | `#d4ff3f` (electric lime) |
| Surface highlight | cool silver specular |
| Display font | [Syne](https://fonts.google.com/specimen/Syne) |
| Label / mono font | [Space Mono](https://fonts.google.com/specimen/Space+Mono) |

Additional details: SVG film-grain overlay, cursor radial spotlight, 1px inner edge highlights, CSS custom properties throughout.

---

## File Structure

```
shaastra-redesign/
├── index.html   — markup & component structure
├── style.css    — all styles, CSS variables, animations
└── script.js    — canvas engine, scroll logic, IntersectionObserver
```

---

## How to Run

No install, no build step needed.

**Option A — Direct open:**
```
Open index.html in any modern browser.
```

**Option B — Local server (recommended for consistent font loading):**
```bash
python -m http.server 3000
# then visit http://localhost:3000
```

---

## Technical Notes

- **Canvas constellation** — particle physics loop using `requestAnimationFrame`; particles repel/attract based on mouse proximity
- **Morphing nav** — single element, two visual states toggled by a scroll threshold class; CSS transitions handle the morph
- **Active indicator** — a child `<span>` absolutely positioned inside the link bar; its `transform: translateX` and `width` are updated via JS on each `IntersectionObserver` callback
- **CSS custom properties** — all colours, blur values, and spacing defined as variables for easy theming
- **Performance** — DPR cap, `will-change` on animated elements, `visibility: hidden` check to skip canvas frames when tab is not visible

---

## Credits

- **Event**: [Shaastra 2026](https://www.shaastra.org/), Annual Tech Fest — IIT Madras
- **Assignment context**: UI/UX Component Redesign — College coursework
- **Fonts**: Google Fonts CDN (Syne, Space Mono)
- Original Shaastra branding and event identity belong to IIT Madras. This is a student redesign exercise and is not affiliated with or endorsed by the official Shaastra team.
