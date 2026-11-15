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

BUILT BY A SOFTWARE EXPERT AND AN AEROSPACE ENGINEER: Team HZN pairs Mevin Joseph Seby, the software expert who built the game, with Pawan Indalkar, an undergraduate aerospace engineering student who made sure the spaceflight is real. Pawan's aerospace training shaped the launch physics, the staging, the orbital transfers and the spacecraft trade-offs; Mevin turned that engineering into a fast, polished game anyone can play.
```

## Link to Project Demo

30-second video (English captions):

```
https://horizons-delta-ten.vercel.app/demo.mp4
```

It plays directly in any browser. The same file is in the repo at `docs/demo/horizons-demo.mp4`. A YouTube upload (Public or Unlisted) also works, if you'd rather paste that. Test the link in a private window first.

## YouTube upload (for the demo link)

Upload `docs/demo/horizons-demo.mp4`. Visibility: **Public** (or Unlisted). Audience: **No, it's not made for kids**. Altered or synthetic content: **No** (nothing realistic is AI-generated; it's real gameplay). Category: Education or Science & Technology. Then paste the YouTube link in "Link to Project Demo".

**Title**
```
Horizons: Design, Launch & Fly Your Own Space Mission | NASA Space Apps 2026 | Team HZN
```

**Description**
```
Horizons is a free browser game where you design a real space mission, launch it and find out if your trade-offs hold up. Built by Team HZN for the NASA Space Apps Challenge 2026 (challenge: Space Mission Design Game).

▶ Play free (no install, any device): https://horizons-delta-ten.vercel.app
💻 Open source: https://github.com/Mevin-9710/Horizons

How it works:
🪐 Pick one of 10 worlds, each based on a real NASA mission (Landsat, LRO, MAVEN, MESSENGER, Magellan, Juno, Cassini, Voyager 2, New Horizons)
🛠 Build your spacecraft part by part: mass, budget, power, data, comms and time, all live
🚀 Choose one of 5 NASA rockets and fly a real ascent: Max-Q, staging, fairing, deploy
🌌 Transfer burn, course correction, orbit insertion or flyby, with real delta-v
📡 Run the mission from mission control
📊 Get a score that explains every point, compared with the real NASA mission

New to it? Press Tutorial: it's hands-free, just press Next.

Team HZN
• Mevin Joseph Seby: software expert, built the game
• Pawan Indalkar: aerospace engineering student, launch physics and orbital mechanics

Credits
3D models courtesy of NASA (NASA 3D Resources). Horizons is not affiliated with or endorsed by NASA.
Music: "Piano and Strings Ambient (Confident and Light)" by zec53 (Pixabay).
Launch sounds synthesised in code.
AI disclosure: we used Claude (Anthropic) as a coding assistant. The video is assembled by code from real gameplay screenshots; no generative AI images or video.

#NASASpaceApps #SpaceApps2026 #SpaceMissionDesign #NASA #SpaceGame #Rocket #OrbitalMechanics #STEM #GameDev
```

**Tags**
```
NASA Space Apps, Space Apps Challenge 2026, Space Mission Design Game, Horizons, Team HZN, space game, rocket launch, orbital mechanics, Hohmann transfer, delta-v, spacecraft design, STEM education, three.js, browser game, NASA 3D models
```

## Link to Final Project

```
https://horizons-delta-ten.vercel.app
```

Source code (mention it in the description too): `https://github.com/Mevin-9710/Horizons`

## Detailed Project Description

