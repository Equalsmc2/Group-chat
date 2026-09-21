/* Soul Seekers / Boston skies v15.
   Six packaged Boston scenes; two-image opacity crossfade, no network dependencies.
   Rain and snow share a capped, pointer-transparent canvas. */
(() => {
  const body = document.body;
  const banner = document.querySelector('.world-banner');
  const imageA = document.querySelector('.scene-image-a');
  const imageB = document.querySelector('.scene-image-b');
  const dayButton = document.getElementById('dayNightToggle');
  const dayText = document.getElementById('dayNightText');
  const weatherButton = document.getElementById('weatherToggle');
  const weatherText = document.getElementById('weatherText');
  const canvas = document.getElementById('weatherCanvas');
  if (!banner || !imageA || !imageB || !dayButton || !weatherButton || !canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const DAY_KEY = 'soul-seekers-day-night-v15';
  const WEATHER_KEY = 'soul-seekers-weather-v15';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const images = {
    day: [
      'assets/boston-day-photo-1.webp',
      'assets/boston-day-photo-2.webp',
      'assets/boston-day-photo-3.webp'
    ],
    night: [
      'assets/boston-night-photo-1.webp',
      'assets/boston-night-photo-2.webp',
      'assets/boston-night-photo-3.webp'
    ]
  };
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* optional */ } };
  const savedTime = read(DAY_KEY);
  let timeOfDay = ['day', 'night'].includes(savedTime)
    ? savedTime : (new Date().getHours() >= 7 && new Date().getHours() < 19 ? 'day' : 'night');
  let weather = ['clear', 'rain', 'snow'].includes(read(WEATHER_KEY)) ? read(WEATHER_KEY) : 'clear';
  let sceneIndex = { day: 0, night: 0 };
  let front = imageA;
  let back = imageB;
  let sceneTimer = 0;
  let frameId = 0;
  let lastFrame = 0;
  let particles = [];
  let width = 1, height = 1, ratio = 1;

  function doAnimate() { return !reduced.matches && !document.hidden && !body.classList.contains('motion-off'); }
  function preload(path) { const image = new Image(); image.decoding = 'async'; image.src = path; }
  // Let CSS own the crossfade; swapping the invisible image avoids layout/paint loops.
  function setScene(path, immediate = false) {
    if (front.getAttribute('src') === path && front.classList.contains('scene-active')) return;
    const target = back;
    const old = front;
    target.src = path;
    const show = () => {
      if (target.src !== new URL(path, location.href).href) return;
      if (immediate || reduced.matches) target.classList.add('scene-no-transition');
      target.classList.add('scene-active');
      old.classList.remove('scene-active');
      front = target;
      back = old;
      requestAnimationFrame(() => target.classList.remove('scene-no-transition'));
    };
    if (target.complete && target.naturalWidth) show();
    else target.addEventListener('load', show, { once: true });
    // A bad asset leaves the previous picture visible rather than a blank banner.
  }
  function drawTimeLabel() {
    const day = timeOfDay === 'day';
    const count = images[timeOfDay].length;
    dayText.textContent = `${day ? 'DAY' : 'NIGHT'} · ${sceneIndex[timeOfDay] + 1}/${count}`;
    dayButton.querySelector('.scene-control-glyph').textContent = day ? '☀' : '☾';
    dayButton.setAttribute('aria-pressed', String(day));
    dayButton.setAttribute('aria-label', `Currently ${timeOfDay}; switch to ${day ? 'night' : 'day'}`);
    body.classList.toggle('is-day', day);
    body.classList.toggle('is-night', !day);
  }
  function displayScene(immediate = false) {
    drawTimeLabel();
    setScene(images[timeOfDay][sceneIndex[timeOfDay]], immediate);
    preload(images[timeOfDay][(sceneIndex[timeOfDay] + 1) % images[timeOfDay].length]);
  }
  function rotateScene() {
    if (!doAnimate()) return;
    sceneIndex[timeOfDay] = (sceneIndex[timeOfDay] + 1) % images[timeOfDay].length;
    displayScene();
  }
  function resetRotation() {
    clearInterval(sceneTimer);
    if (doAnimate()) sceneTimer = setInterval(rotateScene, 13500);
  }
  dayButton.addEventListener('click', () => {
    timeOfDay = timeOfDay === 'day' ? 'night' : 'day';
    sceneIndex[timeOfDay] = (sceneIndex[timeOfDay] + 1) % images[timeOfDay].length;
    write(DAY_KEY, timeOfDay);
    displayScene();
    resetRotation();
  });

  function drawWeatherLabel() {
    const variants = { clear: ['✦', 'CLEAR'], rain: ['☂', 'RAIN'], snow: ['❄', 'SNOW'] };
    const [glyph, word] = variants[weather];
    weatherText.textContent = word;
    weatherButton.querySelector('.scene-control-glyph').textContent = glyph;
    weatherButton.setAttribute('aria-label', `Weather ${word.toLowerCase()}; click to change to ${weather === 'clear' ? 'rain' : weather === 'rain' ? 'snow' : 'clear'}`);
    weatherButton.setAttribute('aria-pressed', String(weather !== 'clear'));
    body.dataset.weather = weather;
  }
  function resize() {
    ratio = Math.min(devicePixelRatio || 1, 1.4);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = [];
    if (weather === 'clear') return;
    const count = Math.min(weather === 'rain' ? 124 : 85,
      Math.max(weather === 'rain' ? 22 : 16,
        Math.floor(width * height / (weather === 'rain' ? 9700 : 15800))));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        size: Math.random() * 1.9 + .7,
        speed: Math.random() * (weather === 'rain' ? 330 : 26) + (weather === 'rain' ? 355 : 17),
        drift: (Math.random() * 2 - 1) * 8, offset: Math.random() * 6.28
      });
    }
  }
  function stopCanvas() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0; lastFrame = 0;
    ctx.clearRect(0, 0, width, height);
  }
  function tick(timestamp) {
    if (weather === 'clear' || !doAnimate()) { stopCanvas(); return; }
    frameId = requestAnimationFrame(tick);
    if (timestamp - lastFrame < 32) return; // ~30 FPS cap
    const dt = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .06) : .033;
    lastFrame = timestamp;
    ctx.clearRect(0, 0, width, height);
    const ancient = body.classList.contains('veil-open');
    const day = timeOfDay === 'day';
    if (weather === 'rain') {
      ctx.lineWidth = 1;
      ctx.strokeStyle = ancient ? 'rgba(223,191,130,.23)' : day ? 'rgba(219,237,250,.32)' : 'rgba(174,200,233,.37)';
      ctx.beginPath();
      for (const p of particles) {
        p.x += (p.drift - 90) * dt;
        p.y += p.speed * dt;
        if (p.y > height + 20 || p.x < -25) { p.x = Math.random() * (width + 30); p.y = -30; }
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.speed / 45), p.y + p.size * 7);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = ancient ? 'rgba(242,225,187,.67)' : day ? 'rgba(251,252,255,.88)' : 'rgba(225,237,250,.79)';
      for (const p of particles) {
        p.x += (p.drift + Math.sin(timestamp / 850 + p.offset) * 17) * dt;
        p.y += p.speed * dt;
        if (p.y > height + 8) { p.x = Math.random() * width; p.y = -8; }
        if (p.x > width + 8) p.x = -8;
        if (p.x < -8) p.x = width + 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  function refreshWeather() {
    drawWeatherLabel();
    stopCanvas();
    resize();
    if (weather !== 'clear' && doAnimate()) frameId = requestAnimationFrame(tick);
  }
  weatherButton.addEventListener('click', () => {
    weather = weather === 'clear' ? 'rain' : weather === 'rain' ? 'snow' : 'clear';
    write(WEATHER_KEY, weather);
    refreshWeather();
  });
  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshWeather, 170);
  }, { passive: true });
  const stateObserver = new MutationObserver(() => {
    resetRotation();
    if (doAnimate() && weather !== 'clear' && !frameId) frameId = requestAnimationFrame(tick);
    else if (!doAnimate()) stopCanvas();
  });
  stateObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    resetRotation();
    if (!document.hidden && weather !== 'clear' && doAnimate()) {
      if (!frameId) frameId = requestAnimationFrame(tick);
    } else stopCanvas();
  });
  reduced.addEventListener?.('change', () => {
    resetRotation();
    refreshWeather();
  });
  imageA.classList.add('scene-active');
  displayScene(timeOfDay === 'night');
  resetRotation();
  refreshWeather();
})();
