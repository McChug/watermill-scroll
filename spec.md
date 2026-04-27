# Watermill Scroll — Implementation Spec

## Overview

The Watermill Scroll is a bespoke, physics-driven scroll widget that replaces native browser scrolling with an interactive watermill mechanic. A draggable hose hangs from the top of a fixed right-side column. When the user clicks and holds the hose nozzle, water streams out with arcing, gravity-affected particle physics. The water strikes a watermill wheel at the bottom of the column, spinning it and driving page scroll — direction and speed determined by which side of the wheel is hit and how far down the nozzle has been dragged.

---

## Recommended Tech Stack

### Rendering: Single `<canvas>` element (2D API)

For a 2D semi-realistic water effect, a plain Canvas 2D context is the right call. It handles hundreds of particles at 60fps without the overhead of WebGL setup, and gives direct control over drawing the hose rope, water droplets, splash particles, and the mill wheel — all in one render loop. No WebGL or Three.js is needed here; that would be over-engineering for a 2D sidebar widget.

### Physics Library: **Matter.js**

Matter.js is the sweet spot for this project. It provides:

- **Rope/chain simulation** via `Matter.Constraint` chains — ideal for the hanging hose with realistic droop and swing.
- **Particle bodies** with gravity, velocity, and collision detection — needed for water arcing and hitting the mill/walls.
- **Composite bodies** for the mill wheel paddles.

It is lightweight (~90KB), well-documented, and has no build toolchain requirements — can be loaded from a CDN in a plain HTML file or imported as an ESM module in a framework.

**Alternative considered:** `planck.js` (Box2D port) is more accurate but significantly more complex to set up. Ruled out in favor of simplicity.

### Hose Rendering: Matter.js Constraint Chain + Canvas 2D

The hose is rendered as a series of small linked rigid bodies (a "verlet chain") using Matter.js constraints. Each link is drawn as a thick curved line segment on the canvas. The nozzle tip (last link) follows the cursor position when held. The attachment point (first link) is fixed just above the top of the viewport.

### No Framework Required

This widget should be delivered as a **self-contained vanilla JS class** (`WatermillScroll`) that can be instantiated on any page. For the demo site, a plain HTML/CSS page is recommended — no React or Vue needed. This keeps it genuinely drop-in.

---

## Layout & Structure

### Desktop Layout (>= 640px wide)

```
┌──────────────────────────────────────┬──────────┐
│                                      │          │
│         PAGE CONTENT                 │  COLUMN  │
│    (articles, sections, etc.)        │ (fixed,  │
│                                      │ ~80px    │
│                                      │  wide)   │
│                                      │          │
│                                      │  [hose]  │
│                                      │          │
│                                      │ [mill──] │
└──────────────────────────────────────┴──────────┘
```

- The **right column** is a fixed-position element, full viewport height, ~80px wide (configurable).
- It contains a single `<canvas>` element that fills the column.
- The **page content** has `margin-right: 80px` to avoid overlap.
- Native scroll is **disabled** (`overflow: hidden` on `<body>`). The widget drives `window.scrollY` manually via `window.scrollTo()`.

### Small Screen Layout (< 640px wide)

At small breakpoints, the column is **removed from the sidebar** and instead rendered as an **overlay in the bottom-left corner** of the viewport:

- The column becomes `position: fixed; bottom: 0; right: 0; width: 60px; height: 40vh; z-index: 100`.
- The canvas is semi-transparent (`opacity: 0.85`) so it floats over content without fully obscuring it.
- Page content has no right margin — it uses the full width.
- The hose attachment point shifts to the top of this smaller floating canvas.
- The "use the watermill" hint overlay still works the same way (see below).
- The breakpoint is implemented as a CSS **container query** on the `<body>` or a named layout container, with a JS resize observer kept in sync to reconfigure the Matter.js world dimensions.

---

## Component Breakdown

### 1. The Column Canvas

- A `<div id="watermill-column">` with `position: fixed; right: 0; top: 0; height: 100vh; width: var(--wm-column-width, 80px)`.
- Inside it, one `<canvas>` sized to match the div.
- On resize, the canvas and Matter.js world are re-initialized.

### 2. The Hose

**Attachment point:** Fixed at `(columnCenterX, -20px)` — just above the visible viewport top. This creates the appearance of the hose entering from off-screen.

**Chain construction:**

