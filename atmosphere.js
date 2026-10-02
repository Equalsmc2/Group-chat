/* The Veil is visual only; messages, map data and audio never change. */
(() => {
  const toggle = document.getElementById('veilToggle');
  const toggleText = document.getElementById('veilToggleText');
  const banner = document.querySelector('.world-banner');
  if (!toggle || !banner) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentTransition = null;
  let pointerFrame = 0;
  let nextPointer = {x: '0px', y: '0px'};

  function setVeil() {
    const chat = document.getElementById('chatMessages');
    const nearBottom = chat && chat.scrollHeight - chat.clientHeight - chat.scrollTop < 140;
    const open = document.body.classList.toggle('veil-open');
    toggle.setAttribute('aria-pressed', String(open));
    toggle.setAttribute('aria-label', open ? 'Return to the present world' : 'Reveal the old world');
    toggleText.textContent = open ? 'VEIL / OPEN' : 'VEIL / CLOSED';
    // The two skins have different font metrics. Keep the latest messages in view.
    if (nearBottom) chat.scrollTop = chat.scrollHeight;
  }

  toggle.addEventListener('click', () => {
    if (currentTransition) {
      currentTransition.skipTransition();
      currentTransition = null;
    }
    if (reducedMotion.matches) {
      setVeil();
      return;
    }
    if (typeof document.startViewTransition === 'function') {
      // The browser blends two single snapshots, not dozens of expensive CSS backgrounds.
      currentTransition = document.startViewTransition(setVeil);
      const transition = currentTransition;
      transition.finished.finally(() => {
        if (currentTransition === transition) currentTransition = null;
      }).catch(() => {});
    } else {
      setVeil();
      document.body.classList.remove('veil-fallback');
      // Next paint rather than a forced synchronous layout read.
      requestAnimationFrame(() => {
        document.body.classList.add('veil-fallback');
        setTimeout(() => document.body.classList.remove('veil-fallback'), 455);
      });
    }
  });

  // Pointer animation is capped to once per paint. No mousemove layout thrashing.
  if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    const applyPointer = () => {
      pointerFrame = 0;
      banner.style.setProperty('--parallax-x', nextPointer.x);
      banner.style.setProperty('--parallax-y', nextPointer.y);
    };
    banner.addEventListener('pointermove', event => {
      const bounds = banner.getBoundingClientRect();
      nextPointer = {
        x: `${((event.clientX - bounds.left) / bounds.width - .5) * 9}px`,
        y: `${((event.clientY - bounds.top) / bounds.height - .5) * 6}px`
      };
      if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer);
    }, {passive: true});
    banner.addEventListener('pointerleave', () => {
      nextPointer = {x: '0px', y: '0px'};
      if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer);
    });
  }
})();
