# Screens (design phase)

| # | Screen | Demo file | Artifact | Status |
|---|---|---|---|---|
| 1 | Home | `home-screen-demo.html` | https://claude.ai/artifact/HTTTSy4zX7pkvTAkExMDJz | Draft. Needs the game-feel pass. |
| 2 | Mission select | `mission-select-demo.html` | https://claude.ai/artifact/R9HaPmZ8Crbu4DCF3f9YSs | Draft. Needs the game-feel pass. |

## Open item for every screen
Every screen still reads more like a **website than a game**. A shared "game feel" layer will be designed later and applied to all screens.

## Mission select: what the demo shows
- A full-screen **3D solar system** (three.js) that revolves slowly and auto-orbits the camera. Drag to look around.
- **Planets use the Comet palette, not realistic colours.** One shared shader draws angled colour bands, film grain, a soft terminator and a rim light. Sun: amber and ember. Earth: teal. Moon: silver. Mars: crimson. Jupiter: olive and gold. Saturn: sand, with a ring. Neptune: dark teal.
- **Thin elliptical orbit lines**, as on Comet. The lines for mission planets are brighter.
- **Mission planets** (Earth, Moon, Mars) have a pulsing amber ring. Hovering shows a tag with the planet and mission name.
- **Floating prompt** (bottom left): "Choose your destination", with quick-pick chips.
- **On select:** orbits slow down, the **camera pans to the planet**, and a **mission brief** slides in. It shows the difficulty, objective, orbit, duration, budget, mass limit, goals, **Start mission** and **Back to system**. Esc goes back. Other planets show "No mission here yet".
- **Performance:** one WebGL context, pixel ratio capped at 1.5, rendering paused when the tab is hidden, a single buffer for the stars, and invisible hit spheres that make planets easy to click.
