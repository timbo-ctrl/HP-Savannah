# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HP Savannahs homepage — a marketing site for a cattery placing high-percentage F1 Savannahs by application only. Editorial/magazine visual direction (Chicago Bulls red/black/bone palette; Anton + Instrument Serif + Archivo + JetBrains Mono).

## Stack

Single-file static site. **No build step, no package manager, no dependencies.** Everything lives in `index.html` — markup, styles (inline `<style>`), and scripts (inline `<script>`) all in one document. Assets (logo, photography) are in `assets/`.

## Running locally

```bash
python3 -m http.server 8000
# then http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Architecture

All work happens in `index.html` (~1600 lines) but navigable via consistent section markers — use these instead of scrolling:

- **CSS sections** (inside `<style>`) are delimited by `/* ==== SECTION NAME ==== */` headers: SPLASH, NAVIGATION, HERO, MANIFESTO SECTION, THE CATS GALLERY, FULL BLEED SPLIT, PROCESS, JOURNAL, CTA BLOCK, FOOTER, REVEAL ANIMATIONS, RESPONSIVE.
- **HTML sections** (inside `<body>`) are delimited by `<!-- ========== SECTION NAME ========== -->` headers in roughly the same order (plus a TICKER block between HERO and MANIFESTO). CSS and HTML sections correspond when paired — when editing a section, touch both.
- Grep for the section name (e.g. `==== PROCESS`) to jump to either block.

### Design tokens

Colors and hairlines are CSS custom properties on `:root` at the top of the `<style>` block (`--red`, `--red-bright`, `--red-deep`, `--black`, `--ink`, `--smoke`, `--bone`, `--paper`, `--chrome`, `--hairline`, `--hairline-dark`). Use these — do not introduce new color literals. The body background is `--black` and foreground is `--bone`; sections on paper/bone backgrounds invert.

Fonts are loaded from Google Fonts in `<head>`: Anton (display), Instrument Serif (editorial italic), Archivo (body, weights 400–900), JetBrains Mono (meta/labels). Body defaults to Archivo — other families are applied per-element.

### Scroll behavior

A small `<script>` block at the bottom handles three things only:

1. **Nav background on scroll** — toggles `.scrolled` on `#nav` past 40px.
2. **Reveal-on-scroll** — an `IntersectionObserver` watches every `.reveal` element and adds `.in` when it enters the viewport (threshold 0.12, `-60px` bottom margin). The `.reveal` → `.in` transition is defined in the REVEAL ANIMATIONS CSS section. To animate a new element, give it `class="reveal"` and matching CSS.
3. **Hero entrance** — staggers `.in` onto `.hero .reveal` elements on `load`.

Keep JS minimal — this site has no framework and no interactive state beyond scroll.

### Responsive

Responsive rules are consolidated in the final `==== RESPONSIVE ====` CSS block, not scattered per-section. When adjusting mobile layout, edit there.

### Assets

`assets/` holds:
- Branding — `favicon.svg` (the actual favicon), `logo.png` (nav + footer), `logo-black.svg` (splash screen).
- Hero — `tuka-heroVIDHIGH.mp4` is the live hero (autoplay/muted/loop `<video>`). `tuka-hero.gif/webp` and the other `tuka-heroVID*` variants are alternate/backup exports left in the repo; don't reference them without pruning the unused ones.
- Photography — `portrait*.jpg`, `perched.jpg`, `standing.jpg`, `bike.jpg`, `car.jpg`, and `snow*.png`. The `snow*.png` files are 7–9 MB each — prefer JPG for any new photography.

## Design direction

From the README: "Editorial magazine luxury. Richard Mille / Off-White editorial confidence, not quiet luxury." Massive display type, heavy weights, tight tracking on uppercase labels, red as punctuation on black/bone. Preserve this tone when adding copy or sections.
