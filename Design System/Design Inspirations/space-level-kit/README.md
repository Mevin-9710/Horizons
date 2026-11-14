# Inspiration 04: "Space Level Kit" (isometric base)

- **Source:** two images sent by Mevin (`ref-01-blue.jpg`, `ref-02-green.jpg`), from an isometric asset pack.
- **Use in Horizons:** the **base and workshop** screen. Take the **structure and layout only**. **Do not use its colours** (cyan/green glow, purple space). Colours come from our Warm Nebula on cream palette. The **3D style** comes from the Comet planets: grainy colour bands, a soft terminator and matte surfaces.

## What to take from it
| Element | In the kit | Horizons version |
|---|---|---|
| Camera | True isometric (about 35° tilt, 45° yaw), orthographic | Same, using an orthographic three.js camera |
| Ground | Floating slabs of stone tiles, thick edges, columns dropping into the void | Floating slabs on the cream page, with columns that fade into the cream |
| Edge trim | Thin glowing lines on every top edge | Thin **ember/amber** trim lines (cyan and green are banned) |
| Walkways | Narrow bridges with arched supports underneath | Same. Bridges join the central plaza to each building |
| Stairs | Long stair runs between levels | Kept for later levels; the demo stays on one level |
| Towers | Tall dark blocks with round lit windows | The **mission control tower**, with amber window dots |
| Doors | Recessed sliding doors on small buildings | Workshop doors with a glowing ring on the floor when the player is near |
| Props | Crates, glowing capsules, lamp posts, round floor lights | Crates, **teal** capsules, lamp posts, floor dots in amber |
| Railings | Translucent glass fences | Glass railings (tinted cream) |

## Surface style (from Comet)
Every surface uses one shared shader. It draws **2 to 4 palette colours in soft angled bands, film grain and soft lighting**, with no textures. That keeps it fast and consistent with the planets.
