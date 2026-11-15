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
- 03:40 IST 15 Nov: milestone 3 (transfer: burn, cruise, course correction, insertion or flyby; mission control hand-off) done. See cook/ROUNDS.md round 02.
- 03:44 IST 15 Nov: milestone 4 (10 missions on all planets + Moon, 8 NASA spacecraft models, delta-v gauge, mission-aware mission control) done. See cook/ROUNDS.md round 03.
- 08:03 IST 15 Nov: user feedback applied (original base HUD restored, delta-v moved into the pad check); trees merged (249 -> 10 draw calls); Music toggle. PR opened.

---

# Phase 2: home extras and the rest of HTML4 (15 Nov 2026)

## What HTML4 has that the game still lacks
| HTML4 part | In our game? |
|---|---|
| Mini-games: Max-Q throttle timing, Sequence order (tap launch events in order) | No |
| Lander & rover mini-game (soft landing, then drive and collect 5 samples in 40 s) | No |
| Rocket anatomy (tap a part, learn what it does) | No |
| Operations manual (controls, flight procedure) and Warnings & how to fix them | No |
| Difficulty: Cadet (+25% delta-v, autopilot on), Pilot, Commander (-15% delta-v, autopilot off, score x1.5) | No |
| Mission team (9 console roles), go/no-go poll, comms chatter | No (skipped as "minimal" in phase 1) |
| Tutorial slides + 30 s spoken audio guide with captions | Partly (our Tutorial button starts a walkthrough, no slides or audio guide) |
| 13 music themes that follow the phase | Partly (one quiet music bed) |
| Space quiz, rocket-equation toy | No (not wanted) |
| Payload builder extras (name, rover / lander legs / relay add-ons) | No (not wanted) |
| 6 launch sites, GitHub template page | No (not wanted) |

## Challenge brief (official Details and Resources tabs, saved by the user 15 Nov 2026)
**Ask:** an interactive game where players design, manage and simulate a complete mission: define an objective, set requirements, design the spacecraft, pick instruments, launch vehicle and orbit, and manage budget, mass, power, communications, data and lifetime. Solo or a team of up to 4. A strong solution has a clear UI, a mission configuration system, resource management, **collaboration/multiplayer for up to 4**, and simulation + evaluation with feedback.

| Brief asks for | Horizons today |
|---|---|
| Objective first, then design | Yes (mission select brief, then workshops) |
| Every decision has a consequence, no single right answer | Yes (HUD trade-offs, delta-v, events) |
| Components: structure, power, **batteries**, comms, **onboard computer**, **attitude control**, instruments | Bus, power, comms, instrument, engine. Missing: batteries, computer, attitude control |
| Simple vs advanced components by difficulty | No |
| Several orbits, each explained (coverage, comms, lifetime) | 2 orbits, little explanation |
| Launch check: mass and orbit vs vehicle | Yes (mass vs capacity, delta-v) |
| Clear resource dashboard | Yes (6 gauges; live in mission control) |
| **Team mode, up to 4, roles, negotiation** | **No** (only described in the README) |
| Scoring + why it succeeded or failed | Yes (report), could explain more |
| Difficulty levels | Planned (Cadet/Pilot/Commander) |
| Multiple scenarios | Yes (10 missions) |
| Random events | Yes (mission control) |
| Leaderboards | No |
| Save, share, compare designs | No |
| Competitive team scenarios | No |
| Sandbox mode | No |
| Post-mission analysis | Partly (report) |
| Short explanations, tutorials, optional learning | Partly (tutorial walkthrough); Manual planned |

**Resources tab (NASA):** Design and Develop Science Missions (launch, space, ground and user segments); GMAT; JPL Concept Maturity Levels; GSFC Mission Design Lab (office hours, concept development, trade studies, point design); NASA Mission Viz; Webb "build a telescope" learning game (objectives drive instruments; 3 levels; ends by naming real NASA missions like yours); CubeSat 101; 2023 VR mission challenge. Partner: CSA digital games.

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
- 03:40 IST 15 Nov: milestone 3 (transfer: burn, cruise, course correction, insertion or flyby; mission control hand-off) done. See cook/ROUNDS.md round 02.
- 03:44 IST 15 Nov: milestone 4 (10 missions on all planets + Moon, 8 NASA spacecraft models, delta-v gauge, mission-aware mission control) done. See cook/ROUNDS.md round 03.
- 08:03 IST 15 Nov: user feedback applied (original base HUD restored, delta-v moved into the pad check); trees merged (249 -> 10 draw calls); Music toggle. PR opened.

---

