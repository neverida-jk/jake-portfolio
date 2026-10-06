# ASCENT — Master Technical Plan for jake-portfolio

> ## Concept change (2026-10): mountains → TIME & PHILOSOPHIES ("Chronos")
> The climb/summit/altitude concept below is **superseded**. Everything structural in this doc
> (sections, Dual voice, perf/a11y contract, one-file project data, no mode toggles, no clutter)
> still holds; only the metaphor changed. What replaced it:
> - **Motif:** the dial. Roman-numeral clock face, hairline ticks, hands driven by live Manila time
>   (UTC+8). Scrolling spins the hands (velocity warp); they swing back to real time when you stop.
> - **Spine:** Now (hero) → Then (journey) → Shipped (work) → Toolkit → (What people say) → Beyond → Next (contact).
> - **Time and philosophy are the theme (design, motion, voice), never content.** No philosopher names,
>   no philosophy section, no per-idea artwork. The old "How I Work" section is gone (it repeated the
>   Toolkit; a "Bugs I've found" defect log was tried and rejected because non-technical visitors don't
>   care). A "What people say" section exists but stays hidden until src/content/copy/testimonials.ts holds
>   real quotes from real people who agreed to be quoted. Never write or invent one.
> - **Voice:** write as someone who does the whole lifecycle. Do not announce "I'm an engineer" or
>   "I'm a QA"; the voice carries it.
> - **Copy rule:** direct and concise; one read should be enough, for technical and non-technical visitors
>   alike. Plain line first, one short mono note beneath. No placeholder text on the live site.
> - **Gone:** hiker, altitude readout, elevation badges, contour map, sunrise sky. Mountain climbing stays
>   as a *hobby fact* (Beyond the Resume, Tropa), not as the site's metaphor.
> - Token names (`summit`, `canvas`, …) were kept to avoid churn; `summit` gold now reads as "the hand".
> Old sections below still describe layout/phases accurately; read "climb/altitude" as "time/dial".

> **For the executing model.** This is a complete redesign spec. Read §0 → §3 before writing any code.
> Work in phases (§11). Every phase has acceptance criteria — do not advance until they pass.
> The current site is competent but generic. The goal is *memorable*. Ship craft, not features.

**Repo:** `C:\Users\jneverida\Projects\jake-port` · GitHub `neverida-jk/jake-portfolio` · branch `main`
**Stack:** Next.js 15.3.8 (App Router) · React 19 · Tailwind CSS v4 · framer-motion 12.9 · react-icons · TypeScript
**No new dependencies** unless §12 explicitly authorizes one.

---

## 0. Read this first

### 0.1 Non-negotiable constraints
1. **Never fabricate biography.** Only use the verified facts in §9.1. If you need a fact that isn't there, write a `TODO(jake):` placeholder — do not invent one.
2. **No clutter.** The owner has explicitly rejected earlier work for being "too many things happening, not easily understandable." Rule: **one loud element per viewport.** Every interactive affordance must be self-evident or labeled. Ambient motion stays under the threshold of conscious notice.
3. **It must work for a non-technical visitor.** A recruiter's HR partner, a client's founder, Jake's mom. If a section only lands for engineers, it's broken.
4. **It must impress a senior engineer.** Craft visible in the details: physics, timing, accessibility, performance, real data.
5. **Progressive enhancement.** With JS motion disabled, the site is still a complete, beautiful, readable document.
6. **Keep what works.** "Beyond the Resume" (the terminal with per-topic layers) is owner-approved. Restyle it to the new identity; do not remove it.

### 0.2 The bar
This should survive an Awwwards/Godly submission on: concept clarity, motion craft, typography, performance. If a decision doesn't serve one of those four, cut it.

---

## 1. The Big Idea

### 1.1 Concept: **The Ascent**

Jake climbs mountains — Pulag, Apo, Ulap, Batulao — and built an app (Tropa) to coordinate climbs. He also climbed from a 2022 freshman to a QA Analyst in 2026. The portfolio becomes that climb.

**Scrolling the page is ascending a mountain from pre-dawn to sunrise.**

- The page background is a **live sky** that shifts with scroll progress: deep pre-dawn blue → alpenglow violet → sunrise gold. The sun physically rises behind the ridgeline as you scroll.
- A fixed **altimeter rail** tracks progress in metres, mapped to **2,954 m — the real summit elevation of Mt. Apo**, the highest point in the Philippines. Section boundaries are waypoints.
- The visual motif throughout is **topographic contour lines** — in backgrounds, dividers, card textures, and data visualisation.
- The contact section is the **summit**: the sun crests, gold light floods the section, and the CTA lands.

### 1.2 Why this works for both audiences
| Audience | What they feel | What they see |
|---|---|---|
| Non-technical | An emotional, cinematic story with an obvious metaphor. "This person is interesting and I understood everything." | Sunrise, mountains, plain-language copy, smooth delightful motion |
| Technical | Obsessive craft and real engineering. "This person can actually build." | Scroll-linked colour interpolation at 60fps, spring physics, shared-element transitions, live GitHub data, a self-testing QA HUD, perfect a11y |

### 1.3 The differentiator: **Two voices, no switch**
> **Revised by the owner:** the tech/non-tech split must be intuitive — *"not like a button to toggle."* There is no mode and no toggle anywhere.

Every explanatory sentence carries two voices at once, separated by **hierarchy** instead of a switch. The **plain** voice is the primary text — large, first, what everyone reads. The **technical** voice sits beneath it as a small mono **field note**, like a margin annotation in a trail guide. Non-technical visitors read the story and skim past the notes; engineers' eyes go straight to them. Nobody has to decide what kind of visitor they are. See §5.2.

---

## 2. Current State Audit

### 2.1 Keep (restyle to new identity)
| File | Verdict |
|---|---|
| `sections/TechnicalExpertiseSection.tsx` | **Keep the mechanic.** Terminal + per-topic layers is owner-approved. Rename file to `BeyondResumeSection.tsx`. Convert layers to bottom sheets on mobile (§7.7). |
| `sections/MyWorksSection.tsx` | Keep carousel logic; rebuild as **Expedition case studies** (§6.3). The auto-advance + clone-loop logic is good — preserve it. |
| `ui/CommandPalette.tsx` | Keep, upgrade to a real command brain (§7.6). |
| `ui/TerminalSandbox.tsx` | Keep. Restyle. Add `sudo hire me` easter egg. |
| `util/sound.ts` | Keep, extend (§5.4). **Change default to muted.** |
| `util/confetti.ts` | Keep but demote — confetti only for the Konami easter egg, not the summit (§7.5 uses a classier moment). |
| `layout/Navbar.tsx` | Keep the floating dock + `layoutId` active pill. (No lens toggle — see §1.3.) |

