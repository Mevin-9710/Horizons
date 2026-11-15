/* Shared mission data and transfer maths (inlined into the launch screen and the hand-off glue by tools/build-game.py).
   Planet constants and plan() come from The Horizon Explorers v4: Hohmann transfer with patched conics.
   Each destination uses a real NASA mission whose spacecraft model is in NASA 3D Resources. */
const HZ_PL={
  mercury:{n:'Mercury',a:.387,P:.241,R:2440,mu:22032,cols:['#B5B0A8','#8E8982','#D2CDC4','#4A4640']},
  venus:  {n:'Venus',  a:.723,P:.615,R:6052,mu:324859,cols:['#E6C27A','#C9A55C','#F3DDA8','#7A5E2E']},
  earth:  {n:'Earth',  a:1,   P:1,   R:6371,mu:398600,cols:['#2C5B65','#1C3E46','#95B3B6','#0B1F24']},
  mars:   {n:'Mars',   a:1.524,P:1.881,R:3390,mu:42828,cols:['#C2643A','#A73B42','#E07A44','#4A1A14']},
  jupiter:{n:'Jupiter',a:5.203,P:11.86,R:69911,mu:1.267e8,cols:['#C9A55C','#8A7A4A','#F2C27A','#4A3F22'],big:1},
  saturn: {n:'Saturn', a:9.537,P:29.46,R:58232,mu:3.793e7,cols:['#E8D9B8','#C9B58A','#F3EEE4','#7A6A48'],big:1,ring:1},
  uranus: {n:'Uranus', a:19.19,P:84,   R:25362,mu:5.794e6,cols:['#95C9CF','#6FA9B2','#C4E4E6','#33606A'],big:1},
  neptune:{n:'Neptune',a:30.07,P:164.8,R:24622,mu:6.837e6,cols:['#2C4F8A','#1C3566','#6F8FCF','#0B1838'],big:1},
  pluto:  {n:'Pluto',  a:39.48,P:248,  R:1188,mu:869.6,cols:['#CBB59A','#A8937A','#E6D6C0','#5E4E3C']}};
// kind: 'orbit' (Earth orbit only), 'moon', 'orbiter' (transfer + insertion), 'flyby' (transfer, no insertion)
const HZ_MISSIONS={
  earth:  {planet:'earth',  name:'Wildfire watch',  nasa:'Landsat',        kind:'orbit',  diff:1,unit:'fires',        verb:'spotted',  model:'landsat-8', obj:'Spot new wildfires within hours, from orbit, so crews on the ground can act before they spread.'},
  moon:   {planet:'moon',   name:'Lunar polar ice', nasa:'LRO',            kind:'moon',   diff:2,unit:'ice maps',     verb:'made',     model:'lro',       obj:'Map water ice hiding in craters at the lunar poles that never see sunlight.'},
  mars:   {planet:'mars',   name:'Mars atmosphere', nasa:'MAVEN',          kind:'orbiter',diff:3,unit:'air samples',  verb:'taken',    model:'maven',     obj:'Measure how Mars is losing its air to space, and how fast.'},
  mercury:{planet:'mercury',name:'Mercury mapper',  nasa:'MESSENGER',      kind:'orbiter',diff:3,unit:'surface maps', verb:'made',     model:'messenger', obj:'Map all of Mercury and look for ice in polar craters that never see the Sun.'},
  venus:  {planet:'venus',  name:'Venus radar',     nasa:'Magellan',       kind:'orbiter',diff:2,unit:'radar swaths', verb:'mapped',   model:'magellan',  obj:'Map the surface of Venus with radar, straight through its thick clouds.'},
  jupiter:{planet:'jupiter',name:'Inside Jupiter',  nasa:'Juno',           kind:'orbiter',diff:3,unit:'gravity passes',verb:'flown',   model:'juno',      obj:'Measure the gravity and magnetic field of Jupiter to see what lies under the clouds.'},
  saturn: {planet:'saturn', name:'Rings and Titan', nasa:'Cassini-Huygens',kind:'orbiter',diff:3,unit:'ring scans',   verb:'made',     model:'cassini',   obj:'Study Saturn, its rings and its moon Titan from orbit.'},
  uranus: {planet:'uranus', name:'Ice giant flyby', nasa:'Voyager 2',      kind:'flyby',  diff:2,unit:'flyby images', verb:'taken',    model:'voyager',   obj:'Fly past Uranus, the ice giant that rolls on its side, and photograph its moons.'},
  neptune:{planet:'neptune',name:'Edge of the planets',nasa:'Voyager 2',   kind:'flyby',  diff:3,unit:'flyby images', verb:'taken',    model:'voyager',   obj:'Fly past Neptune and its moon Triton at the edge of the planets.'},
  pluto:  {planet:'pluto',  name:'Pluto flyby',     nasa:'New Horizons',   kind:'flyby',  diff:3,unit:'flyby images', verb:'taken',    model:'new-horizons',obj:'Cross the whole solar system for one fast pass over the icy heart of Pluto.'}};
