(() => {
'use strict';
addEventListener('scroll', () => { if (window.scrollX) scrollTo(0, window.scrollY); }, { passive: true });
const C = window.CFG;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const photo = id => `photos/${id}.jpg`;
const PAL = ['#b9a3f7', '#ff9fcb', '#ffd86b', '#8fd9ff', '#c7b3ff', '#ffb8da', '#a8f0d0'];

/* =================== CATS (inline SVG) =================== */
function cat(fill = '#ffffff', o = {}) {
  const line = '#8d74d6', pinkc = '#ffb3d1', bow = o.bow || '#ff7fb8';
  const head = `
  <g>
    <polygon class="ear" points="20,48 24,10 54,32" fill="${fill}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/>
    <polygon class="ear" points="100,48 96,10 66,32" fill="${fill}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="28,40 30,20 46,32" fill="${pinkc}"/><polygon points="92,40 90,20 74,32" fill="${pinkc}"/>
    <ellipse cx="60" cy="62" rx="41" ry="35" fill="${fill}" stroke="${line}" stroke-width="3"/>
    <ellipse class="eye" cx="43" cy="62" rx="5" ry="7" fill="#3b2a66"/><ellipse class="eye" cx="77" cy="62" rx="5" ry="7" fill="#3b2a66"/>
    <circle cx="45" cy="59" r="2" fill="#fff"/><circle cx="79" cy="59" r="2" fill="#fff"/>
    <ellipse cx="30" cy="74" rx="8" ry="5" fill="${pinkc}" opacity=".75"/><ellipse cx="90" cy="74" rx="8" ry="5" fill="${pinkc}" opacity=".75"/>
    <path d="M56 72 L64 72 L60 77 Z" fill="#ff8fb5"/>
    <path d="M60 77 Q56 83 51 80 M60 77 Q64 83 69 80" fill="none" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M14 66 L30 69 M14 76 L30 74 M106 66 L90 69 M106 76 L90 74" stroke="${line}" stroke-width="2" stroke-linecap="round"/>
    <path d="M88 24 q10 -14 20 -2 q-8 12 -20 2z M88 24 q-6 -12 -16 -4 q6 12 16 4z" fill="${bow}" transform="translate(0 4)"/><circle cx="88" cy="28" r="4" fill="#fff" opacity=".9"/>
  </g>`;
  if (o.peek) {
    return `<svg class="cat" viewBox="0 6 120 96" xmlns="http://www.w3.org/2000/svg">${head}
    <ellipse cx="38" cy="98" rx="12" ry="8" fill="${fill}" stroke="${line}" stroke-width="3"/><ellipse cx="82" cy="98" rx="12" ry="8" fill="${fill}" stroke="${line}" stroke-width="3"/></svg>`;
  }
  return `<svg class="cat" viewBox="-10 -10 150 164" xmlns="http://www.w3.org/2000/svg">
    <path class="tail" d="M28 130 C0 134 -6 98 14 92" fill="none" stroke="${line}" stroke-width="14" stroke-linecap="round"/>
    <path class="tail" d="M28 130 C0 134 -6 98 14 92" fill="none" stroke="${fill}" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="62" cy="112" rx="33" ry="30" fill="${fill}" stroke="${line}" stroke-width="3"/>
    <ellipse cx="62" cy="116" rx="18" ry="18" fill="#fff" opacity=".6"/>
    <ellipse cx="46" cy="140" rx="12" ry="8" fill="${fill}" stroke="${line}" stroke-width="3"/><ellipse cx="78" cy="140" rx="12" ry="8" fill="${fill}" stroke="${line}" stroke-width="3"/>
    <g transform="translate(2 -14)">${head}</g></svg>`;
}
const CAT_W = '#ffffff', CAT_L = '#e4d8ff', CAT_P = '#ffe0ee', CAT_G = '#d9d4e6';

/* =================== AUDIO =================== */
let AC = null, master = null, musicOn = true, musicTimer = null;
function initAudio() {
  if (AC) return;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 1; master.connect(AC.destination); } catch (e) { AC = null; }
}
function tone(f, t, d, v = .08, type = 'triangle') {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
}
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const TUNE = [['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2], ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1], ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]];
function playTune(beat = .42, vol = .07) {
  if (!AC) return 0;
  if (AC.state === 'suspended') AC.resume();
  let t = AC.currentTime + .05;
  TUNE.forEach(([n, b]) => { tone(N[n], t, b * beat * 1.4, vol); tone(N[n] * 2, t, b * beat, vol * .35, 'sine'); t += b * beat; });
  return (t - AC.currentTime);
}
function musicLoop() {
  clearTimeout(musicTimer);
  if (!musicOn) return;
  const len = playTune(.5, .045);
  musicTimer = setTimeout(musicLoop, (len + 14) * 1000);
}
function meow() {
  if (!AC) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(620, t); o.frequency.exponentialRampToValueAtTime(900, t + .12); o.frequency.exponentialRampToValueAtTime(420, t + .38);
  const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 2;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .05); g.gain.exponentialRampToValueAtTime(.001, t + .42);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + .45);
}
function pop() { if (!AC) return; const t = AC.currentTime; tone(rnd(500, 900), t, .12, .09, 'sine'); tone(rnd(1000, 1600), t + .03, .1, .05, 'sine'); }
$('#musicBtn').addEventListener('click', () => {
  initAudio(); musicOn = !musicOn;
  $('#musicBtn').classList.toggle('off', !musicOn);
  if (musicOn) musicLoop(); else clearTimeout(musicTimer);
});

/* =================== FX CANVAS (confetti, sparkles, trails) =================== */
const fx = $('#fx'), fctx = fx.getContext('2d');
let parts = [], fxRun = false, DPR = Math.min(devicePixelRatio || 1, 2);
function fxResize() { fx.width = innerWidth * DPR; fx.height = innerHeight * DPR; }
addEventListener('resize', fxResize); fxResize();
function addP(p) { parts.push(p); if (!fxRun) { fxRun = true; requestAnimationFrame(fxLoop); } }
function burst(x, y, n = 24, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.283), s = rnd(2, o.speed || 7);
    addP({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, g: .16, life: rnd(50, 90), max: 90, size: rnd(7, 15), rot: rnd(0, 6), vr: rnd(-.2, .2),
      txt: o.txt ? pick(o.txt) : null, col: pick(PAL), shape: pick(['r', 'c', 'r']) });
  }
}
function confetti(n = 130) {
  for (let i = 0; i < n; i++) addP({ x: rnd(0, innerWidth), y: rnd(-40, -10), vx: rnd(-1.5, 1.5), vy: rnd(2, 6), g: .05, life: rnd(150, 260), max: 260,
    size: rnd(7, 13), rot: rnd(0, 6), vr: rnd(-.25, .25), col: pick(PAL), shape: pick(['r', 'r', 'c']), sway: rnd(0, 6) });
}
function trail(x, y) { addP({ x, y, vx: rnd(-.6, .6), vy: rnd(-1.2, -.2), g: -.01, life: 40, max: 40, size: rnd(10, 16), rot: 0, vr: 0, txt: [pick(['✦', '♡', '✧', '💜', '🌸'])], col: pick(PAL) }); }
function fxLoop() {
  fctx.setTransform(DPR, 0, 0, DPR, 0, 0); fctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
  for (const p of parts) {
    p.life--; p.vy += p.g; p.x += p.vx + (p.sway !== undefined ? Math.sin(p.life * .08 + p.sway) * .9 : 0); p.y += p.vy; p.rot += p.vr; p.vx *= .99;
    fctx.globalAlpha = Math.min(1, p.life / 30);
    fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot);
    if (p.txt) { fctx.font = p.size + 'px serif'; fctx.fillStyle = p.col; fctx.textAlign = 'center'; fctx.fillText(p.txt[0], 0, 0); }
    else { fctx.fillStyle = p.col; if (p.shape === 'c') { fctx.beginPath(); fctx.arc(0, 0, p.size / 2.4, 0, 6.3); fctx.fill(); } else fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
    fctx.restore();
  }
  fctx.globalAlpha = 1;
  if (parts.length) requestAnimationFrame(fxLoop); else { fxRun = false; fctx.clearRect(0, 0, innerWidth, innerHeight); }
}
let lastTrail = 0;
addEventListener('pointermove', e => { const n = performance.now(); if (n - lastTrail > 70 && !(e.target.closest && e.target.closest('#worldWrap'))) { lastTrail = n; trail(e.clientX, e.clientY); } }, { passive: true });
addEventListener('pointerdown', e => { if (e.target.closest('#gate')) return; burst(e.clientX, e.clientY, 8, { txt: ['✦', '♡', '✧', '💜'], speed: 4 }); }, { passive: true });

