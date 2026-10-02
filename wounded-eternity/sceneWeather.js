import { subscribeSession, changeSession, getSession } from './sessionState.js';
/* Soul Seekers / Boston scenes.
   Four high-resolution Boston scenes; two-image opacity crossfade, no network dependencies.
   Full-viewport rain and snow are handled by weatherFX.js on all devices. */
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
  const DAY_KEY = 'soul-seekers-day-night-v15';
  const WEATHER_KEY = 'soul-seekers-weather-v15';
  const phoneView = matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const images = {
    day: [
      'assets/boston-charles-day.webp',
      'assets/boston-beacon-day.webp'
    ],
    night: [
      'assets/boston-harbor-night.webp',
      'assets/boston-beacon-night.webp'
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

  function doAnimate() { return !phoneView.matches && !reduced.matches && !document.hidden && !body.classList.contains('motion-off'); }
  const preloaded = new Set();
  function preload(path) { if (preloaded.has(path) || navigator.connection?.saveData) return; preloaded.add(path); const image = new Image(); image.decoding = 'async'; image.src = path; }
  let sceneRequest = 0;
  async function setScene(path, immediate = false) {
    const request = ++sceneRequest;
    if (front.getAttribute('src') === path && front.classList.contains('scene-active')) return;
    const target = back;
    target.src = path;
    try { await target.decode(); } catch { return; }
    if (request !== sceneRequest) return;
    if (immediate || reduced.matches) target.classList.add('scene-no-transition');
    target.classList.add('scene-active');
    front.classList.remove('scene-active');
    back = front; front = target;
    requestAnimationFrame(() => target.classList.remove('scene-no-transition'));
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
    const captions = timeOfDay === 'day' ? ['Charles River / Sunlight', 'Beacon Hill / Morning'] : ['Harbor / Moonlight', 'Beacon Hill / Lamplight'];
    document.getElementById('sceneLocation').textContent = captions[sceneIndex[timeOfDay]];
    document.getElementById('sceneMood').textContent = timeOfDay === 'day' ? 'THE CITY IN DAYLIGHT' : 'BOSTON AFTER DARK';
    setScene(images[timeOfDay][sceneIndex[timeOfDay]], immediate);
    preload(images[timeOfDay][(sceneIndex[timeOfDay] + 1) % images[timeOfDay].length]);
  }
  function rotateScene(manual = false) {
    if (!manual && !doAnimate()) return;
    sceneIndex[timeOfDay] = (sceneIndex[timeOfDay] + 1) % images[timeOfDay].length;
    displayScene();
  }
  function resetRotation() {
    clearInterval(sceneTimer);
    if (doAnimate()) sceneTimer = setInterval(() => rotateScene(), 20000);
  }
  document.getElementById('nextScene').addEventListener('click', () => { rotateScene(true); resetRotation(); });
  dayButton.addEventListener('click', () => {
    void changeSession({ timeOfDay: getSession().timeOfDay === 'day' ? 'night' : 'day' });
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
  weatherButton.addEventListener('click', () => {
    const current = getSession().weather;
    void changeSession({ weather: current === 'clear' ? 'rain' : current === 'rain' ? 'snow' : 'clear' });
  });
  subscribeSession((state, info) => {
    dayButton.disabled = weatherButton.disabled = !info.connected || info.busy;
    if (timeOfDay !== state.timeOfDay) {
      timeOfDay = state.timeOfDay; write(DAY_KEY, timeOfDay);
      displayScene(); resetRotation();
    }
    if (weather !== state.weather) {
      weather = state.weather; write(WEATHER_KEY, weather); drawWeatherLabel();
    }
  });
  let motionOff = body.classList.contains('motion-off');
  new MutationObserver(() => {
    const next = body.classList.contains('motion-off');
    if (next !== motionOff) { motionOff = next; resetRotation(); }
  }).observe(body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', resetRotation);
  reduced.addEventListener('change', resetRotation);
  phoneView.addEventListener('change', resetRotation);
  imageA.classList.add('scene-active');
  displayScene(timeOfDay === 'night');
  resetRotation();
  drawWeatherLabel();
})();