// Hohmann transfer from Earth to a planet (km/s, days). HTML4 plan().
function hzPlan(key){ const M=HZ_MISSIONS[key]||HZ_MISSIONS.earth;
  if(M.kind==='orbit') return {tpi:0,oi:0,T:0,total:0};
  if(M.kind==='moon') return {tpi:3.13,oi:.82,T:3.5,total:3.95,a:58,e:(58-1)/(58+1),at:(1+58)/2,outer:true};
  const p=HZ_PL[M.planet],a=p.a,at=(1+a)/2,T=.5*Math.pow(at,1.5)*365.25,vE=29.78,vd=vE*Math.sqrt(2-1/at),vi1=Math.abs(vd-vE),r=6571,mu=398600;
  const tpi=Math.sqrt(vi1*vi1+2*mu/r)-Math.sqrt(mu/r),va=vE*Math.sqrt(2/a-1/at),vi2=Math.abs(va-vE/Math.sqrt(a)),rp=p.R*1.5,x=2*p.mu/rp;
  const oi=M.kind==='flyby'?0:Math.sqrt(vi2*vi2+x)-Math.sqrt(x*50/51);
  return {tpi,oi,T,total:tpi+oi,a,at,e:Math.abs(a-1)/(a+1),outer:a>1,vi2}; }
// Delta-v the stack can give after reaching orbit: what is left in the upper stage plus the spacecraft engine.
const HZ_STAGE_DV={r1:3.2,r2:4.6,r3:9.5,r4:7.2,r5:12.5}, HZ_ENGINE_DV={e1:.4,e2:1.6,e3:3.6};
function hzDvCap(pick){ return (HZ_STAGE_DV[pick&&pick.rocket]||3.2)+(HZ_ENGINE_DV[pick&&pick.engine]||.4); }

/* ===== Spacecraft design: instruments and mission goals (phase 2) =====
   Each mission has 3 goals; each goal is met by any one of its listed instruments. */
const HZ_INST=[
  {id:'cam',    name:'Visible camera',       proc:'scope',  mass:18, cost:10, time:3, pw:30,  data:12, note:'Sharp pictures in daylight'},
  {id:'ir',     name:'Thermal IR imager',    src:'NASA', model:'infrared-camera', mass:38, cost:32, time:5, pw:110, data:35, note:'Sees heat, day and night'},
  {id:'hyper',  name:'Hyperspectral imager', proc:'scope2', mass:70, cost:58, time:8, pw:190, data:95, note:'Hundreds of colours: what things are made of'},
  {id:'radar',  name:'Imaging radar',        proc:'radar',  mass:90, cost:45, time:7, pw:220, data:120, note:'Sees through clouds and haze'},
  {id:'mag',    name:'Magnetometer',         proc:'boom',   mass:6,  cost:8,  time:2, pw:8,   data:2,  note:'Measures magnetic fields on a long boom'},
  {id:'spec',   name:'Mass spectrometer',    proc:'spec',   mass:25, cost:30, time:5, pw:45,  data:10, note:'Sniffs gases and charged particles'},
  {id:'neutron',name:'Neutron spectrometer', proc:'neutron',mass:15, cost:18, time:4, pw:20,  data:4,  note:'Finds hidden water ice'},
  {id:'grav',   name:'Gravity science radio',proc:'gravr',  mass:8,  cost:12, time:3, pw:25,  data:3,  note:'Tracks tiny speed changes to map gravity'}];
const HZ_GOALS={
  earth:  [['Spot fires day and night',['ir','hyper']],['Map burned land',['cam','hyper']],['See through the smoke',['ir','radar']]],
  moon:   [['Find ice in dark craters',['neutron','radar']],['Map the polar terrain',['cam','radar']],['Measure surface temperature',['ir']]],
  mars:   [['Sample the upper air',['spec']],['Measure the magnetic field',['mag']],['Image the glowing atmosphere',['hyper','cam']]],
  mercury:[['Map the whole surface',['cam','hyper']],['Find ice at the poles',['neutron','radar']],['Measure the magnetic field',['mag']]],
  venus:  [['Map the surface through the clouds',['radar']],['Map the gravity field',['grav']],['Study the cloud tops',['ir','hyper']]],
  jupiter:[['Map the gravity field',['grav']],['Map the magnetic field',['mag']],['Look under the clouds',['ir']]],
  saturn: [['Image the rings',['cam','hyper']],['See through the haze on Titan',['radar','ir']],['Sample the plasma',['spec','mag']]],
  uranus: [['Photograph the planet and moons',['cam','hyper']],['Measure the magnetic field',['mag']],['Measure the heat inside',['ir']]],
  neptune:[['Photograph Neptune and Triton',['cam','hyper']],['Measure the magnetic field',['mag']],['Measure the heat inside',['ir']]],
  pluto:  [['Map the icy heart',['cam','hyper']],['Measure the thin air',['spec']],['Measure surface temperatures',['ir']]]};
