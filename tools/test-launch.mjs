// Drives the launch screen: node tools/test-launch.mjs <outDir> [rocketId] [auto|miss]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out, rk = 'r3', how = 'auto'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1100, height: 690 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error' && !/GL Driver|GPU stall/.test(m.text())) console.log('CONSOLE', m.text()); });
await p.goto('http://localhost:8765/'); await p.waitForTimeout(800);
await p.evaluate(rk => go('launch', { mission: 'mars', pick: { rocket: rk, bus: 'b1', power: 'p2' }, design: { rocket: 'x' } }), rk);
await p.waitForTimeout(2500);
const f = () => p.frames().find(x => x !== p.mainFrame());
await f().waitForFunction(() => window.LX && LX.mode !== 'load', null, { timeout: 90000 });
const shot = n => p.screenshot({ path: `${out}/${n}.png` });
let t0 = Date.now(); const el = () => ((Date.now() - t0) / 1000).toFixed(1);
// cinematic: one still per step
for (let i = 0; i < 6; i++) { await f().waitForFunction(i => LX.stats().tCine > [1.5, 6, 10, 14, 19.5, 23.4][i] || LX.mode !== 'cine', i, { timeout: 120000 }); if (await f().evaluate(() => LX.mode) !== 'cine') break; await shot('cine' + i); }
await f().waitForFunction(() => LX.mode === 'count', null, { timeout: 120000 }); console.log('cinematic game time', (await f().evaluate(() => LX.stats().tCine)).toFixed(1), 's, wall', el()); await shot('count');
await f().waitForFunction(() => LX.mode === 'fly', null, { timeout: 60000 }); t0 = Date.now(); await f().evaluate(() => LX.resetStats());
let n = 0, lastCue = null; const seen = {};
while (true) { const st = await f().evaluate(() => ({ m: LX.mode, cue: LX.cue, alt: LX.S.alt, stage: LX.S.stage }));
  if (st.m !== 'fly') break;
  if (st.cue && st.cue !== lastCue) { await shot('cue-' + st.cue); if (how === 'auto') await p.keyboard.press('Space'); lastCue = st.cue; console.log(el(), 'cue', st.cue, (st.alt / 1e3).toFixed(0) + 'km'); }
  const tr = await f().evaluate(() => LX.stats().tReal); for (const k of [1.2, 3.5, 6.5, 10, 20, 28]) if (tr > k && !seen[k]) { seen[k] = 1; await shot('fly' + k); }
  n++; await p.waitForTimeout(200); if (n > 900) break; }
console.log('ascent wall time', el(), 's, mode', await f().evaluate(() => LX.mode), JSON.stringify(await f().evaluate(() => LX.stats())));
await p.waitForTimeout(4000); await shot('orbit'); await f().waitForFunction(() => LX.flight, null, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(1500); await shot('card');
console.log('flight', JSON.stringify(await f().evaluate(() => LX.flight)));
await b.close();