/* =================== BACKGROUND =================== */
(function bg() {
  const el = $('#bg'), cols = ['#ffb8da', '#c7b3ff', '#a8e6ff', '#ffe08a', '#d9b8ff', '#ffa8c8'];
  const small = innerWidth < 600;
  for (let i = 0; i < (small ? 7 : 12); i++) {
    const b = document.createElement('div'); b.className = 'balloon';
    const c = pick(cols); b.style.background = `radial-gradient(circle at 30% 28%,#fff9,${c} 45%)`; b.style.borderBottomColor = c; b.style.color = c;
    b.style.left = rnd(2, 94) + '%'; b.style.animationDuration = rnd(16, 30) + 's'; b.style.animationDelay = -rnd(0, 30) + 's';
    b.style.transform = `scale(${rnd(.7, 1.2)})`;
    b.addEventListener('pointerdown', e => { e.stopPropagation(); initAudio(); pop(); const r = b.getBoundingClientRect(); burst(r.x + 23, r.y + 29, 22, { txt: ['✦', '💜', '🎈', '♡'] }); b.style.visibility = 'hidden'; setTimeout(() => b.style.visibility = '', 9000); });
    el.appendChild(b);
  }
  for (let i = 0; i < 22; i++) { const t = document.createElement('div'); t.className = 'twinkle'; t.textContent = pick(['✦', '✧', '✨', '⋆']); t.style.left = rnd(0, 98) + '%'; t.style.top = rnd(0, 98) + '%'; t.style.fontSize = rnd(10, 22) + 'px'; t.style.animationDelay = -rnd(0, 3) + 's'; el.appendChild(t); }
  for (let i = 0; i < 4; i++) { const c = document.createElement('div'); c.className = 'cloud'; c.style.top = rnd(4, 70) + '%'; c.style.animationDuration = rnd(60, 110) + 's'; c.style.animationDelay = -rnd(0, 100) + 's'; c.style.transform = `scale(${rnd(.7, 1.4)})`; el.appendChild(c); }
})();

