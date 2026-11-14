// Ascent physics, ported from The Horizon Explorers v4 (HTML4): 2D polar point mass, gravity turn autopilot,
// exponential atmosphere, dynamic pressure, angle-of-attack structural load, two stages, osculating orbit.
// No DOM, no three.js: the launch screen inlines this file, and tools/sim/test-ascent.mjs runs it headless.
const RE=6371e3, MU=3.986e14, RAD=Math.PI/180;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// a1/a2: initial thrust acceleration (m/s2), b1/b2: burn time at full throttle (s). h: display height factor.
const VEHICLES={
  'rocket-jupiter-c':{name:'Jupiter-C',     a1:15.5,b1:150,a2:12.5,b2:420, s1:.52, fair:.80},
  'rocket-ares-1':   {name:'Ares I',        a1:16,  b1:150,a2:12,  b2:380, s1:.50, fair:.84},
  'rocket-saturn-v': {name:'Saturn V',      a1:19,  b1:170,a2:13.5,b2:430, s1:.42, fair:.80},
  'rocket-shuttle':  {name:'Space Shuttle', a1:17,  b1:160,a2:13,  b2:420, s1:.45, fair:.82},
  'rocket-sls':      {name:'SLS',           a1:19.5,b1:175,a2:13.5,b2:440, s1:.55, fair:.82}};
function newAscent(){ return {met:0,alt:0,vr:0,vt:0,th:0,thr:1,pitch:0,theta:0,f1:1,f2:1,stage:'S1',engine:false,fair:true,auto:true,
  q:0,qmax:0,acc:0,maxq:false,thrQ:false,dmg:false,lifted:false,aoa:0,stress:0,dep:false,s1gone:false,fail:null,ev:[]}; }
function orbitOf(S){ const r=RE+S.alt,v2=S.vr*S.vr+S.vt*S.vt,e=v2/2-MU/r,h=r*S.vt; if(e>=0) return {peri:S.alt,ap:Infinity};
  const a=-MU/(2*e),ec=Math.sqrt(Math.max(0,1+2*e*h*h/(MU*MU))); return {peri:a*(1-ec)-RE,ap:a*(1+ec)-RE}; }
// sd = simulated seconds to advance; inp = {left,right,up,down} manual keys (optional)
function stepAscent(S,V,sd,inp){
  S.met+=sd;
  if(S.auto){ let tg=S.pitch; const gam=Math.atan2(S.vt,S.vr)/RAD;
    if(S.alt<1200) tg=0; else if(S.stage==='S1'||S.stage==='C1') tg=gam+2.5+18*clamp(S.alt/90e3,0,1);
    else { const vt=(190e3-S.alt)*.012; tg=90+clamp((S.vr-vt)*.03,-50,25); if(S.alt>150e3&&S.alt<230e3) tg=90+clamp(S.vr*.02,-30,30); }
    S.pitch+=clamp(tg-S.pitch,-2*sd,2*sd); }
  if(inp){ if(inp.left){S.pitch-=2.8*sd;S.auto=false} if(inp.right){S.pitch+=2.8*sd;S.auto=false}
    if(inp.up) S.thr=Math.min(1,S.thr+.1*sd); if(inp.down) S.thr=Math.max(.4,S.thr-.1*sd); }
  S.pitch=clamp(S.pitch,0,130);
  const tgt=S.engine?S.thr:0; S.th+=clamp(tgt-S.th,-.6*sd,.4*sd); if(!S.engine&&S.th<.01) S.th=0;
  const n=Math.max(4,Math.ceil(sd/.25)), h=sd/n;
  for(let i=0;i<n;i++){ const r=RE+S.alt,g=MU/(r*r); let a=0;
    if(S.th>0){ if(S.stage==='S1'){ a=V.a1*S.th/(1-.7*(1-S.f1)); S.f1-=S.th/V.b1*h; } else if(S.stage==='S2'){ a=V.a2*S.th/(1-.5*(1-S.f2))*(S.fair?1:1.04); S.f2-=S.th/V.b2*h; } }
    const p=S.pitch*RAD; let ar=a*Math.cos(p),at=a*Math.sin(p);
    const rho=1.225*Math.exp(-S.alt/8500),v=Math.hypot(S.vr,S.vt); S.q=.5*rho*v*v;
    if(v>1){ const dr=S.q*4e-5/(S.stage==='S1'?1:2); ar-=dr*S.vr/v; at-=dr*S.vt/v; }
    ar+=-g+S.vt*S.vt/r; at-=S.vr*S.vt/r;
    if(S.alt<=0&&ar<=0&&S.vr<=0){ S.alt=0;S.vr=0;at=0;S.vt=0;ar=0; }
    S.vr+=ar*h; S.vt+=at*h; S.alt+=S.vr*h; S.theta+=S.vt/r*h; S.acc=a/9.81;
    if(S.f1<=0&&S.stage==='S1'){ S.f1=0; S.engine=false; S.stage='C1'; S.ev.push('meco'); }
    if(S.f2<=0&&S.stage==='S2'){ S.f2=0; S.engine=false; S.stage='C3'; S.ev.push('seco'); } }
  if(S.alt>50&&!S.lifted){ S.lifted=true; S.ev.push('liftoff'); }
  if(S.alt<=0&&S.lifted&&S.vr<=0){ S.fail='The vehicle fell back to the surface.'; return; }
  const v=Math.hypot(S.vr,S.vt),gm=Math.atan2(S.vt,S.vr)/RAD; S.aoa=v>80?Math.abs(S.pitch-gm):0; S.stress=S.q/1000*S.aoa;
  if(S.q>S.qmax) S.qmax=S.q; if(S.q>12e3&&S.thr<=.8) S.thrQ=true;
  if(!S.maxq&&S.qmax>8e3&&S.q<S.qmax*.9){ S.maxq=true; S.ev.push('maxq'); }
  if(S.stress>220) S.fail='Structural failure: angle of attack too high at '+(S.q/1e3).toFixed(0)+' kPa.';
}
// player actions
const act={
  meco(S){ if(S.stage==='S1'&&S.engine){ S.engine=false; S.stage='C1'; S.ev.push('meco'); return true; } },
  sep(S){ if(S.stage==='C1'){ S.stage='C2'; S.s1gone=true; S.ev.push('sep'); return true; } },
  ses(S){ if(S.stage==='C2'){ S.stage='S2'; S.engine=true; S.th=0; S.ev.push('ses'); return true; } },
  fairing(S){ if(S.fair&&S.lifted){ S.fair=false; if(S.alt<100e3) S.dmg=true; S.ev.push('fair'); return true; } },
  seco(S){ if(S.stage==='S2'&&S.engine){ S.engine=false; S.stage='C3'; S.ev.push('seco'); return true; } },
  deploy(S){ if(S.stage==='C3'&&!S.dep&&orbitOf(S).peri>=140e3){ S.dep=true; S.ev.push('dep'); return true; } }};
if(typeof module!=='undefined') module.exports={VEHICLES,newAscent,stepAscent,orbitOf,act,RE,MU};
