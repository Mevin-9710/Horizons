/* ===== Music by phase (shared by every screen) =====
   One generative score for the whole game, played by the shell page so it carries on across screens and crossfades between phases.
   Each screen sets its phase; the launch and mission control also follow their own moments (countdown, ascent, orbit, cruise, arrival, win, lose).
   Follows the Music setting (localStorage 'hz-settings'). Starts on the first tap or key press (browsers block sound before that).
   API: HZ_MUSIC.phase(name), HZ_MUSIC.sting('win'|'lose'), HZ_MUSIC.unlock() */
(function(){
  const host=(()=>{ try{ return parent&&parent.document?parent:window; }catch(e){ return window; } })();
  if(!host.HZ_MUSIC){ const s=host.document.createElement('script'); s.textContent='('+engine.toString()+')()'; host.document.head.appendChild(s); }
  const M=host.HZ_MUSIC; window.HZ_MUSIC=M; if(!M) return;
  const unlock=()=>M.unlock(); addEventListener('pointerdown',unlock,true); addEventListener('keydown',unlock,true); addEventListener('touchstart',unlock,true);
  const SCREEN={home:'home',select:'select',base:'build',launch:'pad',control:'control'};
  let scr=''; try{ scr=(host.location.hash||'').slice(1); }catch(e){}
  M.phase(SCREEN[scr]||(window.LX?'pad':'home'));

  function engine(){
    const W=window; let ac=null, out=null, bus={}, cur='', want='', on=true, next=0, step=0, timer=0;
    const mtof=m=>440*Math.pow(2,(m-69)/12);
    // music sits under the game: quieter overall, and quieter still while the rocket roars
    const LV={pad:.3,count:.16,ascent:.12,orbit:.3,cruise:.32,arrive:.32,control:.3,win:.4,lose:.35};
    // bpm, chords (MIDI, one per bar), layers and their volumes. 16 steps per bar.
    const P={
      home:   {bpm:68, ch:[[48,55,64,71],[45,52,60,67],[41,48,57,64],[43,50,59,62]], pad:.05, arp:[0,null,null,7,null,null,4,null,null,null,12,null,null,9,null,null], arpV:.028, bell:true},
      select: {bpm:80, ch:[[48,55,64,71],[45,52,60,67],[41,48,57,64],[43,50,59,62]], pad:.045, arp:[0,null,7,null,4,null,12,null,0,null,7,null,9,null,4,null], arpV:.03, bass:[0,null,null,null,null,null,null,null,0,null,null,null,null,null,null,null], bassV:.05},
      build:  {bpm:100,ch:[[41,48,57,64],[43,50,59,62],[45,52,60,67],[43,50,55,62]], pad:.035, arp:[0,7,12,7,4,7,12,16,0,7,12,7,9,7,12,16], arpV:.026, bass:[0,null,null,0,null,null,7,null,0,null,null,0,null,null,5,null], bassV:.06, hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1]},
      pad:    {bpm:76, ch:[[38,45,50,57],[38,45,50,58],[36,43,50,57],[38,45,50,55]], pad:.05, drone:38, arp:[0,null,null,null,null,null,null,null,7,null,null,null,null,null,null,null], arpV:.025},
      count:  {bpm:120,ch:[[38,45,50,57],[38,45,51,57]], pad:.035, drone:38, tick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], bass:[0,null,null,null,0,null,null,null,0,null,null,null,0,null,null,null], bassV:.06, rise:true},
      ascent: {bpm:132,ch:[[38,45,50,57],[34,41,46,53],[36,43,48,55],[41,48,53,60]], pad:.04, saw:true, bass:[0,0,12,0,0,0,12,0,0,0,12,0,0,7,12,0], bassV:.065, kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0], hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], arp:[0,7,12,7,0,7,12,7,0,7,12,7,0,7,12,14], arpV:.02},
      orbit:  {bpm:70, ch:[[40,47,56,63],[45,52,59,64],[42,49,56,61],[44,51,56,63]], pad:.055, arp:[12,null,null,7,null,null,4,null,null,null,11,null,null,7,null,null], arpV:.026, bell:true},
      cruise: {bpm:60, ch:[[36,43,52,59],[34,41,50,57]], pad:.05, drone:24, bell:true, arp:[12,null,null,null,null,null,null,null,null,null,null,null,7,null,null,null], arpV:.022},
      arrive: {bpm:92, ch:[[46,53,62,69],[43,50,58,65],[39,46,55,62],[41,48,57,65]], pad:.05, arp:[0,4,7,12,7,4,0,4,7,12,16,12,7,4,7,12], arpV:.024, bass:[0,null,null,null,0,null,null,null,0,null,null,null,0,null,7,null], bassV:.055},
      control:{bpm:96, ch:[[45,52,57,64],[41,48,57,60],[43,50,55,62],[40,47,55,59]], pad:.035, arp:[0,null,12,null,7,null,12,null,0,null,12,null,7,null,14,null], arpV:.02, bass:[0,null,null,null,null,null,null,null,0,null,null,null,null,null,7,null], bassV:.05, hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
      win:    {bpm:84, ch:[[48,55,64,72],[53,60,69,72],[45,52,60,67],[43,50,59,67]], pad:.05, arp:[0,4,7,12,null,null,7,null,0,4,7,12,null,null,16,null], arpV:.026, bell:true},
      lose:   {bpm:58, ch:[[45,52,57,60],[41,48,53,57],[38,45,50,53],[40,47,52,56]], pad:.045, drone:33},
    };
    function enabled(){ try{ const s=JSON.parse(localStorage.getItem('hz-settings')||'{}')||{}; return s.music!==false; }catch(e){ return true; } }
    function init(){ if(ac) return; try{ ac=new (W.AudioContext||W.webkitAudioContext)(); }catch(e){ return; }
      const comp=ac.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=3; out=ac.createGain(); out.gain.value=0; out.connect(comp); comp.connect(ac.destination);
      const n=ac.createBuffer(1,ac.sampleRate,ac.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; W.__hzNoise=n;
      next=ac.currentTime+.1; timer=setInterval(sched,60); }
    function busFor(ph){ if(!bus[ph]){ const g=ac.createGain(); g.gain.value=0; const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=ph==='count'?600:2600; g.connect(f); f.connect(out); bus[ph]={g,f}; } return bus[ph]; }
    function voice(dest,type,fq,t,dur,vol,a,r,cut){ const o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.value=fq; o.detune.value=(Math.random()-.5)*8;
      let node=o; if(cut){ const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=cut; o.connect(f); node=f; } node.connect(g); g.connect(dest);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+a); g.gain.setValueAtTime(vol,t+Math.max(a,dur-r)); g.gain.linearRampToValueAtTime(0,t+dur); o.start(t); o.stop(t+dur+.05); }
    function noise(dest,t,dur,vol,hp){ const s=ac.createBufferSource(); s.buffer=W.__hzNoise; const f=ac.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp; const g=ac.createGain();
      g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t+dur+.02); }
    function kick(dest,t){ const o=ac.createOscillator(), g=ac.createGain(); o.frequency.setValueAtTime(120,t); o.frequency.exponentialRampToValueAtTime(42,t+.18); g.gain.setValueAtTime(.16,t); g.gain.exponentialRampToValueAtTime(.0001,t+.3); o.connect(g); g.connect(dest); o.start(t); o.stop(t+.32); }
    function sched(){ if(!ac||!cur) return; const p=P[cur], spb=60/p.bpm/4, B=busFor(cur).g;
      while(next<ac.currentTime+.25){ const t=next, s=step%16, bar=Math.floor(step/16), ch=p.ch[bar%p.ch.length];
        if(s===0){ const len=spb*16; for(const m of ch) voice(B,p.saw?'sawtooth':'triangle',mtof(m),t,len+.4,p.pad/(p.saw?1.6:1),len*.3,len*.35,p.saw?900:1600);
          if(p.drone) voice(B,'sine',mtof(p.drone),t,len+.4,.06,len*.4,len*.4);
          if(p.bell&&bar%2===0) voice(B,'sine',mtof(ch[3]+24),t+spb*8,2.6,.022,.01,2.4); }
        if(p.arp&&p.arp[s]!=null) voice(B,'triangle',mtof(ch[0]+24+p.arp[s]),t,spb*2.2,p.arpV,.01,spb*1.8,3200);
        if(p.bass&&p.bass[s]!=null) voice(B,'sine',mtof(ch[0]-12+p.bass[s]),t,spb*1.8,p.bassV,.01,spb,600);
        if(p.hat&&p.hat[s]) noise(B,t,.05,.035,7000);
        if(p.kick&&p.kick[s]) kick(B,t);
        if(p.tick&&p.tick[s]){ voice(B,'sine',s===0?1320:880,t,.08,.05,.003,.06); }
        next+=spb; step++; } }
    function fadeTo(ph){ if(!ac||ph===cur) return; const t=ac.currentTime;
      if(cur&&bus[cur]){ const g=bus[cur].g.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value,t); g.linearRampToValueAtTime(0,t+1.8); }
      cur=ph; const b=busFor(ph); b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value,t); b.g.gain.linearRampToValueAtTime(1,t+2.2);
      if(P[ph].rise){ b.f.frequency.cancelScheduledValues(t); b.f.frequency.setValueAtTime(500,t); b.f.frequency.linearRampToValueAtTime(3200,t+6); }
      step=Math.ceil(step/16)*16; apply(); }
    function apply(){ if(!ac) return; const t=ac.currentTime, v=on&&!document.hidden?(LV[cur]!=null?LV[cur]:.35):0; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value,t); out.gain.linearRampToValueAtTime(v,t+.8); }
    function sting(kind){ if(!ac||!on) return; const t=ac.currentTime+.05, d=ac.createGain(); d.gain.value=1; d.connect(out);
      const notes=kind==='win'?[60,64,67,72,76,79,84]:[57,56,53,50,45];
      notes.forEach((m,i)=>voice(d,'triangle',mtof(m),t+i*(kind==='win'?.09:.22),kind==='win'?1.4:1.1,.06,.01,.9,3000));
      fadeTo(kind==='win'?'win':'lose'); }
    setInterval(()=>{ const e=enabled(); if(e!==on){ on=e; apply(); } },800);
    document.addEventListener('visibilitychange',apply);
    W.HZ_MUSIC={
      unlock(){ on=enabled(); if(!on&&!ac) return; init(); if(!ac) return; if(ac.state!=='running') ac.resume(); if(want) fadeTo(want); apply(); },
      phase(ph){ if(!P[ph]) return; want=ph; if(ac&&ac.state==='running') fadeTo(ph); },
      sting, get current(){ return cur; }, get running(){ return !!ac&&ac.state==='running'; } };
  }
})();