function hzGoalsMet(key,ids){ return (HZ_GOALS[key]||HZ_GOALS.earth).map(([t,need])=>({t,need,ok:need.some(n=>ids.includes(n))})); }
// propulsion: engine efficiency x tank size gives the spacecraft's own delta-v
const HZ_ENGINE_K={e1:.35,e2:1,e3:1.9}, HZ_TANK_DV={t1:1,t2:2,t3:3.4};
function hzDvCap(pick){ return (HZ_STAGE_DV[pick&&pick.rocket]||3.2)+(HZ_ENGINE_K[pick&&pick.engine]||.35)*(HZ_TANK_DV[pick&&pick.tank]||1); }

/* ===== Orbits: each choice has real effects in mission control =====
   ecl: share of each orbit spent in shadow (batteries), link: ground passes (downlink), sci: science per pass,
   oiK: insertion delta-v factor at the destination. */
const HZ_ORBITS={
  orbit:[ // Earth missions
    {id:'o1',name:'Sun-sync 550 km', ecl:.35,link:1,  sci:1,   oiK:1,  note:'Passes over every place at the same local time: fair, repeatable pictures'},
    {id:'o2',name:'Low 400 km',      ecl:.4, link:.8, sci:1.15,oiK:1,  cost:-3,note:'Closer means sharper pictures, but fewer ground passes and more shadow'},
    {id:'o3',name:'Polar 800 km',    ecl:.32,link:1.3,sci:.9, oiK:1,  note:'Flies over the polar ground stations every orbit: lots of downlink'},
    {id:'o4',name:'Dawn-dusk 700 km',ecl:.04,link:1,  sci:.85,oiK:1,  cost:4,note:'Rides the line between day and night: almost never in shadow'}],
  around:[ // orbiters and the Moon
    {id:'o1',name:'Low circular',    ecl:.4, link:.9, sci:1.2, oiK:1.15,note:'Close to the surface: best science, more shadow, costs more fuel to reach'},
    {id:'o2',name:'High elliptical', ecl:.15,link:1.1,sci:.85, oiK:.85, note:'Swoops low then far out: little shadow, cheap to enter, less science'},
    {id:'o3',name:'Polar',           ecl:.3, link:1,  sci:1.05,oiK:1,   note:'Passes over the poles: sees the whole surface over time'}],
  flyby:[
    {id:'o1',name:'Close pass',      ecl:0,  link:1,  sci:1.25,oiK:0,   note:'Skims close: sharper data, a riskier aim'},
    {id:'o2',name:'Safe distance',   ecl:0,  link:1,  sci:.9,  oiK:0,   note:'Passes wider: safe, but less detail'}]};
function hzOrbitsFor(key){ const M=HZ_MISSIONS[key]||HZ_MISSIONS.earth; return M.kind==='orbit'?HZ_ORBITS.orbit:M.kind==='flyby'?HZ_ORBITS.flyby:HZ_ORBITS.around; }

/* ===== Balance (v2): the rocket's push depends on how heavy your spacecraft is, and every mission has its own limits =====
   A light spacecraft can ride a small rocket a long way; a heavy one needs a big rocket. */
const HZ_ROCKET={r1:{cap:300,dv:6.4},r2:{cap:800,dv:7.2},r3:{cap:2000,dv:10.5},r4:{cap:2600,dv:8.4},r5:{cap:4000,dv:12.5}};
function hzRocketDv(rk,mass){ const R=HZ_ROCKET[rk]||HZ_ROCKET.r1; return Math.max(0,R.dv*(1-.55*Math.min(1,(mass||0)/R.cap))); }
hzDvCap=function(pick,mass){ return hzRocketDv(pick&&pick.rocket,mass)+(HZ_ENGINE_K[pick&&pick.engine]||.35)*(HZ_TANK_DV[pick&&pick.tank]||1); };
const HZ_LIMITS={earth:{budget:180,time:12},moon:{budget:320,time:18},mars:{budget:450,time:24},mercury:{budget:480,time:30},venus:{budget:360,time:24},
  jupiter:{budget:560,time:36},saturn:{budget:620,time:40},uranus:{budget:520,time:36},neptune:{budget:540,time:36},pluto:{budget:500,time:36}};

