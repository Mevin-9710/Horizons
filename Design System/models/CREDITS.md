# 3D model credits

All `.glb` files here come from **NASA's 3D Resources**, at https://github.com/nasa/NASA-3D-Resources and https://science.nasa.gov/3d-resources/. NASA content is generally not subject to copyright in the US.

**Rules we follow:**
- Credit NASA in-game: "3D models courtesy of NASA".
- **NASA rockets and parts keep their original NASA colours.** Every texture is flattened at load to its dominant colour, which removes all markings and lettering (no "USA" / "UNITED STATES" text, no NASA insignia or logotype). Only Landsat 8 (a display piece) uses the Horizons palette shader.
- Show no NASA endorsement: "Horizons is not affiliated with or endorsed by NASA."

| File | NASA source (folder in `3D Models/`) | Used as |
|---|---|---|
| kit-body-1/2/3.glb | Satellite Kit (body 1–3) | Bus options |
| kit-wings-1/2/3.glb | Satellite Kit (wings 1–3) | Solar power options |
| kit-radio-1/2/3.glb | Satellite Kit (radio 1–3) | Comms options |
| infrared-camera.glb | Infrared Camera | Thermal IR imager |
| landsat-8.glb | Landsat 8 | Display in the spacecraft workshop |
| rocket-jupiter-c.glb | Explorer Jupiter-C Rocket | Rocket 1 (smallest) |
| rocket-ares-1.glb | Ares 1 (B) | Rocket 2 |
| rocket-saturn-v.glb | Saturn V | Rocket 3 |
| rocket-shuttle.glb | Space Shuttle (A) | Rocket 4 |
| rocket-sls.glb | `3D Printing/` Space Launch System (SLS) Block 1 (**STL**) | Rocket 5 (biggest) |
| orion.glb | `3D Printing/` Orion Capsule (no fbc) (**STL**) | Display in the rocket workshop |
| capsule-mercury.glb | Atlas 9 (Faith 7) | Display in the rocket workshop. NASA's "Atlas" files are only the Mercury capsule, not the Atlas rocket, so it is no longer used as a rocket. |

All rockets also appear in the glass ball on the home screen (◀ ▶ switches between them).

**Processing:** the originals use Draco compression. They were decoded with `gltf-transform copy`, then welded. Landsat 8, Atlas and the infrared camera were simplified, and textures were resized to 32 px because the game only reads each texture's dominant colour.

**No NASA part model exists for these, so they are procedural stand-ins:** visible camera, hyperspectral imager, all engines (cold gas, hydrazine, electric) and the orbit markers.

**Added 2026-11-14** with `tools/model-convert/` (see its README):

```
node convert.mjs "Ares 1 (B).glb" rocket-ares-1.glb 30000 && node dropnode.mjs rocket-ares-1.glb "group2 pCo"
node convert.mjs "Space Shuttle (A).glb" rocket-shuttle.glb 40000 "nodes:pCylinder8=orange,group13=dark,*=white" x90
node convert.mjs "Space Launch System (SLS) Block 1.stl" rocket-sls.glb 40000 sls
node convert.mjs "Orion Capsule (no fbc).stl" orion.glb 20000 yup
```
NASA's Shuttle (A) and the STL files have no colours of their own. The colours above are plain NASA-style colours (orange tank and core stage, white boosters), with no markings.

**Added 2026-11-15: one NASA spacecraft per destination** (the mission's display piece in the spacecraft workshop, and the craft in the transfer view). Converted with `tools/model-convert`, simplified hard, textures dropped (flat NASA colours):

| File | NASA source (`3D Models/` unless noted) | Mission in game |
|---|---|---|
| messenger.glb | MESSENGER | Mercury mapper |
| magellan.glb | Magellan | Venus radar |
| lro.glb | Lunar Reconnaissance Orbiter (B) | Lunar polar ice |
| maven.glb | MAVEN (B) | Mars atmosphere |
| juno.glb | Juno (A) | Inside Jupiter |
| cassini.glb | Cassini-Huygens (A) | Rings and Titan |
| voyager.glb | Voyager Probe (A) | Ice giant flyby (Uranus), Edge of the planets (Neptune) |
| new-horizons.glb | `3D Printing/` New Horizons, body part (**STL**) | Pluto flyby |
