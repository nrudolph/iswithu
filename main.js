/* =============================================
   isWithU v4 — main.js
   ============================================= */

'use strict';

/* ══════════════════════════════════════════════
   STAR CURSOR
   — smooth lag follow + rotation + hover state
══════════════════════════════════════════════ */
(function () {
  const star = document.getElementById('cursor-earth');
  const ring = document.getElementById('cursor-ring-earth');
  if (!star || !ring) return;

  let mx = -200, my = -200;   // target (mouse)
  let sx = -200, sy = -200;   // star position (fast)
  let rx = -200, ry = -200;   // ring position (slower)
  let prevSx = -200, prevSy = -200;
  let angle = 0;
  let visible = false;

  /* ── Track mouse ── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      star.style.opacity = '1';
      ring.style.opacity = '1';
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    star.style.opacity = '0';
    ring.style.opacity = '0';
    visible = false;
  });

  /* ── Hover: enlarge on interactive elements ── */
  document.querySelectorAll('a, button, input').forEach(el => {
    el.addEventListener('mouseenter', () => {
      star.classList.add('hover');
      ring.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      star.classList.remove('hover');
      ring.classList.remove('hover');
    });
  });

  /* ── Animate ── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    /* Lerp towards mouse */
    sx = lerp(sx, mx, 0.18);
    sy = lerp(sy, my, 0.18);
    rx = lerp(rx, mx, 0.09);
    ry = lerp(ry, my, 0.09);

    /* Rotation: always slow base + spike on movement */
    const dx  = sx - prevSx;
    const dy  = sy - prevSy;
    const vel = Math.sqrt(dx * dx + dy * dy);
    angle    += 0.5 + vel * 0.8;

    prevSx = sx;
    prevSy = sy;

    star.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-50%) rotate(${angle}deg)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════
   NAV — scroll state
══════════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ══════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════ */
const burger = document.getElementById('burger');
const mob    = document.getElementById('mob');
const mobX   = document.getElementById('mobX');

burger.addEventListener('click', () => { mob.classList.add('open');    document.body.style.overflow = 'hidden'; });
mobX.addEventListener('click',   () => { mob.classList.remove('open'); document.body.style.overflow = ''; });
document.querySelectorAll('.mob-a').forEach(a => a.addEventListener('click', () => {
  mob.classList.remove('open');
  document.body.style.overflow = '';
}));

/* ══════════════════════════════════════════════
   SCROLL REVEAL (.cs elements)
   Mirrors attension's content-section pattern
══════════════════════════════════════════════ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), i * 60);
    io.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.cs').forEach(el => io.observe(el));

/* Stagger sibling .cs elements in grids/lists */
['.artists-grid', '.feature-list', '.mixes-table'].forEach(sel => {
  document.querySelectorAll(`${sel} .cs`).forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
  });
});

/* ══════════════════════════════════════════════
   WAVEFORM BARS
══════════════════════════════════════════════ */
function buildWave(id, count = 40) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  const seed = id.charCodeAt(id.length - 1);

  for (let i = 0; i < count; i++) {
    const b  = document.createElement('div');
    b.className = 'b';
    const env  = Math.sin((i / (count - 1)) * Math.PI);
    const rand = Math.abs(Math.sin(i * 0.48 + seed) * Math.cos(i * 0.31 + seed * 0.5));
    const h    = Math.max(0.08, env * 0.7 + rand * 0.3 + 0.05);
    b.style.height = `${h * 30}px`;
    if (i % 4 === 0) b.style.animationDelay = `${(i * 0.041) % 0.45}s`;
    wrap.appendChild(b);
  }
}
['mw1','mw2','mw3','mw4','mw5'].forEach(id => buildWave(id));

/* ══════════════════════════════════════════════
   MIX PLAY / PAUSE
══════════════════════════════════════════════ */
const PLAY  = '<polygon points="5,3 17,10 5,17"/>';
const PAUSE = '<rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/>';

document.querySelectorAll('.mplay').forEach(btn => {
  btn.addEventListener('click', () => {
    const row    = btn.closest('.mix-row');
    const active = row.classList.contains('playing');

    document.querySelectorAll('.mix-row').forEach(r => {
      r.classList.remove('playing');
      r.querySelector('.mplay svg').innerHTML = PLAY;
    });

    if (!active) {
      row.classList.add('playing');
      btn.querySelector('svg').innerHTML = PAUSE;
    }
  });
});

