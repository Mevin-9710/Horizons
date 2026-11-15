// Hands-free tutorial: from the home screen, press only the coach's Next buttons until the report.  node tools/test-tutorial-auto.mjs <outDir>
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const [O = '/tmp'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1300, height: 800 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); const f = () => p.frames().find(x => x !== p.mainFrame());
await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
await f().click('.ctas .t-btn.ghost'); let clicks = 0, last = '', t0 = Date.now(), n = 0;
while (Date.now() - t0 < 15 * 60e3) {
  let st = null; try { st = await f().evaluate(() => { const c = document.querySelector('.coach.s'); if (!c) return { txt: '' };
    const btn = [...c.querySelectorAll('[data-next],[data-auto]')].find(x => !x.disabled && !x.closest('[hidden]'));
    return { txt: c.querySelector('.k span').textContent + ' | ' + c.querySelector('[data-say]').textContent.slice(0, 70), btn: btn ? btn.textContent : null, fin: btn && btn.textContent === 'Finish' }; }); } catch (e) { await p.waitForTimeout(500); continue; }
  if (st.txt && st.txt !== last) { last = st.txt; console.log(location(), st.txt); if (++n % 4 === 1) await p.screenshot({ path: `${O}/auto-${String(n).padStart(2, '0')}.png` }); }
  if (st.btn) { const fin = st.fin; await f().click('.coach [data-next], .coach [data-auto]:not([disabled])').catch(() => {}); clicks++; if (fin) { console.log('FINISHED after', clicks, 'Next clicks'); break; } await p.waitForTimeout(1700); }
  else await p.waitForTimeout(400);
}
function location() { return p.url().split('#')[1] || 'home'; }
console.log('report:', JSON.stringify(await f().evaluate(() => window.LAST_REPORT || null).catch(() => null)), '| tutorial flag', await p.evaluate(() => state.tutorial));
await b.close();
