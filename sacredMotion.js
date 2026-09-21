/* A small shared visual stage. The YouTube iframe exposes playback position and
   state, not decoded audio samples, so these are playback-timed musical pulses,
   NOT a waveform/beat detector. Slow CSS motion persists without playback. */
(() => {
  const controls = document.getElementById('motionToggle');
  const label = document.getElementById('motionToggleText');
  const beatRing = document.getElementById('sanctumBeatRing');
  const beatCross = document.getElementById('sanctumBeatCross');
  const mapBeat = document.getElementById('sanctumMapBeat');
  const coverMark = document.getElementById('sanctumCoverMark');
  const outerRing = document.getElementById('sanctumOuterRing');
  const innerRing = document.getElementById('sanctumInnerRing');
  const bannerSigil = document.getElementById('musicSigilBanner');
  const chatSigil = document.getElementById('musicSigilChat');
  const mapSigil = document.getElementById('musicSigilMap');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'soul-seekers-ambient-motion-v14';
  const canStore = (() => {
    try { return localStorage.getItem(key); } catch { return null; }
  })();
  let enabled = !prefersReduced.matches && canStore !== 'off';
  const baseline = () => {
    if (beatRing) { beatRing.style.opacity = ''; beatRing.style.transform = ''; }
    if (beatCross) { beatCross.style.opacity = ''; beatCross.style.transform = ''; }
    if (mapBeat) { mapBeat.style.opacity = ''; mapBeat.style.transform = ''; }
    if (coverMark) { coverMark.style.opacity = ''; coverMark.style.transform = ''; }
    [outerRing, innerRing, bannerSigil, chatSigil, mapSigil].forEach(el => {
      if (!el) return;
      el.style.opacity = '';
      el.style.transform = '';
    });
  };
  function updateMotion() {
    document.body.classList.toggle('motion-off', !enabled);
    if (controls) {
      controls.setAttribute('aria-pressed', String(enabled));
      controls.setAttribute('aria-label', enabled ? 'Turn ambient animation off' : 'Turn ambient animation on');
    }
    if (label) label.textContent = enabled ? 'MOTION / ON' : 'MOTION / OFF';
    if (!enabled) baseline();
  }
  updateMotion();
  controls?.addEventListener('click', () => {
    enabled = !enabled && !prefersReduced.matches;
    try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch { /* localStorage optional */ }
    updateMotion();
  });
  prefersReduced.addEventListener?.('change', event => {
    let stored = null;
    try { stored = localStorage.getItem(key); } catch { /* optional storage */ }
    enabled = !event.matches && stored !== 'off';
    updateMotion();
  });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) baseline();
  });
  let lastUpdate = 0;
  window.addEventListener('soulseekers:music', event => {
    const { playing, energy = 0, seconds = 0 } = event.detail || {};
    document.body.classList.toggle('music-is-playing', !!playing);
    const now = performance.now();
    if (!enabled || document.hidden) {
      baseline();
      return;
    }
    if (now - lastUpdate < 65) return;
    lastUpdate = now;
    const e = Math.max(0, Math.min(1, Number(energy) || 0));
    const measure = 0.5 + 0.5 * Math.sin(Number(seconds) * Math.PI * 2 * 1.85);
    const pulse = playing ? Math.min(1, e * .62 + measure * .38) : 0.10;
    if (!playing) {
      // Keep the site alive, but calmer, when music is paused.
      const idleRot = (Number(seconds) * 14) % 360;
      [bannerSigil, mapSigil].forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate3d(-50%,-50%,0) rotate(${(idleRot * (i ? -0.55 : 0.75)).toFixed(2)}deg) scale(1)`;
        el.style.opacity = (0.10 + i * 0.02).toFixed(3);
      });
      if (chatSigil) { chatSigil.style.transform = ''; chatSigil.style.opacity = ''; }
      return;
    }
    if (beatRing) {
      beatRing.style.transform = `translate3d(-50%,-50%,0) scale(${(0.92 + pulse * .26).toFixed(3)})`;
      beatRing.style.opacity = (0.14 + pulse * .38).toFixed(3);
    }
    if (beatCross) {
      beatCross.style.transform = `translate3d(-50%,-50%,0) scale(${(0.92 + pulse * .25).toFixed(3)})`;
      beatCross.style.opacity = (0.22 + pulse * .39).toFixed(3);
    }
    if (mapBeat) {
      mapBeat.style.transform = `translate3d(-50%,-50%,0) scale(${(0.88 + pulse * .24).toFixed(3)})`;
      mapBeat.style.opacity = (0.14 + pulse * .24).toFixed(3);
    }
    if (coverMark) {
      coverMark.style.transform = `translate3d(-50%,-50%,0) scale(${(0.82 + pulse * .38).toFixed(3)})`;
      coverMark.style.opacity = (0.10 + pulse * .30).toFixed(3);
    }
    if (outerRing) {
      outerRing.style.transform = `translate3d(-50%,-50%,0) rotate(${(seconds * 98 + pulse * 42).toFixed(2)}deg) scale(${(0.98 + pulse * .07).toFixed(3)})`;
      outerRing.style.opacity = (0.26 + pulse * .28).toFixed(3);
    }
    if (innerRing) {
      innerRing.style.transform = `translate3d(-50%,-50%,0) rotate(${(-seconds * 138 - pulse * 54).toFixed(2)}deg) scale(${(0.97 + pulse * .10).toFixed(3)})`;
      innerRing.style.opacity = (0.18 + pulse * .22).toFixed(3);
    }
    const applySigil = (el, multiplier = 1, base = 1, opacityBase = .12, extraScale = .24) => {
      if (!el) return;
      const spin = seconds * (72 * multiplier) + pulse * 68 * multiplier;
      el.style.transform = `translate3d(-50%,-50%,0) rotate(${spin.toFixed(2)}deg) scale(${(base + pulse * extraScale).toFixed(3)})`;
      el.style.opacity = (opacityBase + pulse * .30).toFixed(3);
    };
    applySigil(bannerSigil, 1, 1.00, .16, .26);
    applySigil(chatSigil, -1.15, 1.02, .24, .16);
    applySigil(mapSigil, .92, .98, .13, .20);
  });
})();
