/* The Horizon Explorers: NASA 3D model loader.
   Replaces the procedural rocket and launch pad with real NASA models from
   https://science.nasa.gov/3d-resources/ (mirror: github.com/nasa/NASA-3D-Resources).
   Falls back to the original procedural meshes if anything fails to load.
   Loaded AFTER the main game script, so it can see its globals (rocket, s1, s2, fA, fB, pay, pad, CFG...). */
(function () {
  if (typeof THREE === 'undefined' || !THREE.GLTFLoader || !window.HX_MODELS || typeof rocket === 'undefined') {
    console.warn('[HX models] loader prerequisites missing; keeping procedural models'); return;
  }
  /* Per-vehicle model recipe. total = rocket height in game units.
     cut1/cut2 = fractions of height where stage 1 ends and the fairing/capsule section begins. */
  const RECIPE = {
    0: { model: 'saturn_v',   total: 22.6, cut1: 0.385, cut2: 0.77, name: 'Saturn V (NASA)' },
    1: { model: 'external_tank', total: 21.0, cut1: 0.40, cut2: 0.80, orient: true, split: true, name: 'Space Shuttle External Tank (NASA)' },
    2: { model: 'jupiter_c',  total: 19.0, cut1: 0.45,  cut2: 0.85, name: 'Jupiter-C (NASA)' }
  };
  /* spacecraft choices (SCS order) -> real NASA models; size = longest dimension in game units */
  const PAYLOADS = [ { model: 'mro', size: 3.0 }, { model: 'lunar_module', size: 2.4 }, { model: 'voyager', size: 2.8 }, { model: 'shuttle', size: 3.6 } ];
  const LAUNCHER_TOWER_H = 27;               // game units, matches the old 26-unit tower
  const draco = new THREE.DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
  const loader = new THREE.GLTFLoader(); loader.setDRACOLoader(draco);
  const bin = k => { const s = atob(window.HX_MODELS[k]), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };
  const load = k => new Promise((res, rej) => loader.parse(bin(k), '', g => res(g.scene), rej));
  window.HX_NASA = { ready: false, vehicles: {}, launcher: null, status: 'loading' };

  function prep(root) {                       // sane PBR look for old blinn materials
    root.traverse(o => { if (o.isMesh) { o.frustumCulled = false; const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(m => { if (m.roughness !== undefined) { m.roughness = Math.min(.8, m.roughness || .6); m.metalness = Math.min(.5, m.metalness || .15); } if (!m.map && m.color && m.color.getHex() === 0) m.color.set(0x8c9199); }); } });
  }
  /* put the long axis on Y with the thin (nose) end up; for single-mesh models like the External Tank */
  function orientUp(root, wrap) {
    wrap.updateMatrixWorld(true);
    const sz = new THREE.Box3().setFromObject(wrap).getSize(new THREE.Vector3());
    if (sz.x >= sz.y && sz.x >= sz.z) root.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));
    else if (sz.z >= sz.y) root.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
    wrap.updateMatrixWorld(true);
    const v = new THREE.Vector3(), pts = []; let y0 = 1e9, y1 = -1e9;
    wrap.traverse(o => { if (o.isMesh) { const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i += 4) { v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld); pts.push(v.x, v.y, v.z); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); } } });
    const h = y1 - y0, ext = (lo, hi) => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (let i = 0; i < pts.length; i += 3) { const y = pts[i + 1]; if (y >= lo && y <= hi) { a = Math.min(a, pts[i]); b = Math.max(b, pts[i]); c = Math.min(c, pts[i + 2]); d = Math.max(d, pts[i + 2]); } } return (b - a) * (d - c); };
    if (ext(y1 - h * .1, y1) > ext(y0, y0 + h * .1)) root.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
    wrap.updateMatrixWorld(true);
  }
  /* split one mesh into stage pieces by triangle height (geometry shares vertex buffers; only the index differs) */
  function splitByHeight(mesh, wrap, total, cut1, cut2) {
    mesh.updateWorldMatrix(true, false);
    const g = mesh.geometry.clone(); g.applyMatrix4(mesh.matrixWorld);
    const pos = g.attributes.position, idx = g.index ? g.index.array : null, n = idx ? idx.length : pos.count, bk = [[], [], []];
    for (let t = 0; t + 2 < n; t += 3) {
      const a = idx ? idx[t] : t, b = idx ? idx[t + 1] : t + 1, c = idx ? idx[t + 2] : t + 2;
      const f = ((pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3) / total, s = f < cut1 ? 0 : f < cut2 ? 1 : 2;
      bk[s].push(a, b, c);
    }
    mesh.parent.remove(mesh);
    bk.forEach((arr, s) => { if (!arr.length) return; const ng = new THREE.BufferGeometry();
      Object.keys(g.attributes).forEach(k => ng.setAttribute(k, g.attributes[k])); ng.setIndex(arr);
      const m = new THREE.Mesh(ng, mesh.material); m.frustumCulled = false; m.userData.hxStage = s; wrap.add(m); });
  }
  async function buildVehicle(idx) {
    const R = RECIPE[idx], root = await load(R.model); prep(root);
    const wrap = new THREE.Group(); wrap.add(root);                 // orphan, so boxes are in rocket-local space
    wrap.updateMatrixWorld(true);
    if (R.orient) orientUp(root, wrap);
    let b = new THREE.Box3().setFromObject(wrap);
    const k = R.total / (b.max.y - b.min.y); root.scale.setScalar(k);
    wrap.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(wrap);
    const low = new THREE.Box3(); wrap.traverse(o => { if (o.isMesh) { const m = new THREE.Box3().setFromObject(o), cy = (m.min.y + m.max.y) / 2; if (cy < b.min.y + R.total * .3) low.union(m); } });
    const c = low.isEmpty() ? b.getCenter(new THREE.Vector3()) : low.getCenter(new THREE.Vector3());
    root.position.set(-c.x, -b.min.y, -c.z); wrap.updateMatrixWorld(true);
    const H = { s1: new THREE.Group(), s2: new THREE.Group(), fa: new THREE.Group() };
    s1.add(H.s1); s2.add(H.s2); fA.add(H.fa);
    rocket.add(wrap); rocket.updateMatrixWorld(true);
    let meshes = []; wrap.traverse(o => { if (o.isMesh) meshes.push(o); });
    if (R.split) { meshes.forEach(m => splitByHeight(m, wrap, R.total, R.cut1, R.cut2)); meshes = []; wrap.traverse(o => { if (o.isMesh) meshes.push(o); }); }
    meshes.forEach(m => { if (m.userData.hxStage !== undefined) { (m.userData.hxStage === 0 ? H.s1 : m.userData.hxStage === 1 ? H.s2 : H.fa).attach(m); return; } const bb = new THREE.Box3().setFromObject(m), f = ((bb.min.y + bb.max.y) / 2) / R.total;
      (f < R.cut1 ? H.s1 : f < R.cut2 ? H.s2 : H.fa).attach(m); });
    rocket.remove(wrap);
    Object.values(H).forEach(g => g.visible = false);
    return H;
  }
  async function buildLauncher() {
    const root = await load('mobile_launcher'); prep(root);
    const wrap = new THREE.Group(); wrap.add(root); wrap.updateMatrixWorld(true);
    let b = new THREE.Box3().setFromObject(wrap);
    /* find the deck height by dropping rays around the centreline (the exhaust opening sits on it) */
    const rc = new THREE.Raycaster(), hits = [];
    const ext = Math.max(b.max.x - b.min.x, b.max.z - b.min.z); for (const r of [.04 * ext, .08 * ext, .14 * ext]) for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; rc.set(new THREE.Vector3(Math.cos(a) * r, b.max.y + 5, Math.sin(a) * r), new THREE.Vector3(0, -1, 0)); const h = rc.intersectObject(wrap, true)[0]; if (h && h.point.y < b.max.y * .45) hits.push(h.point.y); }
    hits.sort((x, y) => x - y); const deck = hits.length ? hits[hits.length >> 1] : b.min.y;
    const k = LAUNCHER_TOWER_H / (b.max.y - deck > 1 ? Math.min(b.max.y - deck, 120) : 120);
    root.scale.setScalar(k); root.position.y = -deck * k;
    return wrap;
  }
  function fit(root, size) {               // centre + scale a model so its longest side = size
    const w = new THREE.Group(); w.add(root); w.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(w), d = b.getSize(new THREE.Vector3());
    root.scale.setScalar(size / Math.max(d.x, d.y, d.z)); w.updateMatrixWorld(true);
    const c = new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3()); root.position.sub(c); return w;
  }
  const payModels = [], hxPay = new THREE.Group(); window.HX_NASA.payloads = payModels;
  async function buildPayloads() {
    pay.add(hxPay);
    for (let i = 0; i < PAYLOADS.length; i++) { const r = await load(PAYLOADS[i].model); prep(r); const w = fit(r, PAYLOADS[i].size); w.position.y = .8; w.visible = false; hxPay.add(w); payModels[i] = w; }
    pay.children.forEach(c => { if (c !== hxPay) c.visible = false; });
    usePayload(CFG.sc);
  }
  function usePayload(i) { payModels.forEach((m, j) => m.visible = j === i); }
  /* solar-system view: real spacecraft model on the cruise craft + a Bennu asteroid belt */
  let astPromise = null; const getAst = () => astPromise || (astPromise = load('asteroid').then(r => { prep(r); return r; }));
  const _buildSS = buildSS; buildSS = function () {
    const r = _buildSS.apply(this, arguments);
    try {
      const sc = CFG.sc, P = PAYLOADS[sc];
      load(P.model).then(m => { prep(m); const w = fit(m, 1.7); SS.cr.children.forEach(c => { if (c !== SS.fl && c !== SS.mk) c.visible = false; }); SS.cr.add(w); });
      const sceneRef = sscene;
      getAst().then(ast => { const R = typeof vr === 'function' ? vr(2.7) : 150;
        for (let i = 0; i < 160; i++) { const m = ast.clone(true), a = Math.random() * 6.2832, rr = R * (.9 + Math.random() * .2), s = .25 + Math.random() * .7;
          const bb = new THREE.Box3().setFromObject(m), d = bb.getSize(new THREE.Vector3()); m.scale.multiplyScalar(s / Math.max(d.x, d.y, d.z));
          m.position.set(Math.cos(a) * rr, (Math.random() - .5) * 6, Math.sin(a) * rr); m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); sceneRef.add(m); } });
    } catch (e) { console.warn('[HX models] solar system models failed', e); }
    return r;
  };
  function useVehicle(i) {
    const cur = window.HX_NASA.vehicles[i]; if (!cur) return;
    Object.values(window.HX_NASA.vehicles).forEach(H => Object.values(H).forEach(g => g.visible = false));
    Object.values(cur).forEach(g => g.visible = true);
  }
  Promise.all([0, 2].map(async i => { window.HX_NASA.vehicles[i] = await buildVehicle(i); }))
    .then(() => { window.HX_NASA.vehicles[1] = window.HX_NASA.vehicles[0];
      /* hide the procedural rocket body + payload; keep groups (they drive staging) */
      [s1, s2, fA, fB].forEach(g => g.children.forEach(c => { if (![...Object.values(window.HX_NASA.vehicles[0]), ...Object.values(window.HX_NASA.vehicles[2])].includes(c)) c.visible = false; }));
      window.HX_NASA.ready = true; window.HX_NASA.status = 'ready'; useVehicle(CFG.veh); console.log('[HX models] NASA rockets ready'); })
    .catch(e => { window.HX_NASA.status = 'fallback'; console.warn('[HX models] rocket load failed, using procedural rocket', e); });
  buildPayloads().catch(e => console.warn('[HX models] payload models failed, using procedural payload', e));
  buildLauncher().then(w => {
    pad.children.forEach(c => { if (!clamps.includes(c)) c.visible = false; });
    pad.add(w); window.HX_NASA.launcher = w; console.log('[HX models] NASA Mobile Launcher ready');
  }).catch(e => console.warn('[HX models] launcher load failed, using procedural pad', e));

  /* keep the model in sync with the vehicle picked in mission design */
  const _apply = applyCfg; applyCfg = function () { const r = _apply.apply(this, arguments); if (window.HX_NASA.ready) useVehicle(CFG.veh); usePayload(CFG.sc); return r; };
  /* the payload is inside the capsule/fairing until it is deployed */
  
})();
