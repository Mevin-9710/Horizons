# NASA model → game model

Converts NASA 3D Resources files (`.glb` or `.stl`) into the small GLBs the game loads.

```
cd tools/model-convert && npm install
node convert.mjs <in.glb|in.stl> <out.glb> <maxTriangles> [mode] [rotation]
base64 -w0 out.glb > ../../game/models/<name>.txt     # the game loads base64 text
```

- **GLB:** decodes Draco, welds and simplifies down to `maxTriangles`.
- **STL:** STL has no colours, materials or parts, and is usually Z-up. The script turns it Y-up, then colours it by `mode`:
  - `grey`: one light grey (default)
  - `yup`: same, but the file is already Y-up
  - `sls`: SLS colours (orange core, white boosters and upper stage, dark engines)
- **Recolour a one-grey GLB by node name:** `nodes:pCylinder8=orange,group13=dark,*=white`
- **Rotation:** `x90`, `x-90`, `z90`… bakes the right "up" into the file.
- `node dropnode.mjs <file.glb> "<node name>"` removes a stray part (Ares I had one far from the rocket).

The exact commands for every model in the game are in `Design System/models/CREDITS.md`.
