# Inspiration 02: Perplexity "Comet" page

> **Third-party material, all rights reserved by Perplexity AI, Inc..** Kept only as design inspiration; not part of the game and not under this repo's licence. See [the notice](../README.md).

- **Source:** https://www.perplexity.ai/comet (built with Framer)
- **Captured:** 2026-11-14, Chromium, 1440×900
- **Use in Horizons:**
  1. The **grainy gradient spheres** become the **planets on the mission-selection screen**, as real 3D models orbiting.
  2. The **starry space band** at the bottom of the page is a reference for the night-sky backdrop.
  3. Its colours and type feed the Horizons palette and font choice.
- **Status:** reference only. Nothing has been built from this yet. Their assets belong to Perplexity; we copy the style, not the files.

## Files

| File | What it is |
|---|---|
| `01-hero-planets.png` | Hero: large grainy spheres (teal, rust, crimson) bleeding off the screen edges, plus thin orbit lines. |
| `02-planet-row.png` | A row of five spheres of different sizes and moods. **The main planet reference.** |
| `03-starfield-entry.png` | A small orange sphere "sinking" into the dark space panel. |
| `04-starfield-footer.png` | Full-bleed space panel: a warp-speed starfield with nebula streaks, plus a large pale sphere in the corner. **The starry sky reference.** |
| `page.html` | Rendered DOM. |
| `media.json` | Every image and video, with its position and size. |

## 1. The spheres (becoming our planets)

**What they are:** flat **pre-rendered PNG images** (about 1080², `framerusercontent.com/images/*.png`), not 3D. Each is a circle with:
- **Bands of colour set at angles**, like soft folded paper or gas-giant stripes. Usually 2–4 colours with a hard-ish diagonal split and soft blending.
- **Heavy film grain / noise** across the whole surface. This is the signature of the look.
- A **dark terminator**: one side falls off toward near-black, which makes the flat disc read as a lit sphere.
- No outline. The edge is clean, and some spheres have a very faint rim light.
- A soft drop shadow on the cream page.

Moods seen (sampled colours):

| Sphere | Colours |
|---|---|
| Teal | `#0B1F24` `#1C3E46` `#2C5B65` `#95B3B6` |
| Crimson | `#792B37` `#A73B42` `#B05B62` `#B9A28D` |
| Rust/teal (large, `02`) | teal, rust orange, wine, near-black |
| Charcoal (small) | black → silver highlight |
| Peach/coral | cream, peach, sky-blue patch, red-brown base |
| Olive/gold | mustard, slate blue, olive |
| Dark forest | `#0F1916`, mint-teal facet, olive |

**Orbit lines:** very thin (about 1px) elliptical lines in pale teal, coral or sand at low opacity, crossing behind the content (`01`, `02`). In Horizons these become the **actual orbit paths**.

### For Horizons: mission-selection planets
- Use **real 3D spheres** orbiting a central star, with thin elliptical orbit lines in the same style.
- Shade them in the Comet way: a custom shader (or a baked texture) using **angled colour bands + grain noise + a soft terminator**, *not* photoreal NASA textures. That keeps the art style consistent and makes it cheap to render.
- Planet mapping (suggested):
  - **Earth:** teal and deep ocean with a sand band. The "teal" sphere above.
  - **Moon:** charcoal/silver. The small charcoal sphere, or the large pale grainy sphere from `04`.
  - **Mars:** rust and crimson. The crimson sphere.
  - **Sun:** peach/coral with a glow.
  - Others are decorative and can't be selected: olive/gold (Jupiter-like) and dark forest (Neptune-like).
- Hovering a planet slows its orbit, brightens its rim, and shows a frosted mission card (the card style from inspiration 01).
- **Performance:** one shared shader, about 64-segment spheres, grain done in the shader (no texture fetch), at most 8 bodies. This easily holds 60 fps on mobile.

## 2. The starry space panel (bottom of the page)

- A full-width panel with 16px radius, playing a **looping muted mp4** (`object-fit: cover`) of a warp-speed / hyperspace starfield: white-blue streaks, warm orange sparks, a blue-white nebula ribbon and a black background.
- Headline in a white condensed serif, centred: "Browse with intelligence".
- A pill call-to-action: white pill, dark circular icon chip on the left, label on the right.
- Spheres overlap the panel edges (`03`: an orange sphere sinking in; `04`: a pale sphere in the corner), which creates depth.
- Starfield colours sampled: `#020002` black, `#100E1B`, `#31262D`, greys `#586168` / `#797C7B`, highlights `#C3C6C0`, plus warm orange and cold blue sparks.

**For Horizons:** use this as the space backdrop on the landing and solar-system screens, with the mid/dark blue twist from inspiration 01. Build it as a **live star particle layer** (cheap) instead of a video, so it can react to camera moves. A short "warp" streak burst plays on scene transitions, such as entering a mission or launching.

## 3. Typography

| Role | Font on site | Notes |
|---|---|---|
| Display headline | condensed high-contrast serif (`Newsreader Variable` / `Spectral`) | tight tracking, large size. "The browser that works for you" |
| UI / body | `FK Grotesk Neue` | neutral grotesk |
| Labels / footer | `Berkeley Mono` | uppercase: "©2025 PERPLEXITY", "COSMIC CURIOSITY" |

The same three-part system as inspiration 01: **serif display + grotesk UI + mono labels.**

## 4. Colours

| Token | Value |
|---|---|
| Page cream | `#FBFAF4` |
| Ink | `#091717` (deep teal-black) |
| Brand teal (Download button) | `#21808D` / `#299DA9` |
| Dark teal | `#14343B` |
| Space black | `#020002` |

## 5. Components worth reusing
- **Teal pill button:** `#21808D` with a download icon and white text.
- **Icon-chip pill call-to-action:** a large pill with a round icon chip inside on the left.
- **Round icon buttons:** white circles with a soft shadow (top corners).
- **FAQ cards:** white, about 16px radius, very soft shadow, `+` in a small round chip. Could become the briefing/hint accordion.
- **Mono footer labels.**