/* =================== GATE =================== */
$('#gateCats').innerHTML = cat(CAT_W) + cat(CAT_L, { bow: '#a98cf5' });
$('#gift').addEventListener('click', () => {
  initAudio();
  if (AC && AC.state === 'suspended') AC.resume();
  $('#gift').classList.add('open');
  const r = $('#gift').getBoundingClientRect();
  burst(r.x + r.width / 2, r.y + 40, 60, { txt: ['🎉', '✨', '💜', '🎀', '🌸'], speed: 10 });
  confetti(160);
  setTimeout(() => { $('#gate').classList.add('gone'); document.body.classList.remove('locked'); scrollTo(0, 0); }, 900);
  setTimeout(() => { playTune(.38, .08); setTimeout(musicLoop, 11000); }, 700);
});

/* =================== HERO =================== */
(function hero() {
  const flags = 'HAPPYBIRTHDAY'.split('');
  const n = innerWidth < 500 ? 13 : 13;
  $('#bunting').innerHTML = flags.slice(0, n).map((ch, i) => `<div class="flag" style="--c:${PAL[i % PAL.length]};animation-delay:${-i * .25}s">${ch}</div>`).join('');
  const words = ['Happy', 'Birthday'];
  let d = 0;
  $('#hbTitle').innerHTML = words.map(w => `<span class="w">${[...w].map(ch => `<span class="l" style="animation-delay:${(d++ * .09).toFixed(2)}s">${ch}</span>`).join('')}</span>`).join('');
  $('#heroImg').src = C.heroPhoto;
  $('#nameTitle').textContent = C.name;
  $('#heroLine').textContent = C.heroLine;
  $('#heroCat').innerHTML = cat(CAT_W);
  document.title = `Happy Birthday ${C.name} 💜`;
})();

