// NASA model → Horizons game model.
// GLB: decode Draco, weld, simplify, strip extensions.  STL: parse, colour by region, weld, simplify, write GLB.
// Usage: node convert.mjs <in> <out.glb> <maxTris> [stl-colour-mode]
import fs from 'node:fs';
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune, flatten, join } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';

const [,, inp, out, maxTrisArg, mode = 'grey', rot = ''] = process.argv;
const maxTris = +maxTrisArg || 40000;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
await MeshoptSimplifier.ready;

function triCount(doc) {
  let n = 0;
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const i = p.getIndices(); n += (i ? i.getCount() : p.getAttribute('POSITION').getCount()) / 3;
  }
  return n;
}

// ---------- STL ----------
function parseSTL(buf) {
  const n = buf.readUInt32LE(80);
  if (84 + n * 50 === buf.length) {
    const pos = new Float32Array(n * 9);
    for (let t = 0; t < n; t++) for (let v = 0; v < 9; v++) pos[t * 9 + v] = buf.readFloatLE(84 + t * 50 + 12 + v * 4);
    return pos;
  }
  const txt = buf.toString('utf8'), a = [];
  for (const m of txt.matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)) a.push(+m[1], +m[2], +m[3]);
  return new Float32Array(a);
}

function stlDoc(pos) {
  // Z-up → Y-up (skip for files already Y-up)
  if (mode !== 'yup') for (let i = 0; i < pos.length; i += 3) { const y = pos[i + 1], z = pos[i + 2]; pos[i + 1] = z; pos[i + 2] = -y; }
  // bounds
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); }
  const H = hi[1] - lo[1], cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2;

  // region colouring (STL has no colour). Returns a material key per triangle.
  const MATS = {
    grey:   [0.86, 0.86, 0.84],
    white:  [0.93, 0.92, 0.89],
    orange: [0.80, 0.45, 0.20],
    dark:   [0.22, 0.22, 0.24],
  };
  let classify = () => 'grey';
  if (mode === 'sls') {
    // core stage = centre column below the upper stage; boosters = off-axis; top = upper stage + Orion + abort tower.
    // core radius estimated from the narrowest radius band near mid-height.
    let coreR = 0; const yMid = lo[1] + H * 0.45;
    for (let i = 0; i < pos.length; i += 3) if (Math.abs(pos[i + 1] - yMid) < H * 0.01) {
      const r = Math.hypot(pos[i] - cx, pos[i + 2] - cz); if (r < (hi[0] - lo[0]) * 0.3) coreR = Math.max(coreR, r);
    }
    const coreTop = lo[1] + H * 0.62, engineBand = lo[1] + H * 0.035;
    classify = (x, y, z) => {
      const r = Math.hypot(x - cx, z - cz);
      if (r > coreR * 1.15) return 'white';      // solid rocket boosters
      if (y > coreTop) return 'white';            // ICPS, Orion, launch abort system
      if (y < engineBand) return 'dark';          // RS-25 engine section
      return 'orange';                            // core stage foam
    };
    console.log('sls coreR', coreR.toFixed(2), 'H', H.toFixed(2));
  }
  const buckets = {};
  for (let t = 0; t < pos.length; t += 9) {
    const x = (pos[t] + pos[t + 3] + pos[t + 6]) / 3, y = (pos[t + 1] + pos[t + 4] + pos[t + 7]) / 3, z = (pos[t + 2] + pos[t + 5] + pos[t + 8]) / 3;
    const k = classify(x, y, z); (buckets[k] ||= []).push(t);
  }
  const doc = new Document(); const buffer = doc.createBuffer();
  const mesh = doc.createMesh('stl');
  for (const [k, tris] of Object.entries(buckets)) {
    const p = new Float32Array(tris.length * 9);
    tris.forEach((t, j) => p.set(pos.subarray(t, t + 9), j * 9));
    const mat = doc.createMaterial(k).setBaseColorFactor([...MATS[k], 1]).setRoughnessFactor(0.6).setMetallicFactor(0.1);
    const acc = doc.createAccessor().setType('VEC3').setArray(p).setBuffer(buffer);
    mesh.addPrimitive(doc.createPrimitive().setAttribute('POSITION', acc).setMaterial(mat));
  }
  doc.createScene().addChild(doc.createNode('model').setMesh(mesh));
  return doc;
}

// ---------- pipeline ----------
let doc;
if (/\.stl$/i.test(inp)) doc = stlDoc(parseSTL(fs.readFileSync(inp)));
else doc = await io.read(inp);

for (const e of doc.getRoot().listExtensionsUsed()) e.dispose();   // no Draco/specular in the output

// GLB recolour by node name: nodes:<prefix>=<colour>,...,*=<colour>  (NASA GLBs are often all one grey)
const COLS = { white:[0.93,0.92,0.89], orange:[0.80,0.45,0.20], dark:[0.22,0.22,0.24], grey:[0.75,0.75,0.74], black:[0.12,0.12,0.13] };
if (mode.startsWith('nodes:')) {
  const rules = mode.slice(6).split(',').map(r => r.split('='));
  const mats = {};
  const matOf = c => mats[c] ||= doc.createMaterial(c).setBaseColorFactor([...COLS[c], 1]).setRoughnessFactor(0.6).setMetallicFactor(0.1);
  for (const n of doc.getRoot().listNodes()) {
    const m = n.getMesh(); if (!m) continue;
    const rule = rules.find(([k]) => k !== '*' && n.getName().startsWith(k)) || rules.find(([k]) => k === '*');
    if (rule) for (const p of m.listPrimitives()) p.setMaterial(matOf(rule[1]));
  }
}
// optional fixed rotation (bakes the right "up" into the file): x90, x-90, z90 ...
if (rot) {
  const ax = rot[0], deg = +rot.slice(1) * Math.PI / 180, h = deg / 2;
  const q = ax === 'x' ? [Math.sin(h),0,0,Math.cos(h)] : ax === 'y' ? [0,Math.sin(h),0,Math.cos(h)] : [0,0,Math.sin(h),Math.cos(h)];
  const scene = doc.getRoot().listScenes()[0], top = doc.createNode('up').setRotation(q);
  for (const c of scene.listChildren()) { scene.removeChild(c); top.addChild(c); }
  scene.addChild(top);
}
await doc.transform(dedup(), ...(rot ? [] : [flatten()]), ...(mode.startsWith('nodes:') ? [] : [join()]), weld({ tolerance: 0.0001 }));
const before = triCount(doc);
if (before > maxTris) {
  // simplify step by step until under budget
  let ratio = maxTris / before;
  for (let k = 0; k < 4 && triCount(doc) > maxTris; k++) {
    await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.01 * (k + 1), lockBorder: false }));
    ratio *= 0.8;
  }
}
await doc.transform(prune());
await io.write(out, doc);
console.log(out.split('/').pop(), 'tris', Math.round(before), '→', Math.round(triCount(doc)), (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
