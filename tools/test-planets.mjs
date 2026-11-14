import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1100, height: 690 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
const f = () => p.frames().find(x => x !== p.mainFrame());
// select: open the Saturn brief
await p.goto('http://localhost:8765/#select'); await p.reload(); await p.waitForTimeout(4000);
await p.screenshot({ path: out + '/p-select.png' });
console.log('select missions:', await f().evaluate(() => Object.keys(MISSIONS).join(',') + ' | bodies ' + bodies.filter(b => b.mission).length));
await f().evaluate(() => { const fn = window.select || window.pick || window.selectBody; if (fn) fn('saturn'); else { const b = bodies.find(x => x.id === 'saturn'); } });
await p.waitForTimeout(3500); await p.screenshot({ path: out + '/p-select-saturn.png' });
// base with the Saturn mission
await p.goto('http://localhost:8765/'); await p.waitForTimeout(500); await p.evaluate(() => go('base', { mission: 'saturn' })); await p.waitForTimeout(3000);
await f().waitForFunction(() => typeof MODELS !== 'undefined' && Object.keys(MODELS).length >= 19, null, { timeout: 120000 }).catch(() => console.log('models timeout'));
await p.waitForTimeout(1500); console.log('base HUD:', await f().evaluate(() => document.getElementById('res').innerText.replace(/\n/g, ' | ') + ' || ribbon ' + document.querySelector('.mission .t-ribbon').textContent + ' || show ' + SHOW));
await p.screenshot({ path: out + '/p-base.png' });
await f().evaluate(() => enterRoom('craft')); await p.waitForTimeout(4000); await p.screenshot({ path: out + '/p-craft.png' });
// control for Mars
await p.evaluate(() => go('control', { mission: 'mars', design: { rocket: 'SLS', inst: 'Thermal IR imager', orbit: 'o' }, flight: { rocket: 'SLS', time: 30, peri: 190, ap: 400, score: 2000, f2: .4, hits: 5, late: 0 } })); await p.waitForTimeout(9000);
await p.screenshot({ path: out + '/p-control-mars.png' }); console.log('control:', await f().evaluate(() => document.getElementById('capText').textContent + ' || ' + document.getElementById('sci').textContent));
await b.close();
