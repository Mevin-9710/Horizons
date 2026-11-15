import { createRequire } from 'node:module'; const require=createRequire(import.meta.url); const {chromium}=require('playwright');
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const p=await b.newPage({viewport:{width:1100,height:690}});
p.on('pageerror',e=>console.log('PAGEERR',e.message)); const f=()=>p.frames().find(x=>x!==p.mainFrame()); const O='docs/dev/cook/stills/r05/';
await p.goto('http://localhost:8765/#base'); await p.reload(); await p.waitForTimeout(3000);
await f().waitForFunction(()=>typeof MODELS!=='undefined'&&Object.keys(MODELS).length>=14,null,{timeout:120000}); await p.waitForTimeout(1500);
await p.screenshot({path:O+'base.png'}); await f().evaluate(()=>{camZoomGoal=.55}); await p.waitForTimeout(2500); await p.screenshot({path:O+'base-wide.png'});
await p.goto('http://localhost:8765/'); await p.waitForTimeout(600);
await p.evaluate(()=>go('launch',{mission:'mars',pick:{rocket:'r3'},design:{rocket:'x'}})); await p.waitForTimeout(2500);
await f().waitForFunction(()=>window.LX&&LX.mode==='cine',null,{timeout:120000});
for(const [t,n] of [[1.5,'k0'],[5.5,'k1a'],[7.4,'k1b'],[9.2,'k1c']]){ await f().waitForFunction(t=>LX.stats().tCine>t,t,{timeout:120000}); await p.screenshot({path:O+n+'.png'}); }
await f().evaluate(()=>LX.skip()); await f().waitForFunction(()=>LX.stats().tReal>7,null,{timeout:120000});
await f().evaluate(()=>{ camMode=4; autoCam=false; showAdi(); }); await p.waitForTimeout(2500); await p.screenshot({path:O+'onboard.png'});
await b.close();
