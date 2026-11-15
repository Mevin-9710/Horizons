// Balance check: for every mission, which rockets can fly a design that meets all 3 goals with every gauge green
// and enough delta-v? Runs inside the real base screen.  node tools/test-balance.mjs
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 900, height: 600 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); const f = () => p.frames().find(x => x !== p.mainFrame());
for (const m of ['earth', 'moon', 'mars', 'venus', 'mercury', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
  await p.goto('http://localhost:8765/'); await p.waitForTimeout(300); await p.evaluate(m => go('base', { mission: m }), m); await p.waitForTimeout(2500);
  await f().waitForFunction(() => typeof PARTS !== 'undefined' && typeof totals === 'function', null, { timeout: 60000 });
  const r = await f().evaluate((m) => {
    const ids = c => PARTS[c].opts.map(o => o.id), goals = HZ_GOALS[m], plan = hzPlan(m);
    // smallest instrument sets that meet all goals
    const sets = []; const I = HZ_INST.map(i => i.id);
    for (let a = 0; a < I.length; a++) for (let b2 = a; b2 < I.length; b2++) for (let c = b2; c < I.length; c++) { const s = [...new Set([I[a], I[b2], I[c]])]; if (hzGoalsMet(m, s).every(g => g.ok)) sets.push(s); }
    const best = {};
    for (const rk of ids('rocket')) for (const set of sets) for (const bus of ids('bus')) for (const pw of ids('power')) for (const bt of ids('batt')) for (const cm of ids('comms')) for (const st of ids('store')) for (const en of ids('engine')) for (const tk of ids('tank')) {
      Object.assign(pick, { rocket: rk, bus, power: pw, batt: bt, comms: cm, store: st, engine: en, tank: tk, inst: set[0] || null, inst2: set[1] || null, inst3: set[2] || null });
      const T = totals().M; if (T.some(x => x.r > 1)) continue;
      const mass = totalMass(), need = plan.total ? plan.tpi + plan.oi * (opt('orbit').oiK ?? 1) : 0, cap = hzDvCap(pick, mass);
      if (cap < need) continue; const cost = +T[1].val.match(/\$(\d+)/)[1];
      if (!best[rk] || cost < best[rk].cost) best[rk] = { cost, mass, dv: +cap.toFixed(1), need: +need.toFixed(1), inst: set.join('+') }; }
    return { budget: LIMIT.budget, best };
  }, m);
  const rows = Object.entries(r.best).map(([k, v]) => `${({ r1: 'Jupiter-C', r2: 'Ares I', r3: 'Saturn V', r4: 'Shuttle', r5: 'SLS' })[k]} $${v.cost}M ${v.mass}kg dv ${v.dv}/${v.need}`);
  console.log(m.padEnd(8), `budget $${r.budget}M |`, rows.length ? rows.join(' | ') : 'NO FEASIBLE DESIGN');
}
await b.close();
