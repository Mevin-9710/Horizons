# Horizons

**Design a space mission, launch it, and see if your trade-offs held up.**
Solo, or co-op for up to 4 players. Built for the **NASA Space Apps Challenge 2026**, challenge: *"Space Mission Design Game"*.

## Current phase: Step 1 — Design

> **This repository is in Step 1, the design phase.**
> The design phase is **independent** of the other phases. It produces the visual direction, design inspirations and design system in [`Design System/`](./Design%20System/).
> The **build phase** (3D scenes, character, HUD, UI implementation) may be done by other people or AI agents. They should treat `Design System/` as the source of truth for the look and feel, and the gameplay design below as the source of truth for behaviour.

| Phase | Status |
|---|---|
| 1. Design (inspirations → design system → screen designs) | **In progress** |
| 2. Build (scenes, HUD, UI, integration) | Not started in this repo |

## The game in brief

1. **Intro**: a short intro, then Play.
2. **3D solar system**: click a planet to see its missions (Earth: *Wildfire watch*, Moon: *Lunar polar ice*, Mars: *Mars atmosphere*).
3. **Pick a mission**: enter a 3D isometric base with a character (keyboard, or a joystick on mobile).
4. **Visit the workshops**: rocket workshop (rocket and orbit), spacecraft workshop (bus, power, comms, instruments, engine), and the launch pad.
5. **Watch the HUD**: six metrics are always visible (mass, budget, power, data, comms, time). Red blocks the launch and shows a hint.
6. **Launch**: the simulation runs launch, navigation and four operations slices, with random events.
7. **Mission control**: a full-screen console with the timeline, live telemetry, an event log and the mission status.
8. **Report and retry**: a score out of 100 (performance 40, efficiency 20, decisions 20, resilience 20).

**First-time tutorial (top priority):** a 30-second guided mini mission (Wildfire watch). It teaches by doing, shows one line per step, and has a Skip button that is always visible.

**Co-op:** each player owns some of the metrics (mission lead: time; structures: mass; power and comms: power, data, comms; finance: budget). Every player must approve the launch.

## Repository layout

```
Design System/
  Design Inspirations/       one folder per reference: screenshots, extracted HTML/CSS, a written report
    perplexity-computer/     glass-sphere hero, the main reference for the intro screen
src/                         app scaffold (Vite + React + TypeScript), for the build phase
```

## Tech (scaffold)

React + TypeScript + Vite.
```bash
npm install
npm run dev
npm run build
```
