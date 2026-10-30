import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../uiMotion-v37.js',import.meta.url),'utf8');
function setup({phone=false,reduced=false}={}){
  let sequence=0;const frames=new Map(),timers=new Map(),events=new Map(),classes=new Set(),styles=new Map();
  const reducedQuery={matches:reduced,addEventListener(_,f){this.change=f;}};
  const phoneQuery={matches:phone,addEventListener(_,f){this.change=f;}};
  const body={dataset:{view:'terminal'},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)},classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x),toggle(x,on){on?classes.add(x):classes.delete(x);}}};
  const document={body,hidden:false,addEventListener:(e,f)=>events.set('doc:'+e,f)};
  const viewport={height:800,scale:1,addEventListener:(e,f)=>events.set('viewport:'+e,f)};
  const window={visualViewport:viewport,addEventListener:(e,f)=>events.set(e,f)};
  vm.runInNewContext(source,{window,document,navigator:{hardwareConcurrency:8,deviceMemory:8},innerHeight:844,matchMedia:q=>q.includes('reduced-motion')?reducedQuery:phoneQuery,requestAnimationFrame:f=>{frames.set(++sequence,f);return sequence;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:f=>{timers.set(++sequence,f);return sequence;},clearTimeout:id=>timers.delete(id)});
  const flush=()=>{const fs=[...frames.values()];frames.clear();fs.forEach(f=>f());};
  return {events,frames,timers,classes,styles,body,document,viewport,reducedQuery,phoneQuery,flush};
}
test('phone keyboard resize is coalesced and pinch zoom does not lock page height',()=>{
 const s=setup({phone:true});s.flush();assert.equal(s.styles.get('--phone-viewport-height'),'800px');
 s.viewport.height=420;s.events.get('viewport:resize')();s.events.get('viewport:resize')();assert.equal(s.frames.size,1);s.flush();assert.equal(s.styles.get('--phone-viewport-height'),'420px');
 s.viewport.scale=2;s.events.get('viewport:resize')();s.flush();assert.equal(s.styles.has('--phone-viewport-height'),false);
 s.viewport.scale=1;s.phoneQuery.matches=false;s.phoneQuery.change();s.flush();assert.equal(s.styles.has('--phone-viewport-height'),false);
});
test('rapid navigation schedules one entrance with the latest direction',()=>{
 const s=setup();s.flush();s.events.get('soulseekers:viewchange')({detail:{view:'dm'}});s.events.get('soulseekers:viewchange')({detail:{view:'combat'}});assert.equal(s.frames.size,1);assert.equal(s.styles.get('--view-enter-x'),'-10px');s.flush();assert.ok(s.classes.has('ui-view-flash'));assert.equal(s.timers.size,1);
 s.events.get('pagehide')();assert.equal(s.frames.size,0);assert.equal(s.timers.size,0);assert.equal(s.classes.has('ui-view-flash'),false);
});
test('reduced motion, motion-off and hidden documents do not start entrances',()=>{
 const s=setup({reduced:true});s.flush();const navigate=()=>s.events.get('soulseekers:viewchange')({detail:{view:'combat'}});
 navigate();assert.equal(s.frames.size,0);s.reducedQuery.matches=false;s.classes.add('motion-off');navigate();assert.equal(s.frames.size,0);
 s.classes.delete('motion-off');s.document.hidden=true;navigate();assert.equal(s.frames.size,0);
 s.document.hidden=false;navigate();s.flush();assert.equal(s.classes.has('ui-view-flash'),true);s.reducedQuery.matches=true;s.reducedQuery.change();assert.equal(s.classes.has('ui-view-flash'),false);assert.equal(s.timers.size,0);
});
