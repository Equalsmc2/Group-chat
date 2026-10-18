/* Desktop feature loader v27.
   Combat is loaded first. Music is a shared desktop service because it must
   continue playing and visualizing in both Terminal and Combat. The remaining
   Terminal-only stack (map, weather, ambient ornament) is lazy-loaded only
   while Terminal is visible and suspends while Combat is active. */
const phoneView = matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)');
let desktopStarted = false;
let terminalStarted = false;
let terminalStartPromise = null;
let musicStarted = false;
let musicStartPromise = null;

async function startTerminalFeatures() {
  if (terminalStarted || phoneView.matches) return;
  if (terminalStartPromise) return terminalStartPromise;
  terminalStartPromise = (async () => {
    try {
      await import('./bannerMotion.js?v=27');
      await import('./sacredMotion.js?v=27');
      await import('./sceneWeather.js?v=27');
      await import('./bostonMap.js?v=27');
      terminalStarted = true;
    } catch (error) {
      terminalStartPromise = null;
      console.error('Terminal feature failed to load', error);
    }
  })();
  return terminalStartPromise;
}

async function startSharedMusic() {
  if (musicStarted || phoneView.matches) return;
  if (musicStartPromise) return musicStartPromise;
  musicStartPromise = import('./musicPlayer.js?v=27').then(() => {
    musicStarted = true;
  }).catch(error => {
    musicStartPromise = null;
    console.error('Shared music failed to load', error);
  });
  return musicStartPromise;
}

async function activateDesktop() {
  if (desktopStarted || phoneView.matches) return;
  desktopStarted = true;
  try {
    // Combat owns the desktop tab lifecycle and restores the last open tab.
    await import('./combat.js?v=27');
    await startSharedMusic();
    if (!document.body.classList.contains('combat-screen-active')) {
      await startTerminalFeatures();
    }
    window.addEventListener('soulseekers:viewchange', event => {
      if (event.detail?.view === 'terminal') void startTerminalFeatures();
    });
  } catch (error) {
    desktopStarted = false;
    console.error('Desktop feature failed to load', error);
  }
}

void activateDesktop();
phoneView.addEventListener?.('change', () => { void activateDesktop(); });
