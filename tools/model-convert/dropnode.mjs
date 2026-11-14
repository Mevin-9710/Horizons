import { NodeIO } from '@gltf-transform/core';
import { prune } from '@gltf-transform/functions';
const [,, f, name] = process.argv; const io = new NodeIO(); const d = await io.read(f);
for (const n of d.getRoot().listNodes()) if (n.getName() === name) { n.dispose(); console.log('dropped', name); }
await d.transform(prune()); await io.write(f, d);
