// Full playthrough of one mission like a player, with screenshots of every step.
// node tools/test-full.mjs <outDir> [mission]
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const { chromium, devices } = require('playwright');
const [O, MIS = 'mars'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +(process.env.VW || 1440), height: +(process.env.VH || 900) } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
const f = () => p.frames().find(x => x !== p.mainFrame());
let n = 0; const shot = async (t, pg = p) => { await pg.screenshot({ path: `${O}/${String(++n).padStart(2, '0')}-${t}.png` }); console.log(n, t); };
const plan = async () => f().evaluate(() => [...document.querySelectorAll('.plan li')].map(li => (li.classList.contains('ok') ? '✓' : li.classList.contains('bad') ? '✗' : '·') + ' ' + li.innerText.split('\n')[0]).join(' | '));
const fit = async (c, id) => { await f().click(`[data-tab="${c}"]`); await p.waitForTimeout(250); await f().click(`[data-fit="${c}:${id}"]`); await p.waitForTimeout(300); };

await p.goto('http://localhost:8765/');
if (process.env.DIFF) await p.evaluate(([d, m]) => { localStorage.setItem('hz-settings', JSON.stringify({ diff: d })); localStorage.setItem('hz-flights', JSON.stringify([{ mission: m, score: 71, sandbox: false, diff: 'Pilot', date: 1, rocket: 'Saturn V', orbit: 'Low circular', power: 'Small solar wings', batt: 'Small battery', comms: 'Small dish', store: 'Small storage', insts: ['cam'], mass: 900, cost: 300 }])); }, [process.env.DIFF, MIS]);
await p.reload(); await p.waitForTimeout(3500); await shot('home');
if (process.env.DIFF) { await f().evaluate(() => document.getElementById('open-settings').click()); await p.waitForTimeout(700); await shot('settings'); await f().evaluate(() => document.querySelector('#settings [data-close]').click()); await p.waitForTimeout(400); }
await f().click('.t-btn.primary.btn'); await p.waitForFunction(() => location.hash === '#select'); await p.waitForTimeout(3500);
await f().evaluate(m => select(m), MIS); await p.waitForTimeout(2500); await shot('select-brief');
await f().click('#start'); await p.waitForFunction(() => location.hash === '#base'); await p.waitForTimeout(3000);
await f().waitForFunction(() => typeof MODELS !== 'undefined' && Object.keys(MODELS).length >= 14 && document.querySelector('.plan li'), null, { timeout: 120000 }); await p.waitForTimeout(1200);
await shot('base-arrival'); console.log('  HUD:', await f().evaluate(() => document.getElementById('res').innerText.replace(/\n/g, ' | '))); console.log('  plan:', await plan());
await f().click('.plan li[data-go="craft"]'); await f().waitForFunction(() => where === 'craft', null, { timeout: 60000 }); await p.waitForTimeout(2500); await shot('craft-enter');
await f().evaluate(() => { hero.position.set(0, 0, 4.6); }); await p.waitForTimeout(900); await p.keyboard.press('KeyE'); await p.waitForTimeout(900); await shot('design-panel');
// a sensible design for the mission's goals
const D = { jupiter: [['inst', 'grav'], ['inst', 'mag'], ['inst', 'ir'], ['power', process.env.PW || 'p4'], ['batt', 'bt2'], ['store', 's2'], ['comms', 'c4'], ['engine', 'e2'], ['tank', 't3']], mars: [['inst', 'spec'], ['inst', 'mag'], ['inst', 'cam'], ['power', 'p3'], ['batt', 'bt2'], ['store', 's2'], ['comms', 'c3'], ['engine', 'e2'], ['tank', 't2']] }[MIS];
for (const [c, id] of D) await fit(c, id);
await shot('design-done'); console.log('  plan:', await plan()); console.log('  HUD:', await f().evaluate(() => document.getElementById('res').innerText.replace(/\n/g, ' | ')));
await f().click('[data-close]'); await p.waitForTimeout(500);
await f().evaluate(() => exitRoom(() => walkTo('rocket'))); await f().waitForFunction(() => where === 'base', null, { timeout: 30000 }); await p.waitForTimeout(800); await f().evaluate(() => enterRoom('rocket'));
await f().waitForFunction(() => where === 'rocket', null, { timeout: 30000 }); await p.waitForTimeout(2000);
await f().evaluate(() => { hero.position.set(-6.5, 0, -2); }); await p.waitForTimeout(900); await shot('rocket-ares'); await p.keyboard.press('KeyE'); await p.waitForTimeout(600);
console.log('  plan:', await plan());
await f().evaluate(() => exitRoom()); await p.waitForTimeout(2500); await f().evaluate(() => openWin('pad')); await p.waitForTimeout(900); await shot('pad-check');
console.log('  pad:', await f().evaluate(() => document.querySelector('.check').innerText.replace(/\n/g, ' ') + ' | launch disabled ' + document.getElementById('launch').disabled));
await f().click('#launch'); await p.waitForFunction(() => location.hash === '#launch', null, { timeout: 30000 }); await p.waitForTimeout(3000);
await f().waitForFunction(() => window.LX && LX.mode !== 'load', null, { timeout: 120000 }); await p.waitForTimeout(1500); await shot('launch-hangar'); await f().evaluate(() => LX.skip());
await f().waitForFunction(() => LX.mode === 'fly', null, { timeout: 60000 }); await p.waitForTimeout(1500); await shot('launch-liftoff');
let last = null, k = 0; for (let i = 0; i < 900; i++) { const st = await f().evaluate(() => ({ m: LX.mode, cue: LX.cue, q: LX.S.q, mq: LX.S.maxq })); if (st.m !== 'fly') break;
  if (st.q > 9e3 && !st.mq) await p.keyboard.down('KeyS'); else await p.keyboard.up('KeyS');
  if (st.cue && st.cue !== last) { last = st.cue; if (k++ < 3) await shot('launch-cue-' + st.cue); await p.keyboard.press('Space'); } await p.waitForTimeout(200); }
