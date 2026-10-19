/* Soul Seekers desktop application loader v37.1.
   Realtime state listeners remain lightweight and global; visual/rendering modules
   are lazy and suspend themselves outside their owning view. The removed map
   module is intentionally not imported. */
const phoneView = matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)');
let desktopStarted = false;
let terminalStarted = false;
let terminalStartPromise = null;
let atmosphereStartPromise = null;

// Atmosphere controls are part of the desktop shell, not a slow Terminal effect.
// Start them independently of Firebase, YouTube and the optional animation modules.
function startAtmosphereControls() {
  if (phoneView.matches || atmosphereStartPromise) return atmosphereStartPromise;
  atmosphereStartPromise = import('./sceneWeather.js?v=37.1').catch(error => {
    atmosphereStartPromise = null;
    console.error('Atmosphere controls failed to load', error);
  });
  return atmosphereStartPromise;
}

let musicStarted = false;
let musicStartPromise = null;

async function startTerminalFeatures() {
  if (terminalStarted || phoneView.matches) return;
  if (terminalStartPromise) return terminalStartPromise;
  terminalStartPromise = (async () => {
    try {
      await import('./bannerMotion.js?v=35');
      await import('./sacredMotion.js?v=35');
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
  musicStartPromise = import('./musicPlayer.js?v=37.4').then(() => { musicStarted = true; }).catch(error => {
    musicStartPromise = null;
    console.error('Shared music failed to load', error);
  });
  return musicStartPromise;
}
async function activateDesktop() {
  if (desktopStarted || phoneView.matches) return;
  desktopStarted = true;
  // No await: controls become responsive even if later modules are unavailable.
  void startAtmosphereControls();
  try {
    // Combat owns the common desktop shell/navigation and preserves existing combat state.
    await import('./combat.js?v=35');
    await startSharedMusic();
    // SFX is shared across all desktop views and must be ready before the TV/session
    // director begins receiving cinematic broadcast events.
    await import('./sfx.js?v=35');
    // Public presentation/session state stays live across every view.
    await import('./stage.js?v=35');
    await import('./sessionDirector.js?v=38.5');
    await import('./sceneDirector.js?v=37.1');
    await import('./dmControl.js?v=37.1');
    await import('./sceneDirectorUI.js?v=37.1');
    if ((document.body.dataset.view || 'terminal') === 'terminal') await startTerminalFeatures();
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
