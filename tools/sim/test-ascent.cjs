// Headless check: with the autopilot and on-cue actions, every rocket must reach a stable orbit.
const {VEHICLES,newAscent,stepAscent,orbitOf,act}=require('./ascent.cjs');
const TSF=t=>t<6?7:16;   // sim seconds per real second (slow start so liftoff and Max-Q read)
let bad=0;
for(const [k,V] of Object.entries(VEHICLES)){
  for(const lag of [0,.8]){            // perfect player, and a player who misses every cue (auto-fire after the grace)
  const S=newAscent(); S.engine=true; let t=0,dt=1/60,cue=null,cueT=0,log=[];
  while(t<90&&!S.fail&&!S.dep){ stepAscent(S,V,dt*TSF(t)); t+=dt;
    const o=orbitOf(S); let want=null;
    if(S.stage==='C1') want='sep'; else if(S.stage==='C2') want='ses'; else if(S.fair&&S.alt>=110e3) want='fairing';
    else if(S.stage==='S2'&&S.engine&&o.peri>=150e3) want='seco'; else if(S.stage==='C3'&&o.peri>=140e3) want='deploy';
    if(want!==cue){cue=want;cueT=t}
    if(cue&&t-cueT>=lag){ if(act[cue](S)) log.push(cue+'@'+t.toFixed(1)); cue=null; }
    if(S.ev.length){ for(const e of S.ev) if(e==='maxq'||e==='liftoff'||e==='meco') log.push(e+'@'+t.toFixed(1)); S.ev.length=0; } }
  const o=orbitOf(S); const ok=S.dep&&!S.fail&&t<=45;
  if(!ok) bad++;
  console.log((ok?'OK  ':'BAD ')+V.name.padEnd(14),'lag',lag,'t='+t.toFixed(1)+'s','orbit',(o.peri/1e3).toFixed(0)+'x'+(isFinite(o.ap)?(o.ap/1e3).toFixed(0):'esc'),'qmax',(S.qmax/1e3).toFixed(1),'f2',(S.f2*100).toFixed(0)+'%',S.fail||'',log.join(' '));
  }}
process.exit(bad?1:0);
