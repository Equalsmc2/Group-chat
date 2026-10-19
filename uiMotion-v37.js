/* Soul Seekers v37.1 — event-based motion. No pointer-tracking RAF or global style writes. */
(() => {
  const body=document.body;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=matchMedia('(max-width:720px), (max-height:540px) and (pointer:coarse)');
  const lowPower=(navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4)
    || (navigator.deviceMemory && navigator.deviceMemory<=4);
  body.dataset.performance=lowPower?'lite':'full';
  let flashTimeout=0;
  let refreshTimeout=0;
  function flash(){
    if(reduced.matches || coarse.matches || body.classList.contains('motion-off') || document.hidden)return;
    body.classList.remove('ui-view-flash');
    // Only once per tab transition, without global pointer tracking.
    requestAnimationFrame(()=>{
      body.classList.add('ui-view-flash');
      clearTimeout(flashTimeout);
      flashTimeout=setTimeout(()=>body.classList.remove('ui-view-flash'),260);
    });
  }
  function update(){
    body.classList.toggle('ss-low-motion',reduced.matches || lowPower || coarse.matches);
  }
  window.addEventListener('soulseekers:viewchange',flash);
  reduced.addEventListener?.('change',update);
  coarse.addEventListener?.('change',update);
  window.addEventListener('pagehide',()=>{clearTimeout(flashTimeout);clearTimeout(refreshTimeout);},{once:true});
  update();
})();
