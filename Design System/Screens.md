# Screens (design phase)

> **Playable combined demo:** `horizons-game.html`, https://claude.ai/artifact/BhiwVCSSi8AXYWuaMBGU6x
> One full-screen frame loads each screen in turn (`postMessage` hand-offs and a cream iris wipe). The selected mission, the parts picked and the design names carry through.
> The flow: Home → Mission select → Base & workshops → Launch → Mission control tower → Mission control → Report → Redesign (back to base with the picks kept).

| # | Screen | Demo file | Artifact | Status |
|---|---|---|---|---|
| 1 | Home | `home-screen-demo.html` | https://claude.ai/artifact/HTTTSy4zX7pkvTAkExMDJz | Draft. Needs the game-feel pass. |
| 2 | Mission select | `mission-select-demo.html` | https://claude.ai/artifact/R9HaPmZ8Crbu4DCF3f9YSs | Draft. Needs the game-feel pass. |
| 3 | Base and workshops | `base-workshop-demo.html` | https://claude.ai/artifact/4F9c4SRshinNrKqwwXXA13 | Draft |
| 4 | Mission control | `mission-control-demo.html` | https://claude.ai/artifact/RGniegCBEFYZUELvYUxmhE | Draft |
| – | Game feel (style options) | `game-feel-demo.html` | https://claude.ai/artifact/UQbCc3uns31YmFbA7oaPc9 | Pick A, B or C, then apply it to every screen |

## Open item for every screen
Every screen still reads more like a **website than a game**. A shared "game feel" layer will be designed later and applied to all screens.

## Home: what the demo shows (2026-11-14)
- Same layout as before: cream page, glass ball, mission cards, rotating headline, Tactile Play and Tutorial buttons. The stones, grass and flowers are gone.
- **Top-right night sky is a painted image** (`assets/home-sky.webp`, cropped to the sky and mirrored so its nebula sits in the corner). It melts into the cream through a pink, ember and amber dusk. Twinkling stars and **shooting-star showers** (steep streaks falling down-left, sometimes three at once) play over it. The team supplied the image, downloaded as a free asset and used non-commercially.
- **Glass ball, bigger (up to 480 px), drawn in WebGL:** it reflects the night sky and every passing shooting star (which also flashes a light on the rocket), with a fresnel rim, one white highlight, a slow light sweep and stardust inside. **All colour effects are orange:** the warm film on the rim, the rotating glow around the ball, the light pool under it and the flash when you switch rockets. The reflection shifts as the mouse moves. Reduce motion freezes all of it.
- **A real NASA rocket spins inside the glass ball.** ◀ ▶ (or the arrow keys) switch between Jupiter-C, Ares I, Saturn V, Space Shuttle and SLS. Drag the ball to spin it. The choice is remembered.
- **Mission cards** show the mission name and difficulty stars, and open mission select for that mission.
- **Settings** (gear, or S): sound effects, reduce motion, tutorial hints, graphics low/high. They are saved in the browser and passed to every screen (the base hides the tutorial callout, uses a lower pixel ratio on Low, and stops motion).
- **Credits** (ⓘ): NASA model credits and the "not affiliated with NASA" line.
- **Keys:** Enter plays, ◀ ▶ switch rockets, S opens Settings, Esc closes a window.

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
- **Windows** (`.t-win`): **solid opaque** fill `#FFFDF8` (glassmorphism dropped on 2026-11-14, with no backdrop blur anywhere); inner tiles and footers use `#F6F1E6`. The same goes for cards, tiles, pills and secondary buttons; 3px ink border, 22px radius, `0 7px 0` ink drop. An **ember ribbon title** (`.t-ribbon`) sits on or over the top edge. The ✗ close sits in the top-right corner.
- **Pills and status** (`.t-pill`): white, 2.5px outline, `0 3px 0` drop, Silkscreen text, blinking amber dot.
- **Badges:** a green tilted `NEW` tag. Difficulty is shown as **stars** (amber filled, `#E4DED2` empty).
- **Spec tiles and list bullets:** cream tiles with outlines and drops; bullets are outlined amber diamonds.
- **Motion:** windows pop in with an overshoot `cubic-bezier(.34,1.56,.64,1)`, press squash is 80ms, and cards lift on hover. Everything is off under reduced motion.
- **Unchanged:** 3D models, colour palette, fonts, layout.

