# game-mechanics

Scripts, data and input files for **The Horizon Explorers**.

| Folder | Contents |
|---|---|
| `scripts/model-loader.js` | Loads the NASA models and swaps them in for the procedural rocket and launch pad. Falls back to the old meshes if loading fails. |
| `scripts/cinematics.js` | Launch drama: letterbox, big countdown numerals, ignition flash, ascent shake, speed streaks, Max-Q alarm. Overlay only, never touches physics. |
| `scripts/build_models.py` | Re-bundles the `.glb` files into `assets/models/models.js` (run after changing a model). |
| `assets/models/` | NASA GLB models + the generated `models.js` bundle. |
| `data/` | Planets, vehicles, spacecraft, sites, mission phases (reference copies of the constants in `index.html`). |
| `input/` | Keyboard/touch bindings and difficulty settings. |

## NASA models used
Source: https://science.nasa.gov/3d-resources/ (mirror: https://github.com/nasa/NASA-3D-Resources). NASA 3D Resources are free to use; see the NASA Images and Media Usage Guidelines.

- **Saturn V** → Horizon-9 Medium and Titan Heavy
- **Explorer Jupiter-C Rocket** → Aurora-L Light
- **Mobile Launcher (pad only)** → launch pad

The SLS Block 1 model is only published as split 7z archives (no GLB), so it is not bundled.

## Run
Open `index.html` in a browser (internet needed for three.js and the Draco decoder CDN).


## Models used (NASA 3D Resources)
| Game item | NASA model |
|---|---|
| Horizon-9 Medium | Saturn V |
| Titan Heavy | Space Shuttle External Tank |
| Aurora-L Light | Explorer Jupiter-C |
| Launch pad | Mobile Launcher (assembled) |
| Horizon Orbiter | Mars Reconnaissance Orbiter |
| Aurora Lander | Apollo Lunar Module |
| Voyager Probe | Voyager Probe |
| Explorer Crew | Space Shuttle Orbiter |
| Asteroid belt (solar-system view) | 1999 RQ36 (Bennu) |

Rebuild the bundle after changing GLBs: `python3 scripts/build_models.py`.