### 2.2 Delete outright
| File | Why |
|---|---|
| `ui/Particles.tsx` | Generic floating-dot background. Every AI-built portfolio has it. The sky + contours replace it. |
| `ui/HiveSkills.tsx`, `ui/ScrollingSkills.tsx`, `ui/SkillsComponent.tsx`, `ui/SkillCard.tsx` | Logo-soup skill displays. Replaced by the Toolkit (§6.4). Verify usage with grep before deleting. |
| `ui/ProjectsCard.tsx` | Superseded by the Expedition card. Unused hardcoded font sizes, `any` types. |
| `ui/HorizontalLine.tsx`, `ui/VerticalLine.tsx`, `ui/LandingButton.tsx`, `ui/NavigationButton.tsx`, `ui/ProfilePicture.tsx`, `ui/ContactButtons.tsx` | Check usage; delete any that are unreferenced. Most are dead. |
| `sections/Experiences.tsx` | Verify it's unreferenced (AboutMe doesn't import it). Delete. |

> Run `grep -rn "ComponentName" src/` before every deletion. Delete in Phase 0 so you're not maintaining dead code through the rebuild.

### 2.3 Fix
- `ui/LandingName.tsx` — the typewriter. Keep, but extract speed/cursor into props and respect `prefers-reduced-motion` (render final string immediately).
- `globals.css` — currently a pile of ad-hoc keyframes. Rebuild around the token system (§3).
- Sound is **on by default**. Hostile. Default muted; offer an elegant "sound on" invite once.

---

## 3. Design System

Everything here goes in `src/app/globals.css` under `@theme` plus a `src/lib/motion.ts` for JS-side tokens.

### 3.1 Palette — the scroll-linked sky

The base UI palette is cool and near-neutral; **gold is reserved for the summit and primary action only**. Scarcity is what makes it feel expensive.

```css
@theme {
  /* Surfaces — blue-cast, not neutral zinc. This alone de-genericises the site. */
  --color-void:      #04060C;
  --color-base:      #070B14;
  --color-surface:   #0C1220;
  --color-raised:    #121A2B;
  --color-line:      #1C2637;

  /* Text */
  --color-ink:       #E9EEF7;
  --color-ink-2:     #9FAEC4;
  --color-ink-3:     #61718B;

  /* Accents */
  --color-summit:    #FFB454;   /* sunrise gold — primary action, summit only */
  --color-summit-dt: #FFD9A0;
  --color-alpine:    #7DD3FC;   /* sky blue — links, technical lens */
  --color-moss:      #5EEAD4;   /* teal — success, live indicators */
  --color-alert:     #FB7185;
}
```

**Sky keyframes** (interpolated by scroll progress, §5.1):

| Progress | Top | Bottom | Mood |
|---|---|---|---|
| 0.00 | `#04060C` | `#070D1A` | Pre-dawn, base camp |
| 0.35 | `#070F22` | `#0F1C38` | Blue hour |
| 0.62 | `#141230` | `#2E1E3C` | Alpenglow |
| 0.85 | `#241730` | `#5A2F33` | First light |
| 1.00 | `#2A1A28` | `#8A4A28` | Sunrise at summit |

The **sun**: a radial-gradient div, `mix-blend-mode: screen`, `filter: blur(40px)`, that travels `y: 115vh → 38vh` and `opacity: 0 → 0.9` across progress `0.55 → 1.0`. It must sit *behind* the ridgeline SVG so it appears to crest.

### 3.2 Typography

Editorial contrast is the fastest route to "designed, not templated." Pair a **serif display** with **mono technical text**.

```ts
// src/app/layout.tsx
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";

const display = Instrument_Serif({ weight: "400", style: ["normal","italic"], subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans    = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono    = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
```

- **Display (Instrument Serif)** — section titles, the name, pull quotes, big numbers. Use *italic* for emphasis moments; it's gorgeous and rare in dev portfolios.
- **Sans (Geist)** — all body copy.
- **Mono (Geist Mono)** — labels, eyebrows, metrics, altimeter, terminal, data.

Remove Rubik. Three families is the ceiling.

**Fluid scale** (`clamp()` — no breakpoint jumps):
```css
--text-display: clamp(3rem, 11vw, 8.5rem);   /* letter-spacing: -0.04em; line-height: 0.92 */
--text-h1:      clamp(2.25rem, 5.5vw, 4rem); /* -0.03em / 1.02 */
--text-h2:      clamp(1.75rem, 3.5vw, 2.75rem);
--text-h3:      clamp(1.125rem, 1.8vw, 1.5rem);
--text-body:    clamp(0.9375rem, 1.05vw, 1.0625rem); /* 1.65 line-height */
--text-label:   0.6875rem; /* mono, uppercase, 0.14em tracking */
```

Body copy max width **62ch**. Never full-bleed paragraphs.

### 3.3 Motif: topography

Build `src/app/components/system/Contours.tsx` — an SVG generator producing nested, offset closed paths that read as elevation lines.

Usage rules:
- **Hero background:** 4 contour layers, opacity `0.10 → 0.03` back-to-front, each parallaxing at a different rate.
- **Section dividers:** a single contour slice, 1px, `--color-line`, that draws in via `stroke-dashoffset` when scrolled into view.
- **Card texture:** contour SVG at `opacity: 0.035`, masked to the card, revealed to `0.07` on hover.
- **Data viz:** the GitHub activity chart is a *ridgeline*, not a grid (§7.4).
- **Intro:** the loading choreography is a single contour drawing itself (§5.6).

Generate deterministically (seeded, not `Math.random()` at render) so SSR and client match — hydration mismatch here is a real risk.

### 3.4 Motion language

```ts
// src/lib/motion.ts
export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 32, mass: 0.6 },  // taps, buttons, chips
  smooth: { type: "spring", stiffness: 220, damping: 30, mass: 0.9 },  // layout, shared elements
  lazy:   { type: "spring", stiffness: 110, damping: 26, mass: 1.2 },  // parallax, large surfaces
  sheet:  { type: "spring", stiffness: 340, damping: 38 },             // bottom sheets, modals
} as const;

export const ease = {
  out:   [0.16, 1, 0.3, 1],      // reveals — the workhorse
  inOut: [0.65, 0, 0.35, 1],     // state changes
  in:    [0.55, 0, 1, 0.45],     // exits
} as const;

export const dur = { micro: 0.12, sm: 0.22, md: 0.4, reveal: 0.7, cinematic: 1.2 } as const;
export const stagger = { tight: 0.035, normal: 0.055, loose: 0.09 } as const;
```