## Base on Earth (2026-11-14)
- The base is no longer in space. It sits on a **block of Earth**, like a diorama: grass on top (Comet banding in greens), soil strata on the sides melting into the cream page. The floating decks, the support columns hanging into the void and the arched bridge lines are gone.
- Decks are now **concrete pads and roads** (with lane dashes). Around them are low-poly **trees, pines, bushes and a pond**.
- The page corner is a **daytime sky** (blue to peach, a soft sun) with **clouds drifting** through it instead of stars.
- The player is a **ground engineer** (white hard hat, hi-vis amber vest with a reflective band, work trousers) instead of an astronaut.
- Workshop halls have **daylight windows** instead of round star portholes.
- **Mission select** uses the same painted night sky and shooting stars as the home screen.

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
- **Launch pad:** the chosen NASA rocket stands next to a simple service tower and launches from it. (NASA's Gantry model was tried and dropped: it is a large sprawling structure that read as a garbled dark mass at this scale.)
- **Models:** see `Design System/models/CREDITS.md`. In the artifact the models ship as base64 `.txt` files because the host serves no `.glb` type. A real build should serve the `.glb` files directly.
- **Colour rule (Mevin):** NASA **rockets and spacecraft parts use their original NASA colours**, lit by a soft hemisphere and sun light. **All markings are removed** (no "USA"/"UNITED STATES" lettering). Everything else, including the base, rooms, procedural stand-ins and the Landsat display, keeps the Comet palette shader.
- Known issue: the NASA "Atlas 9 (Faith 7)" file is dominated by the Mercury capsule and reads as a wide cone. Swap it for a better medium rocket in the build phase.

## Mission control (v2, simplified after feedback)
**What the official brief asks for** (NASA-SPACEAPP-2026/Space-Mission-Design-Game, `documentation/challenge.md`): simulate the mission and evaluate the result, with **understandable feedback that explains why** it succeeded or failed. The brief also suggests random events, a real-time dashboard, vehicle visualisations and a post-simulation report, and players can then **modify the design and re-run**. It does **not** ask for landing; our three missions are orbiters.

**The game part:** the player is the **flight director**. They watch their design fly, and when a **random event** happens the flight **pauses for a decision** with visible consequences. The report then explains how the **design** and the **decisions** produced the score, and sends them back to redesign.

**Screen, one focus at a time:**
- **Big trajectory view (centre):** Comet-style Earth. The rocket launches from the surface and arcs up to orbit, an insertion burn follows, then the spacecraft circles on the dashed orbit. Fires spotted pop up as amber dots, and the night side is shaded (the battery drains there).
- **Phase stepper (top):** Launch → Reach orbit → Check-out → Science 1–4.
- **Three gauges only (top right):** Battery, Storage, Fuel, each with a label and an amber or red state.
- **One caption (bottom left):** the phase name plus one sentence on *what is happening and why*, tied to the player's design (rocket, orbit, instrument). It also shows the fires spotted.
- **Controls (bottom right):** log drawer (hidden by default), 1×/3×, and play/pause.
- **Decision card (centre, pauses the flight):** an icon, a plain explanation and **two choice cards** with consequence tags (+/− fires, battery, resilience). Automatic events show as a toast instead.
- **Report:** a score ring and stars, plus the **four categories, each with a one-line "why"**. Performance names the instrument, Efficiency the fuel, Decisions lists the choices made, and Resilience how safe they were. Then **Fly again** or **Redesign spacecraft**.
- **Moon and Mars missions (build phase):** use the same screen with a transfer arc from Earth to the target, then an orbit-insertion burn at the target. Still no landing.