/* =================== CAT BUDDY =================== */
(function buddy() {
  $('#catBuddySvg').innerHTML = cat(CAT_P, { bow: '#a98cf5' });
  const lines = ['meow! 🐾', `Happy Birthday ${C.name}!`, 'purr purr 💜', 'you’re the cutest!', 'give me treats 🐟', 'make a wish! ✨', 'nya~ 🌸', 'party time! 🎉'];
  let to;
  $('#catBuddy').addEventListener('click', e => {
    e.stopPropagation(); initAudio(); meow();
    const s = $('#catSay'); s.textContent = pick(lines); s.classList.add('show'); clearTimeout(to); to = setTimeout(() => s.classList.remove('show'), 2200);
    const r = $('#catBuddy').getBoundingClientRect(); burst(r.x + 40, r.y + 20, 14, { txt: ['💜', '🐾', '✦'], speed: 5 });
  });
  setTimeout(() => { if (!$('#gate').classList.contains('gone')) return; }, 0);
})();

/* =================== CANDLES =================== */
(function candles() {
  $('#cakeName').textContent = C.name;
  $('#cakeCat').innerHTML = cat(CAT_L, { bow: '#ff7fb8' });
  $('#candleRow').innerHTML = String(C.age).split('').map(d => `<div class="ncandle"><span class="flame"></span><span class="wick"></span><span class="digit">${d}</span></div>`).join('');
  let out = false, micStream = null;
  const row = $('#candleRow'), msg = $('#wishMsg'), btn = $('#blowBtn');
  function blow() {
    if (out) return; out = true; initAudio();
    $$('.ncandle', row).forEach((c, i) => setTimeout(() => {
      c.classList.add('out');
      const s = document.createElement('i'); s.className = 'smoke'; c.appendChild(s); setTimeout(() => s.remove(), 2000);
    }, i * 220));
    setTimeout(() => {
      confetti(180); const r = $('#cake').getBoundingClientRect(); burst(r.x + r.width / 2, r.y, 50, { txt: ['🎉', '✨', '💜', '🎂', '🎈'], speed: 11 });
      playTune(.3, .09);
      msg.textContent = `🎉 Wish made, ${C.name}! It’s totally coming true 💫`;
    }, 420);
    btn.textContent = '🔥 Light them again';
    stopMic();
  }
  function relight() { out = false; $$('.ncandle', row).forEach(c => c.classList.remove('out')); btn.textContent = '💨 Blow the candles'; msg.textContent = 'make a wish… 🤫'; }
  btn.addEventListener('click', () => out ? relight() : blow());
  $('#cake').addEventListener('click', () => { if (!out) blow(); });
  row.addEventListener('click', () => { if (!out) blow(); });
  function stopMic() { if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; } }
  $('#micBtn').addEventListener('click', async () => {
    if (out) relight();
    try {
      initAudio(); micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const src = AC.createMediaStreamSource(micStream), an = AC.createAnalyser(); an.fftSize = 512; src.connect(an);
      const buf = new Uint8Array(an.fftSize); let hot = 0; msg.textContent = '🎤 take a deep breath and blow…';
      (function chk() {
        if (!micStream) return;
        an.getByteTimeDomainData(buf); let s = 0; for (const v of buf) s += (v - 128) ** 2; const rms = Math.sqrt(s / buf.length) / 128;
        hot = rms > .22 ? hot + 1 : 0; if (hot > 6) { blow(); return; } requestAnimationFrame(chk);
      })();
    } catch (e) { msg.textContent = 'mic not available — just tap the cake 🍰'; }
  });
})();