/* ══════════════════════════════════════════════
   JOIN FORM
══════════════════════════════════════════════ */
function handleJoin(e) {
  e.preventDefault();
  const email = e.target.querySelector('input').value;
  const el    = document.getElementById('jc');
  el.textContent = `★ You're in — see you at ${email}`;
  e.target.reset();
  setTimeout(() => (el.textContent = ''), 7000);
}

/* ══════════════════════════════════════════════
   HERO CANVAS — Star field + teal aurora
══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  const DPR    = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, t = 0, raf;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); ctx.setTransform(1,0,0,1,0,0); resize(); raf = requestAnimationFrame(frame); }, { passive: true });
  resize();

  /* Static star field */
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.3 + Math.random() * 1.1,
    a: 0.04 + Math.random() * 0.35,
    twinkleSpeed: 0.008 + Math.random() * 0.02,
    twinklePhase: Math.random() * Math.PI * 2,
  }));

  /* Gold dust particles rising */
  const dust = Array.from({ length: 55 }, () => spawnDust());
  function spawnDust() {
    return {
      x:  Math.random(),
      y:  0.5 + Math.random() * 0.6,
      r:  0.4 + Math.random() * 1.0,
      vx: (Math.random() - 0.5) * 0.0002,
      vy: -(0.0002 + Math.random() * 0.0005),
      a:  0.05 + Math.random() * 0.25,
    };
  }

  /* Aurora bands (teal/blue horizontal waves) */
  const aurora = [
    { y: 0.35, amp: 0.04, freq: 0.006, speed: 0.004, alpha: 0.04, color: '43,184,168' },
    { y: 0.45, amp: 0.03, freq: 0.009, speed: 0.006, alpha: 0.03, color: '43,120,184' },
    { y: 0.55, amp: 0.025,freq: 0.012, speed: 0.008, alpha: 0.02, color: '120,80,200' },
  ];

  function frame() {
    ctx.clearRect(0, 0, W, H);

    /* Deep dark bg */
    ctx.fillStyle = '#060d12';
    ctx.fillRect(0, 0, W, H);

    /* Aurora waves */
    aurora.forEach(a => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = H * a.y + Math.sin(x * a.freq + t * a.speed) * H * a.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const g = ctx.createLinearGradient(0, H * (a.y - 0.1), 0, H * a.y);
      g.addColorStop(0, `rgba(${a.color},${a.alpha})`);
      g.addColorStop(1, `rgba(${a.color},0)`);
      ctx.fillStyle = g;
      ctx.fill();
    });

    /* Stars with twinkle */
    stars.forEach(s => {
      const twinkle = s.a * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinklePhase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(237,232,220,${twinkle})`;
      ctx.fill();
    });

    /* Gold dust */
    dust.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.y < -0.02) { Object.assign(d, spawnDust()); d.y = 1.02; }
      if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;
      const fade = Math.min(d.y / 0.05, 1) * d.a;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,212,0,${fade})`;
      ctx.fill();
    });

    /* Central radial glow at hero center */
    const cx = W * 0.5, cy = H * 0.5;
    const pulse = 0.8 + Math.sin(t * 0.018) * 0.2;
    const glow  = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.4 * pulse);
    glow.addColorStop(0,   `rgba(255,212,0,${0.04 * pulse})`);
    glow.addColorStop(0.5, `rgba(255,140,20,${0.02 * pulse})`);
    glow.addColorStop(1,   'rgba(255,140,20,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    t++;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
})();

/* ══════════════════════════════════════════════
   MEANING CANVAS — Soft pulsing glow
══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('meaningCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const pts = Array.from({ length: 30 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random() * 1.2,
    vy: -(0.00015 + Math.random() * 0.0003),
    vx: (Math.random() - 0.5) * 0.0001,
    a: 0.05 + Math.random() * 0.18,
  }));

  function mLoop() {
    ctx.clearRect(0, 0, W, H);

    const p = 0.55 + Math.sin(t * 0.006) * 0.45;
    const g = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, W*.5*p);
    g.addColorStop(0,   `rgba(255,140,0,${0.07*p})`);
    g.addColorStop(0.5, `rgba(255,212,0,${0.03*p})`);
    g.addColorStop(1,   'rgba(255,212,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    pts.forEach(p => {
      p.y += p.vy; p.x += p.vx;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,212,0,${p.a})`;
      ctx.fill();
    });

    t++;
    requestAnimationFrame(mLoop);
  }
  requestAnimationFrame(mLoop);
})();
