/* Only the Firebase chat starts on phones. All atmospheric, map, music and
   YouTube code initializes on desktop, including after a narrow window expands. */
const phoneView = matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)');
let desktopStarted = false;
async function activateDesktop() {
  if (desktopStarted || phoneView.matches) return;
  desktopStarted = true;
  try {
    // The weather system reads the MOTION preference set by sacredMotion.
    await import('./atmosphere.js');
    await import('./sacredMotion.js');
    await import('./sceneWeather.js');
    await Promise.allSettled([loadMap(), import('./musicPlayer.js').then(module => module.enableDesktopAudio())]);
  } catch (error) {
    console.error('Desktop feature failed to load', error);
  }
}
void activateDesktop();
phoneView.addEventListener?.('change', () => { void activateDesktop(); });

async function loadMap() {
  if (!window.L) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
      });
    } catch { document.getElementById('mapTelemetry').textContent = 'OFFLINE MAP'; return; }
  }
  await import('./bostonMap.js');
}
