import './sacredMotion.js';
import { subscribeSession } from './sessionState.js';

// One bounded canvas, including on phones. The top layer puts precipitation
// above the DM dialog while pointer-events:none leaves every control usable.
const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let weather = 'clear', day = false, width = 1, height = 1;
let particles = [], splashes = [], frame = 0, last = 0;
const active = () => ctx && weather !== 'clear' && !document.hidden && !reduced.matches && !document.body.classList.contains('motion-off');
function lift() {
  if (!canvas.showPopover) return;
  try {
    if (canvas.matches(':popover-open')) canvas.hidePopover();
    if (active()) canvas.showPopover();
  } catch { /* Older browsers retain the fixed overlay fallback. */ }
}
function resize() {
  width = innerWidth; height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  const mobile = width <= 720;
  const count = Math.min(mobile ? 65 : weather === 'rain' ? 180 : 110, Math.max(32, Math.round(width * height / (weather === 'rain' ? 6200 : 10000))));
  particles = Array.from({ length: count }, () => {
    const depth = Math.random();
    return { x: Math.random() * width, y: Math.random() * height, depth,
      size: .65 + depth * 2.4, speed: weather === 'rain' ? 420 + depth * 600 : 17 + depth * 43,
      phase: Math.random() * Math.PI * 2, opacity: .2 + depth * .5 };
  });
  splashes = [];
}
function draw(now, dt) {
  ctx.clearRect(0, 0, width, height);
  const wind = Math.sin(now / 5700) * (weather === 'rain' ? 25 : 12);
  const rainColor = day ? '55,94,119' : '182,212,240';
  for (const p of particles) {
    if (weather === 'rain') {
      const dx = -110 - p.depth * 70 + wind;
      p.x += dx * dt; p.y += p.speed * dt;
      if (p.y > height && p.depth > .6 && splashes.length < 18) splashes.push({x:p.x,y:height-3-Math.random()*16,age:0});
      if (p.y > height + 25 || p.x < -35) { p.x = Math.random() * (width + 100); p.y = -30; }
      const length = 10 + p.depth * 22;
      ctx.lineWidth = .55 + p.depth * .9;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${rainColor},${p.opacity * .44})`;
      ctx.beginPath(); ctx.moveTo(p.x - dx / p.speed * length, p.y-length); ctx.lineTo(p.x,p.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${rainColor},${p.opacity * .7})`;
      ctx.beginPath(); ctx.moveTo(p.x - dx / p.speed * 4,p.y-4);ctx.lineTo(p.x,p.y);ctx.stroke();
    } else {
      p.x += (wind + Math.sin(now / (1200 + p.depth * 1000) + p.phase) * (10 + p.depth * 19)) * dt;
      p.y += p.speed * dt;
      if (p.y > height + 8) { p.x = Math.random() * width; p.y = -8; }
      if (p.x > width + 8) p.x = -8; if (p.x < -8) p.x = width + 8;
      ctx.fillStyle = `rgba(241,248,255,${p.opacity})`;
      ctx.strokeStyle = day ? `rgba(63,99,117,${p.opacity * .45})` : `rgba(220,237,255,${p.opacity * .5})`;
      ctx.lineWidth = .65;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.stroke();
      if (p.depth > .9) {
        ctx.strokeStyle = `rgba(${day ? '106,132,147' : '232,245,255'},${p.opacity * .65})`;
        ctx.beginPath();
        for(let arm=0;arm<3;arm++) { const angle=arm*Math.PI/3+p.phase+now/12000;const x=Math.cos(angle)*p.size*1.7,y=Math.sin(angle)*p.size*1.7;ctx.moveTo(p.x-x,p.y-y);ctx.lineTo(p.x+x,p.y+y); }
        ctx.stroke();
      }
    }
  }
  for(const splash of splashes) {
    splash.age += dt; const radius=1+splash.age*20;
    ctx.strokeStyle=`rgba(${rainColor},${Math.max(0,.25-splash.age)})`;ctx.lineWidth=.7;
    ctx.beginPath();ctx.ellipse(splash.x,splash.y,radius,radius*.22,0,0,Math.PI*2);ctx.stroke();
  }
  splashes=splashes.filter(s=>s.age<.25);
}
function tick(now) {
  if (!active()) { refresh(); return; }
  frame=requestAnimationFrame(tick);
  if(now-last<33) return;
  draw(now,last?Math.min((now-last)/1000,.06):.033);last=now;
}
function refresh() {
  cancelAnimationFrame(frame); frame=0; last=0;
  ctx?.clearRect(0,0,width,height);
  lift();
  canvas.dataset.active=String(!!active());
  if(active()) frame=requestAnimationFrame(tick);
}
subscribeSession(state=>{
  day=state.timeOfDay==='day';
  document.body.dataset.weather=state.weather;
  if(weather!==state.weather) { weather=state.weather;resize();refresh(); }
});
let resizeTimer;
addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{resize();refresh();},120);},{passive:true});
document.addEventListener('visibilitychange',refresh);
reduced.addEventListener('change',refresh);
let off=document.body.classList.contains('motion-off');
new MutationObserver(()=>{
  const next=document.body.classList.contains('motion-off');
  if(next!==off){off=next;refresh();}
}).observe(document.body,{attributes:true,attributeFilter:['class']});
document.getElementById('dmPanel').addEventListener('toggle',lift);
resize();refresh();
