/* V39 — event-driven motion and phone viewport sizing; no continuous UI loop. */
(() => {
  const body=document.body;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=matchMedia('(max-width:720px), (max-height:540px) and (pointer:coarse)');
  const lowPower=(navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4)
    || (navigator.deviceMemory && navigator.deviceMemory<=4);
  body.dataset.performance=lowPower?'lite':'full';
  const views=['terminal','combat','stage','dm'];
  let previousView=body.dataset.view||'terminal';
  let flashTimeout=0, flashFrame=0, viewportFrame=0;
  function clearFlash(){
    cancelAnimationFrame(flashFrame);flashFrame=0;
    clearTimeout(flashTimeout);flashTimeout=0;
    body.classList.remove('ui-view-flash');
  }
  function flash(event){
    const next=event.detail?.view||body.dataset.view||previousView;
    body.style.setProperty('--view-enter-x',views.indexOf(next)<views.indexOf(previousView)?'-10px':'10px');
    previousView=next;
    clearFlash();
    if(reduced.matches || coarse.matches || body.classList.contains('motion-off') || document.hidden)return;
    flashFrame=requestAnimationFrame(()=>{
      flashFrame=0;body.classList.add('ui-view-flash');
      flashTimeout=setTimeout(()=>body.classList.remove('ui-view-flash'),280);
    });
  }
  function updateViewport(){
    viewportFrame=0;
    const viewport=window.visualViewport;
    // Do not fight pinch zoom or desktop sizing. A soft keyboard shrinks this viewport.
    if(!coarse.matches || (viewport && viewport.scale!==1)){
      body.style.removeProperty('--phone-viewport-height');return;
    }
    body.style.setProperty('--phone-viewport-height',`${Math.round(viewport?.height||innerHeight)}px`);
  }
  function queueViewport(){
    if(!viewportFrame)viewportFrame=requestAnimationFrame(updateViewport);
  }
  function update(){
    body.classList.toggle('ss-low-motion',reduced.matches || lowPower || coarse.matches);
    if(reduced.matches)clearFlash();
    queueViewport();
  }
  window.addEventListener('soulseekers:viewchange',flash);
  reduced.addEventListener?.('change',update);
  coarse.addEventListener?.('change',update);
  window.visualViewport?.addEventListener('resize',queueViewport,{passive:true});
  window.addEventListener('resize',queueViewport,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearFlash();});
  window.addEventListener('pagehide',()=>{clearFlash();cancelAnimationFrame(viewportFrame);viewportFrame=0;});
  update();
})();