- ~14–18 Matter.js small circular bodies linked by `Matter.Constraint` with low stiffness (~0.05) and some damping (~0.1).
- The first body is pinned (static) at the attachment point.
- The last body (nozzle) is the interactive endpoint — its position is overridden to follow `cursor.x, cursor.y` while the user holds it.

**Default hang:** With no interaction, the chain hangs straight down due to gravity, reaching approximately 15–20% of the viewport height from the top.

**Rendering:**

- Draw a thick rounded-cap `lineTo` path through all chain link positions, with a slight green/rubber color.
- Draw a small nozzle cap shape at the last link.
- Use `quadraticCurveTo` between links for a smooth rope appearance rather than straight segments.

**Dragging:**

- `mousedown` / `touchstart` within ~20px of the nozzle tip begins drag mode.
- While dragging, the nozzle body's position is set to the pointer position each frame.
- `mouseup` / `touchend` releases it; the chain falls/swings naturally back via physics.

### 3. Water Particles

**Emission:**

- Water only emits when the user is **actively holding** (mousedown on nozzle).
- Emit rate: proportional to `nozzleY / columnHeight` — the further down the nozzle, the more particles per frame (range: 1–6 particles/frame).
- Each particle spawns at the nozzle tip with an initial velocity vector based on the nozzle's angle (derived from the last two chain link positions).

**Physics behavior:**

- Each particle is a small Matter.js circular body (~3px radius) with:
  - `frictionAir: 0.01` (slight drag)
  - `restitution: 0.2` (mild bounce)
  - Gravity applied globally by Matter.js engine.
- Particles collide with:
  - The **left wall** of the column (x = 0)
  - The **right wall** of the column (x = columnWidth)
  - The **mill wheel paddles** (see below)
  - The **ground** (bottom of canvas, y = canvasHeight)

**Lifespan:**

- Particles are destroyed after 3 seconds or when they come to rest at the bottom.
- To manage performance, cap active particles at ~300. If over cap, destroy oldest.

**Rendering:**

- Draw each particle as a small filled circle (`#5aabff` or similar water blue) with ~0.8 opacity.
- On splash collision (velocity above threshold), spawn 3–5 short-lived "splash" particles that arc outward and fade over 300ms.

### 4. The Watermill Wheel

**Geometry:**

- Only the **top half** of the wheel is visible — it rises from the very bottom of the canvas like a mill submerged in a river.
- The wheel is centered at `(columnCenterX, canvasHeight)` — its center is at the bottom edge.
- Radius: `columnWidth / 2 - 4px` (nearly fills the column width).
- **4–6 paddles** extending radially from the hub, like a classic paddlewheel.

**Construction in Matter.js:**