await f().waitForFunction(() => LX.flight, null, { timeout: 90000 }); await p.waitForTimeout(800); await shot('launch-orbit-card'); console.log('  flight:', JSON.stringify(await f().evaluate(() => LX.flight)));
await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
if (await f().evaluate(() => LX.mode === 'ss')) { last = null;
  for (let i = 0; i < 900; i++) { const st = await f().evaluate(() => ({ st: LX.tr.st, cue: LX.cue })); if (st.st === 'done' || st.st === 'short') break; if (st.cue && st.cue !== last) { last = st.cue; await shot('transfer-' + st.cue); await p.keyboard.press('Space'); } await p.waitForTimeout(200); }
  await p.waitForTimeout(1500); await shot('transfer-arrived'); console.log('  transfer:', JSON.stringify(await f().evaluate(() => LX.flight.transfer || LX.tr.st))); await p.keyboard.press('Enter'); }
await p.waitForFunction(() => location.hash === '#control', null, { timeout: 30000 }); await p.waitForTimeout(3500); await shot('control');
await f().evaluate(() => { S.speed = 4; });
for (let i = 0; i < 400; i++) { if (await f().evaluate(() => !!window.LAST_REPORT)) break; const c = await f().evaluate(() => { const c = document.querySelector('.choice'); return !!c; });
  if (c) { if (i < 3) await shot('control-decision'); await f().evaluate(() => { const c = document.querySelector('.choice'); if (c) c.click(); }); } await p.waitForTimeout(400); }
await p.waitForTimeout(1500); await shot('report'); console.log('  report:', JSON.stringify(await f().evaluate(() => window.LAST_REPORT)));
// phone: base checklist + design panel
const ph = await b.newContext({ ...devices['iPhone 13'] }); const q = await ph.newPage(); const g = () => q.frames().find(x => x !== q.mainFrame());
await q.goto('http://localhost:8765/'); await q.waitForTimeout(500); await q.evaluate(m => go('base', { mission: m }), MIS); await q.waitForTimeout(3000);
await g().waitForFunction(() => typeof MODELS !== 'undefined' && Object.keys(MODELS).length >= 14 && document.querySelector('.plan'), null, { timeout: 120000 }); await q.waitForTimeout(1000);
await g().click('.plan .pl-tg'); await q.waitForTimeout(500); await shot('phone-base-plan', q);
await g().evaluate(() => { enterRoom('craft'); }); await q.waitForTimeout(3500); await g().evaluate(() => { openWin('stand'); }); await q.waitForTimeout(800); await shot('phone-design', q);
await b.close();
