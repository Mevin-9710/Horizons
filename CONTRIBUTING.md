# Contributing to Horizons

Thanks for helping. A few rules keep the game in one piece.

## Where to change things

| You want to change | Edit this | Not this |
|---|---|---|
| A screen (home, mission select, base, launch, mission control) | `Design System/<screen>-demo.html`, or `Design System/launch-src.html` + `launch-src.js` for the launch | `game/index.html` |
| How screens hand over to each other | `tools/glue/<screen>.html` | |
| Mission data, physics, scoring | `tools/sim/missions.js`, `tools/sim/ascent.cjs` | |
| Tutorial coach, music | `tools/sim/coach.js`, `tools/sim/music.js` | |
| NASA models | add the `.glb` to `Design System/models/`, its base64 text to `game/models/`, and a row to `Design System/models/CREDITS.md` | |

`game/index.html` is **generated**. After any change run:

```bash
npm run build      # python3 tools/build-game.py
```

and commit the rebuilt `game/index.html` with your change. CI fails if it is out of date.

## Test

```bash
npm start                       # serves game/ on http://localhost:8765
npm install                     # once, for Playwright
npm run test:tutorial           # plays the whole tutorial
npm run test:full               # one full mission, design to report
npm run test:balance            # every mission has a feasible design
```

## Style

- Keep the existing look: cream page, thick ink outlines, Tactile buttons. New UI reuses the existing classes.
- No em dashes in game text.
- Work on a branch and open a pull request. Please don't upload files straight onto someone else's branch.