```
THE TEAM: SOFTWARE MEETS AEROSPACE
Horizons was built by a software expert and an aerospace engineer with complementary expertise.
- Mevin Joseph Seby, lead mission engineer, is the software expert who turned the engineering into a game. He designed and built the software: the screens and their flow, the walk-around isometric base, the spacecraft builder with its live gauges, the 3D launch and transfer scenes, mission control, the scoring and the hands-free tutorial. He also built the build pipeline and automated tests, the visual design and the deployment. He directed the AI coding assistant that helped write the code.
- Pawan Indalkar, lead flight engineer, is an undergraduate aerospace engineering student. His aerospace knowledge is the backbone of the game's realism. He built The Horizon Explorers, the launch simulator whose physics Horizons' launch is based on: the ascent model (thrust, drag, an exponential atmosphere, dynamic pressure and Max-Q, the gravity turn, two-stage staging, the orbit computed from the state vector). His understanding of orbital mechanics and spacecraft systems grounds the rest of the physics: Hohmann transfers and delta-v budgets for each destination, a heavier payload costing a rocket its delta-v, and sunlight falling with distance, which is why Mars missions fly solar wings and Saturn missions need RTGs. He also sourced NASA 3D models for the launch.
Together: Mevin made sure anyone can feel it in a few minutes; Pawan made sure every number means something.

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

The form asks for each item as **link text** plus **link URL**; you need at least one. Here are ten, each checked to open. Add them in this order, with the first five as the key ones.

| # | Link text | Link URL |
|---|---|---|
| 1 | NASA 3D Resources: every rocket, spacecraft and part model in the game | https://science.nasa.gov/3d-resources/ |
| 2 | NASA 3D Resources on GitHub: the model files we converted | https://github.com/nasa/NASA-3D-Resources |
| 3 | NASA Planetary Fact Sheet: planet distances for transfers and sunlight | https://nssdc.gsfc.nasa.gov/planetary/factsheet/ |
| 4 | NASA Basics of Space Flight: Hohmann transfers and orbital mechanics | https://science.nasa.gov/learn/basics-of-space-flight/ |
| 5 | Juno mission: solar power at Jupiter (Inside Jupiter mission) | https://science.nasa.gov/mission/juno/ |
| 6 | Landsat 8 mission: Earth observation (Wildfire watch mission) | https://science.nasa.gov/mission/landsat-8 |
| 7 | Lunar Reconnaissance Orbiter: lunar polar ice (Moon mission) | https://science.nasa.gov/mission/lro/ |
| 8 | MAVEN mission: the Martian atmosphere (Mars mission) | https://science.nasa.gov/mission/maven/ |
| 9 | Cassini-Huygens mission: Saturn, rings and Titan (Saturn mission) | https://science.nasa.gov/mission/cassini/ |
| 10 | Voyager and New Horizons: outer-planet and Pluto flybys | https://science.nasa.gov/mission/voyager/ |

Optional 11th: `New Horizons mission: Pluto flyby` → https://science.nasa.gov/mission/new-horizons/

If the form also has a text box for this section, paste:

```
Every rocket and spacecraft in Horizons is a real NASA 3D model (NASA 3D Resources): Jupiter-C, Ares I, Saturn V, Space Shuttle, SLS, Orion, Mercury, the Mobile Launcher, the Apollo Lunar Module, MRO, Landsat 8, LRO, MAVEN, MESSENGER, Magellan, Juno, Cassini, Voyager, New Horizons and the NASA Satellite Kit. Each of the ten missions follows a real NASA mission; the report compares the player's design with it (mass, rocket, power source, instruments). Transfers and sunlight use NASA planetary data (Planetary Fact Sheet), and the transfer model follows NASA's Basics of Space Flight.
```

## Space Agency Partner Data and Other References

We did not use Space Agency Partner data. This field lists **every other resource** we used, as **link text** plus **link URL**. All links were opened to check them except the two marked "(your link)".

**Libraries and tools**

| Link text | Link URL |
|---|---|
| three.js (r128): 3D rendering in the browser (MIT) | https://threejs.org/ |
| Web Audio API: in-game music and launch sounds, synthesised in code | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API |
| glTF Transform: converting the NASA 3D models | https://gltf-transform.dev/ |
| Playwright: automated tests that play the whole game | https://playwright.dev/ |
| Claude Code (Anthropic): AI coding assistant used by the team | https://claude.com/product/claude-code |

**Fonts**

| Link text | Link URL |
|---|---|
| Game Paused font by Dharmas: titles and buttons (free for personal and non-commercial use) | https://dharmasfoundry.com/game-paused |
| Silkscreen font: labels and numbers (SIL Open Font License) | https://fonts.google.com/specimen/Silkscreen |
| Geist font: body text (SIL Open Font License) | https://fonts.google.com/specimen/Geist |

**Music and images**

| Link text | Link URL |
|---|---|
| Music in the demo video: "Piano and Strings Ambient - Confident and Light" by zec53 (Pixabay) | https://pixabay.com/music/modern-classical-piano-and-strings-ambient-confident-and-light-full-633882/ |
| Pixabay Content License (covers the music) | https://pixabay.com/service/license-summary/ |
| Home-screen night-sky image (free asset, used non-commercially) | (your link): paste the page you downloaded it from |

**Our own work and hosting**

| Link text | Link URL |
|---|---|
| Horizons source code (MIT licence) | https://github.com/Mevin-9710/Horizons |
| The Horizon Explorers launch simulator by Pawan Indalkar (basis of the launch physics) | https://github.com/Mevin-9710/Horizons/tree/main/game-mechanics |
| Play Horizons (hosted on Vercel) | https://horizons-delta-ten.vercel.app |

**Design inspiration only** (not used in the game; all rights reserved by their owners)

| Link text | Link URL |
|---|---|
| Perplexity "Computer" page: inspiration for the glass-ball home screen | https://www.perplexity.ai/products/computer |
| Perplexity "Comet" page: inspiration for the banded planets | https://www.perplexity.ai/comet |
| Pinterest "Game UI Design" board: inspiration for the chunky game buttons | https://in.pinterest.com/ilairaz/game-ui-design/ |
| Isometric "Space Level Kit" asset pack: inspiration for the base layout | (your link): where the pack is sold, if you have it |

If the form also has a text box, paste:

```
No Space Agency Partner data was used. Other resources: three.js r128 (MIT) for 3D; the Web Audio API for music and sounds synthesised in code; glTF Transform to convert NASA models; Playwright for tests; Claude Code (Anthropic) as an AI coding assistant. Fonts: Game Paused by Dharmas (free for personal and non-commercial use), Silkscreen and Geist (SIL Open Font License). Demo-video music: "Piano and Strings Ambient - Confident and Light" by zec53 (Pixabay Content License). Home-screen sky image: a free asset, used non-commercially. The launch physics come from The Horizon Explorers, Pawan Indalkar's own launch simulator. Design inspiration only, not used in the game: Perplexity's Computer and Comet pages, a Pinterest Game UI board and the Space Level Kit asset pack (all rights reserved by their owners). 3D models courtesy of NASA; not affiliated with or endorsed by NASA.
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
