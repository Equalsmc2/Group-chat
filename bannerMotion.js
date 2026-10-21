/* Soul Seekers Act III banner parallax.
   The old Veil/theme-switch logic was removed in v27; this file keeps only the
   lightweight pointer treatment and obeys the Terminal/Combat lifecycle. */
(() => {
  const banner = document.querySelector('.world-banner');
  if (!banner) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !window.matchMedia('(pointer: fine)').matches) return;

  let pointerFrame = 0;
  let nextPointer = { x: '0px', y: '0px' };
  let terminalActive = (document.body.dataset.view || 'terminal') === 'terminal';

  const applyPointer = () => {
    pointerFrame = 0;
    banner.style.setProperty('--parallax-x', nextPointer.x);
    banner.style.setProperty('--parallax-y', nextPointer.y);
  };
  const queuePointer = () => {
    if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer);
  };

  banner.addEventListener('pointermove', event => {
    if (!terminalActive) return;
    const bounds = banner.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    nextPointer = {
      x: `${((event.clientX - bounds.left) / bounds.width - .5) * 9}px`,
      y: `${((event.clientY - bounds.top) / bounds.height - .5) * 6}px`
    };
    queuePointer();
  }, { passive: true });

  banner.addEventListener('pointerleave', () => {
    if (!terminalActive) return;
    nextPointer = { x: '0px', y: '0px' };
    queuePointer();
  });

  window.addEventListener('soulseekers:viewchange', event => {
    terminalActive = event.detail?.view === 'terminal';
    if (terminalActive) return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    nextPointer = { x: '0px', y: '0px' };
    banner.style.setProperty('--parallax-x', '0px');
    banner.style.setProperty('--parallax-y', '0px');
  });
})();
