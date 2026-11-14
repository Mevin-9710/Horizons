# Screens (design phase)

| # | Screen | Demo file | Artifact | Status |
|---|---|---|---|---|
| 1 | Home | `home-screen-demo.html` | https://claude.ai/artifact/HTTTSy4zX7pkvTAkExMDJz | Draft. Needs the game-feel pass. |
| 2 | Mission select | `mission-select-demo.html` | https://claude.ai/artifact/R9HaPmZ8Crbu4DCF3f9YSs | Draft. Needs the game-feel pass. |
| 3 | Base and workshops | `base-workshop-demo.html` | https://claude.ai/artifact/4F9c4SRshinNrKqwwXXA13 | Draft |
| – | Game feel (style options) | `game-feel-demo.html` | https://claude.ai/artifact/UQbCc3uns31YmFbA7oaPc9 | Pick A, B or C, then apply it to every screen |

## Open item for every screen
Every screen still reads more like a **website than a game**. A shared "game feel" layer will be designed later and applied to all screens.

## Mission select: what the demo shows
- **Cream page** (`#FBFAF4`, as on Comet). Only the top-right corner melts into a starry night, the same as the home screen. Planets sit on the cream like the Comet spheres.
- A full-screen **3D solar system** (three.js) that revolves slowly and auto-orbits the camera. Drag to look around.
- **Planets use the Comet palette, not realistic colours.** One shared shader draws angled colour bands, film grain, a soft terminator and a rim light. Sun: amber and ember. Earth: teal. Moon: silver. Mars: crimson. Jupiter: olive and gold. Saturn: sand, with a ring. Neptune: dark teal.
- **Thin elliptical orbit lines**, as on Comet. The lines for mission planets are brighter.
- **Mission planets** (Earth, Moon, Mars) have a pulsing amber ring. Hovering shows a tag with the planet and mission name.
- **Floating prompt** (bottom left): "Choose your destination", with quick-pick chips.
- **On select:** orbits slow down, the **camera pans to the planet**, and a **mission brief** opens. On desktop it is a card docked on the right; on phones the planet is framed in the top half and the brief is a bottom sheet. The brief has a scrolling body and a fixed action bar (Back · Start mission). It shows the difficulty, objective, orbit, duration, budget, mass limit, goals, **Start mission** and **Back to system**. Esc goes back. Other planets show "No mission here yet".
- **Performance:** one WebGL context, pixel ratio capped at 1.5, rendering paused when the tab is hidden, a single buffer for the stars, and invisible hit spheres that make planets easy to click.

## Game feel: TACTILE (chosen 2026-11-14)
Applied to the home and mission select screens. The other two styles (Console, Sticker) stay in `game-feel-demo.html` for reference only.
- **Buttons** (`.t-btn`): 3px ink outline, 16px radius, an inner darker lip (`inset 0 -5px 0`) and an outer `0 5px 0` ink drop. On press they move down 4px and the shadow collapses (the squash). Primary = amber with an amber-dark lip. Secondary = white with a `#E4DED2` lip.
- **Round icon buttons** (`.t-round`): 46px circles with the same lip. Back, settings, and a red ✗ for close.
- **Windows** (`.t-win`): **glassmorphism** fill (`rgba(255,255,255,.42)` + `backdrop-filter: blur(18px) saturate(1.4)`), the same for cards, tiles, pills and secondary buttons; 3px ink border, 22px radius, `0 7px 0` ink drop. An **ember ribbon title** (`.t-ribbon`) sits on or over the top edge. The ✗ close sits in the top-right corner.
- **Pills and status** (`.t-pill`): white, 2.5px outline, `0 3px 0` drop, Silkscreen text, blinking amber dot.
- **Badges:** a green tilted `NEW` tag. Difficulty is shown as **stars** (amber filled, `#E4DED2` empty).
- **Spec tiles and list bullets:** cream tiles with outlines and drops; bullets are outlined amber diamonds.
- **Motion:** windows pop in with an overshoot `cubic-bezier(.34,1.56,.64,1)`, press squash is 80ms, and cards lift on hover. Everything is off under reduced motion.
- **Unchanged:** 3D models, colour palette, fonts, layout.

## Base and workshops: what the demo shows
- **Isometric base** (orthographic three.js camera that follows the player). It is laid out like the Space Level Kit: a central plaza, bridges with arched supports, and four buildings on floating slabs. Columns fade into the cream page.
- **3D style** = the Comet planet shader applied to every surface: palette colour bands, grain and soft light. Edge trim lines are **ember** (no cyan or green).
- **Buildings:**
  - **Rocket workshop** (west hangar): pick the rocket and orbit. The rocket sets the mass limit.
  - **Spacecraft workshop** (east, with a teal dome): pick the bus, power, comms, instrument and engine.
  - **Launch pad** (north): a pre-launch check of all six metrics, then Launch.
  - **Mission control** (south tower): locked, with a lock badge, until launch.
- **Astronaut** in the Comet style (cream suit, teal visor, rust backpack). Walk with WASD or the arrow keys, or the joystick on touch. Tap the floor or a dock tile to auto-walk there. Near a door, a glowing ring appears with a Tactile "Enter … [E]" button.
- **HUD:** six Tactile glass capsules with mini bars: mass, budget, power, data, comms and time. Green is OK, amber is close, red is over. Values bump when they change.
- **Workshop window:** a Tactile glass window with a ribbon title, category tabs (a red dot means not chosen yet) and option cards that list each part's effects. Every pick updates the HUD live.
- **Tutorial callout** (3 steps, as in the gameplay doc): walk to the glowing workshop → pick an instrument ("Heavier means less fuel. Keep bars green!") → walk to the pad and launch. It can be skipped.
- **Launch:** a "Liftoff!" banner, the rocket climbs off-screen, and the dock's Mission control tile unlocks with a NEW badge.
- **Part numbers are placeholders** for the design. The real values come from the game data and evaluator.

## Walk-in workshops (update)
- Entering a workshop door does a **camera push-in to the door, then a cream iris wipe**, and the screen swaps to the workshop interior. Leaving reverses it.
- **Spacecraft workshop:** a large isometric hall (32×24) with back walls, round star windows and a floor grid. **Five rows of pedestals** (Bus, Power, Comms, Instrument, Engine), each holding 3 **NASA models**: the Satellite Kit bodies, wings and radios, plus the Infrared Camera. A **Build bay** turntable shows the craft assembled from the current picks. A NASA **Landsat 8** stands on display. There is an Exit pad.
- **Rocket workshop:** a hall with the **NASA Jupiter-C, Atlas and Saturn V** on pads (each pick sets the mass limit), and two orbit kiosks.
- **Picking:** walk up to a pedestal (or tap it to auto-walk). An info card shows the part, whether its model is NASA or a stand-in, and its effects, with a **Pick [E]** button. The HUD and build bay update live.
- **Launch pad:** the chosen NASA rocket stands next to the NASA gantry and launches from it.
- **Models:** see `Design System/models/CREDITS.md`. In the artifact the models ship as base64 `.txt` files because the host serves no `.glb` type. A real build should serve the `.glb` files directly.