**Laws:**
1. Nothing animates longer than `cinematic` (1.2s) except ambient loops.
2. Only `transform` and `opacity` animate. Never `width/height/top/left/margin`. Layout animation goes through framer's `layout` prop.
3. Entrances travel **≤ 24px**. Anything further reads as a slideshow.
4. Reveals fire **once** (`viewport={{ once: true, margin: "-12% 0px" }}`). Re-animating on every scroll-by is amateur.
5. Hover = `scale 1.02–1.04` + `y: -2`. Tap = `scale 0.96`. Consistent everywhere.
6. `prefers-reduced-motion: reduce` → opacity-only, duration 0.2s, no parallax, no cursor, no kinetics, no velocity skew. Implement as a `useReducedMotion()` guard in every motion component **and** a CSS fallback.

### 3.5 Depth & glass

Replace the current three glass classes with a single elevation scale:

```css
--e0: transparent;                                      /* flush */
--e1: 0 1px 0 0 rgb(255 255 255 / .04) inset, 0 8px 24px -12px rgb(0 0 0 / .6);
--e2: 0 1px 0 0 rgb(255 255 255 / .06) inset, 0 18px 40px -18px rgb(0 0 0 / .75);
--e3: 0 1px 0 0 rgb(255 255 255 / .08) inset, 0 32px 64px -24px rgb(0 0 0 / .85);
```

Glass (`backdrop-filter`) is used on **exactly two** things: the nav dock and overlay/sheet backdrops. Everywhere else uses solid `--color-surface` with a 1px `--color-line` border. Over-glassing is why the current site reads generic.

---

## 4. Information Architecture

The climb, in order. Nav labels stay plain-language.

| # | Section | id | Nav label | Altitude | Job |
|---|---|---|---|---|---|
| 1 | Base Camp | `hero` | About | 0 m | Who, one line, live status, 2 CTAs |
| 2 | The Route | `journey` | Journey | 620 m | 2022→now as a trail along a ridge |
| 3 | Expeditions | `work` | Work | 1,340 m | 4 case studies, expandable |
| 4 | The Toolkit | `toolkit` | Skills | 1,880 m | Tools grouped by verb, cross-linked to projects |
| 5 | How I Work | `approach` | Approach | 2,310 m | 4 principles, each with a receipt |
| 6 | Beyond the Resume | `beyond` | — | 2,640 m | The terminal (keep) |
| 7 | Summit | `contact` | Contact | 2,954 m | Sunrise, CTA, form |

Section 6 is deliberately absent from the nav — it's a reward for scrolling, surfaced by the command palette and a waypoint on the rail.

---

## 5. Global Systems

Build all of these in Phase 0–1. Everything downstream depends on them.

### 5.1 Ascent scroll engine — `components/system/AscentSky.tsx`

```tsx
"use client";
const { scrollYProgress } = useScroll();
const p = useSpring(scrollYProgress, { stiffness: 58, damping: 22, mass: 0.4 });

const top    = useTransform(p, [0,.35,.62,.85,1], ["#04060C","#070F22","#141230","#241730","#2A1A28"]);
const bottom = useTransform(p, [0,.35,.62,.85,1], ["#070D1A","#0F1C38","#2E1E3C","#5A2F33","#8A4A28"]);
const bg = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;

const sunY = useTransform(p, [0.55, 1], ["115vh", "38vh"]);
const sunO = useTransform(p, [0.55, 0.8, 1], [0, 0.5, 0.9]);
```

Structure (fixed, `inset-0`, `-z-50`, `pointer-events-none`):
1. `motion.div` sky gradient
2. `motion.div` sun — `w-[60vmin] h-[60vmin] rounded-full`, radial gradient `--color-summit → transparent`, `blur(40px)`, `mix-blend-screen`
3. Star layer — ~40 seeded dots, `opacity` fading `1 → 0` across progress `0 → 0.5`
4. Ridgeline SVG — 3 mountain silhouette layers, parallaxed `y` at 0.06 / 0.12 / 0.22 of scroll, filled with `--color-void` → `--color-base`. Sits above the sun so the sun *crests*.

> **Perf:** this is one fixed layer. `will-change: transform` on the sun and ridges only. Do not add `will-change` to the gradient div.
> **Reduced motion:** freeze at a fixed mid-state (progress 0.5) and skip the spring.

### 5.2 Two voices — `components/system/Dual.tsx` *(revised — no toggle)*

Content lives in **`src/content/copy/<section>.ts`** (one file per section, re-exported by `copy/index.ts`), typed as:

```ts
export type Dual = { plain: string; technical: string };
```

`<Dual>` is purely presentational and renders **both** voices:

```tsx
<Dual value={copy.hero.role} />               // plain + field note beneath (default)
<Dual value={copy.work.title} note="none" />  // plain only — headlines, labels, chips
<Dual value={copy.x.spec} note="only" />      // field note alone
```

- **plain** inherits the size/colour of its context.
- **technical** is a field note: mono, ~0.72em, `--color-ink-3`, max 60ch, 1px left rule in `--color-line`. It is a real text node, so screen readers read both.

**Rules:**
- Headlines, labels, chips and CTAs use `note="none"`. A note there is clutter.
- **At most one field note per visual block.** Annotate the sentence where the technical detail genuinely adds something, not every line.
- Richer technical depth lives one interaction deeper: case-study sheets, hotspot popovers, the terminal. It is always there to find, and never in the way.
- Every copy entry still has both variants. Grep for hardcoded prose at the end of each phase.

Projects are **data**: everything about a project (copy, hotspots, tools, screenshot) lives in `src/content/projects.ts`. The owner will swap projects, so no other file may name a project or hardcode a project count.

### 5.3 Altimeter rail — `components/system/Altimeter.tsx`

Fixed, right edge, vertically centred, `hidden lg:flex`. Mobile gets a 2px top progress bar instead.

- Vertical 1px line, `--color-line`; a `--color-summit` fill scaling `scaleY` with progress (`transform-origin: top`).
- One tick per section at its normalised offset. Active tick: dot expands `4px → 9px`, gains a gold ring, `layoutId="altimeterActive"`.
- Live readout above the rail in mono: `1,340 m` — `Math.round(progress * 2954)`, animated with `useSpring` + `useMotionValueEvent`, comma-formatted.
- Hovering a tick shows the section label sliding in from the right (`x: 8 → 0`, opacity).
- Crossing a waypoint fires `soundFx.tick()` (if unmuted) and `navigator.vibrate?.(8)`.
- Clicking a tick smooth-scrolls to that section.
- `aria-hidden="true"` — it's decorative; real navigation is the nav dock.

Active section detection: single `IntersectionObserver` with `rootMargin: "-45% 0px -45% 0px"`, shared via a `useActiveSection()` hook. Do **not** run a scroll listener per section.

### 5.4 Sound — extend `util/sound.ts`

