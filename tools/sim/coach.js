/* ===== Tutorial coach (shared by every screen) =====
   COACH.run(name, steps): shows one step at a time in a Tactile card, points an arrow at the thing to use,
   and waits until the player has done it (step.until) or presses Next (step.next).
   step = {say, why?, target?: ()=>({x,y})|Element|null, until?: ()=>bool, next?: 'Next', enter?: fn, leave?: fn}
   Skipping turns the tutorial off for the whole game (the shell keeps HZ.tutorial). */
(function(){
  const css=`.coach{position:fixed;z-index:60;left:max(12px,env(safe-area-inset-left,0px));top:calc(78px + env(safe-area-inset-top,0px));width:min(350px,calc(100% - 24px));
    background:#1A1206;color:#FBFAF4;border:3px solid #1A1206;border-radius:16px;box-shadow:0 5px 0 rgba(26,18,6,.35);padding:12px 14px 12px;font:600 14px/1.4 Geist,system-ui,sans-serif;display:none;animation:cpop .35s cubic-bezier(.34,1.56,.64,1) both}
  .coach.s{display:block}
  .coach .k{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px;font:400 10px 'Silkscreen',monospace;letter-spacing:.08em;color:#F2A541}
  .coach .k button{background:none;border:0;color:#B9B0A0;font:600 12px Geist,system-ui,sans-serif;cursor:pointer;padding:2px 4px}
  .coach .why{display:block;margin-top:6px;font-weight:500;font-size:12.5px;color:#D7D0C0}
  .coach .nx{margin-top:10px;display:flex;justify-content:flex-end}
  .coach .nx button{border:3px solid #FBFAF4;border-radius:12px;background:#F2A541;color:#1A1206;font:400 15px 'Game Paused','Silkscreen',monospace;padding:5px 14px 7px;cursor:pointer;box-shadow:0 3px 0 #FBFAF4}
  .coach .bar{height:5px;border-radius:3px;background:rgba(251,250,244,.18);margin-top:10px;overflow:hidden}.coach .bar i{display:block;height:100%;background:#F2A541;transition:width .4s}
  .coach-arrow{position:fixed;z-index:59;width:44px;height:52px;pointer-events:none;display:none;transform:translate(-50%,-100%);filter:drop-shadow(0 3px 0 #1A1206)}
  .coach-arrow.s{display:block;animation:cbob .8s ease-in-out infinite alternate}
  @keyframes cbob{to{margin-top:-10px}} @keyframes cpop{0%{transform:scale(.88) translateY(10px);opacity:0}}
  @media (max-width:760px){.coach{top:auto;bottom:calc(96px + env(safe-area-inset-bottom,0px));font-size:13px}}
  @media (prefers-reduced-motion:reduce){.coach,.coach-arrow.s{animation:none}}`;
  let el=null, ar=null, cur=null, idx=0, list=[], name='', timer=0, on=false;
  function mount(){ if(el) return; const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    el=document.createElement('div'); el.className='coach'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); document.body.appendChild(el);
    ar=document.createElement('div'); ar.className='coach-arrow'; ar.innerHTML='<svg viewBox="0 0 44 52"><path d="M14 2h16v24h12L22 50 2 26h12z" fill="#F2A541" stroke="#1A1206" stroke-width="3" stroke-linejoin="round"/></svg>'; document.body.appendChild(ar); }
  function speak(t){ try{ const S=(window.HZ&&HZ.settings)||{}; if(S.sfx===false||!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=1.05; u.pitch=1; speechSynthesis.speak(u); }catch(e){} }
  let lastDyn='';
  function show(){ cur=list[idx]; if(!cur){ stop(false); return; } if(cur.enter) try{ cur.enter(); }catch(e){} lastDyn='';
    if(typeof cur.dyn==='function'){ const d=cur.dyn()||['','']; cur.say=d[0]; cur.why=d[1]; lastDyn=d[0]; }
    el.innerHTML=`<div class="k"><span>Tutorial · ${name} ${idx+1}/${list.length}</span><button type="button" data-skip>Skip tutorial</button></div><div data-say>${cur.say}</div><span class="why" data-why ${cur.why?'':'hidden'}>${cur.why||''}</span>${cur.next?`<div class="nx"><button type="button" data-next>${cur.next}</button></div>`:''}<div class="bar"><i style="width:${(idx)/list.length*100}%"></i></div>`;
    el.classList.remove('s'); void el.offsetWidth; el.classList.add('s'); speak(cur.say.replace(/<[^>]+>/g,''));
    const nb=el.querySelector('[data-next]'); if(nb) nb.onclick=advance; el.querySelector('[data-skip]').onclick=()=>stop(true); }
  function advance(){ if(cur&&cur.leave) try{ cur.leave(); }catch(e){} idx++; show(); }
  function tick(){ if(!on||!cur) return; let p=null;
    if(typeof cur.dyn==='function'){ const d=cur.dyn()||['','']; if(d[0]&&d[0]!==lastDyn){ lastDyn=d[0]; el.querySelector('[data-say]').innerHTML=d[0]; const w=el.querySelector('[data-why]'); w.innerHTML=d[1]||''; w.hidden=!d[1]; speak(d[0].replace(/<[^>]+>/g,'')); } } try{ p=cur.target&&cur.target(); }catch(e){ p=null; }
    if(p&&p.getBoundingClientRect){ const r=p.getBoundingClientRect(); p=r.width?{x:r.left+r.width/2,y:r.top-4}:null; }
    if(p&&isFinite(p.x)&&p.y>-40&&p.y<innerHeight+40){ ar.style.left=p.x+'px'; ar.style.top=Math.max(56,p.y)+'px'; ar.classList.add('s'); } else ar.classList.remove('s');
    let done=false; try{ done=cur.until&&cur.until(); }catch(e){} if(done) advance(); }
  function stop(skipped){ on=false; clearInterval(timer); if(el) el.classList.remove('s'); if(ar) ar.classList.remove('s'); try{ speechSynthesis.cancel(); }catch(e){}
    if(skipped){ if(window.HZ) HZ.tutorial=false; try{ parent.postMessage({hzState:{tutorial:false}},'*'); }catch(e){} if(window.COACH.onSkip) window.COACH.onSkip(); } }
  window.COACH={ active:()=>!!(window.HZ&&HZ.tutorial),
    run(n,steps){ if(!this.active()) return; mount(); name=n; list=steps; idx=0; on=true; show(); clearInterval(timer); timer=setInterval(tick,150); },
    stop, finish(){ stop(false); if(window.HZ) HZ.tutorial=false; try{ parent.postMessage({hzState:{tutorial:false}},'*'); }catch(e){} },
    get step(){ return idx; }, onSkip:null };
})();
