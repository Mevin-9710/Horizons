// base -> launch (skip cinematic) -> orbit -> control. node tools/test-flow.mjs <outDir>
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1100, height: 690 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
const f = () => p.frames().find(x => x !== p.mainFrame());
await p.goto('http://localhost:8765/#base'); await p.reload(); await p.waitForTimeout(2500);
await f().waitForFunction(() => typeof MODELS !== 'undefined' && Object.keys(MODELS).length >= 18, null, { timeout: 120000 });
await f().evaluate(() => { pick.inst = 'i1'; pick.rocket = 'r5'; renderHUD(); doLaunch(); });
await p.waitForTimeout(1200); await p.screenshot({ path: out + '/flow-dive.png' });
await p.waitForFunction(() => location.hash === '#launch', null, { timeout: 30000 }); await p.waitForTimeout(2500);
await f().waitForFunction(() => window.LX && LX.mode === 'cine', null, { timeout: 90000 }); console.log('launch screen up, rocket', await f().evaluate(() => V.name));
await p.waitForTimeout(1500); await p.keyboard.press('Escape');
await f().waitForFunction(() => LX.mode === 'fly', null, { timeout: 90000 });
let last = null; for (let n = 0; n < 900; n++) { const st = await f().evaluate(() => ({ m: LX.mode, cue: LX.cue })); if (st.m !== 'fly') break; if (st.cue && st.cue !== last) { last = st.cue; await p.keyboard.press('Space'); } if (n === 6) await p.screenshot({ path: out + '/flow-liftoff.png' }); await p.waitForTimeout(200); }
await f().waitForFunction(() => LX.flight, null, { timeout: 90000 }); console.log('flight', JSON.stringify(await f().evaluate(() => LX.flight)));
await p.screenshot({ path: out + '/flow-space.png' });
await p.keyboard.press('Enter'); await p.waitForFunction(() => location.hash === '#control', null, { timeout: 30000 }); await p.waitForTimeout(4000);
await p.screenshot({ path: out + '/flow-control.png' }); console.log('control phase:', await f().evaluate(() => document.getElementById('capTitle').textContent + ' | fuel ' + S.fuel));
await b.close();
