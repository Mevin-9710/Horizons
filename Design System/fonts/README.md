# Fonts

| File | Role | Licence | Status |
|---|---|---|---|
| `GamePaused-DEMO.otf` | **Chosen display font** (titles, buttons, pause and score screens) | 1001Fonts *Free For Personal Use*, see `GamePaused-DEMO-EULA.txt` | OK for the non-commercial hackathon build. **Buy a commercial licence** (https://dharmasstudio.com/game-paused) before any commercial or company use. |
| `Priestacy.otf` | candidate (script) | All rights reserved (Sronstudio) | Not chosen |
| `Godtyr-Regular.otf` | candidate (carved capitals) | All rights reserved (artisantemplate) | Not chosen |

## Rules for Game Paused DEMO (from its EULA)
- **No modification.** We may not add glyphs, rename it or change it. Converting it to WOFF2 unchanged is allowed.
- **No digits in the demo file.** Every number (HUD, score, timers) must use a fallback font. Use **Silkscreen** (free, Open Font License, pixel style, has digits) so numbers match the look. For dense HUD readouts, use the chosen mono.
- **Embedding:** allowed in a personal-use or non-commercial app. Don't offer the font as a download, and don't link to the file in the UI.
- **Commercial use** (selling, ads, a company app, anything that earns money) needs the paid licence first.

Suggested CSS stack:
```css
--f-display: "Game Paused", "Silkscreen", monospace;  /* digits fall through to Silkscreen */
```