Default **muted**. Add a discreet invite: after the user's first meaningful interaction, a small mono toast — *"this page has sound · enable"* — shown once per session, auto-dismissing in 6s.

Palette (all Web Audio, all ≤ 90ms, gain ≤ 0.06 except summit):
| Event | Sound |
|---|---|
| Hover interactive | 2.4 kHz sine, 18ms, gain 0.015 |
| Tap / commit | 900 Hz triangle, 40ms |
| Waypoint crossed | 1.2 kHz ping, 60ms |
| Layer opens | rising 600→900 Hz, 120ms |
| Summit reached | a soft major triad (C-E-G) 1.4s, gain 0.1, **once per session** |

### 5.5 Cursor — `components/system/Cursor.tsx`

Desktop only (`(pointer: fine)` **and** not reduced-motion). Two elements:
- **Dot:** 5px, `--color-ink`, spring `{stiffness: 900, damping: 40}` — near-instant.
- **Ring:** 30px, 1px border, spring `{stiffness: 180, damping: 22}` — trails.

Behaviour:
- Over `[data-cursor="link"]` → ring scales to 1.9, border → `--color-summit`.
- Over `[data-cursor="magnet"]` → ring **snaps to the element's bounding box** (animate `x/y/width/height/borderRadius` to the rect) — this is the expensive-looking one.
- Over text inputs → hide custom cursor, restore native caret.
- Never `cursor: none` on `body` globally without a fallback; if the component fails to mount, the native cursor must still exist.

### 5.6 Intro choreography — `components/system/Intro.tsx`

Max **2.0s**, first visit per session only (`sessionStorage`), skippable by any key/click/scroll.

| t | Event |
|---|---|
| 0.00s | Void. A single contour path begins drawing (`stroke-dashoffset`, 900ms, `ease.out`) |
| 0.55s | Ridgelines rise (`y: 28 → 0`, opacity, `lazy` spring) |
| 0.85s | Name mask-reveals per character (§8.1), stagger `tight` |
| 1.25s | Role line types in (LandingName, slowed to 55ms/char) |
| 1.55s | CTAs spring in; altimeter rail draws top→bottom |
| 2.00s | Done. Scroll unlocked. |

**LCP protection:** the `<h1>` must be in the DOM from the first paint with `opacity: 0` animating to 1 — never `display:none`, never client-gated. Verify LCP element in Lighthouse is the H1 and lands < 2.0s.

---

## 6. Section Specifications

### 6.1 Base Camp — `sections/HeroSection.tsx`

**Layout:** full-viewport, asymmetric. Left 7 cols: identity. Right 5 cols: the Now panel. Mobile: stacked, Now panel collapses to a single status strip.

**Left column**
- Eyebrow (mono, label size): `BASE CAMP · 14.55°N 121.02°E` — real Makati coordinates. Small, precise, confident.
- `<h1>` **Jake Neverida** at `--text-display`, Instrument Serif, per-char mask reveal.
- Role line — `<Dual value={copy.hero.role} />`, `--text-h3`, `--color-ink-2`, max 48ch.
- Status chip: pulsing `--color-moss` dot + `<Dual value={copy.hero.status} />` + live Manila clock (keep existing logic).
- CTAs: **"See the work"** (gold, magnetic) and **"Copy email"** (ghost, with check-state swap — already built, keep). Both `data-cursor="magnet"`.
- Beneath: 3 proof stats in mono — `1.95 GWA` · `4 shipped products` · `2 mountains above 2,900 m`. Numbers count up on reveal (§8.3). **Verify the mountain claim against §9.1 before using; if unverified, use `4 summits climbed`.**

**Right column — the "Now" panel**
A bordered `--color-surface` card, no glass:
- `NOW` label + local time
- Current focus line (a constant in `copy.ts`, easy for Jake to edit)
- **Latest GitHub activity** — most recent public commit message + repo + relative time, fetched with ISR (§7.4). If the fetch fails, the whole module unmounts silently. Never show a skeleton forever, never show an error.
- GitHub ridgeline sparkline (§7.4)

**Scroll-out:** hero content `y: 0 → -60`, `opacity: 1 → 0`, `scale: 1 → 0.97` over the first viewport (`useScroll` with `offset: ["start start","end start"]`). Ridges move slower. This creates real depth.

**Scroll cue:** a thin vertical line that draws down 24px and resets, infinite, `--color-ink-3`. Disappears after first scroll.

---

### 6.2 The Route — `sections/JourneySection.tsx` *(new)*

The career as a trail. **This is the emotional centrepiece for non-technical visitors.**

**Mechanic:** a sticky section (`h-[320vh]`) where an SVG trail path draws itself as you scroll, with four milestone markers that snap into focus in turn.

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
const pathLength = useTransform(scrollYProgress, [0, 0.85], [0, 1]);
// <motion.path style={{ pathLength }} strokeDasharray handled by framer automatically />
```

- The trail is a hand-authored bezier that climbs left→right and bottom→top across a ridgeline silhouette.
- 4 markers positioned along the path (use `path.getPointAtLength()` at mount to place them precisely — do not hardcode pixel positions; they break responsively).
- As each marker activates: it scales `0.6 → 1` with the `snappy` spring, its card fades/slides in beside it, and the altimeter readout ticks up.
- A small hiker glyph (simple SVG silhouette) rides the path via `offsetPath`/`offsetDistance` bound to scroll progress. **This is the single most delightful moment on the site for a non-technical viewer.**

**Milestones** (facts from §9.1):
| Year | Title | Detail |
|---|---|---|
| 2022 | Started BS Computer Science | University of the Philippines Los Baños |
| 2025 | Software Engineer Intern | Limitless Lab — shipped React/Next.js features on an agile team |
| 2026 | Graduated · Iskolar ng Bayan | BS Computer Science, 1.95 GWA |
| 2026 | QA Analyst | Vertere Global Solutions Inc. |

Each milestone card carries a `<Dual>` description.

**Mobile:** drop the sticky scroll-draw (it fights native scroll). Use a vertical trail with the same path-draw bound to scroll, markers stacked. Same story, simpler mechanic.

**Reduced motion:** render the full path immediately; markers fade in on `whileInView`.

---

### 6.3 Expeditions — `sections/WorkSection.tsx` (from `MyWorksSection.tsx`)

Four real products. This is where technical credibility is won.

**Collapsed card** (preserve the existing carousel/snap/auto-advance logic — it works):
- The browser-chrome mockup is good. Keep it, restyle to the new palette.
- Add an **elevation badge** (mono, gold) giving each project a fake altitude — consistent with the motif, e.g. `quant · 2,410 m`.
- Add live metadata row: stack chips + a `LIVE` dot linking to the real domain.
- `layoutId={`project-${id}`}` on the card container, `layoutId={`project-img-${id}`}` on the thumbnail, `layoutId={`project-title-${id}`}` on the title.

**Expanded case study** (the wow):
- Click → shared-element expansion into a full-screen layer via matching `layoutId`s, `spring.smooth`. Desktop: centred layer, max-w 1000px. Mobile: **bottom sheet with drag-to-dismiss** (§7.7).
- URL updates to `#work/tropa` via `history.replaceState` — shareable, and deep links restore the open state on load. Cheap, and engineers notice.
- Structure, in this order (a case study, not a description):
  1. **The problem** — one sentence, `<Dual>`
  2. **The constraint** — what made it hard
  3. **The artifact** — the real screenshot, large, with **annotated hotspots** (§7.3)
  4. **Decisions** — 2–3 bullets, each `<Dual>`: plain = "why it matters", technical = "how it works"
  5. **Outcome** — what shipped, what it does now
  6. CTA row: `Open live site ↗` · `Next expedition →`
