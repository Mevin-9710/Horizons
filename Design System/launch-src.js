/* ================= Horizons launch screen =================
   Mechanics from The Horizon Explorers v4 (ascent physics, staging, hangar steps), rebuilt in the Horizons look.
   Flow: hangar cinematic (skippable) -> 5 s count -> ascent (autopilot flies, the player fires each event on cue) -> orbit -> hand-off. */
const $=id=>document.getElementById(id);
const HZ=window.HZ||{}, SET=Object.assign({sfx:true,music:true,motion:false,gfx:'high'},HZ.settings||{});
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||!!SET.motion;
const go=(s,d)=>{ if(window.hzGo) hzGo(s,d); };
const pick=HZ.pick||{};
const RK={r1:'rocket-jupiter-c',r2:'rocket-ares-1',r3:'rocket-saturn-v',r4:'rocket-shuttle',r5:'rocket-sls'}[pick.rocket]||'rocket-saturn-v';
const V=VEHICLES[RK], HT={'rocket-jupiter-c':10,'rocket-ares-1':13,'rocket-saturn-v':15,'rocket-shuttle':11.5,'rocket-sls':15}[RK];
const BUS={b1:'kit-body-2',b2:'kit-body-3',b3:'kit-body-1'}[pick.bus]||'kit-body-2', WING={p1:'kit-wings-1',p2:'kit-wings-2',p3:'kit-wings-3'}[pick.power]||'kit-wings-1';
const H1=HT*V.s1, H2=HT*V.fair;                       // stage 1 / stage 2 / fairing split heights on the model
const R=600, vis=h=>h<2000?h*.03:60+(h-2000)/1000*1.2;   // small display planet; altitude is compressed for the camera
const rnd=(a=1)=>(Math.random()-.5)*2*a, sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