// sunlight at the destination, as a share of Earth's (solar wings make this much less; an RTG does not care)
function hzSunK(key){ const M=HZ_MISSIONS[key]; if(!M||M.planet==='earth'||M.planet==='moon') return 1; const a=HZ_PL[M.planet]?HZ_PL[M.planet].a:1; return Math.min(2,Math.pow(a,-1.25)); }

/* ===== Difficulty and sandbox (Settings) ===== */
const HZ_DIFF={cadet:{name:'Cadet',dv:1.2,budget:1.25,grace:1.6,score:.9},pilot:{name:'Pilot',dv:1,budget:1,grace:1,score:1},commander:{name:'Commander',dv:.88,budget:.85,grace:.6,score:1.15}};
function hzDiff(){ const S=(window.HZ&&HZ.settings)||{}; return HZ_DIFF[S.diff]||HZ_DIFF.pilot; }
function hzSandbox(){ return !!(window.HZ&&HZ.settings&&HZ.settings.sandbox); }
{ const _cap=hzDvCap; hzDvCap=function(p,m){ return _cap(p,m)*hzDiff().dv; }; }

/* ===== The real NASA mission behind each game mission (for "a real mission like yours" in the report) ===== */
const HZ_REAL={
  earth:  {n:'Landsat 8',y:2013,rocket:'Atlas V',mass:2623,power:'solar',inst:['cam','ir'],txt:'An imaging camera (OLI) and a thermal infrared sensor (TIRS), in a sun-synchronous orbit at 705 km.'},
  moon:   {n:'Lunar Reconnaissance Orbiter',y:2009,rocket:'Atlas V',mass:1916,power:'solar',inst:['cam','ir','neutron','radar'],txt:'Cameras, a thermal radiometer, a neutron detector and a small radar, in a low polar orbit.'},
  mars:   {n:'MAVEN',y:2013,rocket:'Atlas V',mass:2454,power:'solar',inst:['spec','mag','hyper'],txt:'A mass spectrometer, a magnetometer and an ultraviolet imaging spectrograph, in an elliptical orbit.'},
  mercury:{n:'MESSENGER',y:2004,rocket:'Delta II',mass:1107,power:'solar',inst:['cam','mag','neutron'],txt:'Cameras, a magnetometer and a neutron spectrometer. It used six planet flybys to slow down instead of a huge rocket.'},
  venus:  {n:'Magellan',y:1989,rocket:'Space Shuttle Atlantis',mass:3449,power:'solar',inst:['radar','grav'],txt:'A radar that mapped 98% of Venus through the clouds, and radio tracking for gravity.'},
  jupiter:{n:'Juno',y:2011,rocket:'Atlas V',mass:3625,power:'solar',inst:['grav','mag','ir'],txt:'Huge solar wings (the farthest solar-powered craft), a magnetometer, gravity science and a microwave radiometer.'},
  saturn: {n:'Cassini-Huygens',y:1997,rocket:'Titan IV-B',mass:5712,power:'rtg',inst:['cam','radar','spec','mag'],txt:'Three RTGs, cameras, a radar that saw through Titan\'s haze, and particle instruments.'},
  uranus: {n:'Voyager 2',y:1977,rocket:'Titan IIIE',mass:722,power:'rtg',inst:['cam','mag','ir'],txt:'RTG power, cameras, a magnetometer and an infrared spectrometer: still the only visitor to Uranus.'},
  neptune:{n:'Voyager 2',y:1977,rocket:'Titan IIIE',mass:722,power:'rtg',inst:['cam','mag','ir'],txt:'The same Voyager 2, twelve years after launch: still the only visitor to Neptune.'},
  pluto:  {n:'New Horizons',y:2006,rocket:'Atlas V',mass:478,power:'rtg',inst:['cam','spec','ir'],txt:'A light, fast craft with an RTG, cameras and an ultraviolet spectrometer for Pluto\'s thin air.'}};

/* ===== Saved flights (this browser): compare with your last design, local leaderboard ===== */
const HZ_FLIGHTS={ all(){ try{ return JSON.parse(localStorage.getItem('hz-flights')||'[]'); }catch(e){ return []; } },
  save(f){ try{ const a=this.all(); a.push(f); localStorage.setItem('hz-flights',JSON.stringify(a.slice(-200))); }catch(e){} },
  of(m){ return this.all().filter(f=>f.mission===m); },
  best(m){ return this.of(m).filter(f=>!f.sandbox).sort((a,b)=>b.score-a.score); } };
