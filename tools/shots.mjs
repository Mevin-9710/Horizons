// Screenshot helper: node tools/shots.mjs <outDir> <screen[:waitMs]> ...   (server: python3 -m http.server 8765 --directory game)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [outDir, ...screens] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
for (const s of screens) {
  const [name, wait = '5000'] = s.split(':');
  await p.goto('http://localhost:8765/#' + name); await p.reload(); await p.waitForTimeout(+wait);
  await p.screenshot({ path: `${outDir}/${name}.png` }); console.log('shot', name);
}
await b.close();
