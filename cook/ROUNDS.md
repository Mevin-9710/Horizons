# Cook ledger: Horizons x HTML4 integration

Started: 2026-11-14 23:45 IST (work began 2026-11-15 03:16 IST after the usage reset)
Time: cap 09:00 IST 15 Nov
Bar: design fit 9 | spectacle 9 | beat readability 9 | pacing (measured) | smoothness (measured)
Calibration offset: none yet
Usage: 5h window, about 20% per hour, never 100%
Gate: none (playable game; stills sent after each milestone)
Best so far: baseline 43919bc

Wake-ups: hourly trig_01KvLT8mmx2cT1nDmFWSPnru (delete after PR); one-shots trig_01BVnfZUaxFx1xHmw4pRTwbK and trig_01RsAhHBhKCvSzU4HdxRqK72 already fired.

## Decisions

Made without asking, one line each.
- 03:16 Extra one-shot wake-up at 03:15 IST, because the user said the reset is 03:10 and the planned 03:05 would fire too early.
- 03:20 Launch is a NEW screen (`Design System/launch-demo.html`, shell key `launch`) between base and control, because the base scene is orthographic/isometric and the ascent needs a perspective chase camera; the base does the camera dive into the pad, then the cream iris wipe hands over.
- 03:20 Staging on single-mesh NASA models is done with clipping planes (stage 1 / stage 2 / fairing halves by height fractions per rocket), because the models have no stage nodes.
- 03:20 Events auto-fire after a short grace window if the player misses the cue (score penalty), so the ascent always stays under 45 s.

## User feedback inbox

(none yet)

---

## Round 01

Time: 03:16 to 03:34 IST
Focus: milestones 1 and 2 (launch sim + hangar cinematic), because they are first in the build order.

Changes:
- tools/build-game.py: bundles are rebuilt from the demo sources (+ tools/glue). tools/sim/ascent.cjs: HTML4 ascent physics, shared by the game and the headless test.
- New launch screen (Design System/launch-src.html + launch-src.js -> launch-demo.html, shell key "launch"): Earth diorama pad, NASA rocket cut into stage 1 / stage 2 / fairing halves with clipping planes, pooled fire and smoke, soft plume, day sky -> painted night, shooting stars, chase camera, cue button (auto-fires after a grace), Max-Q hold-to-throttle, minimal HUD, telemetry window on T, voice + music + rumble, fail and orbit cards.
- Hangar cinematic: 6 beats (payload, fairing, mating, rollout, erection, all stations go), skippable (Esc or button).
- Base: Launch dives the camera into the pad and hands over. Mission control starts at Check-out with the flight result.

Stills: cook/stills/r01/ (sheet-cine.jpg, sheet-fly.jpg, sheet-flow.jpg)

Measured:
- Headless ascent (node tools/sim/test-ascent.cjs): all 5 rockets reach orbit; ignition to deploy 28.9 to 39.4 s (perfect cues and all cues missed).
- In game (Playwright, game time): hangar cinematic 24.5 s; Saturn V ascent 32.2 s, orbit 175 x 1242 km; SLS 29.7 s, 192 x 432 km. 5 of 5 cues.
- Frame time under SwiftShader: capped at 50 ms (software GL, about 8 fps wall); 249 draw calls, 34k triangles. Real-GPU frame time: not measured.

Not checked this round:
- Fresh-context critics: not run yet (time spent on building; planned after milestone 3).
- Phone layout of the launch screen, audio by ear.

Own score (logged, never decides): design fit 7.5, spectacle 7.5, readability 8, pacing meets the measured targets.
Top gaps (own): 1) trees and pad are sparse near the horizon, 2) no Earth limb in the chase view until late, 3) 249 draw calls (merge trees), 4) fairing half floats oddly in the first cinematic beat.
Stop check: not done -> next: milestone 3 (transfer + mission control handoff).

## Round 02

Time: 03:34 to 03:40 IST
Focus: milestone 3 (transfer + mission control hand-off).

Changes:
- tools/sim/missions.js: planets, 10 missions (NASA mission per destination), HTML4 plan() Hohmann maths, delta-v capability from rocket + engine.
- Launch screen transfer view: parking orbit -> transfer burn cue -> cruise (9 s, day counter) -> course correction cue -> insertion or flyby -> result card -> mission control. Not enough delta-v: no departure (back to base) or flyby only.
- Mission control receives the flight and transfer result and starts at Check-out.

Stills: cook/stills/r02/sheet-transfer.jpg

Measured (Playwright): Mars with SLS + hydrazine: transit 259 d, capture, 9.65 km/s left. Headless plan(): Moon 3.95, Mars 4.43, Venus 4.01, Jupiter 7.11, Saturn 8.07, Mercury 12.34 km/s; flybys 7.98 to 8.36.
Not checked: critics; other destinations in the browser (next round); phone layout.
Own score: design fit 7.5, readability 7.5 (the wallpaper was too busy behind the orbit lines; dimmed to 42% for the transfer).
Stop check: not done -> next: milestone 4 (planets and NASA mission models in select, base, control).

## Round 03

Time: to 03:44 IST
Focus: milestone 4 (all planets, NASA missions and models).

Changes:
- Mission select: Mercury, Venus, Jupiter, Saturn, Uranus, Neptune and Pluto added (Uranus and Pluto are new bodies); every brief names the NASA mission it follows.
- 8 NASA spacecraft models fetched and converted (all under 1 MB): MESSENGER, Magellan, LRO, MAVEN, Juno, Cassini, Voyager, New Horizons. Shown in the spacecraft workshop and as the craft in the transfer view.
- Base: mission name for every destination; a 7th HUD gauge, delta-v (rocket + engine against the Hohmann need), red blocks the launch.
- Mission control: units, texts, events and the planet's colours follow the mission.
- Every screen now gets tools/sim/missions.js from the build.

Stills: cook/stills/r02/sheet-planets.jpg
Measured: select lists 10 missions on 9 bodies + Moon; base (Saturn, Jupiter-C + cold gas) shows 3.6/8.1 km/s in red.
Not checked: Moon and flyby transfers in the browser (next), critics, phones.
Decisions: New Horizons uses only the STL "body" part (NASA ships it as loose print parts). Flyby missions still show an orbit ring in mission control.
Stop check: build order complete; now critics and polish until the cap.