# Phase 2: home extras and the rest of HTML4 (15 Nov 2026)

## What HTML4 has that the game still lacks
| HTML4 part | In our game? |
|---|---|
| Mini-games: Max-Q throttle timing, Sequence order (tap launch events in order) | No |
| Lander & rover mini-game (soft landing, then drive and collect 5 samples in 40 s) | No |
| Rocket anatomy (tap a part, learn what it does) | No |
| Operations manual (controls, flight procedure) and Warnings & how to fix them | No |
| Difficulty: Cadet (+25% delta-v, autopilot on), Pilot, Commander (-15% delta-v, autopilot off, score x1.5) | No |
| Mission team (9 console roles), go/no-go poll, comms chatter | No (skipped as "minimal" in phase 1) |
| Tutorial slides + 30 s spoken audio guide with captions | Partly (our Tutorial button starts a walkthrough, no slides or audio guide) |
| 13 music themes that follow the phase | Partly (one quiet music bed) |
| Space quiz, rocket-equation toy | No (not wanted) |
| Payload builder extras (name, rover / lander legs / relay add-ons) | No (not wanted) |
| 6 launch sites, GitHub template page | No (not wanted) |

## Challenge brief (Details tab, from a participant mirror; the official page was unreachable from the container)
Expected journey: objectives first, design spacecraft and payload, pick launcher/destination/orbit, check mass/energy/budget/data/comms/lifetime, simulate, then revise from the report. No single right answer; feedback must explain consequences.
Design considerations: clear UI, **tutorials, progressive difficulty and scenarios**; explicit goals and realistic constraints; satellite subsystems; payload trade-offs; orbits (coverage, windows, lifetime); launch compatibility; understandable resource indicators; evaluation of performance, efficiency and decision quality with explanations; co-op for up to 4 with distinct roles.
Extras named in the brief: multiple scenarios, unexpected events, final reports, **design comparisons, leaderboards**, team competition, sandbox, post-mission analysis.
Resources tab: could not be read (site returned 503/502 to this container). Search results point at NASA GMAT, NASA Eyes on the Solar System and NASA 3D Resources; verify on the official page.

## Decisions from the interview
- Home: the 3 mission cards become **Mini-games, Rocket anatomy, Manual** (same card style). Missions stay behind Play.
- Mini-games window: Max-Q timing, Sequence order, Lander & rover.
- Lander & rover: **3D in our style** (isometric diorama), playable from the home AND as a phase of the Moon and Mars missions after orbit insertion. Models: Apollo Lunar Module (Moon) and Perseverance (Mars), from NASA 3D Resources (no preference given; default).
- Rocket anatomy: tap parts of a NASA rocket model in 3D.
- Manual window: Controls, Flight procedure, Warnings & fixes.
- Difficulty: Cadet / Pilot / Commander as a row in Settings.
- Go/no-go: quick poll before the count, console roles only (no named crew), comms captions during flight.
- Tutorial button: slides + 30 s spoken guide with captions, then the walkthrough mission.
- Music: auto themes by phase (no preference given; default).
- Original design stays: new things use existing styles only.

## Decisions, round 2 (after reading the official brief)
- **Co-op: online rooms, peer to peer** (WebRTC through the free public PeerJS broker). The host's browser runs the room; up to 3 others join with a 5-letter code. Roles own gauges (mission lead: time; structures: mass; power & comms: power, data, comms; finance: budget); every player must give GO to launch; events go to the owning role. No accounts or server. Known limits: host must stay connected; some strict networks block peer connections (fallback: solo).
- **New parts:** batteries, onboard computer, attitude control; more orbits, each explained (coverage, comms passes, lifetime).
- **Brief extras:** local leaderboard, save and compare designs, sandbox mode, "real NASA mission like yours" in the report.
- **Order:** brief gaps first, then the HTML4 extras.

## Build order
1. Difficulty (Cadet / Pilot / Commander) in Settings, simple vs advanced parts by difficulty.
2. New parts (batteries, computer, attitude control) and more orbits with explanations.
3. Co-op online rooms (PeerJS): lobby, roles, shared design, everyone's GO, events to roles.
4. Report extras: "real NASA mission like yours", save and compare designs, local leaderboard.
5. Sandbox mode.
6. Home cards (Mini-games, Rocket anatomy, Manual with Warnings & fixes).
7. Mini-games: Max-Q timing, Sequence order.
8. Rocket anatomy.
9. Go/no-go poll + comms captions.
10. Tutorial slides + audio guide.
11. Lander & rover (3D), from home and in Moon/Mars missions.
12. Music themes by phase.
