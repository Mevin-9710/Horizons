# Inspiration 01: Perplexity "Computer" product page

- **Source:** https://www.perplexity.ai/products/computer
- **Captured:** 2026-11-14, Chromium, 1440×900 viewport
- **Use in Horizons:** the main reference for the **intro / title screen**, and the general look (light glass, serif headline, small mono labels).
- **Status:** reference only. Nothing has been built from this yet.

> This is a third-party page. We copy the *feel* (layout, how the layers stack, the motion), not their assets. The video, poster image, fonts and wordmark belong to Perplexity. `reference-hero-poster.webp` is kept only to look at; it must not ship in the game.

---

## 1. Files in this folder

| File | What it is |
|---|---|
| `01-hero.png` | Hero section with the cookie banner dismissed. **The main reference.** |
| `01b-hero-later-frame.png` | The same hero a few seconds later, showing the rotating word and the glimmer. |
| `reference-hero-poster.webp` | Their still poster frame of the hero video (glass ball on a flowery hill). Reference only. |
| `page.html` | Raw rendered DOM of the page. |
| `hero-extracted.css` | Every CSS rule that touches the hero, query cards, buttons and keyframes, pulled from the live stylesheets. |
| `hero-extraction.json` | The hero's media elements (video, canvas, image) and the card styles they computed to. |
| `extracted-styles.json` | Computed fonts, colours and buttons, plus the `:root` design tokens. |

---

## 2. What the hero is made of

In `01-hero.png` you see a **large clear glass sphere** sitting on a rocky, flowery hill. Soft god-rays come in from the top right. The edges fade into an off-white page. A huge serif headline sits to the right of the ball, and a column of small frosted "query" cards runs down the left.

The layers, back to front (from `page.html` and `hero-extracted.css`):

```
section.hero
└─ .hero-bg                      absolute, 824px tall, overflow hidden
   ├─ .computer-hero-bg          1610×906 box (16:9), translateX(-50% - 160px) → ball sits left of centre
   │  ├─ img.computer-hero-bg-poster   still fallback, object-fit: cover
   │  ├─ video.hero-glimmer-video      looping muted autoplay .webm (opacity 0; it is used as a texture)
   │  └─ canvas (three.js r174)        draws the video through a shader: "glimmer"/shimmer distortion
   └─ ::after                    gradient vignette that fades every edge into the page colour
.hero-inner
├─ .hero-headlines   absolute; top 17.5rem; right 18rem; text right-aligned
│  ├─ h1 "Computer"               serif, 96px, weight 300, line-height 1
│  └─ .hero-headline-rotator      one word at a time: Researches / Codes / Builds / …
├─ .query-stack     absolute left column, 15rem wide, gap 1.5rem
│  └─ .query-card ×3              frosted cards: number · text · "/query" tag
└─ bottom-left .hero-status-indicator  "BUILDING..." mono label + dot loader; bottom-right "ON / OFF" toggle
```

**Main finding:** the glass ball is **not rendered in real time**. It is a **pre-rendered video** (`computer-hero-bg-2.webm`). A three.js canvas then draws that video as a texture and adds a light "glimmer" shader on top. To get the same look we have two options:
- **(a) Cheap and closest to the original:** render or buy a looping video of a glass sphere and play it through a simple three.js shader.
- **(b) Fully live:** a real three.js sphere using `MeshPhysicalMaterial` with `transmission: 1`, `roughness: ~0.05`, `ior: 1.5`, `thickness: ~2`, lit by an environment map. This lets the ball react to the cursor, but needs a good HDRI to look right.

### Edge-fade vignette (the most important trick for the soft look)
```css
.hero-bg::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background:
    radial-gradient(804px 120% at calc(50% - 160px) 40%, rgba(250,248,245,0) 72%, rgb(250,248,245) 100%),
    linear-gradient(90deg,  rgb(250,248,245) 0%,  rgba(250,248,245,0) 12%),
    linear-gradient(270deg, rgba(250,248,245,0) 80%, rgb(250,248,245) 100%),
    linear-gradient(rgb(250,248,245) 0%, rgba(250,248,245,0) 1…);  /* top fade */
}
```
The whole background melts into the page colour on every side. For Horizons we change `250,248,245` (cream) to our **space-navy page colour**.

---

## 3. Typography

| Role | Font | Size / weight | Colour |
|---|---|---|---|
| Hero headline | `pplxSerif` (custom; fallback Georgia) | 96px / **300**, line-height 100% | `rgb(39,26,0)`, a warm near-black |
| Section H2 | serif | 48px / 400 (72px / 300 for the large call-to-action) | near-black, or white on dark sections |
| Body / UI | `pplxSans` (custom; fallback system-ui) | 14–16px | black |
| Labels, numbers, tags | mono (`--nimbus-font-mono`) | ~12px / 600; status label 10px, uppercase | near-black |

Free substitutes for Horizons: **serif** → *Fraunces* or *Newsreader* at weight 300; **sans** → *Inter* or *Geist*; **mono** → *JetBrains Mono* or *Geist Mono*.