/* =================== CAROUSEL =================== */
(function carousel() {
  const stage = $('#stage'), ids = C.carousel, n = ids.length;
  stage.innerHTML = ids.map(id => `<div class="slide"><img src="${photo(id)}" alt="" loading="lazy" draggable="false"></div>`).join('');
  $('#dots').innerHTML = ids.map(() => '<i></i>').join('');
  $('#peek1').innerHTML = cat(CAT_W, { peek: true });
  const slides = $$('.slide', stage), dots = $$('#dots i');
  let cur = 0, timer;
  function layout() {
    const w = slides[0].offsetWidth, gap = w * .56;
    slides.forEach((s, i) => {
      let o = i - cur; if (o > n / 2) o -= n; if (o < -n / 2) o += n;
      const a = Math.abs(o), vis = a <= 2;
      s.style.transform = `translateX(${o * gap}px) translateZ(${-a * 140}px) rotateY(${-o * 34}deg) scale(${a === 0 ? 1.04 : 1})`;
      s.style.opacity = vis ? 1 - a * .22 : 0; s.style.zIndex = 10 - a; s.style.pointerEvents = vis ? 'auto' : 'none';
      s.style.filter = a ? 'brightness(.88) saturate(.9)' : 'none';
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  }
  const go = i => { cur = (i + n) % n; layout(); };
  const auto = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 3600); };
  $('#next').onclick = () => { go(cur + 1); auto(); }; $('#prev').onclick = () => { go(cur - 1); auto(); };
  slides.forEach((s, i) => s.addEventListener('click', () => { if (moved) return; if (i === cur) openLB(photo(ids[i])); else { go(i); auto(); } }));
  let sx = 0, moved = false, down = false;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; down = true; moved = false; });
  addEventListener('pointerup', e => { if (!down) return; down = false; const dx = e.clientX - sx; if (Math.abs(dx) > 40) { moved = true; go(cur + (dx < 0 ? 1 : -1)); auto(); setTimeout(() => moved = false, 50); } });
  addEventListener('resize', layout); layout(); auto();
  $('#gallery').addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
})();

/* =================== LIGHTBOX =================== */
function openLB(src) { $('#lightbox img').src = src; $('#lightbox').hidden = false; }
$('#lightbox').addEventListener('click', () => $('#lightbox').hidden = true);

/* =================== DRAG CARDS =================== */
(function cards() {
  const board = $('#board'); let z = 10;
  const spots = [[3, 2], [36, 1], [66, 3], [8, 34], [42, 31], [68, 35], [4, 66], [46, 64]];
  const wide = innerWidth >= 700;
  const spotsW = [[2, 6], [26, 3], [50, 8], [74, 4], [8, 48], [32, 52], [56, 46], [78, 50]];
  C.cards.forEach((c, i) => {
    const [x, y] = (wide ? spotsW : spots)[i % 8];
    const el = document.createElement('div'); el.className = 'pcard';
    el.style.left = x + '%'; el.style.top = y + '%'; el.style.zIndex = i + 1; el.style.transform = `rotate(${rnd(-9, 9)}deg)`;
    el.innerHTML = `<div class="pin"><div class="face"><span class="tape"></span><img src="${photo(c.img)}" alt="" draggable="false" loading="lazy"><div class="cap">${c.cap}</div></div><div class="face back">${c.msg}</div></div>`;
    board.appendChild(el);
    let sx, sy, ox, oy, mv = false;
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; mv = false;
      ox = el.offsetLeft; oy = el.offsetTop; el.style.zIndex = ++z; el.classList.add('drag');
    });
    el.addEventListener('pointermove', e => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 6) mv = true;
      if (!mv) return;
      const bw = board.clientWidth, bh = board.clientHeight;
      const nx = Math.max(0, Math.min(bw - el.offsetWidth, ox + dx)), ny = Math.max(0, Math.min(bh - el.offsetHeight, oy + dy));
      el.style.left = nx / bw * 100 + '%'; el.style.top = ny / bh * 100 + '%';
    });
    const end = e => { el.classList.remove('drag'); if (!mv && e.type === 'pointerup') { el.classList.toggle('flip'); initAudio(); pop(); } };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  });
})();

