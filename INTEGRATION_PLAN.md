# Integration plan: HTML4 mechanics into Horizons

This is the spec for the overnight integration run (14–15 Nov 2026). The run keeps its progress log at the bottom of this file. **Read the whole file before starting or resuming.**

- **Source of mechanics:** `Design System/reference/horizon-explorers-v4.html` ("HTML4", The Horizon Explorers v4.1).
- **Source of look and feel:** the current game (`game/index.html`, built from `Design System/*-demo.html`) and `Design System/Screens.md`.
- **Rule:** we take HTML4's *mechanics* and rebuild them in *our* design. We never trade away our smoothness or beauty.

## Decisions from the interview

| Topic | Decision |
|---|---|
| Favourite part of HTML4 | The **rocket launch** (ignition → liftoff → Max-Q → MECO → separation → stage 2 → fairing → SECO → payload). Our current liftoff is weak; replace it. |
| "HTML4 is slow" | **Pacing**, not frame rate. Everything must move faster. |
| Ascent time | **Under 45 s** from ignition to payload in orbit. Use time-scaling or warp between beats; keep each beat readable. |
| Player control in flight | **Autopilot flies the gravity turn; the player triggers the events** (MECO, separation, stage 2 ignition, fairing, deploy) on cue, with a Max-Q throttle-down as a skill moment. Manual pitch/throttle is optional for a bonus. |
| Hangar operations | A **skippable auto cinematic** (aim for 20–40 s; one tap or key skips it): payload processing, fairing encapsulation, stage mating and inspection, transporter rollout, erection at the pad. |
| How the launch starts | **Seamless zoom from the base**: the isometric camera dives into the launch pad, the hangar cinematic plays, then the camera swings to a low launch angle. Same Earth-diorama style, not a separate realistic world. |
| Go/no-go poll and HUD | **Minimal**: no long poll (at most a 1–2 s "ALL STATIONS GO" beat); in flight just altitude, speed and the next-action button. **All the other HTML4 telemetry** (accel, dynamic pressure, pitch/AoA, perigee/apogee, throttle, stage props, structural load, autopilot) is an **optional toggle** (button and key T), off by default. |
| After orbit | **Transfer**: TPI burn, cruise with time warp, a course correction (TCM) and orbit insertion (or flyby). **Music and voice callouts** (countdown, "Liftoff", "Max-Q", "MECO"…; respect Settings: sound effects on/off, add a music toggle). **Not wanted:** lander/rover mini-game, quiz. |
| Mission control | **The launch replaces the old flight sequence.** Our mission control console takes over **once the spacecraft is in orbit or on its way** (cruise to a planet), running the operations slices, events and decisions, then the report. |
| Destinations | **All 9 planets** (Mercury → Pluto) plus the Moon. Missions only where **NASA has a real mission and we have (or can fetch) its NASA model** (table below). |
| Rockets and site | **Our 5 NASA rockets** (Jupiter-C, Ares I, Saturn V, Space Shuttle, SLS) with real-ish thrust/staging numbers mapped onto HTML4's physics. **One launch site:** our Earth base. |
| Look | **Our design language** throughout: cream page, Tactile UI, Comet-shader banding, orange flame and smoke, Earth diorama pad. As the rocket climbs, the sky darkens into our painted night with shooting stars (`assets/home-sky.webp`). HTML4 physics underneath. |
| New models | **Allowed: NASA only.** Fetch from NASA 3D Resources, convert with `tools/model-convert`, credit in `Design System/models/CREDITS.md`, keep each file small (aim < 1 MB). |
| Shipping | **Commit and push after every finished milestone** to the working branch; **open one PR in the morning** with screenshots. |

## Build order (if time runs out, earlier items win)
1. **Launch and staging sim:** new liftoff and ascent in our style, under 45 s, autopilot plus player-triggered events, minimal HUD plus optional full telemetry, voice callouts and music.
2. **Hangar cinematic:** skippable, seamless zoom from the base pad.
3. **Transfer and mission control handoff:** TPI, cruise (warp), TCM, insertion/flyby; mission control takes over in orbit or in cruise; report at the end.
4. **9 planets and new missions** with NASA models (table below), in mission select and the whole flow.

## Planet missions (NASA mission → model in NASA 3D Resources `3D Models/`)
| Destination | Mission in game | NASA model | Type |
|---|---|---|---|
| Mercury | MESSENGER | `MErcury Surface, Space ENvironment, GEochemistry, and Ranging (MESSENGER)` | orbiter |
| Venus | Magellan (radar mapping) | `Magellan` | orbiter |
| Earth | Wildfire watch (existing) | Landsat 8 already in repo | Earth orbit (no transfer) |
| Moon | Lunar polar ice (existing) | `Lunar Reconnaissance Orbiter (A)` | lunar orbiter |
| Mars | Mars atmosphere (existing; this *is* MAVEN) | `Mars Atmosphere and Volatile EvolutioN (MAVEN) (A)` | orbiter |
| Jupiter | Juno | `Juno (A)` | orbiter |
| Saturn | Cassini-Huygens | `Cassini-Huygens (A)` | orbiter |
| Uranus, Neptune | Voyager 2 | `Voyager Probe (A)` | flyby |
| Pluto | New Horizons | `3D Printing/New Horizons` (STL) | flyby |

Use HTML4's `plan()` (Hohmann transfer, patched conics) for each destination's TPI and OI delta-v, transit time and phase angle; flybys skip OI. The delta-v budget joins the HUD metrics and the trade-offs in the base.

## Technical notes (learned the hard way)
- **Where the code lives:** each screen's source is `Design System/<screen>-demo.html`. `game/index.html` (the deploy build) and `Design System/horizons-game.html` hold all screens as JSON in `<script id="screens" type="application/json">`. Today the edits are applied to the demo and to both bundles by Python scripts. **Step 0 of the run:** add `tools/build-game.py`, which rebuilds both bundles from the demo files (home gets a `<!doctype html>` + viewport prefix; JSON is written with `json.dumps(d).replace('</','<\\/')`). After that, edit only the demo sources and rebuild.
- **Models:** shipped as base64 GLB text in `game/models/*.txt` (the host serves no `.glb` type). Screens fetch `models/<name>.txt` and fall back to `models-b64/`.
- **Never** do `arr.push(...bigArray)` on model vertex arrays (stack overflow on big models); use a loop.
- **Python pitfall:** `open(p,'w').write(f(open(p).read()))` truncates the file before reading it. Read first, then write.
- **Testing:** `python3 -m http.server 8765 --directory game` and Playwright with `chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']})`. Changing only the URL hash does **not** reload the shell; call `page.reload()` between screens. Screens run in an iframe: use `page.frames().find(f=>f!==page.mainFrame())`.
- **Performance budget:** one WebGL context per screen, pixel ratio ≤ 1.5 (Settings "Low" = 1), pause when the tab is hidden, pooled particles (HTML4's `PS` class is fine), no per-frame allocations.
- **Settings:** the shell carries `window.HZ.settings` (sfx, motion, hints, gfx) to every screen. Respect Reduce motion (no shake, no particles bursts) and Sound effects; add a Music toggle in the home Settings.

## Progress log
(The run appends one line per finished milestone: date/time IST, what was done, the commit hash.)
- 03:34 IST 15 Nov: step 0 (tools/build-game.py), milestone 1 (launch sim, new `launch` screen) and milestone 2 (hangar cinematic, base dive hand-off, control starts at check-out) done. See cook/ROUNDS.md round 01.
