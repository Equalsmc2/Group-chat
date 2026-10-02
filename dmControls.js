import './weatherFX.js';
import { changeSession, subscribeSession, getSession, sessionPosition, connectSession } from './sessionState.js';
import { subscribeLibrary, loadSharedTrack, chooseSharedTrack, nextSharedTrack } from './musicPlayer.js';
const $ = id => document.getElementById(id);
const panel = $('dmPanel');
const launch = $('dmLaunch');
let library = [];
const renderTitle = () => { const music = getSession().music; $('dmTrack').textContent = library.find(track => track.id === music.id)?.title || music.title; };
launch.addEventListener('click', () => { panel.showModal(); launch.setAttribute('aria-expanded', 'true'); });
$('dmClose').addEventListener('click', () => panel.close());
panel.addEventListener('close', () => { launch.setAttribute('aria-expanded', 'false'); launch.focus(); });
panel.addEventListener('click', event => { if (event.target === panel) { const r = panel.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) panel.close(); } });
for (const button of panel.querySelectorAll('[data-time]')) button.addEventListener('click', () => void changeSession({ timeOfDay: button.dataset.time }));
for (const button of panel.querySelectorAll('[data-weather]')) button.addEventListener('click', () => void changeSession({ weather: button.dataset.weather }));
$('dmPlay').addEventListener('click', () => { const m = getSession().music; void changeSession({ music: { playing: !m.playing, position: sessionPosition(m) } }); });
$('dmRepeat').addEventListener('click', () => { const m = getSession().music; void changeSession({ music: { repeat: !m.repeat, position: sessionPosition(m) } }); });
$('dmNext').addEventListener('click', nextSharedTrack);
$('dmSaved').addEventListener('change', () => chooseSharedTrack($('dmSaved').value));
$('dmLoadForm').addEventListener('submit', async event => { event.preventDefault(); const result = await loadSharedTrack($('dmLink').value); $('dmFeedback').textContent = result.message; if (result.ok) $('dmLink').value = ''; });
$('dmRetry').addEventListener('click', connectSession);
subscribeLibrary(tracks => {
  library = tracks;
  $('dmSaved').replaceChildren(...tracks.map(track => { const option = document.createElement('option'); option.value = track.id; option.textContent = track.title; return option; }));
  $('dmSaved').value = getSession().music.id;
  renderTitle();
});
subscribeSession((state, info) => {
  document.body.classList.toggle('is-day', state.timeOfDay === 'day');
  document.body.classList.toggle('is-night', state.timeOfDay === 'night');
  $('dmStatus').textContent = info.status; $('dmStatus').dataset.live = String(info.connected);
  $('sessionStatus').textContent = info.status;
  $('dmRetry').hidden = info.connected;
  for (const control of panel.querySelectorAll('[data-shared], [data-time], [data-weather]')) control.disabled = !info.connected || info.busy;
  for (const button of panel.querySelectorAll('[data-time]')) button.setAttribute('aria-pressed', String(button.dataset.time === state.timeOfDay));
  for (const button of panel.querySelectorAll('[data-weather]')) button.setAttribute('aria-pressed', String(button.dataset.weather === state.weather));
  renderTitle();
  $('dmPlay').textContent = state.music.playing ? 'Ⅱ Pause' : '▶ Play';
  $('dmRepeat').textContent = state.music.repeat ? '↻ Loop on' : '↻ Loop off';
  $('dmRepeat').setAttribute('aria-pressed', String(state.music.repeat));
  $('dmSaved').value = state.music.id;
});

const effects = document.getElementById('dmEffects');
function renderEffects() {
  const on = !document.body.classList.contains('motion-off');
  effects.textContent = on ? 'Visual effects on' : 'Visual effects off';
  effects.setAttribute('aria-pressed', String(on));
}
effects.addEventListener('click', () => document.getElementById('motionToggle').click());
new MutationObserver(renderEffects).observe(document.body, { attributes: true, attributeFilter: ['class'] });
renderEffects();
