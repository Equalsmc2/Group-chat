import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read = filename => readFileSync(new URL('../'+filename,import.meta.url),'utf8');

test('V40.9 loads the last override and uses a deployable installer marker',()=>{
 const html=read('index.html');
 const refs=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"<>]+)"\s*>/g)].map(m=>m[1]);
 assert.equal(refs.length,7);
 assert.equal(refs.at(-1),'asya-deadair-v40-9.css?v=40.10');
 assert.match(html,/SS \/ V40\.10/);
 assert.match(html,/legendaryActions\.js\?v=40\.10/);
 const installer=readFileSync(new URL('../../INSTALL_FULL_WEBSITE.bat',import.meta.url),'utf8');
 assert.match(installer,/findstr \/C:"SS \/ V40\.10"/);
});

test('Quick glitch cleans itself at exactly 500ms, does not replay on a repeated sync update, and does not mutate the delivery TTL',()=>{
 const source=read('legendaryActions.js');
 const start=source.indexOf('function clearAsyaGlitchPair(');
 const ensure=source.indexOf('function ensureAsyaGlitchLayer()',start);
 const activate=source.indexOf('function activateAsyaGlitchPair(',ensure);
 const end=source.indexOf('function $(id)',activate);
 assert.ok(start>=0 && ensure>start && activate>ensure && end>activate);
 // Run the actual two production functions in a deterministic DOM/timer mock.
 const script=source.slice(start,ensure)+'\n'+source.slice(activate,end);
 let timeoutId=0; const timers=new Map(), classes=new Set(), dataset={};
 const body={dataset,offsetWidth:1200,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)}};
 let blocks=0;
 const ctx={
   state:{asyaBurstToken:'',asyaBurstStopTimer:0},
   document:{body},
   setTimeout:(callback,delay)=>{const id=++timeoutId;timers.set(id,{callback,delay});return id;},
   clearTimeout:id=>timers.delete(id),
   getAsyaGlitchPair:()=>({structural:'flip',signal:'pixel',seed:123}),
   ensureAsyaGlitchLayer:()=>({}),
   populateAsyaGlitchBlocks:()=>{blocks++}
 };
 vm.runInNewContext(script+'\nthis.activate=activateAsyaGlitchPair;this.clear=clearAsyaGlitchPair;',ctx);
 const first={id:'t1',issuedAtMs:10000,serial:15};
 ctx.activate(first);
 assert.ok(classes.has('legendary-signal-burst'));
 assert.equal(timers.size,1);
 assert.equal([...timers.values()][0].delay,500);
 assert.equal(blocks,1);
 ctx.activate(first);
 assert.equal(timers.size,1,'duplicate Firebase snapshot should not schedule another animation');
 const {callback}=[...timers.values()][0];callback();
 assert.ok(!classes.has('legendary-signal-burst'));
 assert.equal(Object.keys(dataset).length,0);
 assert.equal(timers.size,0);
 assert.equal(ctx.state.asyaBurstToken,'t1|10000|15','hold token through network TTL');
 ctx.activate(first);
 assert.ok(!classes.has('legendary-signal-burst'),'no afterglow or replay during remaining 1.8s TTL');
 assert.equal(timers.size,0);
 assert.equal(blocks,1);
 ctx.activate({id:'t2',issuedAtMs:12200,serial:17});
 assert.ok(classes.has('legendary-signal-burst'),'a new trigger still runs');
 assert.equal(blocks,2);
 ctx.clear();
 assert.ok(!classes.has('legendary-signal-burst'));
 assert.equal(ctx.state.asyaBurstToken,'');
 assert.match(source,/momentaryDurationMs: 1800/,'shared delivery TTL remains longer');
 assert.match(source,/visualDurationMs: 500/,'short visual is still half a second');
});

test('No post-glitch dim/pulse and no named cinematic leak in the last CSS layer',()=>{
 const css=read('asya-deadair-v40-9.css');
 assert.match(css,/transition:none!important/);
 assert.match(css,/body:not\(\.legendary-signal-burst\) #asyaGlitchFx/);
 assert.match(css,/#legendaryCinematic\[data-legendary-action="asya-channel-o-short"\]/);
 assert.doesNotMatch(css,/brightness\(\.\d+\)/);
});
