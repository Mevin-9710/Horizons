# NASA Space Apps 2026: project submission text

**Team HZN**: Mevin Joseph Seby and Pawan Indalkar

Copy each block into the matching field on the team's Project page (My Team → Project → Edit). Everything here follows the 2026 Project Submission Guide and the Judging & Awards Guide.

**Deadline:** Sunday, November 15, 11:59 p.m. local time of your Local Event (Universal Event: the Team Owner's local time). Only the last saved submission counts, and you can resubmit until the deadline.

---

## Project Name

```
Horizons: Design a Mission, Launch It, Learn Why
```

## High-Level Project Summary

```
Horizons is a free browser game that turns real space mission design into play. You pick one of ten destinations, each modelled on a real NASA mission (Landsat, LRO, MAVEN, MESSENGER, Magellan, Juno, Cassini, Voyager 2, New Horizons). You build a spacecraft part by part, with mass, budget, power, data, comms and time all live. Then you pick one of five NASA rockets and an orbit, fly a real ascent (Max-Q, staging, fairing, deploy) and a transfer with real delta-v. Finally, you run the mission from mission control. A report out of 100 explains every point and compares your design with the real NASA one. It answers the challenge by making the trade-offs engineers face visible and hands-on, so anyone can learn why missions are built the way they are, in under ten minutes, on any device.

BUILT BY A SOFTWARE ENGINEER AND AN AEROSPACE ENGINEER: Team HZN pairs Mevin Joseph Seby, the software engineer who built the game, with Pawan Indalkar, an undergraduate aerospace engineering student who made sure the spaceflight is real. Pawan's aerospace training shaped the launch physics, the staging, the orbital transfers and the spacecraft trade-offs; Mevin turned that engineering into a fast, polished game anyone can play.
```

## Link to Project Demo

30-second video (English captions):

```
https://horizons-delta-ten.vercel.app/demo.mp4
```

It plays directly in any browser. The same file is in the repo at `docs/demo/horizons-demo.mp4`. A YouTube upload (Public or Unlisted) also works, if you'd rather paste that. Test the link in a private window first.

## Link to Final Project

```
https://horizons-delta-ten.vercel.app
```

Source code (mention it in the description too): `https://github.com/Mevin-9710/Horizons`

## Detailed Project Description

```
THE TEAM: SOFTWARE MEETS AEROSPACE
Horizons was built by two engineers with complementary expertise.
- Pawan Indalkar, lead flight engineer, is an undergraduate aerospace engineering student. His aerospace knowledge is the backbone of the game's realism. He built The Horizon Explorers, the launch simulator whose physics Horizons' launch is based on: the ascent model (thrust, drag, an exponential atmosphere, dynamic pressure and Max-Q, the gravity turn, two-stage staging, the orbit computed from the state vector). His understanding of orbital mechanics and spacecraft systems grounds the rest of the physics: Hohmann transfers and delta-v budgets for each destination, a heavier payload costing a rocket its delta-v, and sunlight falling with distance, which is why Mars missions fly solar wings and Saturn missions need RTGs. He also sourced NASA 3D models for the launch.
- Mevin Joseph Seby, lead mission engineer, is the software engineer who turned that engineering into a game. He designed and built the software: the screens and their flow, the walk-around isometric base, the spacecraft builder with its live gauges, the 3D launch and transfer scenes, mission control, the scoring and the hands-free tutorial. He also built the build pipeline and automated tests, the visual design and the deployment. He directed the AI coding assistant that helped write the code.
Together: Pawan made sure every number means something; Mevin made sure anyone can feel it in a few minutes.

WHAT IT DOES
Horizons is a mission-design game for everyone, from students to space fans. In one loop you:
1. Choose a mission. Ten worlds, each with three science goals, a budget, a build time and a delta-v requirement, based on a real NASA mission.
2. Build the spacecraft. In a walk-around isometric base you carry parts from subsystem stations to a build stand: bus, solar wings or an RTG, battery, comms dish, storage, engine, fuel tank and up to three instruments. Six live gauges (mass, budget, power, data, comms, time) turn red the moment a trade-off breaks. Sunlight falls with distance from the Sun, so wings that work at Mars fail at Saturn.
3. Pick a rocket and an orbit. Jupiter-C, Ares I, Saturn V, Space Shuttle or SLS. A heavier payload means less delta-v. Each orbit changes shadow time, ground passes and science.
4. Launch. A hangar cinematic, then a physics-based ascent: the autopilot flies the gravity turn and you fire each event on cue (throttle down for Max-Q, stage separation, second-stage ignition, fairing, engine cutoff, deploy).
5. Travel. Transfer burn, a cruise with time warp, a course correction, then orbit insertion or a flyby, with the delta-v you actually have left.
6. Operate. Mission control simulates the spacecraft you built, phase by phase: battery, storage and fuel, random events and decisions that trade science against safety.
7. Learn. A score out of 100 (performance 40, efficiency 20, decisions 20, resilience 20), explained line by line, compared with your last flight and with the real NASA mission.

A tutorial coached by our two lead engineers walks through a whole mission. It is hands-free: just press Next. Mevin (software) coaches the ground part: mission choice, base and spacecraft design. Pawan (aerospace) takes over for the launch and mission control.

HOW IT WORKS
A static web app: HTML, CSS and JavaScript with three.js (WebGL) for 3D. There is no install and no account, and it runs on desktop and phones. The launch uses a 2D ascent integrator (thrust, drag, an exponential atmosphere, dynamic pressure, gravity turn, staging, orbit from the state vector), ported from Pawan's launch simulator The Horizon Explorers, drawing on his aerospace engineering studies of ascent dynamics and orbital mechanics. Transfers use Hohmann delta-v budgets. A Python script builds the single-page game from the screen sources. Playwright tests play the full tutorial and full missions automatically, and CI checks every push. The music is generated live in the browser with Web Audio and changes with each phase.

BENEFITS AND GOALS
Real mission design is all trade-offs, and they are hard to see in a textbook. Horizons makes them physical: you feel why Juno needed huge wings, why Voyager needed RTGs and why a bigger rocket isn't always better. We want it in classrooms and space clubs as a free, open-source mission lab.

TOOLS
JavaScript, HTML5, CSS, three.js r128 (WebGL), Web Audio API, Python (build), Playwright (tests), gltf-transform (model conversion), GitHub, Vercel. AI assistance: Claude (Anthropic), used as a coding assistant (see the AI disclosure on GitHub).

Open source (MIT): https://github.com/Mevin-9710/Horizons
```

## Use of Super Intelligence (SI)

(Only for data collection; judges don't see this field, but they do see the markings in the project.)

```
Yes. We used Claude (Anthropic), through Claude Code, as an AI coding assistant. The idea, the game design, the choice of missions and NASA data, and every design decision are the team's (Mevin Joseph Seby and Pawan Indalkar). Pawan's launch simulator, The Horizon Explorers, is the basis of the launch mechanics. We directed the work, reviewed and playtested every build, and decided every change. Claude helped write and refactor the code. No generative AI images, video or audio were used: the portraits are drawn in code (SVG), the music is synthesised by the game's code, and the demo video is put together by code from real gameplay screenshots, with music the team chose (zec53, Pixabay) and launch sounds synthesised in code. As a precaution, the portraits and the demo video carry a small "AI-assisted" mark. This is disclosed in the README (AI disclosure section), in the game's Credits, in the page metadata and in package.json.
```

## NASA Data

```
- NASA 3D Resources (science.nasa.gov/3d-resources, github.com/nasa/NASA-3D-Resources): every rocket and spacecraft in the game is a real NASA model: Jupiter-C, Ares I, Saturn V, Space Shuttle, SLS, Orion, Mercury (Faith 7), Mobile Launcher, Apollo Lunar Module, Mars Reconnaissance Orbiter, Landsat 8, LRO, MAVEN, MESSENGER, Magellan, Juno, Cassini, Voyager, New Horizons, the NASA Satellite Kit (bus, solar wings, radios) and the Infrared Camera.
- NASA mission data: each of the ten missions follows a real NASA mission. Its objective, instruments, launch vehicle, mass, launch year and power source (solar or RTG) appear in the post-flight report next to the player's own design (Landsat 8, LRO, MAVEN, MESSENGER, Magellan, Juno, Cassini-Huygens, Voyager 2, New Horizons).
- Planetary and orbital data: orbital distances for the transfers and delta-v budgets, and sunlight falling with distance from the Sun for solar power, based on NASA planetary data.
```

## Space Agency Partner Data and Other References

```
Code and libraries: three.js r128 (MIT) with GLTFLoader and BufferGeometryUtils; Web Audio API; Playwright (tests); gltf-transform (model conversion); Python 3 (build).
Hosting: Vercel (game), GitHub (code, demo video).
Fonts: Game Paused DEMO by Dharmas Studio (free for personal and non-commercial use); Silkscreen and Geist (SIL Open Font License, Google Fonts).
Images: home-screen night-sky image (free asset, used non-commercially).
Music (demo video): "Piano and Strings Ambient (Confident and Light)" by zec53, Pixabay (Pixabay Content License). All other visuals are made in code or are NASA 3D models.
Design inspiration only (not used in the game, all rights reserved by their owners): Perplexity's "Computer" and "Comet" web pages, a Pinterest "Game UI Design" board, and the isometric "Space Level Kit" asset pack.
Launch mechanics: ported from The Horizon Explorers, the team's own launch simulator (Pawan Indalkar).
AI assistance: Claude (Anthropic), see the SI field and the README's AI disclosure.
3D models courtesy of NASA. Horizons is not affiliated with or endorsed by NASA.
Source code: https://github.com/Mevin-9710/Horizons (MIT licence)
```

---

## Checklist before pressing "Submit for Judging"

- [ ] Every team member is registered, on the same Local Event (not waitlisted) or the Universal Event, and appears on the Members tab.
- [ ] Every required field is filled. All text is in English.
- [ ] Demo link and final project link open in a private window with no login.
- [ ] The demo is 30 seconds or less (ours is 29.5 s).
- [ ] Tick "I have read and understand the project submission requirements…".
- [ ] Tick "I confirm that the submitted project represents my team's original work…". Every external resource is listed in References above.
- [ ] Press **Submit for Judging** and wait for the confirmation banner. Then download your participant certificate from Profile → Participant Information.
