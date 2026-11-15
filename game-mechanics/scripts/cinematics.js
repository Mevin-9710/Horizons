/* The Horizon Explorers: launch cinematics. Pure overlay: reads game state, never changes physics.
   Countdown drama, ignition flash, ascent shake, speed streaks, Max-Q alarm. */
(function () {
  if (typeof S === 'undefined') return;
  const css = document.createElement('style');
  css.textContent = `
  .cin-bar{position:fixed;left:0;right:0;height:0;background:#000;z-index:40;pointer-events:none;transition:height 1.2s ease}
  #cinT{top:0}#cinB{bottom:0}body.cin .cin-bar{height:7vh}
  #cinN{position:fixed;left:50%;top:44%;transform:translate(-50%,-50%);z-index:41;pointer-events:none;font:800 clamp(90px,22vw,260px) Orbitron,ui-monospace,monospace;color:#fff;text-shadow:0 0 40px #ff3d5a,0 0 100px #ff7a1a;opacity:0}
  #cinN.p{animation:cinp .95s ease-out}@keyframes cinp{0%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}18%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}
  #cinC{position:fixed;left:50%;top:15vh;transform:translateX(-50%);z-index:41;pointer-events:none;font:600 clamp(12px,2.2vw,18px) Orbitron,ui-monospace,monospace;letter-spacing:.35em;color:#ffd27a;text-shadow:0 0 14px #000;opacity:0;transition:opacity .6s;text-align:center;width:92vw}
  #cinF{position:fixed;inset:0;z-index:42;pointer-events:none;background:radial-gradient(circle,#fff 0,#ffd27a 35%,#ff5a1a 80%);opacity:0}
  #cinF.f{animation:cinf 1.6s ease-out}@keyframes cinf{0%{opacity:.95}100%{opacity:0}}
  #cinW{position:fixed;inset:0;z-index:39;pointer-events:none;opacity:0;box-shadow:inset 0 0 160px 60px #ff1030;transition:opacity .15s}
  #cinS{position:fixed;inset:0;z-index:38;pointer-events:none;width:100%;height:100%}`;
  document.head.appendChild(css);
  const mk = (t, id, cls) => { const e = document.createElement(t); e.id = id; if (cls) e.className = cls; document.body.appendChild(e); return e; };
  mk('div', 'cinT', 'cin-bar'); mk('div', 'cinB', 'cin-bar');
  const N = mk('div', 'cinN'), C = mk('div', 'cinC'), F = mk('div', 'cinF'), W = mk('div', 'cinW'), SC = mk('canvas', 'cinS'), cx = SC.getContext('2d');
  const gl = document.querySelector('body > canvas');
  const fit = () => { SC.width = innerWidth; SC.height = innerHeight; }; fit(); addEventListener('resize', fit);

  let lastN = 99, capT = 0, flashed = false, rise = null, said = {};
  const CAPS = [[-9.5, 'ALL STATIONS GO'], [-7.5, 'DELUGE ACTIVE'], [-5.5, 'ENGINES CHILLED'], [-3.4, 'IGNITION SEQUENCE START'], [-1, 'HOLD-DOWNS ARMED'],
    [6, 'TOWER CLEAR'], [22, 'THROTTLING DOWN FOR MAX-Q'], [75, 'GO AT THROTTLE UP'], [130, 'STAGING SEQUENCE']];
  function cap(t) { C.textContent = t; C.style.opacity = 1; clearTimeout(capT); capT = setTimeout(() => C.style.opacity = 0, 2400); }
  function tone(f0, f1, d, v, type) { try { if (typeof ac === 'undefined' || !ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type || 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + d * .8); g.gain.exponentialRampToValueAtTime(.0001, t + d + .3);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .35); } catch (e) {} }

  function countdown() {
    const n = Math.ceil(-S.tc);
    if (n !== lastN && n >= 1 && n <= 10) { lastN = n; N.textContent = n; N.classList.remove('p'); void N.offsetWidth; N.classList.add('p');
      if (n === 10) tone(80, 900, 10, .05); if (n <= 3) tone(60, 40, .4, .3, 'sine'); }
    CAPS.forEach(c => { if (S.tc >= c[0] && !said[c[0]] && c[0] < 0) { said[c[0]] = 1; cap(c[1]); } });
  }
  function ascent() {
    CAPS.forEach(c => { if (c[0] > 0 && S.met >= c[0] && !said[c[0]]) { said[c[0]] = 1; cap(c[1]); } });
    if (!flashed) { flashed = true; F.classList.add('f'); N.textContent = 'LIFTOFF'; N.style.fontSize = 'clamp(50px,12vw,150px)'; N.classList.remove('p'); void N.offsetWidth; N.classList.add('p'); tone(40, 30, 2.5, .5, 'sine'); }
  }
  /* shake: the whole 3D canvas rattles with thrust at low altitude, harder near Max-Q */
  function shake() {
    if (!gl) return; let a = 0;
    if (S.mode === 'count' && S.engine) a = S.th * 3;
    else if (S.mode === 'fly' && !S.end && S.th > 0) a = S.th * (S.alt < 4000 ? 5 - S.alt / 1000 : 0) + clamp(S.q / 12000, 0, 1) * 3 * S.th;
    gl.style.transform = a > .2 ? `translate(${(Math.random() - .5) * a}px,${(Math.random() - .5) * a}px)` : '';
  }
  /* speed streaks between 2 km and 60 km */
  const streaks = Array.from({ length: 60 }, () => ({ a: Math.random() * 6.28, r: Math.random(), s: .2 + Math.random() }));
  function streakFx() {
    cx.clearRect(0, 0, SC.width, SC.height);
    if (S.mode !== 'fly' || S.end || S.alt < 1500 || S.alt > 70e3) return;
    const v = Math.hypot(S.vr, S.vt), k = clamp(v / 2500, 0, 1) * .5; if (k < .03) return;
    const X = SC.width / 2, Y = SC.height / 2, R = Math.hypot(X, Y); cx.strokeStyle = 'rgba(190,225,255,' + k + ')'; cx.lineWidth = 1.2;
    streaks.forEach(s => { s.r += s.s * .03 * (.4 + k * 2); if (s.r > 1) { s.r = .12; s.a = Math.random() * 6.28; }
      const r0 = s.r * R, r1 = r0 + 6 + k * 70 * s.s; cx.beginPath(); cx.moveTo(X + Math.cos(s.a) * r0, Y + Math.sin(s.a) * r0); cx.lineTo(X + Math.cos(s.a) * r1, Y + Math.sin(s.a) * r1); cx.stroke(); });
  }
  let warnT = 0;
  function alarm(now) {
    const hot = S.mode === 'fly' && !S.end && S.stress > 110;
    W.style.opacity = hot ? (.35 + .35 * Math.sin(now / 90)) : 0;
    if (hot && now - warnT > 700) { warnT = now; tone(900, 600, .25, .06, 'square'); }
  }
  (function loop(now) {
    requestAnimationFrame(loop);
    const on = (S.mode === 'count' || (S.mode === 'fly' && S.met < 12)) && !document.getElementById('ov').style.display.includes('flex') && getComputedStyle($('ov')).display === 'none';
    document.body.classList.toggle('cin', on);
    if (S.mode === 'count') countdown(); else if (S.mode === 'fly') ascent();
    shake(); streakFx(); alarm(now);
  })(0);
})();
