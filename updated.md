# CyberSense — Performance Problem Plan

## Problem 1: Slow / Delayed Hover Animations

### Root Cause

The primary culprit is `backdrop-filter: blur()` used on almost every glass panel in the app (sidebar, main-content, glass-card, module-card, awareness-card, feature-card, etc.). When any property changes on hover — background, border-color, box-shadow, transform — the browser must:

1. Isolate the element into its own compositor layer
2. Sample all pixels rendered behind it
3. Apply the Gaussian blur kernel to those pixels
4. Re-composite the result into the page

This is an expensive GPU pipeline step. If the element is **not already promoted to its own layer before the hover starts**, the browser creates that layer on the fly the moment your cursor enters, causing a visible stutter/delay before the CSS `transition` kicks in.

Secondary contributors:
- Transitioning `box-shadow` on hover (`.module-card`, `.learning-card`, `.btn-hero-primary`, etc.) triggers full repaints rather than cheap GPU compositing.
- The WebGL ShaderBackground (`ShaderBackground.tsx`) runs a full-screen simplex-noise fragment shader at 60 fps, continuously consuming GPU resources on the landing page and leaving less headroom for CSS transitions.
- Multiple simultaneous CSS animations running at page load (`gridMove`, `pulsate`, `spinRing`, `badgePulse`) compete for GPU compositor budget.

### Fix Plan

**Fix 1A — Pre-promote glass panels to compositing layers (globals.css)**

Add `will-change: transform` (or `transform: translateZ(0)` as fallback) to every element that uses `backdrop-filter`. This tells the browser to allocate the compositor layer *before* any hover happens, so the layer already exists when the transition fires — zero delay.

Target selectors:
- `.sidebar`, `.main-content`, `.login-container`, `.settings-form-container`
- `.glass-card`, `.module-card`, `.learning-card`
- `.achievement-popup`

**Fix 1B — Remove box-shadow from hover transitions (globals.css + landing.css)**

`box-shadow` is not GPU-composited. Replace hover box-shadow changes with `filter: drop-shadow()` (which is) or just remove the shadow transition and keep only `transform` + `opacity` on hover. These two properties are the only ones the browser can animate without triggering layout or paint.

Affected rules:
- `.module-card:hover` / `.learning-card:hover` — drop the `box-shadow` from the transition property list.
- `.btn-hero-primary:hover`, `.btn-cta-primary:hover` — same treatment.
- `.badge-card` hover — currently only transitions `transform` and `box-shadow`; remove `box-shadow`.

**Fix 1C — Reduce backdrop-filter blur radius on inner cards (globals.css)**

`.glass-card`, `.module-card`, `.learning-card` use `backdrop-filter: blur(8px)`. Reducing to `blur(4px)` on these smaller cards cuts the blur workload by ~75% while remaining visually indistinguishable on dark backgrounds. The main panels (sidebar, main-content) keep `blur(12px)`.

---

## Problem 2: General System Optimization

### Root Cause Analysis

**2A — ShaderBackground runs at full resolution, every frame, even when hidden**

`ShaderBackground.tsx` calls `requestAnimationFrame` unconditionally in a tight loop. On a 1920×1080 display this means running a Simplex-noise fragment shader over ~2 million pixels at 60 fps — even when the user has switched tabs or scrolled away. This drains battery and blocks GPU resources needed by CSS transitions.

**2B — No Page Visibility API pause on ShaderBackground**

When the tab is backgrounded the animation loop continues burning GPU. Standard practice is to pause `requestAnimationFrame` loops when `document.visibilityState === 'hidden'`.

**2C — No canvas resolution scaling on ShaderBackground**

The canvas renders at device pixel ratio (effectively 1:1 screen pixels). Rendering at 50% resolution (half width/height) then letting CSS scale it up is visually imperceptible for a blurry noise background, but cuts fragment shader work to 25% of the current cost.

**2D — Inline styles on dynamic elements cause repeated style recalculation**