### Rotating headline word (blur + slide)
```css
.hero-headline-rotator { position: relative; height: 1em; overflow: hidden; min-width: 14ch; }
.hero-headline-word { position: absolute; inset: 0 auto auto 0; opacity: 0; filter: blur(12px); transform: translateY(40%);
  transition: opacity var(--d) var(--e), transform var(--d) var(--e), filter var(--d) var(--e); }
.hero-headline-word--active { opacity: 1; filter: blur(0); transform: translateY(0); }
.hero-headline-word--exit   { opacity: 0; filter: blur(12px); transform: translateY(-40%); }
```
On page load the headline also comes into focus: `.hero-headline { animation: hero-headline-focus 2.2s cubic-bezier(.16,1,.3,1) .2s both; }`. It starts at about 24px blur and opacity 0 and ends sharp.
**Horizons use:** "Horizons **Launches / Orbits / Explores / Designs / Observes**".

---

## 4. Components

**Frosted query card** (the left column):
```css
.query-card { position: relative; width: 15rem; height: 10rem; padding: .625rem .75rem; border-radius: 4px;
  border: 1px solid rgba(39,26,0,.10); display: flex; flex-direction: column; justify-content: space-between; }
.query-card::before { content:""; position:absolute; inset:0; border-radius:4px;
  background: rgba(255,255,255,.6); backdrop-filter: blur(20px); }          /* frosted glass */
.query-card::after  { content:""; position:absolute; inset:0; transform: translate(-140%);
  background: linear-gradient(100deg, transparent 26%, rgba(255,255,255,.4) 50%, transparent 74%); } /* shimmer sweep */
.query-card.query-entering.query-visible { transition: opacity 1s cubic-bezier(.12,1,.72,1), transform 1s cubic-bezier(.12,1,.72,1); }
```
Layout inside the card: a mono number at the top left (`03`), body text in the middle (12px, clamped to 6 lines), and a mono tag at the bottom right (`/query`). The cards cycle up the column every few seconds.
**Horizons use:** mission cards ("01 · Wildfire watch · Earth" … tag `/mission`), or the tutorial step cards.

**Status indicator** (bottom left): a small chip with `backdrop-filter: blur(20px)` on `rgba(255,255,255,.6)`, 4px radius, a 10px uppercase mono label `BUILDING...` and an animated dot loader. **Horizons use:** `LOADING SOLAR SYSTEM...` and `TELEMETRY LINK...`.

**Buttons:**
- Nav primary button: a pill (`border-radius: 9999px`), `padding 8px 16px`, 14px text, dark fill (`rgb(18,40,51)`-ish teal-black) with light text.
- Hero call-to-action: pill, 40px radius, dark `rgb(39,37,30)` fill with cream text.
- Hover: `opacity: .8`.

**Nav bar:** 56px tall, logo on the left, plain text links with chevrons, primary pill on the right. It changes colour depending on the section underneath (`data-nav-theme="dark"`): cream on light sections, `#101216` on dark sections.

---

## 5. Colour tokens (from `:root`)

| Token | Value | Notes |
|---|---|---|
| page background | `rgb(250,248,245)` | warm off-white |
| text, primary | `rgb(39,26,0)` / `#121516` | warm black |
| `--fg-secondary` | text at 65% | |
| `--fg-tertiary` | text at 50% | |
| `--border-base` | text at 14% | hairline borders |
| `--border-soft` | text at 7% | |
| `--bg-soft` / `--bg-subtle` | text at 6% / 3% | quiet fills |
| glass fill | `rgba(255,255,255,.6)` + `blur(20px)` | every frosted surface |
| dark section | `#101216`, light text `rgb(219,222,227)` | |
| main easing | `cubic-bezier(.22,1,.36,1)` (ease-out-quint), `cubic-bezier(.12,1,.72,1)` | slow, soft motion |

---

## 6. Scope

Only the **hero** (`01-hero.png`, `01b-hero-later-frame.png`) is in scope. This is the **game's landing / home screen**. The rest of the page (the "Computer unifies" text ribbon and the "How it works" steps) is **out of scope** and should not be used.

---

## 7. Changes for Horizons (requested by Mevin)

> "Keep that central spherical ball as a 3D glass ball, just as it is. In the top-right corner add a mid dark blue starry night sky. Change everything else to match space."

1. **Glass sphere: keep it as it is.** Same clear, refractive 3D glass ball in the same spot (left of centre, about 430px across at 1440w), with the same highlights and the same gentle glimmer. The only thing allowed to change is **what the glass refracts**: it should show the space scene behind it (stars, the blue sky, the horizon glow) instead of meadow and sunlight.
2. **Top-right corner: a mid-to-dark blue starry night sky.** In place of the white god-rays, the top-right area becomes a **mid/dark blue night sky full of stars**:
   - A gradient from about `#1B2A5E` / `#1E3370` (mid blue) at the top-right corner to `#0B1230` (deep navy) further away.
   - Stars of mixed sizes (mostly 1px, a few 2–3px with a soft glow), slow twinkle, and maybe a faint Milky Way band running diagonally.
   - It keeps the same soft vignette, fading into the rest of the scene like the god-rays do now.
