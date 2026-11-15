/* ===== Tutorial coach (shared by every screen) =====
   COACH.run(name, steps): shows one step at a time in a Tactile card, points an arrow at the thing to use,
   and waits until the player has done it (step.until) or presses Next (step.next).
   step = {say, why?, target?: ()=>({x,y})|Element|null, until?: ()=>bool, next?: 'Next', enter?: fn, leave?: fn}
   Skipping turns the tutorial off for the whole game (the shell keeps HZ.tutorial).
   The two lead engineers coach the player: Mevin on the ground (mission choice, base, workshops), Pawan in flight (launch, mission control).
   step.who ('mevin'|'pawan') overrides the speaker for one step.
   Hands-free: a step with auto() gets a Next button that does the action for the player (so a judge can click Next all the way through);
   autoIf() hides that button while there is nothing to do yet. */
(function(){
  const css=`.coach{position:fixed;z-index:60;left:max(12px,env(safe-area-inset-left,0px));top:calc(78px + env(safe-area-inset-top,0px));width:min(350px,calc(100% - 24px));
    background:#1A1206;color:#FBFAF4;border:3px solid #1A1206;border-radius:16px;box-shadow:0 5px 0 rgba(26,18,6,.35);padding:12px 14px 12px;font:600 14px/1.4 Geist,system-ui,sans-serif;display:none;animation:cpop .35s cubic-bezier(.34,1.56,.64,1) both}
  .coach.s{display:block}
  .coach .k{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px;font:400 10px 'Silkscreen',monospace;letter-spacing:.08em;color:#F2A541}
  .coach .who{display:flex;align-items:center;gap:10px;margin:2px 0 8px}
  .coach .who svg{width:46px;height:46px;flex:none;border-radius:50%;border:3px solid #FBFAF4;background:#F3EEE4;box-shadow:0 3px 0 rgba(251,250,244,.25)}
  .coach .who .av{position:relative;flex:none;display:block;line-height:0}
  .coach .who .ai{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);font:700 8px/1 Geist,system-ui,sans-serif;font-style:normal;letter-spacing:.04em;background:#F2A541;color:#1A1206;border:1.5px solid #FBFAF4;border-radius:6px;padding:2px 4px;white-space:nowrap}
  .coach .who b{display:block;font:400 17px/1 'Game Paused','Silkscreen',monospace;color:#FBFAF4;letter-spacing:.02em}
  .coach .who span{display:block;margin-top:3px;font:400 9px 'Silkscreen',monospace;letter-spacing:.08em;color:#F2A541}
  .coach .k button{background:none;border:0;color:#B9B0A0;font:600 12px Geist,system-ui,sans-serif;cursor:pointer;padding:2px 4px}
  .coach .why{display:block;margin-top:6px;font-weight:500;font-size:12.5px;color:#D7D0C0}
  .coach .nx{margin-top:10px;display:flex;justify-content:flex-end}
  .coach .nx button:disabled{opacity:.55;cursor:wait}
  .coach .nx[hidden]{display:none}
  .coach .nx button{border:3px solid #FBFAF4;border-radius:12px;background:#F2A541;color:#1A1206;font:400 15px 'Game Paused','Silkscreen',monospace;padding:5px 14px 7px;cursor:pointer;box-shadow:0 3px 0 #FBFAF4}
  .coach .bar{height:5px;border-radius:3px;background:rgba(251,250,244,.18);margin-top:10px;overflow:hidden}.coach .bar i{display:block;height:100%;background:#F2A541;transition:width .4s}
  .coach-arrow{position:fixed;z-index:59;width:44px;height:52px;pointer-events:none;display:none;transform:translate(-50%,-100%);filter:drop-shadow(0 3px 0 #1A1206)}
  .coach-arrow.s{display:block;animation:cbob .8s ease-in-out infinite alternate}
  @keyframes cbob{to{margin-top:-10px}} @keyframes cpop{0%{transform:scale(.88) translateY(10px);opacity:0}}
  @media (max-width:760px){.coach{top:auto;bottom:calc(96px + env(safe-area-inset-bottom,0px));font-size:13px}}
  @media (prefers-reduced-motion:reduce){.coach,.coach-arrow.s{animation:none}}`;
  // Lead engineers, drawn in the game's flat, thick-outlined style.
  const FACE=(skin,hairC,top,extra,jacket)=>`<svg viewBox="10 8 44 44" aria-hidden="true"><defs><clipPath id="cl"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#cl)" stroke="#1A1206" stroke-width="2" stroke-linejoin="round">
    <path d="M6 66C8 50 19 45 32 45s24 5 26 21z" fill="${jacket}"/><path d="M25 45l7 9 7-9" fill="#FBFAF4"/><circle cx="45" cy="55" r="3" fill="#F2A541"/>
    <rect x="27" y="37" width="10" height="9" rx="2" fill="${skin}"/><circle cx="20.5" cy="29" r="3" fill="${skin}"/><circle cx="43.5" cy="29" r="3" fill="${skin}"/>
    <ellipse cx="32" cy="28" rx="11.5" ry="13" fill="${skin}"/>${top.replace(/HAIR/g,hairC)}
    <circle cx="27.5" cy="29" r="1.5" fill="#1A1206" stroke="none"/><circle cx="36.5" cy="29" r="1.5" fill="#1A1206" stroke="none"/><path d="M28 35q4 3.2 8 0" fill="none" stroke-width="1.8" stroke-linecap="round"/>${extra}</g></svg>`;
  const LEADS={
    mevin:{name:'Mevin',role:'Lead mission engineer',pitch:1.05,
      svg:FACE('#B47A4E','#22160F','<path d="M20 27c-1-11 6-15 13-15 8 0 12 5 11 15-2-6-7-9-13-8-5 1-9 4-11 8z" fill="HAIR"/><path d="M30 13c-4 3-6 7-6 11" fill="none" stroke-width="1.5"/>',
        '<path d="M18.5 29c0-17 27-17 27 0" fill="none" stroke-width="3"/><rect x="16" y="25" width="5" height="9" rx="2" fill="#2C5B65"/><rect x="43" y="25" width="5" height="9" rx="2" fill="#2C5B65"/><path d="M18.5 33q1 6 7 6" fill="none" stroke-width="2"/><circle cx="26" cy="39" r="1.6" fill="#1A1206"/>','#F2A541')},
    pawan:{name:'Pawan',role:'Lead flight engineer',pitch:.88,
      svg:FACE('#9C6440','#15100C','<path d="M20.5 26c-1-10 5-14 11.5-14S45 16 43.5 26c-1.5-5-6-8-11.5-8s-10 3-11.5 8z" fill="HAIR"/><path d="M21.5 31c1 10 6 12 10.5 12s9.5-2 10.5-12c-2 5-6 7-10.5 7s-8.5-2-10.5-7z" fill="HAIR"/>',
        '<circle cx="27.5" cy="29" r="4" fill="none" stroke-width="1.8"/><circle cx="36.5" cy="29" r="4" fill="none" stroke-width="1.8"/><path d="M31.5 29h1" stroke-width="1.8"/>','#2C5B65')}};
  const SPEAKER={'Mission':'mevin','Base':'mevin','Launch':'pawan','Mission control':'pawan'};
  const INTRO={'Mission':'Hi, I\'m Mevin, one of your two lead engineers. ','Launch':'Pawan here, lead flight engineer. I\'ll be with you from the pad to orbit. '};
  window.HZ_LEADS=LEADS;
  let el=null, ar=null, cur=null, idx=0, list=[], name='', timer=0, on=false;
  function mount(){ if(el) return; const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    el=document.createElement('div'); el.className='coach'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); document.body.appendChild(el);
    ar=document.createElement('div'); ar.className='coach-arrow'; ar.innerHTML='<svg viewBox="0 0 44 52"><path d="M14 2h16v24h12L22 50 2 26h12z" fill="#F2A541" stroke="#1A1206" stroke-width="3" stroke-linejoin="round"/></svg>'; document.body.appendChild(ar); }
  function speak(t){ try{ const S=(window.HZ&&HZ.settings)||{}; if(S.sfx===false||!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=1.05; u.pitch=(LEADS[who()]||{}).pitch||1; speechSynthesis.speak(u); }catch(e){} }
  let lastDyn='';
  const who=()=>(cur&&cur.who)||SPEAKER[name]||'mevin';
  function show(){ cur=list[idx]; if(!cur){ stop(false); return; } if(cur.enter) try{ cur.enter(); }catch(e){} lastDyn='';
    if(typeof cur.dyn==='function'){ const d=cur.dyn()||['','']; cur.say=d[0]; cur.why=d[1]; lastDyn=d[0]; }
    if(idx===0&&INTRO[name]&&!cur._intro){ cur._intro=1; cur.say=INTRO[name]+cur.say; } const L=LEADS[who()];
    el.innerHTML=`<div class="k"><span>Tutorial · ${name} ${idx+1}/${list.length}</span><button type="button" data-skip>Skip tutorial</button></div><div class="who"><span class="av">${L.svg}<i class="ai" title="Portrait drawn with AI assistance">AI art</i></span><div><b>${L.name}</b><span>${L.role}</span></div></div><div data-say>${cur.say}</div><span class="why" data-why ${cur.why?'':'hidden'}>${cur.why||''}</span>${cur.next?`<div class="nx"><button type="button" data-next>${cur.next}</button></div>`:cur.auto?`<div class="nx" data-autow><button type="button" data-auto>${cur.autoLabel||'Next'}</button></div>`:''}<div class="bar"><i style="width:${(idx)/list.length*100}%"></i></div>`;
    el.classList.remove('s'); void el.offsetWidth; el.classList.add('s'); speak(cur.say.replace(/<[^>]+>/g,''));
    const nb=el.querySelector('[data-next]'); if(nb) nb.onclick=advance;
    const ab=el.querySelector('[data-auto]'); if(ab){ const me=cur; ab.onclick=()=>{ if(ab.disabled) return; ab.disabled=true; try{ me.auto(); }catch(e){} setTimeout(()=>{ if(ab.isConnected) ab.disabled=false; },1600); }; } el.querySelector('[data-skip]').onclick=()=>stop(true); }
  function advance(){ if(cur&&cur.leave) try{ cur.leave(); }catch(e){} idx++; show(); }
  function tick(){ if(!on||!cur) return; let p=null;
    if(typeof cur.dyn==='function'){ const d=cur.dyn()||['','']; if(d[0]&&d[0]!==lastDyn){ lastDyn=d[0]; el.querySelector('[data-say]').innerHTML=d[0]; const w=el.querySelector('[data-why]'); w.innerHTML=d[1]||''; w.hidden=!d[1]; speak(d[0].replace(/<[^>]+>/g,'')); } } try{ p=cur.target&&cur.target(); }catch(e){ p=null; }
    if(p&&p.getBoundingClientRect){ const r=p.getBoundingClientRect(); p=r.width?{x:r.left+r.width/2,y:r.top-4}:null; }
    if(p&&isFinite(p.x)&&p.y>-40&&p.y<innerHeight+40){ ar.style.left=p.x+'px'; ar.style.top=Math.max(56,p.y)+'px'; ar.classList.add('s'); } else ar.classList.remove('s');
    if(cur.autoIf){ const w=el.querySelector('[data-autow]'); if(w){ let v=false; try{ v=!!cur.autoIf(); }catch(e){} w.hidden=!v; } }
    let done=false; try{ done=cur.until&&cur.until(); }catch(e){} if(done) advance(); }
  function stop(skipped){ on=false; clearInterval(timer); if(el) el.classList.remove('s'); if(ar) ar.classList.remove('s'); try{ speechSynthesis.cancel(); }catch(e){}
    if(skipped){ if(window.HZ) HZ.tutorial=false; try{ parent.postMessage({hzState:{tutorial:false}},'*'); }catch(e){} if(window.COACH.onSkip) window.COACH.onSkip(); } }
  window.COACH={ active:()=>!!(window.HZ&&HZ.tutorial),
    run(n,steps){ if(!this.active()) return; mount(); name=n; list=steps; idx=0; on=true; show(); clearInterval(timer); timer=setInterval(tick,150); },
    stop, finish(){ stop(false); if(window.HZ) HZ.tutorial=false; try{ parent.postMessage({hzState:{tutorial:false}},'*'); }catch(e){} },
    get step(){ return idx; }, onSkip:null };
})();