- `Esc` closes. Focus trapped. Focus returns to the originating card. Background scroll locked (`overflow: hidden` on `<body>` + preserve scroll position).

**Projects** (§9.1 for verified copy):
`quant.dev-jk.me` · `tropa.dev-jk.me` · `finance.dev-jk.me` · portfolio v2

---

### 6.4 The Toolkit — `sections/ToolkitSection.tsx`

**Kill the logo grid.** Nobody is impressed by a wall of framework icons.

Group by **verb**, because verbs mean something to non-technical readers:

| Group | Tools | Plain framing |
|---|---|---|
| **Build** | React 19, Next.js 15, TypeScript, Tailwind, Node, MongoDB | "Making the thing exist" |
| **Test** | Test plans, regression suites, defect triage, cross-browser QA, release gating | "Making sure it doesn't break" |
| **Ship** | Git, GitHub Actions, Docker, AWS, Vercel | "Getting it in front of people" |

Each tool is a chip. Each group has a one-line `<Dual>` intro.

**The interaction — cross-highlighting:**
- Hover/focus a tool chip → **every project that used it lifts and glows; the rest dim** (`opacity: 0.32`, `filter: grayscale(0.5)`).
- Hover a project card → **its tools illuminate** in the toolkit.
- Implement with a tiny context: `ToolFocusProvider { focusedTool, focusedProject, set… }`, 60ms debounce on enter, 120ms on leave.
- Requires a `tools: string[]` field on every project and a `projects: string[]` on every tool — one shared registry in `src/content/registry.ts` so the mapping can't drift.

This is the moment where a recruiter *sees* the connection between claimed skills and shipped work. It's honest, it's legible to both audiences, and it's rarely done.

**Reduced motion / touch:** no dimming; use an outline + a count badge (`used in 3 projects`) instead, triggered by tap.

---

### 6.5 How I Work — `sections/ApproachSection.tsx` (from `WhyWorkWithMeSection.tsx`)

Keep the 4-principle tab mechanic — it's solid — but **every principle must carry a receipt**.

| Principle | Receipt (real evidence, not a claim) |
|---|---|
| Quality & Reliability | "On this site: an accessibility and behaviour test suite you can run yourself — press `⌘K → Break It`." |
| Clean Architecture | Link to a specific structural decision in a project case study |
| Execution & Ownership | "Four products live in production, all shipped solo." |
| Engineering Rigor | The algorithm/complexity work behind `quant.dev-jk.me` |

Restyle the tab panel with the new tokens; keep the `AnimatePresence` panel swap. Add a **vertical progress line** that fills as the tab auto-advances (8s per principle, pausing on hover/focus) — gives the section life without demanding a click.

---

### 6.6 Beyond the Resume — `sections/BeyondResumeSection.tsx`

**Owner-approved. Preserve behaviour, upgrade presentation.**
- Restyle terminal to the new tokens; the prompt chips become `--color-surface` pills with gold hover.
- Layers: keep the themed per-topic layers (timeline, trail chips, principle tags, confetti, contact CTA).
- **Mobile: convert layers to bottom sheets** (§7.7).
- Add two prompts: `Why QA?` and `What's next?` — both high-value for recruiters, both `<Dual>`.
- The free-text fallback should be warmer and suggest the command palette.

---

### 6.7 Summit — `sections/ContactSection.tsx` (from `CallToActionSection.tsx`)

The payoff. When this section enters the viewport:

1. The sun completes its rise (scroll progress is ~1 here by construction).
2. A **gold light wash** sweeps across the section — a `linear-gradient` overlay animating `backgroundPosition`, 1.4s, once.
3. The headline mask-reveals: **"You made it to the top."** (`--text-h1`, display serif, italic on "top").
4. A tiny **flag plants** at the summit of the ridgeline SVG — 6-frame spring (`scale 0 → 1`, `rotate -25 → 0`), `snappy`. Far classier than confetti.
5. `soundFx.summit()` — once per session, only if unmuted.

