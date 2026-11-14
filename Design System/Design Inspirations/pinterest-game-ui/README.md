# Inspiration 03: Pinterest board "Game UI Design"

- **Source:** https://in.pinterest.com/ilairaz/game-ui-design/ (820 pins)
- **Captured:** 2026-11-14. Pinterest only loads about 20 pins without logging in, so **17 pins** were collected (`pins/`, combined in `contact-sheet.jpg`). They cover the board's main styles: casual mobile, card battlers, level maps and RPG inventory.
- **Use in Horizons:** the "game feel" layer for every screen. Only how the UI chrome looks changes (buttons, windows, bars, badges). **3D models, colour palette and fonts stay the same.**

## Why our screens still look like a website
Our UI is flat glass cards, thin 1px hairlines, small grey uppercase labels and pill links. That is the language of a SaaS landing page. Every pin uses the opposite: **thick, physical, readable-at-a-glance objects that react when touched.**

## Patterns seen across the pins

| # | Pattern | Seen in | What it does |
|---|---|---|---|
| 1 | **Chunky 3D buttons**: thick outline, a darker "lip" underneath, a top gloss line, and a squash when pressed | almost every pin (green ✓, red ✗, SHOP/ARENA, START) | Makes buttons feel like physical things you push |
| 2 | **Resource bar at the top**: icon, number, then a `+` chip, in rounded capsules | coin/gem bars, 23 / 100,485 | The player always sees their resources. For us these are the HUD metrics. |
| 3 | **Round icon buttons** with badges and notification dots | settings, back, check, shop icons | Quick actions without text |
| 4 | **Ribbon / banner titles**: a cloth banner or angled plate behind the title | "MAGIC POWER", "Начало боя!", "STATS / WEAPONS" | Turns headings into objects and gives every screen a moment |
| 5 | **Framed windows**: a thick border, a coloured header strip, an inner panel and a close ✗ in a corner | inventory, hero select, scroll map | Windows feel like game dialogs, not web cards |
| 6 | **Chunky progress bars**: a thick track, a bright fill, a highlight stripe and a number inside | 46/50, 1250 wave bar | Progress you can read at a glance |
| 7 | **Bottom dock** of big icon tiles with labels | Daily puzzle / Gift bag / Shop, mail and event dock | The game's main navigation |
| 8 | **Stickers and stamps**: tilted labels, hard offset shadows | "ALL YOUR STUFF", "NEW", "LEVEL 107" | Personality and hierarchy |
| 9 | **Stars, levels and nodes**: numbered circles on a path, star ratings | level maps | Progress and replay value |
| 10 | **Motion**: pop-in with overshoot, bounce, sparkles and a counter tick-up | implied everywhere | Feedback that rewards actions |

## What Horizons should add
1. Swap the pill links for **chunky pressable buttons** with a lip and a squash on press.
2. A **top resource bar** for the six metrics (mass, budget, power, data, comms, time), shown as icon capsules with chunky bars.
3. **Windows with a header plate and a ✗ close** for the mission brief, workshops and report.
4. **Ribbon titles** for screen names and big moments ("MISSION BRIEF", "LIFTOFF!").
5. A **bottom dock** of icon tiles: Missions · Workshop · Launch pad · Mission control (locked until launch) · Settings.
6. **Badges and notification dots**: NEW, difficulty stars, a lock icon on locked items.
7. **Toasts and callouts** with a pop and a pointer arrow, for the tutorial ("Heavier means less fuel. Keep bars green.").
8. **Motion rules**: pop-in with overshoot, press squash, counters that tick up, and a soft sparkle on success. All of it respects reduced-motion.

Three styles that use these ideas are in the **Game Feel** artifact (`Design System/game-feel-demo.html`). One will be chosen, then applied to every screen.
