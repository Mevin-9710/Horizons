// launch (cinematic skipped) -> orbit -> transfer -> control.  node tools/test-transfer.mjs <outDir> <mission> [rocket] [engine]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out, mission = 'mars', rk = 'r5', eng = 'e2'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1100, height: 690 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
const f = () => p.frames().find(x => x !== p.mainFrame());
await p.goto('http://localhost:8765/'); await p.waitForTimeout(800);
await p.evaluate(([m, rk, eng]) => go('launch', { mission: m, pick: { rocket: rk, bus: 'b2', power: 'p2', engine: eng }, design: { rocket: 'x', inst: 'camera', orbit: 'o' }, skipCine: true }), [mission, rk, eng]);
await p.waitForTimeout(2500);
await f().waitForFunction(() => window.LX && LX.mode === 'fly', null, { timeout: 120000 });
let last = null; for (let n = 0; n < 900; n++) { const st = await f().evaluate(() => ({ m: LX.mode, cue: LX.cue })); if (st.m !== 'fly') break; if (st.cue && st.cue !== last) { last = st.cue; await p.keyboard.press('Space'); } await p.waitForTimeout(200); }
await f().waitForFunction(() => LX.flight, null, { timeout: 90000 }); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
console.log('mode after continue:', await f().evaluate(() => LX.mode + ' ' + (LX.tr ? LX.tr.st : '-')));
if (await f().evaluate(() => LX.mode) === 'ss') {
  await p.screenshot({ path: `${out}/tr-${mission}-park.png` }); last = null; let shots = 0;
  for (let n = 0; n < 900; n++) { const st = await f().evaluate(() => ({ st: LX.tr.st, cue: LX.cue, f: LX.tr.f })); if (st.st === 'done' || st.st === 'short') break;
    if (st.cue && st.cue !== last) { last = st.cue; await p.screenshot({ path: `${out}/tr-${mission}-cue-${st.cue}.png` }); await p.keyboard.press('Space'); }
    if (st.st === 'cruise' && st.f > .2 && shots === 0) { shots++; await p.screenshot({ path: `${out}/tr-${mission}-cruise.png` }); } await p.waitForTimeout(200); }
  await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/tr-${mission}-card.png` });
  console.log('transfer', JSON.stringify(await f().evaluate(() => LX.flight.transfer || LX.tr.st)));
  if (await f().evaluate(() => LX.tr.st) === 'done') { await p.keyboard.press('Enter'); await p.waitForFunction(() => location.hash === '#control', null, { timeout: 30000 }); await p.waitForTimeout(3500); await p.screenshot({ path: `${out}/tr-${mission}-control.png` }); console.log('control ok') }
}
await b.close();
