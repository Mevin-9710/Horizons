# Fonts

| File | Role | Licence | Status |
|---|---|---|---|
| Game Paused DEMO (embedded as base64 in the screen sources; the raw `.otf` is not kept in this public repo, as its EULA asks) | **Chosen display font** (titles, buttons, pause and score screens) | 1001Fonts *Free For Personal Use*, see `GamePaused-DEMO-EULA.txt` | OK for the non-commercial hackathon build. **Buy a commercial licence** (https://dharmasfoundry.com/game-paused) before any commercial or company use. |

Two rejected candidates (Priestacy, Godtyr) were removed: both are all rights reserved.

## Rules for Game Paused DEMO (from its EULA)
- **No modification.** We may not add glyphs, rename it or change it. Converting it to WOFF2 unchanged is allowed.
- **No digits in the demo file.** Every number (HUD, score, timers) must use a fallback font. Use **Silkscreen** (free, Open Font License, pixel style, has digits) so numbers match the look. For dense HUD readouts, use the chosen mono.
- **Embedding:** allowed in a personal-use or non-commercial app. Don't offer the font as a download, and don't link to the file in the UI.
- **Commercial use** (selling, ads, a company app, anything that earns money) needs the paid licence first.

Suggested CSS stack:
```css
--f-display: "Game Paused", "Silkscreen", monospace;  /* digits fall through to Silkscreen */
```
