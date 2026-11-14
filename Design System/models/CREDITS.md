# 3D model credits

All `.glb` files here come from **NASA's 3D Resources**, at https://github.com/nasa/NASA-3D-Resources and https://science.nasa.gov/3d-resources/. NASA content is generally not subject to copyright in the US.

**Rules we follow:**
- Credit NASA in-game: "3D models courtesy of NASA".
- No NASA insignia or logotype. Textures are dropped at load, so only the shape is used.
- Show no NASA endorsement: "Horizons is not affiliated with or endorsed by NASA."

| File | NASA source (folder in `3D Models/`) | Used as |
|---|---|---|
| kit-body-1/2/3.glb | Satellite Kit (body 1–3) | Bus options |
| kit-wings-1/2/3.glb | Satellite Kit (wings 1–3) | Solar power options |
| kit-radio-1/2/3.glb | Satellite Kit (radio 1–3) | Comms options |
| infrared-camera.glb | Infrared Camera | Thermal IR imager |
| landsat-8.glb | Landsat 8 | Display in the spacecraft workshop |
| rocket-jupiter-c.glb | Explorer Jupiter-C Rocket | Small rocket |
| rocket-atlas.glb | Atlas 9 (Faith 7) | Medium rocket |
| rocket-saturn-v.glb | Saturn V | Heavy rocket |
| gantry.glb | Gantry | Launch pad tower |

**Processing:** the originals use Draco compression. They were decoded with `gltf-transform copy`, then welded. Landsat 8, the gantry, Atlas and the infrared camera were simplified, and textures were resized to 64 px because the game re-shades every model with the Comet shader.

**No NASA part model exists for these, so they are procedural stand-ins:** visible camera, hyperspectral imager, all engines (cold gas, hydrazine, electric) and the orbit markers.
