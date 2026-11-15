# Brief: Horizons x HTML4 integration

Target: integrate the mechanics of `Design System/reference/horizon-explorers-v4.html` (HTML4) into the Horizons game in OUR design. Stack: three.js r128, static HTML screens bundled by `tools/build-game.py`.
Scope: the playable game only. No video, film, trailer or separate demo.
Spec: `INTEGRATION_PLAN.md` (wins over cook defaults). Build order: 1 launch sim, 2 hangar cinematic, 3 transfer + mission control handoff, 4 nine planets + NASA missions.
References: cook/refs/R01..R05 = current game (look). HTML4 = mechanics and beat timing only, never its look.
Bar (critics, /10, target >= 9): fits our design system, launch spectacle, readability of each beat, pacing (measured: ascent <= 45 s, hangar cinematic 20-40 s, skippable), smoothness (measured frame time vs baseline; one WebGL context per screen, pixel ratio <= 1.5, no per-frame allocations).
Calibration offset: none yet.
Rules: external assets allowed (existing NASA models, assets/home-sky.webp, new NASA 3D Resources models < ~1 MB each, credited). WebAudio + speech voice fine; respect Settings; add Music toggle. Slop ban list does not apply to the existing design system; only to new decoration. No em dashes in new UI text.
Time: hard cap 09:00 IST 15 Nov 2026. Started 23:45 IST 14 Nov (stalled by usage limit 23:45-03:15; real work began 03:16 IST 15 Nov).
Usage: 5 h windows, reset 03:10 IST, next window ends ~08:00 IST. ~20% per hour, never 100%.
Hardware: cloud container, SwiftShader. Frame times pessimistic; compare to baseline.
Deliverable: playable game. No approval gate. After each milestone: rebuild, Playwright test, check stills, commit, push, send stills. Morning: ONE PR with summary, screenshots, known issues, SI/AI usage note.
Permissions: download NASA models yes; push to ccr-be6156b9-8vugxp yes; one PR yes; publish elsewhere no.
User's words: "I love the way the rocket launch works. The liftoff currently is pretty stupid in the current game" / "integrate all of them to our current design without trading off the smoothness or the beauty" / "everything is very slow in this HTML" / "hangar operations stuff should be somehow added in as cutscenes".