/* =================== TAP THE HEARTS =================== */
(function wishes() {
  const field = $('#heartsField'), emojis = ['💗', '💜', '🩷', '💖', '💝', '💘', '🩵', '💕'];
  const spots = [[8, 6], [40, 0], [72, 8], [20, 38], [56, 36], [80, 44], [6, 70], [44, 68]];
  let opened = 0; const total = C.wishes.length;
  C.wishes.forEach((m, i) => {
    const b = document.createElement('button'); b.className = 'heart'; b.textContent = emojis[i % emojis.length];
    b.style.left = spots[i][0] + '%'; b.style.top = spots[i][1] + '%'; b.style.setProperty('--r', rnd(-12, 12) + 'deg'); b.style.animationDelay = -rnd(0, 1.5) + 's';
    b.setAttribute('aria-label', 'Open wish ' + (i + 1));
    b.addEventListener('click', e => {
      initAudio(); pop(); const r = b.getBoundingClientRect(); burst(r.x + 32, r.y + 32, 20, { txt: ['💗', '✦', '💜', '✨'] });
      $('#noteText').textContent = m; $('#noteCat').innerHTML = cat(pick([CAT_W, CAT_L, CAT_P]), { peek: true }); $('#note').hidden = false;
      if (!b.classList.contains('done')) { b.classList.add('done'); opened++; $('#wishCount').textContent = `${opened} / ${total} opened`; if (opened === total) setTimeout(allOpen, 700); }
    });
    field.appendChild(b);
  });
  function allOpen() {
    $('#note').hidden = true; $('#wishCount').textContent = `all ${total} wishes found! 🎉`;
    $('#secretCat').innerHTML = cat(CAT_P, { bow: '#a98cf5' });
    $('#secret p').textContent = `${C.name}, you found every wish! The last one is a secret: you are truly one of a kind. 💜`;
    $('#secret').hidden = false; confetti(160); meow();
  }
  $('#noteClose').onclick = () => $('#note').hidden = true;
  $('#note').addEventListener('click', e => { if (e.target.id === 'note') $('#note').hidden = true; });
})();

/* =================== SCRAPBOOK =================== */
(function scrap() {
  const P = C.scrapPhotos, r = () => rnd(-5, 5).toFixed(1) + 'deg', tp = ['rgba(185,163,247,.75)', 'rgba(255,159,203,.7)', 'rgba(255,216,107,.75)', 'rgba(143,217,255,.7)'];
  const ph = (i, cap) => `<figure class="sc ph" style="--r:${r()};--tape:${tp[i % 4]};--tr:${rnd(-6, 6).toFixed(0)}deg;margin:0" data-src="${photo(P[i])}"><img src="${photo(P[i])}" alt="" loading="lazy"><span>${cap}</span></figure>`;
  const stk = t => `<div class="sc sticker" style="--r:${r()}">${t}</div>`;
  $('#paper').innerHTML = [
    ph(0, 'cutie ✿'), ph(1, 'sunday vibes'),
    `<div class="sc note-s" style="--r:-2deg">✎ things I love about you<ul><li>your smile that lights up rooms</li><li>how kind you are to everyone</li><li>your cute little chaos</li><li>that you’re always YOU</li></ul></div>`,
    stk('🦋'), ph(2, 'soft & sweet'),
    `<div class="sc ticket" style="--r:2deg">ADMIT ONE<b>forever friendship</b>valid for life ♾️</div>`,
    ph(3, 'fashion queen 👑'), stk(cat(CAT_W, { bow: '#a98cf5' })),
    `<div class="sc quote" style="--r:-1deg">you are my favourite kind of sunshine ☀️</div>`,
    ph(4, 'study mode 📚'), stk('🌸🎀'), ph(5, 'pretty in purple'),
    ph(6, 'giggles'), stk('🧸'), ph(7, 'cozy me'), ph(8, 'outdoor queen'), stk('⭐')
  ].join('');
  $$('#paper .ph').forEach(f => f.addEventListener('click', () => openLB(f.dataset.src)));
})();

