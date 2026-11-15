#!/usr/bin/env python3
"""Bundle the NASA GLB models into one script (assets/models/models.js).
Base64 data in a plain <script> works when index.html is opened straight from
disk (file://), where fetch() of .glb files is blocked by the browser."""
import base64, json, pathlib
here = pathlib.Path(__file__).resolve().parent.parent / "assets" / "models"
files = {"saturn_v": "saturn_v.glb", "mobile_launcher": "mobile_launcher_assembled.glb", "jupiter_c": "jupiter_c.glb",
         "external_tank": "external_tank.glb", "shuttle": "space_shuttle_orbiter.glb", "asteroid": "asteroid_1999_rq36.glb",
         "mro": "mro.glb", "lunar_module": "apollo_lunar_module.glb", "voyager": "voyager_probe.glb"}
out = {k: base64.b64encode((here / v).read_bytes()).decode() for k, v in files.items()}
(here / "models.js").write_text("window.HX_MODELS=" + json.dumps(out) + ";\n")
print("wrote", here / "models.js", sum(len(v) for v in out.values()) // 1024, "KB")
