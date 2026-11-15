// The spacecraft is the same object everywhere: build stand (base) -> hangar/fairing/deploy (launch) -> cruise (transfer) -> mission control icon.
// node tools/test-craft.mjs <outDir> [mission]
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
import fs from 'node:fs';
const [O, MIS = 'jupiter'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
const f = () => p.frames().find(x => x !== p.mainFrame());
const save = (n, url) => { fs.writeFileSync(`${O}/${n}.png`, Buffer.from(url.split(',')[1], 'base64')); console.log('saved', n); };
// render any group of the current frame on its own, from the same angle
const SNAP = `(grp)=>{ const sc=new THREE.Scene(); const c=grp.clone(); c.position.set(0,0,0); c.quaternion.identity(); sc.add(c); sc.add(new THREE.HemisphereLight(0xFFF6E8,0x6E6457,1.05)); const dl=new THREE.DirectionalLight(0xFFFFFF,.9); dl.position.set(3,5,4); sc.add(dl); c.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(c), ctr=bb.getCenter(new THREE.Vector3()), r=bb.getSize(new THREE.Vector3()).length()/2;
  const cam=new THREE.PerspectiveCamera(30,1,.001,1e4); cam.position.copy(ctr).add(new THREE.Vector3(r*2.3,r*1.5,r*2.7)); cam.lookAt(ctr);
  const R=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true}); R.setSize(360,360); R.setClearColor(0xF3EEE4,1); R.render(sc,cam); return R.domElement.toDataURL('image/png'); }`;
await p.goto('http://localhost:8765/'); await p.waitForTimeout(500);
await p.evaluate(m => go('base', { mission: m }), MIS); await p.waitForTimeout(3000);
await f().waitForFunction(() => typeof MODELS !== 'undefined' && Object.keys(MODELS).length >= 14 && typeof refreshBuildBay === 'function', null, { timeout: 120000 });
await f().evaluate(() => { enterRoom('craft'); }); await p.waitForTimeout(3500);
await f().evaluate(() => { Object.assign(pick, { rocket: 'r3', bus: 'b2', power: 'p3', batt: 'bt2', comms: 'c3', store: 's2', engine: 'e2', tank: 't3', inst: 'grav', inst2: 'mag', inst3: 'ir' }); renderHUD(); refreshBuildBay(); });
await p.waitForTimeout(800);
save('1-base-stand', await f().evaluate(`(${SNAP})(buildBay.children[0])`));
save('1b-control-icon', await f().evaluate(() => craftImage()));
await f().evaluate(() => doLaunch()); await p.waitForFunction(() => location.hash === '#launch', null, { timeout: 30000 });
await f().waitForFunction(() => window.LX && LX.mode !== 'load', null, { timeout: 120000 }); await p.waitForTimeout(1500);
console.log('own craft in launch:', await f().evaluate(() => !!window.HZ_OWN_CRAFT), 'meshes', await f().evaluate(() => { let n = 0; pay.traverse(o => { if (o.isMesh) n++; }); return n; }));
save('2-launch-payload', await f().evaluate(`(()=>{ const s=wings.scale.x; wings.scale.x=1; const u=(${SNAP})(pay); wings.scale.x=s; return u; })()`));
await p.screenshot({ path: `${O}/3-hangar.png` });
await b.close();
