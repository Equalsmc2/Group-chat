/* Soul Seekers / city skies v18.1.
   Global atmosphere controller: rotating city scenes, solar/lunar modes,
   and shared weather overlays for every desktop/TV tab.
   v37 optimization: lower render cost on weaker devices, calmer particle budgets. */
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
  const DAY_KEY = 'soul-seekers-day-night-v17';
  const WEATHER_KEY = 'soul-seekers-weather-v17';
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  if (lowPower && !body.dataset.performance) body.dataset.performance = 'lite';
  const LEGACY_DAY_KEY = 'soul-seekers-day-night-v16';
  const LEGACY_WEATHER_KEY = 'soul-seekers-weather-v16';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const syncChannel = 'BroadcastChannel' in window ? new BroadcastChannel('soulseekers-atmosphere-v17') : null;
  const WEATHER_SEQUENCE = ['clear', 'rain', 'snow', 'leaves'];
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
  const readState = (key, legacyKey) => read(key) ?? read(legacyKey);
  const broadcastAtmosphere = payload => { try { syncChannel?.postMessage({ type: 'atmosphere', ...payload, at: Date.now() }); } catch {} };

  const savedTime = readState(DAY_KEY, LEGACY_DAY_KEY);
  let timeOfDay = ['day', 'night'].includes(savedTime)
    ? savedTime
    : (new Date().getHours() >= 7 && new Date().getHours() < 19 ? 'day' : 'night');
  let weather = WEATHER_SEQUENCE.includes(readState(WEATHER_KEY, LEGACY_WEATHER_KEY))
    ? readState(WEATHER_KEY, LEGACY_WEATHER_KEY)
    : 'clear';
  let sceneIndex = { day: 0, night: 0 };
  let front = imageA;
  let back = imageB;
  let sceneTimer = 0;
  let frameId = 0;
  let lastFrame = 0;
  let particles = [];
  let width = 1, height = 1, ratio = 1;
  let viewName = body.dataset.view || 'terminal';

  function currentView() { return body.dataset.view || viewName || 'terminal'; }
  function atmosphereEnabled() {
    return !matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)').matches;
  }
  function doAnimate() {
    return atmosphereEnabled() && !reduced.matches && !document.hidden && !body.classList.contains('motion-off');
  }
  function preload(path) { const image = new Image(); image.decoding = 'async'; image.src = path; }

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
  }

  function drawTimeLabel() {
    const isDay = timeOfDay === 'day';
    dayText.textContent = isDay ? 'DAY' : 'NIGHT';
    dayButton.querySelector('.scene-control-glyph').textContent = isDay ? '☀' : '☾';
    dayButton.setAttribute('aria-pressed', String(isDay));
    dayButton.setAttribute('aria-label', `Currently ${timeOfDay}; switch to ${isDay ? 'night' : 'day'}`);
    body.classList.toggle('is-day', isDay);
    body.classList.toggle('is-night', !isDay);
    body.dataset.timeOfDay = timeOfDay;
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
    sceneTimer = 0;
    if (doAnimate()) sceneTimer = setInterval(rotateScene, 13500);
  }

  dayButton.addEventListener('click', () => {
    timeOfDay = timeOfDay === 'day' ? 'night' : 'day';
    sceneIndex[timeOfDay] = (sceneIndex[timeOfDay] + 1) % images[timeOfDay].length;
    write(DAY_KEY, timeOfDay);
    broadcastAtmosphere({ timeOfDay });
    window.dispatchEvent(new CustomEvent('soulseekers:atmosphere-director-change',{detail:{timeOfDay}}));
    displayScene();
    resetRotation();
    refreshWeather();
  });

  function nextWeather(current) {
    const index = WEATHER_SEQUENCE.indexOf(current);
    return WEATHER_SEQUENCE[(index + 1) % WEATHER_SEQUENCE.length];
  }

  function drawWeatherLabel() {
    const variants = {
      clear: ['✦', 'CLEAR'],
      rain: ['☂', 'RAIN'],
      snow: ['❄', 'SNOW'],
      leaves: ['❦', 'LEAVES']
    };
    const [glyph, word] = variants[weather];
    const upcoming = nextWeather(weather);
    weatherText.textContent = word;
    weatherButton.querySelector('.scene-control-glyph').textContent = glyph;
    weatherButton.setAttribute('aria-label', `Weather ${word.toLowerCase()}; click to change to ${upcoming}`);
    weatherButton.setAttribute('aria-pressed', String(weather !== 'clear'));
    body.dataset.weather = weather;
  }

  function particleCountForWeather() {
    const base = weather === 'rain' ? Math.min(92, Math.max(22, Math.floor(width * height / 14500)))
      : weather === 'snow' ? Math.min(62, Math.max(12, Math.floor(width * height / 22500)))
      : weather === 'leaves' ? Math.min(48, Math.max(10, Math.floor(width * height / 24500)))
      : 0;
    const view = currentView();
    const multiplier = view === 'combat' ? .78 : view === 'dm' ? .8 : view === 'stage' ? .9 : 1;
    const performance = body.dataset.performance === 'lite' ? .68 : 1;
    return Math.ceil(base * multiplier * performance * (body.classList.contains('tv-device') ? 1.02 : 1));
  }

  function updateWeatherExclusions() {
    const legacyCriticalZones = ['.stage-copy', '.combat-grid', '.dm-control-hero', '.director-monitor'];
    void legacyCriticalZones;
    /* v36.6: weather is now allowed to play over the full interface, including those legacy zones. */
  }

  function maskImportantContent() { /* intentionally no-op in v36.6 */ }

  function makeParticle() {
    const common = { x: Math.random() * width, y: Math.random() * height, offset: Math.random() * 6.28 };
    if (weather === 'rain') {
      const slant = -(Math.random() * 16 + 12);
      return {
        ...common,
        size: Math.random() * 1.2 + .7,
        speed: Math.random() * 280 + 480,
        drift: slant * (Math.random() * .34 + .32),
        slant,
        length: Math.random() * 18 + 14,
        alpha: Math.random() * .28 + .34
      };
    }
    if (weather === 'snow') {
      return {
        ...common,
        size: Math.random() * 1.9 + .7,
        speed: Math.random() * 26 + 17,
        drift: (Math.random() * 2 - 1) * 8
      };
    }
    if (weather === 'leaves') {
      const palette = timeOfDay === 'day'
        ? ['rgba(231,146,44,.88)', 'rgba(201,95,34,.84)', 'rgba(193,154,61,.86)', 'rgba(167,87,27,.90)']
        : ['rgba(205,122,38,.84)', 'rgba(160,82,32,.80)', 'rgba(151,120,57,.82)', 'rgba(189,110,52,.78)'];
      return {
        ...common,
        size: Math.random() * 7 + 7,
        speed: Math.random() * 42 + 28,
        drift: (Math.random() * 2 - 1) * 24,
        spin: (Math.random() * 2 - 1) * 1.9,
        rotation: Math.random() * Math.PI * 2,
        wobble: Math.random() * 28 + 10,
        color: palette[(Math.random() * palette.length) | 0]
      };
    }
    return common;
  }

  function resize() {
    ratio = Math.min(devicePixelRatio || 1, 1);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = [];
    updateWeatherExclusions();
    if (weather === 'clear') return;
    for (let i = 0; i < particleCountForWeather(); i++) particles.push(makeParticle());
  }

  function recycleParticle(p, fromTop = true) {
    Object.assign(p, makeParticle());
    p.x = Math.random() * (width + 60) - 30;
    p.y = fromTop ? -40 : Math.random() * height;
  }

  function stopCanvas() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
    ctx?.clearRect(0, 0, width, height);
  }

  function drawLeaf(p) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * .75);
    ctx.quadraticCurveTo(p.size * .72, -p.size * .18, p.size * .35, p.size * .72);
    ctx.quadraticCurveTo(0, p.size * .42, -p.size * .35, p.size * .72);
    ctx.quadraticCurveTo(-p.size * .72, -p.size * .18, 0, -p.size * .75);
    ctx.fill();
    ctx.strokeStyle = 'rgba(55,31,12,.28)';
    ctx.lineWidth = Math.max(.8, p.size * .08);
    ctx.beginPath();
    ctx.moveTo(0, -p.size * .55);
    ctx.lineTo(0, p.size * .48);
    ctx.stroke();
    ctx.restore();
  }

  function tick(timestamp) {
    if (!ctx || weather === 'clear' || !doAnimate()) { stopCanvas(); return; }
    frameId = requestAnimationFrame(tick);
    const minFrame = body.dataset.performance === 'lite' ? 62 : 32;
    if (timestamp - lastFrame < minFrame) return;
    const dt = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .06) : .033;
    lastFrame = timestamp;
    ctx.clearRect(0, 0, width, height);
    const isDay = timeOfDay === 'day';

    if (weather === 'rain') {
      ctx.lineCap = 'round';
      for (const p of particles) {
        p.x += p.drift * dt;
        p.y += p.speed * dt;
        if (p.y > height + 40 || p.x < -60 || p.x > width + 60) recycleParticle(p);
      }

      ctx.strokeStyle = isDay ? 'rgba(188, 214, 255, .16)' : 'rgba(160, 184, 228, .15)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (const p of particles) {
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.slant * .38, p.y + p.length + 8);
      }
      ctx.stroke();

      ctx.strokeStyle = isDay ? 'rgba(233, 242, 255, .64)' : 'rgba(223, 234, 255, .56)';
      ctx.lineWidth = 1.05;
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.slant * .28, p.y + p.length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return;
    }

    if (weather === 'snow') {
      ctx.fillStyle = isDay ? 'rgba(251,252,255,.88)' : 'rgba(225,237,250,.79)';
      for (const p of particles) {
        p.x += (p.drift + Math.sin(timestamp / 850 + p.offset) * 17) * dt;
        p.y += p.speed * dt;
        if (p.y > height + 8) recycleParticle(p);
        if (p.x > width + 8) p.x = -8;
        if (p.x < -8) p.x = width + 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    for (const p of particles) {
      p.x += (p.drift + Math.sin(timestamp / 600 + p.offset) * p.wobble) * dt;
      p.y += p.speed * dt;
      p.rotation += p.spin * dt;
      if (p.y > height + 24 || p.x > width + 40 || p.x < -40) recycleParticle(p);
      drawLeaf(p);
    }
  }

  function refreshWeather() {
    drawWeatherLabel();
    stopCanvas();
    resize();
    if (ctx && weather !== 'clear' && doAnimate()) frameId = requestAnimationFrame(tick);
  }

  weatherButton.addEventListener('click', () => {
    weather = nextWeather(weather);
    write(WEATHER_KEY, weather);
    broadcastAtmosphere({ weather });
    window.dispatchEvent(new CustomEvent('soulseekers:atmosphere-director-change',{detail:{weather}}));
    refreshWeather();
  });

  syncChannel?.addEventListener('message', event => {
    if (event.data?.type !== 'atmosphere') return;
    let changed = false;
    if (['day', 'night'].includes(event.data.timeOfDay) && event.data.timeOfDay !== timeOfDay) {
      timeOfDay = event.data.timeOfDay;
      displayScene(true);
      changed = true;
    }
    if (WEATHER_SEQUENCE.includes(event.data.weather) && event.data.weather !== weather) {
      weather = event.data.weather;
      changed = true;
    }
    if (changed) {
      resetRotation();
      refreshWeather();
    }
  });

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshWeather, 170);
  }, { passive: true });

  // Ignore routine CSS-class mutations (hover/tabs/theme); react only to the
  // actual Motion ON/OFF change so we never restart the weather loop per class.
  let wasMotionOff = body.classList.contains('motion-off');
  const stateObserver = new MutationObserver(() => {
    const isMotionOff = body.classList.contains('motion-off');
    if (wasMotionOff === isMotionOff) return;
    wasMotionOff = isMotionOff;
    resetRotation();
    if (ctx && doAnimate() && weather !== 'clear' && !frameId) frameId = requestAnimationFrame(tick);
    else if (!doAnimate()) stopCanvas();
  });
  stateObserver.observe(body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('visibilitychange', () => {
    resetRotation();
    if (ctx && !document.hidden && weather !== 'clear' && doAnimate()) {
      if (!frameId) frameId = requestAnimationFrame(tick);
    } else stopCanvas();
  });
  reduced.addEventListener?.('change', () => {
    resetRotation();
    refreshWeather();
  });

  window.addEventListener('storage', event => {
    if (event.key === DAY_KEY || event.key === LEGACY_DAY_KEY) {
      if (['day', 'night'].includes(event.newValue)) {
        timeOfDay = event.newValue;
        displayScene(true);
        refreshWeather();
        resetRotation();
      }
    }
    if (event.key === WEATHER_KEY || event.key === LEGACY_WEATHER_KEY) {
      if (WEATHER_SEQUENCE.includes(event.newValue)) {
        weather = event.newValue;
        refreshWeather();
      }
    }
  });

  window.addEventListener('soulseekers:atmosphere-apply', event => {
    const next=event.detail||{};
    let changed=false;
    if(['day','night'].includes(next.timeOfDay) && next.timeOfDay!==timeOfDay){
      timeOfDay=next.timeOfDay;
      write(DAY_KEY,timeOfDay);
      displayScene(true);
      changed=true;
    }
    if(WEATHER_SEQUENCE.includes(next.weather) && next.weather!==weather){
      weather=next.weather;
      write(WEATHER_KEY,weather);
      changed=true;
    }
    if(changed){
      resetRotation();
      refreshWeather();
    }
  });

  window.addEventListener('soulseekers:viewchange', event => {
    viewName = event.detail?.view || currentView();
    displayScene(true);
    resetRotation();
    refreshWeather();
  });

  window.addEventListener('pagehide', () => {
    stateObserver.disconnect();
    clearInterval(sceneTimer);
    stopCanvas();
    try { syncChannel?.close(); } catch {}
  }, { once:true });

  imageA.classList.add('scene-active');
  body.dataset.atmosphereReady = 'true';
  displayScene(timeOfDay === 'night');
  resetRotation();
  refreshWeather();
})();