/* ---------- renderer ---------- */
const canvas=$('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:SET.gfx!=='low',alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,SET.gfx==='low'?1:1.5)); renderer.setClearColor(0,0); renderer.localClippingEnabled=true;
const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(52,1,.1,7000);
scene.add(new THREE.HemisphereLight(0xFBFAF4,0x6E6457,.85)); const sun=new THREE.DirectionalLight(0xffffff,.95); sun.position.set(-300,260,320); scene.add(sun,sun.target);
const C=new THREE.Vector3(0,-R,0);

/* ---------- Comet surface shader (same banding and grain as the base) ---------- */
const CV=`varying vec3 vN; varying vec3 vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const CF=`uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 ax; uniform float fq; varying vec3 vN; varying vec3 vW;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){ float t=dot(vW,normalize(ax))*fq+.35*sin(vW.x*fq*2.+sin(vW.z*fq*2.6))*cos(vW.z*fq*1.7); float b=fract(t);
  vec3 col=b<.35?c0:b<.55?mix(c0,c1,smoothstep(.35,.42,b)):b<.78?mix(c1,c2,smoothstep(.55,.63,b)):mix(c2,c0,smoothstep(.78,1.,b));
  float d=dot(normalize(vN),normalize(vec3(-.5,1.,.35))); vec3 c=mix(c3,col,smoothstep(-.4,.9,d)*.85+.15); c+=(h(gl_FragCoord.xy)-.5)*.08; gl_FragColor=vec4(c,1.); }`;
const hex=x=>new THREE.Color(x);
const mat=(cols,ax=[1,0,.3],fq=.35)=>new THREE.ShaderMaterial({vertexShader:CV,fragmentShader:CF,side:THREE.DoubleSide,uniforms:{c0:{value:hex(cols[0])},c1:{value:hex(cols[1])},c2:{value:hex(cols[2])},c3:{value:hex(cols[3])},ax:{value:new THREE.Vector3(...ax)},fq:{value:fq}}});
const STONE=mat(['#D7D0C0','#B9B0A0','#E8E2D4','#6E6457'],[1,0,.4],.28), DARK=mat(['#3A2E3E','#2A1E3A','#4A3A44','#120C1E'],[0,1,.2],.5), RUST=mat(['#C2643A','#A73B42','#E07A44','#4A1A14'],[.2,1,.3],.9),
  CREAM=mat(['#FBFAF4','#E8D9B8','#D7D0C0','#9B7751'],[.1,1,.1],.5), GRASS=mat(['#8DAA62','#7C9A55','#A3BC74','#4E6B3A'],[1,0,.6],.16), LEAF=mat(['#5F8A4A','#4D7A3E','#7FA35E','#2E4A26'],[.3,1,.2],.8),
  PINE=mat(['#3E6B4A','#2F5A3C','#557F5C','#1E3828'],[.3,1,.2],.9), TRUNK=mat(['#8A6A48','#755839','#9E7C57','#4A3523'],[0,1,0],1.2), GOLD=mat(['#F2C27A','#C9A55C','#F2A541','#6B5A3A'],[.4,1,.2],1.4),
  OCEAN=mat(['#2C5B65','#1C3E46','#95B3B6','#0B1F24'],[.5,1,.3],.011);
const gy=(x,z)=>Math.sqrt(Math.max(0,R*R-x*x-z*z))-R;       // ground height on the small planet
const add=(o,p=scene)=>{ p.add(o); return o; };
const box=(w,h,d,m,x,y,z,p)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); return add(o,p); };
const cyl=(a,b,h,m,x,y,z,s=24,p)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,s),m); o.position.set(x,y,z); return add(o,p); };

/* ---------- Earth, pad, hangar, trees ---------- */
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,96,64),OCEAN); earth.position.copy(C); scene.add(earth);
const land=new THREE.Mesh(new THREE.SphereGeometry(R+.06,64,24,0,6.2832,0,.19),GRASS); land.position.copy(C); scene.add(land);
const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.045,64,48),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
  vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 m=modelViewMatrix*vec4(position,1.);v=-m.xyz;gl_Position=projectionMatrix*m;}',
  fragmentShader:'varying vec3 n;varying vec3 v;void main(){float f=pow(clamp(dot(normalize(v),-n),0.,1.),2.2);gl_FragColor=vec4(.45,.7,1.,1.)*f*.9;}'})); atm.position.copy(C); scene.add(atm);
const pad=new THREE.Group(); scene.add(pad);
cyl(10,10.4,.5,STONE,0,-.25,0,48,pad); cyl(7.6,7.6,.06,GOLD,0,.02,0,48,pad); cyl(7.2,7.2,.08,STONE,0,.04,0,48,pad); box(3,.1,16,DARK,0,.06,0,pad);
const tower=new THREE.Group(); tower.position.set(-HT*.11-3.2,0,0); pad.add(tower);
box(1.5,HT+3,1.5,DARK,0,(HT+3)/2,0,tower); const arms=[]; for(let i=1;i<=3;i++) arms.push(box(3.4,.24,.5,RUST,1.9,HT*i/3.6,0,tower));
const clamps=[]; for(let i=0;i<4;i++){ const a=i*1.5708+.785; clamps.push(box(.6,.9,.6,DARK,Math.cos(a)*(HT*.07+.5),.45,Math.sin(a)*(HT*.07+.5),pad)); }
box(34,.3,5.4,STONE,27,gy(27,0)-.1,0).rotation.z=-.045;                         // road from the hangar to the pad
const HGX=52, hg=new THREE.Group(); hg.position.set(HGX,gy(HGX,0),0); hg.rotation.z=-HGX/R; scene.add(hg);   // cutaway hangar, like the workshop halls
box(36,.5,26,STONE,0,-.25,0,hg); box(36,13,.5,CREAM,0,6.5,-13,hg); box(.5,13,26,CREAM,18,6.5,0,hg); box(36.6,.5,1,RUST,0,13.2,-13,hg); box(1,.5,26.6,RUST,18,13.2,0,hg);
for(const x of [-12,-4,4,12]) box(.4,.4,26,DARK,x,12.6,0,hg);
const crane=box(.7,.7,26,GOLD,0,11.8,0,hg), cable=box(.12,1,.12,DARK,0,9,0,hg);
for(const x of [-9,0,9]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(4,2.6),mat(['#A9D2EE','#CFE4F0','#8FC3E8','#6E9BB8'],[.2,1,0],.5)); w.position.set(x,7.5,-12.7); hg.add(w); }
const tp=box(HT*.9,1,3.2,DARK,0,0,0); for(const dx of [-.35,-.12,.12,.35]) for(const z of [-1.6,1.6]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.5,14),DARK); w.rotation.x=1.5708; w.position.set(dx*HT,-.7,z); tp.add(w); }
{ let ts=11; const TR=()=>(ts=(ts*16807)%2147483647)/2147483647;
  for(let i=0;i<150;i++){ const a=TR()*6.283, r=16+TR()*92, x=Math.cos(a)*r, z=Math.sin(a)*r; if((Math.abs(z)<5&&x>0&&x<76)||(Math.abs(x-HGX)<22&&Math.abs(z)<17)) continue;
    const y=gy(x,z), sc=.9+TR()*.9, g=new THREE.Group(); g.position.set(x,y,z); g.rotation.set(z/R,0,-x/R); scene.add(g);
    if(TR()<.4){ cyl(.1*sc,.14*sc,.7*sc,TRUNK,0,.3*sc,0,6,g); const c=new THREE.Mesh(new THREE.ConeGeometry(.85*sc,2.4*sc,7),PINE); c.position.y=1.7*sc; g.add(c); }
    else { cyl(.12*sc,.17*sc,1.1*sc,TRUNK,0,.5*sc,0,6,g); const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.95*sc,0),LEAF); c.position.y=1.7*sc; g.add(c); } } }

/* ---------- the rocket: one NASA model, cut into stage 1 / stage 2 / two fairing halves with clipping planes ---------- */
const rocket=new THREE.Group(); scene.add(rocket);
const upper=new THREE.Group(); rocket.add(upper);
const parts={}, CLIPS=[];
function part(name,parent,planes){ const g=new THREE.Group(); parent.add(g); parts[name]=g; g.userData.local=planes.map(p=>new THREE.Plane(new THREE.Vector3(p[0],p[1],p[2]),p[3])); g.userData.world=planes.map(()=>new THREE.Plane()); CLIPS.push(g); return g; }
part('s1',rocket,[[0,-1,0,H1]]); part('s2',upper,[[0,1,0,-H1],[0,-1,0,H2]]); part('fA',upper,[[0,1,0,-H2],[1,0,0,0]]); part('fB',upper,[[0,1,0,-H2],[-1,0,0,0]]);
function updateClips(){ for(const g of CLIPS){ g.updateWorldMatrix(true,false); for(let i=0;i<g.userData.local.length;i++) g.userData.world[i].copy(g.userData.local[i]).applyMatrix4(g.matrixWorld); } }
const pay=new THREE.Group(); pay.position.y=H2+.05; upper.add(pay); const wings=new THREE.Group(); pay.add(wings);

function b64ToBuf(s){ const bin=atob(s.trim()), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer; }
const fetchModel=n=>fetch(`models/${n}.txt`).then(r=>{ if(!r.ok) throw 0; return r.text(); }).catch(()=>fetch(`models-b64/${n}.txt`).then(r=>{ if(!r.ok) throw 0; return r.text(); }));
function dominant(img){ try{ const c=document.createElement('canvas'); c.width=c.height=24; const g=c.getContext('2d'); g.drawImage(img,0,0,24,24); const d=g.getImageData(0,0,24,24).data, n={}; let best=null,bc=0;
  for(let i=0;i<d.length;i+=4){ const k=(d[i]>>4)+','+(d[i+1]>>4)+','+(d[i+2]>>4); n[k]=(n[k]||0)+1; if(n[k]>bc){bc=n[k];best=[d[i],d[i+1],d[i+2]];} } return new THREE.Color(best[0]/255,best[1]/255,best[2]/255); }catch(e){ return new THREE.Color(1,1,1); } }
// -> [{geo,mat}] : one merged geometry per material, upright, base at y=0, height = size (or largest side when !upright)
function bake(gltf,size,upright){ gltf.scene.updateMatrixWorld(true); const byMat=new Map(), v=new THREE.Vector3();
  gltf.scene.traverse(o=>{ if(!o.isMesh||!o.geometry) return; const P=o.geometry.getAttribute('position'),I=o.geometry.index,n=I?I.count:P.count; const m=Array.isArray(o.material)?o.material[0]:o.material;
    if(!byMat.has(m)) byMat.set(m,[]); const t=byMat.get(m); for(let i=0;i<n;i++){ v.fromBufferAttribute(P,I?I.getX(i):i).applyMatrix4(o.matrixWorld); t.push(v.x,v.y,v.z); } });
  const bb=new THREE.Box3(); for(const a of byMat.values()) for(let i=0;i<a.length;i+=3) bb.expandByPoint(v.set(a[i],a[i+1],a[i+2]));
  const s=bb.getSize(new THREE.Vector3()); let rot=0; if(upright){ if(s.z>s.y&&s.z>=s.x) rot=1; else if(s.x>s.y&&s.x>s.z) rot=2; }
  const hgt=rot===1?s.z:rot===2?s.x:s.y, k=size/(upright?hgt:Math.max(s.x,s.y,s.z)), c=bb.getCenter(new THREE.Vector3()), out=[];
  for(const [m,a] of byMat){ const f=new Float32Array(a.length);
    for(let i=0;i<a.length;i+=3){ let x=a[i]-c.x,y=a[i+1]-c.y,z=a[i+2]-c.z; if(rot===1){ const t=y; y=z; z=-t; } else if(rot===2){ const t=y; y=x; x=-t; } f[i]=x*k; f[i+1]=y*k+(upright?size/2:0); f[i+2]=z*k; }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(f,3)); geo.computeVertexNormals();
    const col=(m&&m.color?m.color.clone():new THREE.Color(1,1,1)); if(m&&m.map&&m.map.image) col.multiply(dominant(m.map.image));
    out.push({geo,mat:new THREE.MeshStandardMaterial({color:col,roughness:.55,metalness:Math.min(m&&m.metalness||0,.35),side:THREE.DoubleSide})}); }
  return out; }
const loadModel=(n,size,up)=>fetchModel(n).then(t=>new Promise((res,rej)=>new THREE.GLTFLoader().parse(b64ToBuf(t),'',g=>res(bake(g,size,up)),rej)));
function fillRocket(meshes){ for(const g of CLIPS) for(const m of meshes){ const mm=m.mat.clone(); mm.clippingPlanes=g.userData.world; g.add(new THREE.Mesh(m.geo,mm)); } }
function fallbackRocket(){ const w=new THREE.MeshStandardMaterial({color:0xF2F0EA,roughness:.5,side:THREE.DoubleSide}), r=HT*.055;
  const body=new THREE.CylinderGeometry(r,r,HT*.86,28); body.translate(0,HT*.43,0); const nose=new THREE.ConeGeometry(r,HT*.14,28); nose.translate(0,HT*.93,0); return [{geo:body,mat:w},{geo:nose,mat:w}]; }
const PS_=Math.max(.9,HT*.075);
const ready=Promise.all([
  loadModel(RK,HT,true).catch(()=>fallbackRocket()).then(fillRocket),
  loadModel(BUS,PS_,false).then(ms=>{ for(const m of ms){ const o=new THREE.Mesh(m.geo,m.mat); o.position.y=PS_*.5; pay.add(o); } }).catch(()=>{ box(PS_*.6,PS_*.9,PS_*.6,GOLD,0,PS_*.5,0,pay); }),
  loadModel(WING,PS_*2.6,false).then(ms=>{ for(const m of ms){ const o=new THREE.Mesh(m.geo,m.mat); wings.add(o); } wings.position.y=PS_*.5; }).catch(()=>{})]);
wings.scale.set(.05,1,1);

/* ---------- flame, fire and smoke (pooled particles) ---------- */
const flame=new THREE.Group(); rocket.add(flame);
// soft plume: bright at the nozzle, fading along its length and at the silhouette (no hard cone edges)
const fm=(c,r,l,op)=>{ const g=new THREE.ConeGeometry(r,l,20,6,true); g.rotateX(Math.PI); g.translate(0,-l/2,0); return new THREE.Mesh(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{col:{value:new THREE.Color(c)},op:{value:op}},
  vertexShader:'varying float vy;varying vec3 vn;varying vec3 vv;void main(){vy=uv.y;vn=normalize(normalMatrix*normal);vec4 m=modelViewMatrix*vec4(position,1.);vv=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
  fragmentShader:'uniform vec3 col;uniform float op;varying float vy;varying vec3 vn;varying vec3 vv;void main(){float edge=pow(abs(dot(normalize(vn),vv)),1.6);float along=pow(1.-clamp(vy,0.,1.),1.5);gl_FragColor=vec4(col,op*edge*along);}'})); };
const FS=HT/14, fo=fm(0xF2893A,.8*FS,7*FS,.9), fi=fm(0xFFE9B0,.4*FS,4.5*FS,1); flame.add(fo,fi); const fl=new THREE.PointLight(0xff9040,0,70); flame.add(fl); flame.visible=false;
class PS{ constructor(n,additive){ this.n=n; this.i=0; this.P=new Float32Array(n*3); this.Cc=new Float32Array(n*3); this.A=new Float32Array(n*2); this.B=new Float32Array(n); this.V=new Float32Array(n*3); this.L=new Float32Array(n); this.M=new Float32Array(n).fill(1); this.S=new Float32Array(n*2);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(this.P,3)); g.setAttribute('col',new THREE.BufferAttribute(this.Cc,3)); g.setAttribute('aux',new THREE.BufferAttribute(this.A,2));
    this.o=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,uniforms:{k:{value:1}},
      vertexShader:'attribute vec3 col;attribute vec2 aux;uniform float k;varying vec3 c;varying float a;void main(){c=col;a=aux.y;vec4 m=modelViewMatrix*vec4(position,1.);gl_PointSize=aux.x*k/-m.z;gl_Position=projectionMatrix*m;}',
      fragmentShader:'varying vec3 c;varying float a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(c,a*smoothstep(.5,.05,d));}'})); this.o.frustumCulled=false; scene.add(this.o); }
  emit(px,py,pz,vx,vy,vz,life,s0,s1,r,g,b,al){ const i=this.i++%this.n, j=i*3; this.P[j]=px; this.P[j+1]=py; this.P[j+2]=pz; this.V[j]=vx; this.V[j+1]=vy; this.V[j+2]=vz; this.L[i]=this.M[i]=life; this.S[i*2]=s0; this.S[i*2+1]=s1; this.Cc[j]=r; this.Cc[j+1]=g; this.Cc[j+2]=b; this.B[i]=al; this.A[i*2]=s0; this.A[i*2+1]=al; }
  upd(dt){ const {n,L,M,P,V,A,S,B}=this; for(let i=0;i<n;i++){ if(L[i]<=0){ A[i*2+1]=0; continue; } L[i]-=dt; const f=Math.max(0,L[i]/M[i]), j=i*3; P[j]+=V[j]*dt; P[j+1]+=V[j+1]*dt; P[j+2]+=V[j+2]*dt; A[i*2]=S[i*2]+(S[i*2+1]-S[i*2])*(1-f); A[i*2+1]=B[i]*Math.min(1,f*2.5); }
    const at=this.o.geometry.attributes; at.position.needsUpdate=at.col.needsUpdate=at.aux.needsUpdate=true; } }
const LOW=SET.gfx==='low'||reduce, fire=new PS(LOW?700:1600,true), smoke=new PS(LOW?700:1500,false);

/* ---------- state ---------- */
const S=newAscent(); let mode='load', tc=-5, tReal=0, camMode=0, autoCam=true, telOn=false, orbT=0, late=0, hits=0, react=0, flight=null;
const inp={left:false,right:false,up:false,down:false}; let thrHeld=false;
const K={}; const P=new THREE.Vector3(), dirv=new THREE.Vector3(0,1,0), rv=new THREE.Vector3(), prevP=new THREE.Vector3(), t1=new THREE.Vector3(), t2=new THREE.Vector3(), t3=new THREE.Vector3(), ZV=new THREE.Vector3(0,0,1);
const camP=new THREE.Vector3(-20,5,30), camT=new THREE.Vector3(0,HT*.5,0), dP=new THREE.Vector3(), dT=new THREE.Vector3(); cam.position.copy(camP);
let spent=[];
function nozzleY(){ return S.s1gone?H1:0; }

/* ---------- audio: rumble, beeps, voice, a quiet music bed ---------- */
let ac=null, ngain=null, mgain=null;
function audio(){ if(ac||(!SET.sfx&&!SET.music)) return; try{ ac=new (window.AudioContext||window.webkitAudioContext)();
  const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate), d=b.getChannelData(0); let l=0; for(let i=0;i<d.length;i++){ l=(l+.02*(Math.random()*2-1))/1.02; d[i]=l*3.5; }
  const s=ac.createBufferSource(); s.buffer=b; s.loop=true; const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=380; ngain=ac.createGain(); ngain.gain.value=0; s.connect(f); f.connect(ngain); ngain.connect(ac.destination); s.start();
  if(SET.music){ mgain=ac.createGain(); mgain.gain.value=0; const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=900; mgain.connect(lp); lp.connect(ac.destination);
    const CH=[[110,164.8,220,277.2],[98,146.8,196,246.9],[130.8,196,261.6,329.6],[146.8,220,293.7,370]]; let bar=0;
    const play=()=>{ if(!ac) return; const t=ac.currentTime; for(const fq of CH[bar%4]){ const o=ac.createOscillator(), g=ac.createGain(); o.type='triangle'; o.frequency.value=fq; o.detune.value=rnd(6); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.05,t+1.2); g.gain.linearRampToValueAtTime(0,t+4.4); o.connect(g); g.connect(mgain); o.start(t); o.stop(t+4.5); } bar++; };
    play(); setInterval(play,4000); mgain.gain.linearRampToValueAtTime(.9,ac.currentTime+3); } }catch(e){ ac=null; } }
function beep(f=800,d=.12){ if(!ac||!SET.sfx) return; const o=ac.createOscillator(), g=ac.createGain(); o.type='square'; o.frequency.value=f; g.gain.value=.05; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+d); }
function say(t){ if(!SET.sfx) return; try{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=1.15; u.pitch=.85; u.volume=.9; speechSynthesis.speak(u); }catch(e){} }

/* ---------- HUD ---------- */
const phaseEl=$('phase'), capEl=$('cap'), actEl=$('act'), toastEl=$('toast'), thrEl=$('thr');
function setPhase(t,c){ phaseEl.textContent=t; if(c){ capEl.textContent=c; capEl.classList.remove('s'); void capEl.offsetWidth; capEl.classList.add('s'); } else capEl.classList.remove('s'); }
function toast(t,sub,voice){ toastEl.innerHTML=t+(sub?`<small>${sub}</small>`:''); toastEl.classList.remove('s'); void toastEl.offsetWidth; toastEl.classList.add('s'); if(voice!==false) say(voice||t); }
let cue=null, cueT=0;
const CUES={sep:['Separate stage',.9,'Stage separation'],ses:['Ignite stage 2',.9,'Second stage ignition'],fairing:['Jettison fairing',1.6,'Fairing separation'],seco:['Engine cutoff',.9,'S E C O'],deploy:['Deploy spacecraft',1.3,'Spacecraft deployed']};
function setCue(c){ if(c===cue) return; cue=c; cueT=0; if(c){ actEl.innerHTML=CUES[c][0]+'<kbd>Space</kbd>'; actEl.disabled=false; actEl.classList.add('cue'); beep(980,.08); } else { actEl.textContent=mode==='fly'?'Autopilot flying':'Stand by'; actEl.disabled=true; actEl.classList.remove('cue'); } }
function fireCue(byPlayer){ if(!cue||mode!=='fly') return; const c=cue; if(!act[c](S)) return; if(byPlayer){ hits++; react+=cueT; } else late++; onAction(c); setCue(null); }
function press(){ audio(); if(mode==='cine'){ return; } if(mode==='fly') fireCue(true); else if(mode==='orbit'&&$('card').classList.contains('s')) next(); }
actEl.addEventListener('click',press);
const fmtT=t=>{ const s=Math.abs(Math.floor(t)); return (t<0?'T-':'T+')+String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); };

/* ---------- staging visuals ---------- */
function tumble(o,vx,vy,vz,wx,wy,wz){ scene.attach(o); spent.push({o,vx:rv.x+vx,vy:rv.y+vy,vz:rv.z+vz,wx,wy,wz,t:0}); }
function burst(n,sp,r,g,b){ rocket.localToWorld(t1.set(0,nozzleY(),0)); for(let i=0;i<n;i++) fire.emit(t1.x,t1.y,t1.z,rv.x+rnd(sp),rv.y+rnd(sp),rv.z+rnd(sp),.6,1.2,.3,r,g,b,1); }
function onAction(c){
  if(c==='sep'){ tumble(parts.s1,-dirv.x*4,-dirv.y*4,0,.5,.1,.6); burst(40,6,1,.9,.7); toast('Stage sep','Stage 1 away. Light stage 2.','Stage separation'); setPhase('Stage separation'); }
  else if(c==='ses'){ toast('Stage 2','Vacuum engine at full thrust.','Second stage ignition'); setPhase('Stage 2 burn'); }
  else if(c==='fairing'){ t1.set(1,0,0).applyQuaternion(rocket.quaternion); tumble(parts.fA,t1.x*5-dirv.x,t1.y*5-dirv.y,t1.z*5,.2,.3,-.9); tumble(parts.fB,-t1.x*5-dirv.x,-t1.y*5-dirv.y,-t1.z*5,.2,-.3,.9);
    toast('Fairing',S.dmg?'Too early: heating damaged the spacecraft.':'Spacecraft exposed to space.','Fairing separation'); }
  else if(c==='seco'){ const o=orbitOf(S); toast('SECO','Orbit '+(o.peri/1e3).toFixed(0)+' km perigee. Deploy the spacecraft.','Engine cutoff. Orbit achieved.'); setPhase('Orbit'); }
  else if(c==='deploy'){ mode='orbit'; orbT=0; scene.attach(pay); camMode=3; autoCam=false; toast('Deployed','Solar wings unfolding.','Spacecraft deployed'); setPhase('Spacecraft deployed'); setCue(null); actEl.textContent='In orbit'; } }
function explode(why){ rocket.localToWorld(t1.set(0,HT*.5,0)); for(let i=0;i<260;i++){ const vx=rnd(30),vy=rnd(30),vz=rnd(30); fire.emit(t1.x,t1.y,t1.z,vx,vy,vz,1+Math.random(),2,9,1,.5+Math.random()*.4,.15,1); smoke.emit(t1.x,t1.y,t1.z,vx*.4,vy*.4,vz*.4,3+Math.random()*3,3,14,.35,.33,.3,.7); }
  rocket.visible=false; S.th=0; mode='fail'; setCue(null); say('Vehicle lost'); setPhase('Vehicle lost');
  setTimeout(()=>card('Vehicle lost',`<p>${why}</p><p>Keep the angle of attack low through Max-Q, and wait for 100 km before dropping the fairing.</p><div class="btns"><button class="t-btn primary" type="button" id="c-retry">Launch again</button><button class="t-btn" type="button" id="c-base">Back to base</button></div>`),1400); }
function card(title,html){ $('card-t').textContent=title; $('card-b').innerHTML=html; $('card').classList.add('s'); const b=$('card-b').querySelector('button'); if(b) b.focus();
  const r=$('c-retry'), bb=$('c-base'), n=$('c-next'); if(r) r.onclick=()=>go('launch',{mission:HZ.mission,pick:HZ.pick,design:HZ.design,skipCine:true}); if(bb) bb.onclick=()=>go('base',{mission:HZ.mission,pick:HZ.pick}); if(n) n.onclick=next; }
function next(){ go('control',{mission:HZ.mission,pick:HZ.pick,design:HZ.design,flight}); }
$('back').onclick=()=>go('base',{mission:HZ.mission,pick:HZ.pick});

/* ---------- hangar cinematic (HTML4's hangar and pad operations, as one skippable auto cutscene) ---------- */
const CINE=[[4.2,'Payload processing','The spacecraft is checked out and fuelled in the clean hangar.'],[3.8,'Fairing encapsulation','The crane lowers the second fairing half over the spacecraft.'],
  [3.8,'Stage mating','The upper stage is mated to the first stage and inspected.'],[5.6,'Rollout','The transporter carries the rocket out to the pad.'],[4.4,'Erection','The rocket is raised upright against the service tower.'],[2.4,'All stations go','Propellant loaded. Launch control has the count.']];
const HX=44; let cs=0, ct_=0;
function cinePose(s,e){      // s = step, e = eased 0..1 inside the step
  const open=s===0?1:s===1?1-e:0, off=s<2?2.6:s===2?2.6*(1-e):0; parts.fB.position.x=-3.4*open; upper.position.y=off;
  let x=s<3?HX:s===3?HX*(1-e):0; const er=s<4?0:s===4?e:1, yy=1.9+gy(x,0);
  rocket.position.set(x,yy*(1-er)+.05*er,0); rocket.rotation.set(0,0,-Math.PI/2*(1-er));
  tp.visible=er<.25; tp.position.set(x+HT*.45,yy-1.1,0); tp.rotation.z=-x/R;
  const cr=open>0.02; cable.visible=cr; if(cr){ parts.fB.getWorldPosition(t1); hg.worldToLocal(t1); crane.position.x=t1.x+ (H2+HT)*.0; cable.position.set(t1.x,(11.8+t1.y)/2,0); cable.scale.y=Math.max(.1,11.8-t1.y); }
  for(const a of arms) a.scale.x=s>=5?1:.25;
  const px=x+H2+.6;      // where the payload sits while the rocket lies down
  if(s===0){ dP.set(px+1.5-e*2,yy+4.6,14.5); dT.set(px-3,yy+.8,0); } else if(s===1){ dP.set(px-.5-e*1.5,yy+4,12.5); dT.set(px-2.5,yy+1,0); } else if(s===2){ dP.set(x+H1-2+e*3,yy+4.4,15); dT.set(x+H1+1,yy+.4,0); }
  else if(s===3){ dP.set(x+HT*.5+7,7.5,23); dT.set(x+HT*.45,2.5,0); } else if(s===4){ dP.set(13,6.5,25); dT.set(1.5,HT*.42,0); } else { dP.set(-19,4.5,29); dT.set(0,HT*.5,0); } }
function startCine(){ mode='cine'; cs=0; ct_=0; $('skip').style.display='inline-block'; actEl.style.display='none'; setPhase(CINE[0][1],CINE[0][2]); cinePose(0,0); camP.copy(dP); camT.copy(dT); cam.position.copy(camP); say(CINE[0][1]); }
function endCine(){ cinePose(5,1); $('skip').style.display='none'; actEl.style.display=''; startCount(); }
$('skip').onclick=()=>{ if(mode==='cine') endCine(); };
function startCount(){ mode='count'; tc=-5; camMode=0; setPhase('Terminal count','Hold-down clamps armed. Water deluge ready.'); $('read').style.display=''; setCue(null); }

/* ---------- input ---------- */
addEventListener('keydown',e=>{ if(e.repeat&&e.code!=='KeyS') return; K[e.code]=1; audio();
  if(e.code==='Space'||e.code==='Enter'){ e.preventDefault(); press(); } else if(e.code==='Escape'&&mode==='cine') endCine();
  else if(e.code==='KeyT') toggleTel(); else if(e.code==='KeyC') nextCam(); else if(e.code==='KeyG'){ S.auto=!S.auto; toast(S.auto?'Autopilot':'Manual','',false); } else if(e.code==='KeyF'&&mode==='fly'&&S.fair){ if(act.fairing(S)){ onAction('fairing'); if(cue==='fairing') setCue(null); } } });
addEventListener('keyup',e=>{ K[e.code]=0; });
function toggleTel(){ telOn=!telOn; $('tel').classList.toggle('s',telOn); $('btel').classList.toggle('on',telOn); $('btel').setAttribute('aria-pressed',telOn); }
function nextCam(){ camMode=(camMode+1)%4; autoCam=false; }
$('btel').onclick=toggleTel; $('bcam').onclick=nextCam;
thrEl.onpointerdown=()=>{ thrHeld=true; thrEl.classList.add('down'); audio(); }; thrEl.onpointerup=thrEl.onpointerleave=()=>{ thrHeld=false; thrEl.classList.remove('down'); };
canvas.addEventListener('pointerdown',()=>{ audio(); if(mode==='fly'&&cue) fireCue(true); });

/* ---------- shooting stars on the 2D layer once the sky is dark ---------- */
const fx=$('fx'), fxc=fx.getContext('2d'); let FW=0, FH=0; const MET=[]; let nextMet=0;
function drawFx(now,night){ fxc.clearRect(0,0,FW,FH); if(night<.5||reduce) return; if(now>nextMet){ const ang=Math.PI/2+.38+Math.random()*.2, sp=FH*(.9+Math.random()*.7); MET.push({x:FW*(.2+Math.random()*.9),y:-20+FH*Math.random()*.3,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,len:110+Math.random()*170,born:now,life:800+Math.random()*600,w:1.1+Math.random()*1.3,pink:Math.random()<.45}); nextMet=now+900+Math.random()*2200; }
  for(let i=MET.length-1;i>=0;i--){ const m=MET[i], a=(now-m.born)/m.life; if(a>1){ MET.splice(i,1); continue; } const sec=a*m.life/1000, px=m.x+m.vx*sec, py=m.y+m.vy*sec, sp=Math.hypot(m.vx,m.vy), tx=px-m.vx/sp*m.len, ty=py-m.vy/sp*m.len, f=Math.sin(Math.PI*a)*(night-.5)*2;
    const g=fxc.createLinearGradient(px,py,tx,ty); g.addColorStop(0,`rgba(255,255,255,${f})`); g.addColorStop(.2,m.pink?`rgba(255,175,225,${.7*f})`:`rgba(160,205,255,${.7*f})`); g.addColorStop(1,'rgba(255,255,255,0)'); fxc.strokeStyle=g; fxc.lineWidth=m.w; fxc.lineCap='round'; fxc.beginPath(); fxc.moveTo(px,py); fxc.lineTo(tx,ty); fxc.stroke(); } }

/* ---------- frame ---------- */
function resize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); cam.aspect=w/h; cam.fov=w<h?66:52; cam.updateProjectionMatrix(); const d=Math.min(devicePixelRatio||1,1.5); fx.width=w*d; fx.height=h*d; fxc.setTransform(d,0,0,d,0,0); FW=w; FH=h; fire.o.material.uniforms.k.value=smoke.o.material.uniforms.k.value=h*.42*renderer.getPixelRatio(); }
addEventListener('resize',resize); resize();
function place(){ const h=vis(Math.max(0,S.alt)), r=R+h+.05, th=S.theta, a=th+S.pitch*RAD; P.set(Math.sin(th)*r,Math.cos(th)*r-R,0); rocket.position.copy(P); rocket.rotation.set(0,0,-a); dirv.set(Math.sin(a),Math.cos(a),0); }
let last=performance.now(), running=true, shake=0, cdN=9, frames=0, ftSum=0, ftMax=0, tCine=0;
document.addEventListener('visibilitychange',()=>{ running=!document.hidden; if(running){ last=performance.now(); requestAnimationFrame(frame); } });
const elAlt=$('alt'), elVel=$('vel'), elClock=$('clock'), dayEl=$('day'), nightEl=$('night'), duskEl=$('dusk');
function frame(now){ if(!running) return; const dt=Math.min((now-last)/1000,.05); last=now; frames++; ftSum+=dt; if(dt>ftMax) ftMax=dt;
  if(mode==='cine'){ ct_+=dt; tCine+=dt; const D=CINE[cs][0]; if(ct_>=D){ if(cs<CINE.length-1){ cs++; ct_=0; setPhase(CINE[cs][1],CINE[cs][2]); say(CINE[cs][1]); } else endCine(); }
    if(mode==='cine'){ const e=sstep(0,1,ct_/CINE[cs][0]); cinePose(cs,e); elClock.textContent='Pre-launch'; } }
  if(mode==='count'){ tc+=dt; elClock.textContent=fmtT(tc); const n=Math.ceil(-tc); if(n!==cdN&&n>=1&&n<=5){ cdN=n; beep(n<=2?1200:800); say(String(n)); }
    if(tc>-2&&!S.engine){ S.engine=true; setPhase('Ignition','Engines spooling up.'); }
    if(S.engine) S.th=Math.min(1,S.th+dt*.6);
    if(tc>=0){ mode='fly'; tReal=0; S.met=0; for(const c of clamps) c.visible=false; for(const a of arms) a.scale.x=.25; setPhase('Liftoff'); toast('Liftoff','',"Liftoff. We have liftoff."); setCue(null); } }
  if(mode==='fly'){ tReal+=dt; const TS=7+9*sstep(5,8,tReal);
    const maxqWin=S.q>9e3&&!S.maxq&&S.alt<45e3; thrEl.style.display=maxqWin?'inline-block':'none';
    const down=(thrHeld||K.KeyS||K.ArrowDown)&&maxqWin; inp.down=!!down; inp.up=!down&&S.thr<1; inp.left=!!(K.ArrowLeft||K.KeyA); inp.right=!!(K.ArrowRight||K.KeyD);
    prevP.copy(P); stepAscent(S,V,dt*TS,inp); place(); if(dt>0) rv.subVectors(P,prevP).divideScalar(dt);
    for(const e of S.ev){ if(e==='maxq'){ toast('Max-Q',S.thrQ?'Throttled down through peak pressure. Nice.':'Peak aerodynamic pressure passed.','Max Q'); setPhase('Max-Q passed'); }
      else if(e==='meco'){ toast('MECO','Main engine cutoff.','Main engine cutoff'); setPhase('MECO'); } else if(e==='liftoff') setPhase('Ascent','Autopilot is flying the gravity turn. Fire each event on cue.'); else if(e==='seco'&&S.f2<=0) setPhase('Stage 2 empty'); }
    S.ev.length=0;
    if(S.fail){ explode(S.fail); }
    else { const o=orbitOf(S); let want=null;
      if(S.stage==='C1') want='sep'; else if(S.stage==='C2') want='ses'; else if(S.fair&&S.alt>=110e3) want='fairing'; else if(S.stage==='S2'&&S.engine&&o.peri>=150e3) want='seco'; else if(S.stage==='C3'&&o.peri>=140e3) want='deploy';
      setCue(want); if(cue){ cueT+=dt; if(cueT>=CUES[cue][1]) fireCue(false); }
      if(S.stage==='C3'&&!S.dep&&o.peri<140e3&&S.f2<=.001&&mode==='fly'){ mode='fail'; setCue(null); setPhase('Suborbital'); card('Not in orbit',`<p>Stage 2 ran dry at a perigee of ${(o.peri/1e3).toFixed(0)} km. The spacecraft falls back to Earth.</p><p>Try a bigger rocket or a lighter spacecraft.</p><div class="btns"><button class="t-btn primary" type="button" id="c-retry">Launch again</button><button class="t-btn" type="button" id="c-base">Back to base</button></div>`); } }
    elClock.textContent=fmtT(S.met); }
  if(mode==='orbit'){ orbT+=dt; prevP.copy(P); stepAscent(S,V,dt*16,null); place(); pay.position.copy(P).addScaledVector(dirv,H2+1+orbT*1.6); pay.quaternion.copy(rocket.quaternion); wings.scale.x=.05+.95*sstep(1,3.2,orbT);
    if(orbT>3.6&&!flight){ const o=orbitOf(S); const sc=Math.round(Math.max(0,1000+Math.max(0,400-Math.abs(o.peri/1e3-200)*2)+S.f2*300+(S.thrQ?150:0)+(S.dmg?-300:150)+(S.auto?0:300)+hits*60-late*80));
      flight={peri:Math.round(o.peri/1e3),ap:isFinite(o.ap)?Math.round(o.ap/1e3):null,qmax:+(S.qmax/1e3).toFixed(1),thrQ:S.thrQ,dmg:S.dmg,manual:!S.auto,f2:+S.f2.toFixed(2),hits,late,time:+tReal.toFixed(1),score:sc,rocket:V.name};
      card('Orbit achieved',`<div class="stats"><div>ORBIT<b>${flight.peri} x ${flight.ap==null?'esc':flight.ap} km</b></div><div>TIME TO ORBIT<b>${flight.time} s</b></div><div>ON-CUE EVENTS<b>${hits} of ${hits+late}</b></div><div>FLIGHT SCORE<b>${sc}</b></div></div><p>${S.thrQ?'Max-Q throttle-down done. ':''}${S.dmg?'Fairing dropped too early. ':''}${late?'Late events were fired by the computer.':'Every event on cue.'}</p><div class="btns"><button class="t-btn primary" type="button" id="c-next">Continue<kbd>Enter</kbd></button></div>`); } }

  /* visuals shared by every mode */
  const th=S.th, on=th>.03&&rocket.visible&&mode!=='cine'; flame.visible=on; flame.position.y=nozzleY();
  const vac=1-Math.exp(-S.alt/12e3), fs=th*(1+.6*clamp(S.alt/60e3,0,1)), fk=1+Math.random()*.15; fo.scale.set(fs*(1+vac*.3)*fk,fs*fk*(S.s1gone?.6:1),fs*(1+vac*.3)*fk); fi.scale.set(fs*fk,fs*fk,fs*fk); fl.intensity=on?th*(1.5+Math.random())*3:0;
  const atmo=Math.exp(-Math.max(0,S.alt)/8500);
  if(on&&!reduce){ rocket.localToWorld(t1.set(0,nozzleY(),0)); const k=Math.ceil(th*(LOW?5:9)), sp=3+vac*5;
    for(let i=0;i<k;i++){ const s=14+Math.random()*10; fire.emit(t1.x+rnd(.5),t1.y+rnd(.3),t1.z+rnd(.5),rv.x-dirv.x*s+rnd(sp),rv.y-dirv.y*s+rnd(sp),rv.z+rnd(sp),.35+Math.random()*.3,1.8*FS,.3,1,.6-Math.random()*.2,.2,.8); }
    if(atmo>.02) for(let i=0;i<Math.ceil(th*4*atmo);i++) smoke.emit(t1.x+rnd(.5),t1.y,t1.z+rnd(.5),rv.x*.1-dirv.x*3+rnd(2),rv.y*.1-dirv.y*3+rnd(2),rnd(2),3+Math.random()*4,1.6,6+atmo*6,.97,.95,.9,.4*atmo+.05);
    if(S.alt<400) for(let i=0;i<Math.ceil(th*(LOW?6:12));i++){ const a=Math.random()*6.283, sp2=7+Math.random()*13; smoke.emit(Math.cos(a)*2,.5,Math.sin(a)*2,Math.cos(a)*sp2,1+Math.random()*3,Math.sin(a)*sp2,4+Math.random()*4,3,14,.96,.93,.88,.6); } }
  if(mode==='count'&&tc>-4.2&&!reduce) for(let i=0;i<5;i++){ const a=Math.random()*6.283; smoke.emit(Math.cos(a)*5,.4,Math.sin(a)*5,Math.cos(a)*(3+Math.random()*4),2+Math.random()*3,Math.sin(a)*(3+Math.random()*4),2+Math.random()*2,2,8,1,1,1,.45); }   // water deluge steam
  fire.upd(dt); smoke.upd(dt);
  for(let i=spent.length-1;i>=0;i--){ const s=spent[i]; s.o.position.x+=s.vx*dt; s.o.position.y+=s.vy*dt; s.o.position.z+=s.vz*dt; s.o.rotation.x+=s.wx*dt; s.o.rotation.y+=s.wy*dt; s.o.rotation.z+=s.wz*dt; s.t+=dt; if(s.t>12){ scene.remove(s.o); spent.splice(i,1); } }
  if(mode==='fail'){ /* particles keep running */ }

  /* sky: day -> dusk -> painted night */
  const sp=clamp((S.alt-22e3)/70e3,0,1), night=Math.pow(sp,.7); dayEl.style.opacity=(1-sstep(0,.8,sp)).toFixed(3); nightEl.style.opacity=night.toFixed(3); duskEl.style.opacity=(Math.sin(Math.PI*clamp(sp*1.15,0,1))*.9).toFixed(3);
  atm.material.opacity=1; drawFx(now,night);

  /* camera */
  if(mode!=='cine'){ if(autoCam&&mode==='fly'&&S.alt>2600) camMode=1;
    const mid=t2.copy(P).addScaledVector(dirv,S.s1gone?HT*.7:HT*.55);
    if(mode==='count'||(camMode===0)){ dP.set(-19,4.5,29); dT.copy(mode==='count'||S.alt<60?t3.set(0,HT*.5,0):mid); }
    else if(camMode===1){ const up=sstep(20e3,120e3,S.alt); t3.set(Math.sin(S.theta),Math.cos(S.theta),0); dP.copy(mid).addScaledVector(dirv,-HT*1.5).addScaledVector(ZV,HT*(.8+up*.5)).addScaledVector(t3,HT*up*1.1); dT.copy(mid).addScaledVector(t3,-HT*up*.9); }
    else if(camMode===2){ dP.copy(mid).addScaledVector(dirv,-HT*4.6).addScaledVector(ZV,HT*4); dP.x-=Math.sin(S.theta)*15; dP.y-=Math.cos(S.theta)*15; dT.copy(mid); }
    else { const c=mode==='orbit'?pay.position:mid, t=now/4000; dP.set(c.x+Math.cos(t)*HT*.8,c.y+HT*.33,c.z+Math.sin(t)*HT*.8); dT.copy(c); }
    if(mode==='fly'||mode==='orbit'){ camP.add(t3.copy(rv).multiplyScalar(dt)); camT.add(t3); } }   // ride along, then ease
  const kp=1-Math.exp(-dt*(mode==='cine'?2.2:camMode===0?6:3.2)); camP.lerp(dP,kp); camT.lerp(dT,1-Math.exp(-dt*6));
  shake=reduce?0:(mode==='count'&&S.engine?S.th*.1:(mode==='fly'&&S.alt<2500&&S.th>0?S.th*.09*(1-S.alt/2500):0));
  cam.position.set(camP.x+rnd(shake),camP.y+rnd(shake),camP.z+rnd(shake)); cam.up.set(0,1,0); cam.lookAt(camT);
  sun.position.set(P.x-300,P.y+260,320); sun.target.position.copy(P);

  /* readouts */
  if(mode==='fly'||mode==='orbit'||mode==='count'){ const v=Math.hypot(S.vr,S.vt); elAlt.textContent=(S.alt/1e3).toFixed(S.alt<1e4?1:0)+' km'; elVel.textContent=v.toFixed(0)+' m/s';
    if(telOn){ const o=orbitOf(S); $('t-acc').textContent=(S.th>0?S.acc:0).toFixed(1)+' g'; $('t-q').textContent=(S.q/1e3).toFixed(1)+' kPa'; $('t-pit').textContent=S.pitch.toFixed(0)+' / '+S.aoa.toFixed(1); $('t-pe').textContent=S.lifted?(o.peri/1e3).toFixed(0)+' km':'-'; $('t-ap').textContent=S.lifted?(isFinite(o.ap)?(o.ap/1e3).toFixed(0)+' km':'escape'):'-';
      $('t-thr').textContent=(S.thr*100).toFixed(0)+'%'; $('b-thr').style.width=S.thr*100+'%'; $('t-f1').textContent=(S.f1*100).toFixed(0)+'%'; $('b-f1').style.width=S.f1*100+'%'; $('t-f2').textContent=(S.f2*100).toFixed(0)+'%'; $('b-f2').style.width=S.f2*100+'%';
      const sl=clamp(S.stress/220,0,1); $('t-st').textContent=(sl*100).toFixed(0)+'%'; $('b-st').style.width=sl*100+'%'; $('b-st').style.background=sl>.6?'var(--bad)':'var(--warn)'; $('t-ap2').textContent=S.auto?'ON':'OFF'; } }
  if(ngain) ngain.gain.value=SET.sfx?th*.45*(.15+.85*atmo)*(mode==='fail'?0:1):0;
  updateClips(); renderer.render(scene,cam); requestAnimationFrame(frame); }

/* ---------- start ---------- */
window.LX={S,get mode(){return mode},get flight(){return flight},get cue(){return cue},press,skip:()=>{ if(mode==='cine') endCine(); },stats:()=>({tCine,tReal,frames,avg:ftSum/Math.max(1,frames),max:ftMax,calls:renderer.info.render.calls,tris:renderer.info.render.triangles}),resetStats:()=>{frames=0;ftSum=0;ftMax=0}};
ready.then(()=>{ $('load').style.display='none'; if(HZ.skipCine) { cinePose(5,1); startCount(); camP.set(-19,4.5,29); camT.set(0,HT*.5,0); } else startCine(); requestAnimationFrame(t=>{ last=t; frame(t); }); });