- The wheel hub is a static `Matter.Body` circle at the center point (pinned, doesn't move laterally).
- The wheel has a `Matter.Body` composite representing the paddle arms, constrained to rotate around the hub using a revolute constraint (or simulated via angular velocity).
- Alternatively (simpler): Track the wheel's `angle` manually, apply angular impulse when particles hit paddle bodies, apply angular damping each frame.

**Collision detection:**

- When a water particle contacts a paddle, determine which side of the wheel's vertical center axis the contact occurred on:
  - **Right side hit (x > columnCenterX):** Apply positive angular velocity → clockwise rotation → scroll down.
  - **Left side hit (x < columnCenterX):** Apply negative angular velocity → counter-clockwise rotation → scroll up.
- Each hit applies a small angular impulse proportional to the particle's velocity magnitude.

**Rendering:**

- Draw the hub as a filled circle.
- Draw each paddle as a rounded rectangle rotated by the current wheel angle.
- Use a `clipRect` to only render the top half (above `canvasHeight`).
- Color: warm wood tones (`#8B5E3C`, `#6B3F1F`) with a darker hub.

### 5. Scroll Driving

- Each frame, read the wheel's current `angularVelocity`.
- Map it to a scroll delta: `scrollDelta = angularVelocity * scrollSensitivity` (configurable constant, default ~8).
- Apply: `window.scrollBy({ top: scrollDelta, behavior: 'instant' })`.
- Clamp scrollDelta to a max of ~40px/frame to prevent runaway scroll.
- Angular velocity naturally decays via damping (~0.95 multiplier per frame) when no water is hitting — scroll gracefully eases to a stop.

### 6. "Use the Watermill" Hint Overlay

- A `<div id="wm-hint">` positioned absolutely over the page content (not the column), centered in the viewport.
- Contains an illustration or icon of the hose + mill with text: _"Drag the hose to scroll"_ or similar.
- **Appears** when the user attempts native scroll (wheel event, touch swipe, keyboard arrow/page keys) while watermill scroll is active.
- Fades in over 300ms, stays visible for 2 seconds, fades out over 500ms.
- CSS: `opacity: 0; transition: opacity 300ms; pointer-events: none`. JS adds/removes an `.visible` class.
- On mobile small-screen layout, the hint is adjusted to point at the floating overlay column position in the bottom-right corner.

---

## Interaction State Machine

```
IDLE
  └─ mousedown near nozzle → HOLDING
  └─ wheel/swipe/arrow key → show hint overlay

HOLDING
  ├─ each frame: emit water particles
  ├─ each frame: nozzle follows cursor
  ├─ each frame: water hits mill → spin → scroll
  └─ mouseup / touchend → RELEASING

RELEASING
  ├─ stop emitting particles
  ├─ hose swings back to rest via physics
  ├─ existing particles continue simulating
  ├─ wheel decelerates via angular damping
  └─ wheel stops → IDLE
```

---

## Nozzle Drag & Hose Physics — Key Details

- The hose attachment is fixed at `y = -20` (just above viewport). The nozzle can be dragged **anywhere within the column bounds**.
- Nozzle `y` position determines both:
  - **Water emission rate** (further down = more flow)
  - **Scroll speed** (further down = faster, because more water hits the mill harder)
- The nozzle **cannot be dragged outside the column's x bounds** — clamp `cursor.x` to `[8, columnWidth - 8]`.
- The nozzle **cannot be dragged above the attachment point** — clamp `cursor.y` to `[0, canvasHeight - millRadius - 10]`.
- The chain links between attachment and nozzle will naturally form a curve/arc based on physics — no manual catenary math required.

---

## Performance Considerations

| Concern                                             | Mitigation                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Too many particles                                  | Hard cap at 300; destroy oldest on overflow                                                                                                      |
| Matter.js running full rigid body sim for particles | Use lightweight `Bodies.circle` with minimal collision categories; disable particle-particle collisions (only particle-wall and particle-paddle) |
| Render loop overhead                                | Use `requestAnimationFrame`; clear only dirty regions or full clear (full clear is fine at 80px wide)                                            |
| Resize jank                                         | Debounce resize handler 150ms; re-init world on stable size                                                                                      |
| Mobile battery                                      | Pause engine when tab is hidden (`visibilitychange`); reduce emission rate on small screens                                                      |

---

## Configuration API

The widget should expose a config object at instantiation:

```js
new WatermillScroll({
  columnWidth: 80, // px, sidebar width on desktop
  smallScreenBreakpoint: 640, // px, switches to overlay mode
  scrollSensitivity: 8, // multiplier: angular velocity → scroll px
  maxParticles: 300,
  maxScrollDeltaPerFrame: 40,
  wheelPaddleCount: 5,
  angularDamping: 0.95, // per-frame velocity decay
  waterColor: "#5aabff",
  woodColor: "#8B5E3C",
  hoseColor: "#4a7c4e",
  hintText: "Drag the hose to scroll",
});
```

---

## Demo Site Structure

The demo page should have enough content to make scrolling meaningful:

- Fixed `<header>` with the site title (left of the column).
- 5–8 `<section>` blocks with article-length dummy content, images, and varying layouts.
- Content starts at `margin-right: var(--wm-column-width)` on desktop.
- A subtle visual indicator (e.g., a thin line or shadow) separates the column from the content.
- The page uses a nature/mechanical aesthetic to complement the watermill theme — warm paper tones, serif body font, industrial accent details.

---

## Art & Visual Design

All visual elements are rendered via Canvas 2D primitives — no external image assets are required except the hint overlay SVG. Each element below is described geometrically so the coding agent can implement it directly.

### Column Background

The column background should evoke a mossy stone channel or millrace. Fill it with a dark desaturated green-grey (`#2a3328`). Add a subtle vertical gradient overlaid on top: slightly lighter at the top (`rgba(255,255,255,0.04)`) fading to fully transparent at the bottom, giving a faint sense of depth. A single 1px right border in `#1a2018` separates it from the page content.

### The Hose

Draw the hose as a continuous thick stroke (~8px line width) through the chain link positions using `quadraticCurveTo` for smoothness. Color: a dark matte rubber green (`#3d5c3a`) with a 2px lighter highlight stroke (`#5a8a55`) drawn offset by 2px to the left to simulate a rounded tube catching light. Cap both ends with `lineCap: 'round'`. The nozzle tip is a distinct shape: a short tapered trapezoid (wider at the hose end, narrower at the outlet) in dark gunmetal (`#2e2e2e`), with a 1px brass-colored (`#b5922a`) ring at the joint where it meets the hose.

### Water Particles

Individual particles are small filled circles (~3px radius) in a mid-range water blue (`#5aabff`) at 0.8 opacity. When multiple particles are close together they should visually blend — achieve this by drawing each with `globalCompositeOperation: 'lighter'` at lower opacity (`0.35`) so dense streams appear brighter and more luminous. Splash particles on collision are the same color but drawn at 0.5 opacity and shrink from 3px to 0px over their 300ms lifespan.

### The Watermill Wheel

The wheel is the most detailed element. Construct it from the following layers drawn in order:

**Hub:** A filled circle of radius ~10px in dark iron (`#1c1c1c`), centered at `(columnCenterX, canvasHeight)`. Inside it, a smaller circle of radius ~5px in aged brass (`#8a6e2a`) representing the axle cap.

**Spokes:** 5 thin lines (`lineWidth: 2`, color `#5c3a1e`) radiating from hub center to where each paddle begins, giving the impression of a structural wheel frame.

**Paddles:** Each paddle is a rounded rectangle (~14px wide, ~22px tall) positioned at the end of each spoke. Fill with a base wood tone (`#8B5E3C`). Add a highlight on the top edge (`rgba(255,255,255,0.15)`, 1px) and a shadow on the bottom edge (`rgba(0,0,0,0.3)`, 1px) to give a slight 3D plank appearance. A vertical grain line down the center of each paddle in `rgba(0,0,0,0.1)` completes the wood illusion.

**Clip:** Apply a `clipRect` for `y < canvasHeight` so only the top half of the wheel is visible, as though the bottom is submerged.

**Water line:** Draw a horizontal line at `y = canvasHeight` in `#3a7abf` at 60% opacity with a 2px stroke, suggesting the water surface the mill sits in.

### Column Idle State

When no water is flowing, add a very subtle ambient drip: every 4–8 seconds (randomized), emit a single particle from a random x position near the top of the canvas with a slow downward velocity. This keeps the column feeling alive without being distracting.

### Hint Overlay

The hint overlay is rendered as an inline SVG injected into the DOM (no external file needed — remove `hint-overlay.svg` from the file structure). It should contain:

- A simple line-art illustration of a hand gripping a hose nozzle, drawn in a single stroke color (`#3d3d3d`) on a rounded rectangle card with a warm parchment background (`#f5f0e8`) and a subtle drop shadow.
- Below the illustration, the text **"Drag the hose to scroll"** in a serif font at ~14px, color `#3d3d3d`.
- A small arrow or chevron pointing rightward toward the column.
- The card should be ~200px wide × ~120px tall, centered in the content area (not overlapping the column), with `border-radius: 12px` and `box-shadow: 0 4px 24px rgba(0,0,0,0.18)`.

---

## File Structure

```
watermill-scroll/
├── index.html               # Demo site
├── style.css                # Demo site styles + column layout + media queries
└── WatermillScroll.js       # Self-contained widget class
```

`WatermillScroll.js` has zero dependencies beyond Matter.js (loaded from CDN or bundled).

---

## Known Hard Parts & Recommended Approach

### Hose rope realism

Use a Matter.js constraint chain with **low stiffness and moderate damping**. Too-high stiffness makes it feel like a rigid stick; too-low makes it rubbery and slow. Tune `stiffness: 0.04–0.08` and `damping: 0.08–0.12`. The key insight is that the nozzle position is **overridden by cursor input** each frame, not physics-driven — the physics only governs the intermediate links. This hybrid approach gives natural droop without fighting the engine.

### Water hitting the mill correctly

Don't rely purely on Matter.js collision events for mill driving — they can fire inconsistently at high particle counts. Instead, each frame, sweep active particles and check: is this particle within the mill's bounding arc and within 1 frame's distance of a paddle? If so, apply the impulse and mark the particle as "splashed." This deterministic sweep is more reliable than event callbacks at scale.

### Scroll direction from mill side

After computing the contact point of a particle on the wheel, compare `contactX` to `wheelCenterX`. This is simpler and more robust than trying to infer it from angular torque direction.
