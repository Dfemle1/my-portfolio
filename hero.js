// Cursor-tracking hero: scrubs a 240-frame horizontal sprite sheet with eased interpolation.
(function () {
  var SPRITE = 'assets/sprite-sheet.jpg';
  var CW = 224, CH = 398;               // size of one frame inside the sprite sheet

  // Frame numbers ordered by head direction: far left -> idle (frame 0) -> far right.
  // Blink/wink frames are skipped. Tweak these ranges to change the feel.
  var track = [], f;
  for (f = 60; f >= 30; f--) track.push(f);
  var C = track.length; track.push(0);
  for (f = 83; f <= 112; f++) track.push(f);
  var LAST = track.length - 1;

  var SMOOTH_ACTIVE = 0.2;              // seconds: lower = snappier while tracking
  var SMOOTH_IDLE = 0.75;               // seconds: how slowly she returns to idle
  var REACH = 0.38;                     // fraction of hero width needed for full head turn

  var hero = document.getElementById('hero');
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  var ready = false, visible = true, running = false, active = false;
  var cur = 0, vel = 0, target = 0, last = 0, key = '', leaveT = 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function size() {
    var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    key = ''; draw();
  }

  function draw() {
    if (!ready) return;
    var pos = cur < 0 ? C + cur * C : C + cur * (LAST - C);
    pos = Math.max(0, Math.min(LAST, pos));
    var i = Math.floor(pos), fr = pos - i, j = Math.min(LAST, i + 1);
    if (fr < 0.01) fr = 0; else if (fr > 0.99) { i = j; fr = 0; }
    var k = i + ':' + fr.toFixed(3); if (k === key) return; key = k;
    ctx.globalAlpha = 1;
    ctx.drawImage(img, track[i] * CW, 0, CW, CH, 0, 0, canvas.width, canvas.height);
    if (fr > 0) {                       // crossfade between neighbouring frames
      ctx.globalAlpha = fr;
      ctx.drawImage(img, track[j] * CW, 0, CW, CH, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
  }

  // Critically damped spring: smooth, no overshoot, frame-rate independent.
  function step(dt, smooth) {
    var o = 2 / smooth, x = o * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    var ch = cur - target, t = (vel + o * ch) * dt;
    vel = (vel - o * t) * e; cur = target + (ch + t) * e;
  }

  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    step(dt, (active ? SMOOTH_ACTIVE : SMOOTH_IDLE) * (reduce ? 0.5 : 1));
    draw();
    if (Math.abs(cur - target) < 0.0004 && Math.abs(vel) < 0.0004) { cur = target; vel = 0; draw(); running = false; return; }
    requestAnimationFrame(loop);
  }
  function wake() { if (!running && visible) { running = true; last = performance.now(); requestAnimationFrame(loop); } }

  function aim(e) {
    if (!visible) return;
    clearTimeout(leaveT); active = true;
    var r = hero.getBoundingClientRect();
    var u = (e.clientX - (r.left + r.width / 2)) / (r.width * REACH);
    u = Math.max(-1, Math.min(1, u));
    var a = Math.abs(u); a = a < 0.03 ? 0 : (a - 0.03) / 0.97;   // small dead zone in the centre
    target = (u < 0 ? -1 : 1) * (1 - Math.pow(1 - a, 1.6));      // quick near centre, soft at the edges
    wake();
  }
  function release() { clearTimeout(leaveT); leaveT = setTimeout(function () { active = false; target = 0; wake(); }, 160); }

  window.addEventListener('pointermove', aim, { passive: true });
  window.addEventListener('pointerdown', aim, { passive: true });
  window.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') release(); });
  window.addEventListener('pointercancel', release);
  document.documentElement.addEventListener('mouseleave', release);
  window.addEventListener('blur', release);
  window.addEventListener('resize', size);

  // Pause work (and return to idle) when the hero is scrolled out of view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (!visible) { active = false; target = 0; cur = 0; vel = 0; key = ''; draw(); } else wake();
    }, { threshold: 0.05 }).observe(hero);
  }

  img.onload = function () {
    (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
      ready = true; size();
      requestAnimationFrame(function () { canvas.classList.add('ready'); });
    });
  };
  img.src = SPRITE;
})();