Content:
- `<Dual>` invitation line
- Email row with copy-to-clipboard (keep existing, restyle)
- The form (keep `mailto:` composition — it's honest and needs no backend). Upgrade: inline validation with `aria-live` error messages, a `--color-moss` valid-state tick per field, and a submit button with a three-state machine (idle → composing → opened).
- Availability + timezone line
- Footer: minimal. Name, year, and a `built with` line that is **one honest sentence**, not a badge wall.

---

## 7. Signature Wow Moments — detailed

Ranked by impact per unit of effort. If time runs out, ship in this order.

### 7.1 Two voices, no switch — §5.2
**Why it wins:** it serves both audiences without asking either to self-identify. Every visitor reads the same page; hierarchy decides who reads what.

### 7.2 The Ascent (sky + altimeter + ridge parallax) — §5.1, §5.3
**Why it wins:** it's the identity. A visitor knows within 400ms of scrolling that this site is not a template.

### 7.3 Annotated hotspots on real screenshots
Over each project screenshot, absolutely-positioned markers at percentage coordinates:

```ts
type Hotspot = {
  id: string;
  x: number; y: number;          // 0–1, relative to image box
  label: string;                  // short, e.g. "Join code"
  body: Dual;
};
```
- Rendered as an 18px `<button>` with a pulsing gold ring (`box-shadow` keyframe, 2.4s, respects reduced motion).
- Click/focus → popover with `spring.snappy`, auto-flipping to stay in viewport.
- Fully keyboard accessible: `Tab` cycles hotspots, `Esc` closes.
- **3–4 hotspots per project, maximum.** More is clutter.

**Why it wins:** it converts a static screenshot into an explained decision. Non-technical visitors learn what the product does; engineers learn *why it was built that way*. This is the single best proof-of-thinking device on the site.

### 7.4 Live GitHub data
Two modules, both from one ISR fetch:

```ts
// src/lib/github.ts — export const revalidate = 3600
// GraphQL: contributionsCollection { contributionCalendar { weeks { contributionDays { contributionCount date } } } }
// + latest push event from REST /users/neverida-jk/events/public
```
- Requires `GITHUB_TOKEN` in `.env.local` (read-only, `public_repo` scope). **Document this in the README.** If the token is absent, both modules must render nothing — no errors, no skeletons.
- **Ridgeline chart:** last 26 weeks of contribution counts → an SVG area path smoothed with Catmull-Rom→bezier conversion, filled with a `--color-summit` → transparent gradient, drawn with `pathLength` on reveal. It looks like a mountain range. The motif and the data become the same object — that's the kind of detail that wins awards.
- **Latest activity line:** `pushed to tropa · 3 days ago`.

### 7.5 The summit moment — §6.7
**Why it wins:** endings are what people remember. Most portfolios just… stop.

### 7.6 Command palette upgrade — `ui/CommandPalette.tsx`
`⌘K` / `Ctrl K`. Make it a genuine control surface:
- Fuzzy search (simple subsequence scorer, ~30 lines — no dependency) across: sections, projects, tools, terminal topics.
- Actions: `Copy email`, `Print résumé` (§7.8), `Open terminal`, `Toggle sound`, `Break It mode`, `Jump to summit`.
- Recent/suggested items when empty.
- Full keyboard: `↑↓` navigate, `↵` run, `Esc` close, `Tab` cycles groups. Highlighted match characters in results.
- Visible hint in the nav dock so non-technical visitors discover it: `⌘K`.

### 7.7 Bottom sheets on mobile — `components/system/Sheet.tsx`
Every overlay (project case study, terminal layers, skill detail) is a **centred layer on desktop** and a **drag-dismissible bottom sheet on mobile**.

```tsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={{ top: 0, bottom: 0.55 }}
  onDragEnd={(_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 650) onClose();
  }}
  transition={spring.sheet}
/>
```
Include a grab handle, a scrim whose opacity tracks drag offset, and `overscroll-behavior: contain` on the scrollable body. This single change makes the site feel *native* on a phone, which is where most recruiters will open it.

### 7.8 Print résumé — `globals.css` `@media print`
`⌘P` produces a clean, one-page, black-on-white résumé: hide nav/sky/rail/decoration, linearise sections, expose full URLs after links (`a[href]::after { content: " (" attr(href) ")" }`), force `--text-body` to 10.5pt, page margins 18mm.

**Why it wins:** zero dependencies, ten minutes of work, and it's the exact thing a recruiter actually needs. It signals empathy for the user's real job.

### 7.9 "Break It" — the QA mode *(opt-in, never default)*
Jake is a QA Analyst. The site tests itself.

Toggle from the command palette or a small mono link in the footer: **"Try to break this page →"**. Enabling it shows a collapsible HUD (bottom-left, `--color-surface`, 320px) that runs real checks against the live DOM:

```ts
type Check = { id: string; label: Dual; run: () => boolean };
```
Ship ~10 **honest** checks, e.g.:
- every `<img>` has non-empty `alt`
- every interactive element has an accessible name
- no element exceeds the viewport width (horizontal-overflow check)
- all headings form a valid hierarchy (no skipped levels)
- focus ring is visible on keyboard focus
- `prefers-reduced-motion` is respected (asserts a motion flag)
- contact form rejects a malformed email
- every external link has `rel="noopener"`
- colour contrast on body text ≥ 4.5:1 (computed)
- no console errors since load

Display pass/fail with timing, a summary `10/10 passing`, and a re-run button. Run in `requestIdleCallback`, never on the critical path.

**Why it wins:** it is the one thing on this site that could only have been built by *this* person. A non-technical visitor thinks "the website checks itself?!"; an engineering manager thinks "this is a QA hire who ships." Keep it opt-in so it never violates the anti-clutter rule.

### 7.10 Micro-wow: dynamic OG images
`app/opengraph-image.tsx` + per-project variants using `next/og`'s `ImageResponse` — the topo motif, the project name, the elevation badge. Every shared link becomes a designed card.

---

## 8. Micro-interaction Catalogue

Implement as reusable primitives in `components/motion/`.

### 8.1 `<RevealText>` — mask reveal
Split to words (and chars for the H1 only). Each glyph wrapped in `overflow: hidden` with the inner span animating `y: 105% → 0`. Stagger `tight`. Parent gets `aria-label={text}`; spans get `aria-hidden`. **Never split text that a screen reader must read without a label.**

### 8.2 `<Magnetic>` — magnetic hover
```tsx
const x = useSpring(0, spring.smooth), y = useSpring(0, spring.smooth);
onMouseMove: x.set((e.clientX - cx) * 0.28); y.set((e.clientY - cy) * 0.28);
onMouseLeave: x.set(0); y.set(0);
```
Clamp displacement to 14px. Desktop + fine pointer only. Wrap every primary CTA.

### 8.3 `<CountUp>` — number ticker
`useSpring` on a `motionValue`, `useMotionValueEvent` → `setState(Math.round)`. Triggers `whileInView` once. Use for stats, altimeter, outcome metrics. Respect reduced motion (render final value).

### 8.4 Velocity skew
```tsx
const v = useVelocity(scrollY);
const sv = useSpring(v, { stiffness: 280, damping: 48 });
const skewY = useTransform(sv, [-2800, 0, 2800], [-3.5, 0, 3.5], { clamp: true });
```
Apply to section wrappers only. Cap ±3.5°. Off for reduced motion. Subtle enough that people feel it without seeing it.

### 8.5 Others
- **Hover lift:** `y: -3`, shadow `--e1 → --e2`, `spring.snappy`. Every card.
- **Link underline:** `scaleX: 0 → 1`, `transform-origin` left on enter / right on leave (0.22s, `ease.out`).
- **Border trace:** on focus-visible for cards — an SVG rect with `pathLength` animating 0→1 in gold. Makes keyboard navigation *feel designed* rather than tolerated.
- **Image reveal:** clip-path `inset(0 0 100% 0) → inset(0)` + inner `scale 1.08 → 1`, 0.9s `ease.out`.
- **Tab pills:** `layoutId` shared indicator everywhere (nav, approach tabs, toolkit groups). Consistency here is what makes a site feel like one system.
- **Sticky section headers:** the section eyebrow sticks to the top of the viewport while its section is active, then releases. Cheap, orients the reader.

---

## 9. Content Guide

### 9.1 Verified facts — the ONLY biography you may use
- Jake Neverida. Based in **Makati, Philippines** (GMT+8).
- **QA Analyst, Vertere Global Solutions Inc.** — June 2026 → present. Test plans, regression suites, defect lifecycle/triage, release quality.
- **Software Engineer Intern, Limitless Lab** — May 2025 → July 2025. React/Next.js features, REST integration, agile team.
- **BS Computer Science, University of the Philippines Los Baños**, 2022 → 2026. **GWA 1.95. Iskolar ng Bayan.**
- Climbs mountains in the Philippines: **Pulag, Apo, Ulap, Batulao**. Built **Tropa** to coordinate climbs.
- Projects: **quant.dev-jk.me** (prediction-market probability/Kelly sizing), **tropa.dev-jk.me** (climb itinerary + expense splitting), **finance.dev-jk.me** (offline-first finance PWA, Dexie/IndexedDB, Recharts), **portfolio v2** (this site).
- Contact: `jlrneverida@gmail.com` · `github.com/neverida-jk`
- LinkedIn URL in the codebase is a **placeholder** (`linkedin.com/in/your-profile`). Either replace it with the real one or remove the link entirely. **Do not ship a dead link.**

**Anything not on this list must be written as `TODO(jake):`.** Do not invent hobbies, metrics, testimonials, company names, or dates.

### 9.2 Voice
- **Positioning (2026-10):** Jake is a software engineer first. QA is one of his strengths, not his whole identity — he builds with quality, he isn't only the person who checks other people's work. Copy should read "engineer who builds with quality," never "QA Analyst who also codes." Keep the QA Analyst job itself (it's real, current work), but don't let it eclipse the engineering identity across the site.
- **Plain voice:** first person, warm, concrete, zero jargon. Short sentences. Explain by consequence, not by mechanism. *"I make sure software works before anyone else has to deal with it."*
- **Technical voice (field notes):** precise, dense, no marketing adjectives. Name the actual tools and techniques. *"Regression suites, defect lifecycle management, and release gating for enterprise applications."*
- Banned in both: "passionate", "cutting-edge", "leverage", "synergy", "robust solutions", "detail-oriented", "results-driven". If a sentence could appear on any other portfolio, rewrite it.
- Every section: **one sentence that only Jake could have written.**

### 9.3 Copy inventory to author (both voices)
`hero.role`, `hero.status`, `hero.now`, `journey.intro`, `journey.m1–m4`, `work.intro`, 4 × `work.<id>.{problem, constraint, decisions[], outcome}`, 4 × hotspot bodies, `toolkit.build/test/ship`, `approach.p1–p4.{body, receipt}`, `beyond.*` (exists), `contact.invite`, `contact.availability`.

---

## 10. Accessibility & Performance Contract

**These are gates, not goals. A phase is not complete until its additions pass.**

### Performance
- Lighthouse **mobile**: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100.
- LCP < 2.0s · CLS < 0.02 · INP < 200ms · TBT < 150ms.
- Animate only `transform`/`opacity`. Audit with DevTools → Rendering → *Paint flashing* and *Layer borders*.
- One `requestAnimationFrame` loop for the entire site. Canvas/rAF work pauses on `document.hidden` and when its element leaves the viewport (IntersectionObserver).
- Canvas DPR capped at 2. Particle/blob counts scale down on `navigator.deviceMemory <= 4` or `(max-width: 768px)`.
- `next/image` everywhere, with correct `sizes`, AVIF/WebP, and blur placeholders. Project screenshots must be ≤ 220 KB each — recompress the existing JPEGs.
- Lazy-load heavy layers with `next/dynamic({ ssr: false })`: case-study layer, terminal sandbox, Break-It HUD, cursor.
- `useReducedMotion()` guards must short-circuit *before* expensive setup (don't mount a canvas then hide it).

### Accessibility
- Full keyboard operability. Visible `:focus-visible` ring (2px `--color-summit`, 2px offset) on **every** interactive element.
- Skip-to-content link, first in tab order.
- All overlays: focus trap, `Esc` to close, focus returns to trigger, `aria-modal="true"`, `role="dialog"`, labelled by the heading.
- Touch targets ≥ 44 × 44 px.
- Body text contrast ≥ 4.5:1 against its *actual* rendered background — the sky gradient changes behind text, so **verify contrast at progress 0, 0.5, and 1.0**. Add a scrim behind text blocks if needed.
- Decorative elements (`sky`, `altimeter`, `contours`, `cursor`): `aria-hidden="true"`.
- Respect `prefers-reduced-motion` *and* `prefers-reduced-transparency` (drop backdrop blur).
- Semantic landmarks: one `<main>`, `<nav>`, `<header>`, `<footer>`; sections labelled with `aria-labelledby`.
- Test with keyboard only, then with VoiceOver/NVDA, then at 200% browser zoom, then at 320px width.

---

## 11. Phased Execution

Each phase is independently shippable. Commit at the end of each. Do not start the next until acceptance criteria pass.

### Phase 0 — Foundations *(no visible redesign yet)*
- Delete dead components (§2.2) after grep verification.
- Install token system in `globals.css`; create `src/lib/motion.ts`.
- Swap fonts (Instrument Serif + Geist + Geist Mono); remove Rubik.
- Create `src/content/copy.ts` + `registry.ts` scaffolding.
- Build `<Dual>` (two voices, §5.2) — no toggle.
- Build motion primitives: `RevealText`, `Magnetic`, `CountUp`, `Reveal` wrapper.
- Add `useReducedMotion` guards and the reduced-motion CSS block.
**Accept:** site still builds and looks intentional (not broken); hero role line renders both voices via `<Dual>`; `npm run build` clean; no console errors; Lighthouse not regressed.

### Phase 1 — The Ascent engine
- `AscentSky` (gradient + sun + stars + 3 ridge layers).
- `Altimeter` rail + `useActiveSection`.
- Remove `Particles`.
- Section ids/order per §4.
**Accept:** scrolling shifts sky smoothly with no jank (60fps in a DevTools performance recording); altimeter reads 0 → 2,954 m; text contrast verified at 3 scroll positions; reduced-motion freezes the sky.

### Phase 2 — Base Camp
- Hero rebuild (§6.1), intro choreography (§5.6), scroll-out parallax.
**Accept:** LCP element is the H1 and < 2.0s; intro ≤ 2.0s and skippable; hero readable at 320px; no CLS from the Now panel.

### Phase 3 — The Route
- Journey section (§6.2), path draw, markers, hiker glyph, mobile variant.
**Accept:** path draws in sync with scroll on desktop; mobile variant works without sticky; markers positioned via `getPointAtLength` (not hardcoded); reduced-motion renders statically.

### Phase 4 — Expeditions
- Case-study expansion with `layoutId`, hotspots (§7.3), deep links, bottom sheets on mobile (§7.7).
**Accept:** expansion is a true shared-element transition (no cross-fade pop); `Esc`/backdrop/drag all close; focus trap + restore verified; `#work/tropa` deep link opens the right study on fresh load.

### Phase 5 — Toolkit
- Verb-grouped tools, shared registry, cross-highlight both directions.
**Accept:** hovering any tool highlights exactly the correct projects; touch/reduced-motion fallback works; registry is the single source of truth (no duplicated tool strings).

### Phase 6 — Approach + Beyond the Resume
- Principles with receipts + auto-advance progress; restyle the terminal + layers; mobile sheets.
**Accept:** every principle shows a real receipt; auto-advance pauses on hover/focus; terminal layers unchanged in behaviour, upgraded in look.

### Phase 7 — Summit
- Contact rebuild, light wash, flag plant, form validation states, footer.
**Accept:** summit sequence fires once per session; form validation announces via `aria-live`; `mailto:` composes correctly with special characters escaped.

### Phase 8 — The extras
- Command palette upgrade, cursor, sound palette + muted default, print résumé, GitHub live data, OG images, Break-It mode, ≤ 3 easter eggs.
**Accept:** `⌘K` works everywhere including inside overlays; cursor never blocks text selection; print preview is a clean one-pager; GitHub modules vanish gracefully without a token; Break-It checks are honest and all pass.

### Phase 9 — Hardening
- Lighthouse on mobile throttling; keyboard-only pass; screen-reader pass; 320px and 200%-zoom pass; Safari + Firefox + Chrome; iOS Safari real-device check.
- Remove all `console.log`; strip unused CSS; verify no hydration warnings.
**Accept:** every gate in §10 met. Then ship.

---

## 12. File Map

```
src/
  app/
    layout.tsx                    # fonts, Sky, Altimeter, Cursor, metadata
    page.tsx                      # section composition only — no logic
    globals.css                   # tokens, reduced-motion, print styles
    opengraph-image.tsx           # NEW — dynamic OG
    components/
      system/                     # NEW — global machinery
        AscentSky.tsx
        Altimeter.tsx
        ToolFocusProvider.tsx
        Dual.tsx
        Cursor.tsx
        Intro.tsx
        Sheet.tsx
        Contours.tsx
        BreakItHUD.tsx
      motion/                     # NEW — reusable primitives
        RevealText.tsx
        Magnetic.tsx
        CountUp.tsx
        Reveal.tsx
      sections/
        HeroSection.tsx           # rebuild
        JourneySection.tsx        # NEW
        WorkSection.tsx           # from MyWorksSection
        ToolkitSection.tsx        # NEW
        ApproachSection.tsx       # from WhyWorkWithMeSection
        BeyondResumeSection.tsx   # from TechnicalExpertiseSection
        ContactSection.tsx        # from CallToActionSection
        CredentialsSection.tsx    # DELETE — merged into Journey
      layout/Navbar.tsx           # + ⌘K hint
      ui/                         # CommandPalette, TerminalSandbox, ContentModal keep
  content/
    copy/                         # per-section Dual copy + index.ts
    registry.ts                   # NEW — projects + tools + hotspots, single source of truth
  lib/
    motion.ts                     # NEW — springs, eases, durations
    github.ts                     # NEW — ISR data
    useActiveSection.ts           # NEW
util/
  sound.ts                        # extend
  confetti.ts                     # keep, demote to easter egg
```

**Dependency policy:** build everything above with the existing stack. The *only* additions authorized, and only if a phase genuinely stalls without them:
- `@vercel/og` — already bundled in Next 15 as `next/og`. **Use `next/og`, don't install anything.**
- Nothing else. No GSAP, no Lenis, no three.js, no Lottie, no shadcn. Framer-motion 12 + CSS covers every effect specified here. Smooth-scroll libraries in particular are a trap: they break native scroll on trackpads, hurt INP, and fight `scroll-behavior: smooth`.

---

## 13. Anti-patterns — do NOT do these

1. **Don't add a smooth-scroll library.** Native scroll + `useScroll` springs give the same feel without the INP tax.
2. **Don't animate on every scroll pass.** `viewport={{ once: true }}`. Always.
3. **Don't build a preloader with a percentage counter.** It's a lie and it delays LCP. The intro is 2s and content-driven.
4. **Don't stack more than one ambient animation per viewport.** The sky is already moving; a card doesn't also need a shimmer.
5. **Don't use emoji as UI.** One emoji in the Fun Fact layer is the entire budget.
6. **Don't ship placeholder links or lorem.** The current LinkedIn URL is a placeholder — fix or remove.
7. **Don't put glass on everything.** Two surfaces. That's it.
8. **Don't auto-play sound.** Muted by default, always.
9. **Don't hide content behind interaction.** Every claim must be readable without clicking. Layers *enrich*; they never *gate*.
10. **Don't let motion delay reading.** If a reveal hasn't fired by the time a user's eye arrives, the animation is too slow.
11. **Don't regress mobile to make desktop prettier.** Most recruiters open portfolios on a phone. Design the 390px view first for every section.
12. **Don't invent facts.** See §9.1.

---

## 14. Pre-ship QA Checklist

**Functionality**
- [ ] Every nav link scrolls to the right section, on desktop and mobile
- [ ] Every piece of prose is a `Dual` in `src/content/copy/` (grep for hardcoded strings); field notes follow the one-per-block budget
- [ ] Swapping a project in `projects.ts` updates every section with no other edits
- [ ] All four case studies open, close, and deep-link correctly
- [ ] All external links open in a new tab with `rel="noopener noreferrer"` and resolve (no 404s)
- [ ] Contact form composes a correct `mailto:` including special characters
- [ ] Command palette reachable and functional from every state
- [ ] Break-It mode: all checks pass on the shipped build

**Cross-cutting**
- [ ] 320px, 390px, 768px, 1280px, 1920px — no horizontal overflow at any width
- [ ] 200% browser zoom remains usable
- [ ] Keyboard-only: complete traversal, visible focus, no traps except intentional modal traps
- [ ] Screen reader: headings form a logical outline; decorative layers are silent
- [ ] `prefers-reduced-motion: reduce`: no parallax, no kinetics, no cursor, site fully usable
- [ ] JS-disabled: content readable and styled
- [ ] Chrome, Safari, Firefox, iOS Safari (real device), Android Chrome
- [ ] Lighthouse mobile: 95+ / 100 / 100 / 100
- [ ] No console errors or hydration warnings
- [ ] Print preview yields a clean one-page résumé
- [ ] OG image renders correctly in a link-preview debugger

**The final test**
Show it to one non-technical person and one senior engineer.
- The non-technical person should be able to say **what Jake does** and **what kind of person he is** without asking.
- The engineer should point at one thing and ask **"how did you build that?"**

If both happen, it's outstanding. Ship it.