3. **Everything else becomes space themed:**
   - **Ground:** the flowery hill becomes a **rocky lunar/planetary surface** (grey regolith, small craters, scattered rocks), with the ball sitting on it the same way.
   - **Flowers and plants:** gone. Use rocks, dust, and perhaps a small rover, antenna or launch-pad detail for scale.
   - **Light:** sun rays become cool starlight. Possibly a planet (Earth glowing blue) low on the horizon or reflected in the ball, which ties into the tutorial's "Earth glows. Tap Earth."
   - **Page colour and vignette:** cream `#FAF8F5` becomes deep space navy (about `#070B1A`). The edge-fade gradients use that navy so the scene melts into space.
   - **Text:** the headline turns light (about `#E8ECF5`) and stays a weight-300 serif. Rotating words: *Designs · Launches · Orbits · Observes · Explores*.
   - **Frosted cards:** keep the glass, but make it dark glass: `rgba(20,30,60,.45)` + `blur(20px)`, a hairline border `rgba(180,200,255,.14)`, and light text. Show missions: `01 Wildfire watch /earth`, `02 Lunar polar ice /moon`, `03 Mars atmosphere /mars`.
   - **Status chip:** the same mono uppercase chip, reading `PLOTTING TRAJECTORY...` / `LOADING SOLAR SYSTEM...`.
   - **Call-to-action:** the pill button becomes **"Play"** (or "Launch"). Light pill on the dark background, or a soft blue glow.
   - **Accents:** one cool accent such as `#7AA2FF` (star blue). Keep the HUD status colours (green OK / amber / red blocked) separate from the brand palette.

### Performance requirement (hard rule)
This is a **game**, not a website. The landing screen must be **fast and responsive**: 60 fps, an instant first paint, and no jank on mid-range laptops or phones.
- Use whichever glass-ball approach (video texture or live 3D) measures faster on a mid-range device. Both are allowed.
- Show a static poster frame immediately, then upgrade to the video or 3D version once it has loaded.
- Use one WebGL context at most, cap the device pixel ratio at about 1.5, pause rendering when the tab is hidden, and keep `backdrop-filter` blur to a few small elements.
- Draw the stars as a single `Points` buffer or a single canvas, never thousands of DOM nodes.

### Implementation notes for the build phase
- Simplest route to a convincing result: **pre-render a looping 16:9 video** of the glass sphere on a lunar surface under a starry sky (Blender), then play it as a texture in three.js with a subtle refraction/shimmer shader, the way Perplexity does. Add a **live star layer** (a canvas or three.js `Points`) on top for twinkle and parallax.
- Live alternative: three.js `MeshPhysicalMaterial({ transmission: 1, roughness: .05, ior: 1.5, thickness: 2 })` with a starfield cubemap or HDRI as `scene.environment`, plus a low-poly regolith ground.
- Keep the same layout numbers: background box 1610×906 shifted `-160px`; headline at `top: 17.5rem; right: 18rem`; cards in a 15rem column at `top: 10.5rem`.

### Update 2026-11-14: decisions from Mevin (these replace the space-ground notes above)
- **Page background:** Comet cream `#FBFAF4`. **Only the top-right corner** melts into a dark starry night (Warm Nebula: `#08070F` → `#2A1E3A`, with a faint ember/amber glow at the edge).
- **Stones and flowers stay.** Put them along the **bottom, towards the left** (not in the corner): grey rounded stones, white daisies with amber centres, orange poppies, teal spikes and grass. They fade out toward the centre.
- **Light shimmer: keep it.** The soft light shimmer/glimmer over the hero (Perplexity's three.js glimmer pass, plus light rays) must be in the real build. It is left out of the demo only.
- **Fonts:** display = Game Paused (digits fall back to Silkscreen); UI = Geist; labels and HUD = Geist Mono (provisional).
- **Demo:** `Design System/home-screen-demo.html` (published as the "Horizons Home Screen" artifact).
- **Feedback on the demo (to apply in the build):** stones and flowers need about **25% more volume and height**, and should **rise higher into the hero** so they read as the ground the orb sits on, not a strip at the bottom edge. **Make the glass orb larger** too, so it connects with the planting (as in the Perplexity hero, where the ball rests on the hill).
- **Inside the orb:** a **rocket in the same glass tone** (frosted white, translucent, a soft white rim and a faint amber exhaust glow), tilted about 18°. In the real build it should sit *inside* the sphere and be refracted by it. We chose a rocket instead of a real person's image: no rights or likeness issues, and it ties straight into the "build and launch" goal.
- **Status: home screen design is FINAL.** Demo: `Design System/home-screen-demo.html` (artifact https://claude.ai/artifact/HTTTSy4zX7pkvTAkExMDJz).