`HomeClient.tsx` and the game pages set many styles via JavaScript inline `style` objects (e.g., `style={{ border: \`1px solid \${isExpanded ? color : 'var(--glass-border)'}\` }}`). Inline styles bypass the CSSOM cache and trigger style recalculation on every render.

**2E — Simultaneous background CSS animations**

`gridMove` (body::before), `pulsate` (glow-text, badge-dot), `badgePulse`, and `spinRing` (loading rings) all run simultaneously. While each is individually GPU-composited, having 6–8 concurrent animation timelines stresses the compositor thread, especially on mid-range hardware.

**2F — Font Awesome loaded for entire icon library**

`all.min.css` (~34 kB gzipped, ~400 kB uncompressed) loads every Font Awesome icon even though the app uses only ~15 icons. This delays first contentful paint on slow connections.

### Fix Plan

**Fix 2A+2B — Throttle ShaderBackground to 30 fps and pause when hidden (ShaderBackground.tsx)**

- Add a `document.visibilitychange` listener that cancels the animation frame loop when hidden and resumes when visible again.
- Throttle from 60 fps to 30 fps by skipping every other frame using a timestamp delta check (`if (now - lastFrame < 33) { id = requestAnimationFrame(draw); return }`). The slow noise animation is imperceptible at 30 fps.

**Fix 2C — Render ShaderBackground canvas at 50% resolution (ShaderBackground.tsx)**

In the `resize()` function, set `canvas.width = window.innerWidth * 0.5` and `canvas.height = window.innerHeight * 0.5`, then add CSS `image-rendering: auto` — the canvas is already being CSS-stretched to 100% width/height, so the GPU will upscale smoothly.

**Fix 2D — Move dynamic class-based styles to CSS classes (HomeClient.tsx + game pages)**

Replace inline `style={{ border: \`1px solid \${color}\` }}` patterns with CSS custom property assignments (`style={{ '--card-color': color }}`) and reference `var(--card-color)` in a CSS rule. This allows the CSSOM to cache the rule and only update one property.

**Fix 2E — Respect prefers-reduced-motion (globals.css)**

Add a `@media (prefers-reduced-motion: reduce)` block that disables or greatly slows `gridMove`, `pulsate`, and `badgePulse`. This also improves accessibility and reduces background compositor load on users who have this OS preference set.

**Fix 2F — Subset Font Awesome to only used icons (layout.tsx)**

Replace `all.min.css` with individual icon SVGs or use Font Awesome's subset/kit URL limited to the ~15 icons actually used. Alternatively switch to loading only the `solid` and `regular` style files (`fa-solid-900.woff2` is ~72 kB vs the full set) by importing only `solid.min.css` + `regular.min.css` instead of `all.min.css`.

---

## Priority Order

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Fix 1A — Pre-promote glass panels (`will-change: transform`) | High — directly fixes hover delay | Low |
| 2 | Fix 1B — Remove `box-shadow` from transition properties | High — eliminates repaint on hover | Low |
| 3 | Fix 2A+2B — Throttle + pause ShaderBackground | High — frees GPU on landing page | Low |
| 4 | Fix 2C — Render ShaderBackground at 50% resolution | Medium — cuts fragment shader cost 75% | Low |
| 5 | Fix 1C — Reduce blur radius on inner cards | Medium — less blur work per hover | Low |
| 6 | Fix 2E — `prefers-reduced-motion` media query | Medium — accessibility + perf | Low |
| 7 | Fix 2D — CSS custom properties for dynamic colors | Low-medium — reduces style recalc | Medium |
| 8 | Fix 2F — Subset Font Awesome | Low-medium — faster initial load | Medium |

---

## Files to Edit

- `app/globals.css` — Fixes 1A, 1B, 1C, 2E
- `app/landing.css` — Fixes 1B (landing page buttons)
- `components/landing/ShaderBackground.tsx` — Fixes 2A, 2B, 2C
- `app/layout.tsx` — Fix 2F (Font Awesome subset)
- `app/user/home/HomeClient.tsx` — Fix 2D (inline style cleanup)
