(() => {
  const overlay = document.getElementById('actTransition');
  const body = document.body;
  if (!overlay || !body) return;

  const desktop = matchMedia('(min-width: 721px) and (min-height: 541px) and (pointer: fine)');
  if (!desktop.matches || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.remove();
    body.classList.remove('act-transitioning');
    body.classList.add('act-three-ready');
    return;
  }

  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    body.classList.remove('act-transitioning');
    body.classList.add('act-three-ready');
    overlay.classList.add('is-finished');
    window.setTimeout(() => overlay.remove(), 650);
  };

  overlay.addEventListener('animationend', (event) => {
    if (event.animationName === 'actTransitionExit') finish();
  });
  overlay.addEventListener('click', finish);
  window.setTimeout(finish, 4400);
})();
