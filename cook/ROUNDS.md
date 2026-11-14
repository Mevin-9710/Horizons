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