/* =================== FINAL =================== */
(function fin() {
  $('#finalCats').innerHTML = cat(CAT_L, { bow: '#ff7fb8' }) + cat(CAT_W, { bow: '#a98cf5' }) + cat(CAT_P);
  $('#fName').textContent = C.name; $('#fMsg').textContent = C.wishMessage; $('#fFrom').textContent = C.from;
  $('#again').onclick = () => { initAudio(); confetti(220); playTune(.3, .09); };
})();

/* =================== REVEAL ON SCROLL =================== */
(function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
  $$('.reveal').forEach(el => io.observe(el));
})();

/* =================== 3D WORLD (three.js) =================== */
(function world() {
  const wrap = $('#worldWrap'), canvas = $('#worldCanvas');
  let started = false, visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !started) { started = true; init(); } }, { threshold: .05 }).observe(wrap);
  $('#worldFull').addEventListener('click', () => {
    const full = wrap.classList.toggle('full'); document.body.classList.toggle('locked', full); $('#worldFull').textContent = full ? '✕' : '⛶'; setTimeout(() => dispatchEvent(new Event('resize')), 30);
  });
  function init() {
    if (!window.THREE) { $('#worldLoading').textContent = '3D not available on this device'; return; }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch (e) { $('#worldLoading').textContent = '3D not supported here 😿'; return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(65, 1, .1, 200); cam.rotation.order = 'YXZ'; cam.fov = innerWidth < 700 ? 78 : 65;
    // gradient sky
    const g = document.createElement('canvas'); g.width = 4; g.height = 256; const gx = g.getContext('2d'), gr = gx.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#2a1768'); gr.addColorStop(.5, '#7a5bd0'); gr.addColorStop(1, '#ffb3dc'); gx.fillStyle = gr; gx.fillRect(0, 0, 4, 256);
    scene.background = new THREE.CanvasTexture(g);

    function sprTex(draw) { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); return new THREE.CanvasTexture(c); }
    const heartTex = col => sprTex(x => { x.fillStyle = col; x.font = '100px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('♥', 64, 70); });
    const starTex = sprTex(x => { const gg = x.createRadialGradient(64, 64, 0, 64, 64, 64); gg.addColorStop(0, '#fff'); gg.addColorStop(.25, 'rgba(255,255,255,.8)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, 128, 128); });

    // stars
    const sp = []; for (let i = 0; i < 700; i++) { const v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(30, 90)); sp.push(v.x, v.y, v.z); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.6, map: starTex, transparent: true, depthWrite: false, color: 0xffffff })); scene.add(stars);

    // floating hearts
    const floaters = [], cols = ['#ff7fb8', '#ffffff', '#c7b3ff', '#ffd86b', '#ff9fcb'];
    const tex = cols.map(heartTex);
    for (let i = 0; i < 46; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pick(tex), transparent: true, opacity: .9, depthWrite: false }));
      const a = rnd(0, 6.28), rad = rnd(11, 20), sc = rnd(.5, 1.4); s.scale.set(sc, sc, 1);
      s.position.set(Math.cos(a) * rad, rnd(-8, 9), Math.sin(a) * rad); s.userData = { y: s.position.y, sp: rnd(.4, 1.2), ph: rnd(0, 6) }; floaters.push(s); scene.add(s);
    }

    // photo ring(s)
    const hits = [], R = 8.5, ids = C.world, loader = new THREE.TextureLoader();
    const rows = [[0, 10], [.52, 6], [-.52, 6]]; let k = 0, loaded = 0;
    rows.forEach(([lat, count], ri) => {
      for (let j = 0; j < count && k < ids.length; j++, k++) {
        const id = ids[k], yaw = j / count * Math.PI * 2 + ri * .35;
        const grp = new THREE.Group();
        grp.position.set(Math.sin(yaw) * Math.cos(lat) * R, Math.sin(lat) * R, -Math.cos(yaw) * Math.cos(lat) * R);
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
        const pm = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), pm); pic.position.z = .02;
        const H = 4.4; frame.scale.set(H * .75 + .3, H + .3, 1); pic.scale.set(H * .75, H, 1); // temp, fixed on load
        grp.add(frame, pic); grp.lookAt(0, 0, 0); scene.add(grp); pic.userData.src = photo(id); hits.push(pic);
        loader.load(photo(id), t => {
          const asp = t.image.width / t.image.height, w = Math.min(H * asp, 5.4), h = w / asp;
          pm.map = t; pm.needsUpdate = true; pic.scale.set(w, h, 1); frame.scale.set(w + .3, h + .42, 1); frame.position.y = -.06;
          if (++loaded >= Math.min(6, ids.length)) $('#worldLoading').classList.add('done');
        });
        grp.userData = { bob: rnd(0, 6), by: grp.position.y };
        pic.userData.grp = grp;
      }
    });
    setTimeout(() => $('#worldLoading').classList.add('done'), 4000);

    // controls
    let yaw = 0, pitch = 0, vy = 0, vp = 0, idle = 0, drag = false, lx = 0, ly = 0, dist = 0;
    const touches = new Map(); let pd0 = 0;
    function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    addEventListener('resize', resize); new ResizeObserver(resize).observe(wrap); resize();
    canvas.addEventListener('pointerdown', e => {
      touches.set(e.pointerId, [e.clientX, e.clientY]); canvas.setPointerCapture(e.pointerId); drag = true; lx = e.clientX; ly = e.clientY; dist = 0; idle = 0;
      if (touches.size === 2) { const [a, b] = [...touches.values()]; pd0 = Math.hypot(a[0] - b[0], a[1] - b[1]); }
    });
    canvas.addEventListener('pointermove', e => {
      if (!touches.has(e.pointerId)) return; touches.set(e.pointerId, [e.clientX, e.clientY]);
      if (touches.size === 2) { const [a, b] = [...touches.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); cam.fov = Math.max(40, Math.min(100, cam.fov - (d - pd0) * .15)); pd0 = d; cam.updateProjectionMatrix(); dist = 99; return; }
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; dist += Math.abs(dx) + Math.abs(dy);
      const k = cam.fov / 65 * .0045; vy = dx * k; vp = dy * k; yaw += vy; pitch = Math.max(-.9, Math.min(.9, pitch + vp)); idle = 0;
    });
    const up = e => {
      touches.delete(e.pointerId); if (touches.size) return; drag = false;
      if (dist < 8 && e.type === 'pointerup') {
        const r = canvas.getBoundingClientRect(), v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        const rc = new THREE.Raycaster(); rc.setFromCamera(v, cam); const h = rc.intersectObjects(hits)[0];
        if (h) { initAudio(); pop(); openLB(h.object.userData.src); }
      }
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', e => { if (!wrap.classList.contains('full') && !e.ctrlKey) return; e.preventDefault(); cam.fov = Math.max(40, Math.min(100, cam.fov + e.deltaY * .04)); cam.updateProjectionMatrix(); }, { passive: false });

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop); if (!visible) return;
      const t = clock.getElapsedTime(); clock.getDelta();
      if (!drag) { idle++; if (idle > 60) { yaw += .0016; } yaw += vy; pitch = Math.max(-.9, Math.min(.9, pitch + vp)); vy *= .93; vp *= .93; pitch *= .995; }
      cam.rotation.set(-pitch, -yaw, 0);
      stars.rotation.y = t * .01;
      floaters.forEach(s => { s.position.y = s.userData.y + Math.sin(t * s.userData.sp + s.userData.ph) * .8; });
      hits.forEach(p => { const gp = p.userData.grp; gp.position.y = gp.userData.by + Math.sin(t * .8 + gp.userData.bob) * .12; });
      renderer.render(scene, cam);
    })();
  }
})();

})();
