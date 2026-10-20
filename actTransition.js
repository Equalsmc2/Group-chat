(() => {
  const overlay = document.getElementById('actTransition');
  const body = document.body;
  if (!overlay || !body) return;
  const desktop = matchMedia('(min-width: 721px) and (min-height: 541px) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const force = new URLSearchParams(location.search).get('intro') === '1';
  let alreadyPlayed = false;
  try { alreadyPlayed = sessionStorage.getItem('soulSeekersAct3IntroV29') === 'seen'; } catch {}
  const skip = !desktop.matches || reduced || (alreadyPlayed && !force);
  if (skip) {
    overlay.remove(); body.classList.remove('act-transitioning'); body.classList.add('act-three-ready'); return;
  }
  try { sessionStorage.setItem('soulSeekersAct3IntroV29', 'seen'); } catch {}
  overlay.removeAttribute('aria-hidden');
  const skipButton=document.createElement('button');skipButton.type='button';skipButton.className='intro-skip';skipButton.textContent='SKIP INTRO / ESC';overlay.append(skipButton);
  let ended = false;
  const finish = () => {
    if (ended) return; ended = true;
    body.classList.remove('act-transitioning'); body.classList.add('act-three-ready');
    overlay.setAttribute('aria-hidden','true');
    overlay.classList.add('is-finished'); window.setTimeout(() => overlay.remove(), 650);
  };
  overlay.setAttribute('aria-label','Act II to Act III opening. Click to skip.');
  overlay.addEventListener('animationend', event => { if (event.animationName === 'actTransitionExit') finish(); });
  overlay.addEventListener('click', finish);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finish(); }, { once:true });
  window.setTimeout(finish, 4400);
})();
