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
    await Promise.all([import('./bostonMap.js'), import('./musicPlayer.js')]);
  } catch (error) {
    console.error('Desktop feature failed to load', error);
  }
}
void activateDesktop();
phoneView.addEventListener?.('change', () => { void activateDesktop(); });
