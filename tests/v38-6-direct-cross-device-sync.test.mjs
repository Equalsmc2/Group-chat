import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read = name => readFileSync(new URL(`../${name}`, import.meta.url),'utf8');

test('V38.6 normal phone writes authenticated Legendary state directly, not via a DM relay',()=>{
 const director=read('sessionDirector.js');
 const actions=read('legendaryActions.js');
 const rules=read('firestore.rules');
 assert.match(director,/return runTransaction\(db, async tx =>/);
 assert.match(director,/tx\.update\(STATE_REF, \{ legendary:item \}\)/);
 assert.match(director,/async function requestLegendary\(cue = \{\}\) \{[\s\S]*?return toggleLegendary\(cue\)/);
 assert.doesNotMatch(actions,/onSnapshot\(q, async snapshot =>/);
 assert.doesNotMatch(actions,/optimisticHoldMs/);
 assert.match(rules,/validPlayerLegendaryUpdate/);
 assert.match(rules,/affectedKeys\(\)\.hasOnly\(\['legendary'\]\)/);
 assert.match(rules,/next\.serial == current\.get\('serial', 0\) \+ 1/);
 assert.match(read('index.html'),/presentation-v40\.css\?v=40/);
 assert.match(read('desktopApps.js'),/sessionDirector\.js\?v=40/);
 assert.match(actions,/sessionDirector\.js\?v=40/);
});

test('two simulated devices share LA state; it persists until second press; other branches preserved',async()=>{
 const director=read('sessionDirector.js');
 const code=director.slice(director.indexOf('function legendaryPayload('),director.indexOf('async function setAudio('));
 const sessionDoc={broadcast:{scene:'combat',serial:4},audio:{trackId:'prior'},legendary:{active:false,serial:0}};
 let seq=0;
 const ctx={
   isLocalPreview:false,authReady:Promise.resolve(),auth:{currentUser:{uid:'player-1'}},db:{},STATE_REF:{},
   makeEventId:()=>`evt-${++seq}`,
   Date:{now:()=>1750000000000},Math,Number,String,
   normalizeSessionState:s=>({legendary:{active:false,serial:0,...s.legendary}}),
   runTransaction:async(_db,handler)=>handler({
      get:async()=>({exists:()=>true,data:()=>JSON.parse(JSON.stringify(sessionDoc))}),
      update:(_ref,patch)=>Object.assign(sessionDoc,patch),
      set:(_ref,patch)=>Object.assign(sessionDoc,patch)
   })
 };
 const api=vm.runInNewContext(`${code}\n({toggleLegendary,clearLegendary})`,ctx);
 const cue={actionKey:'asya-channel-o-unaired',characterId:'Asya',title:'CHANNEL Ø: UNAIRED',body:'...',visualKey:'channel-o-unaired'};
 await api.toggleLegendary(cue);
 assert.equal(sessionDoc.legendary.active,true);
 assert.equal(sessionDoc.legendary.serial,1);
 assert.equal(sessionDoc.broadcast.scene,'combat');
 assert.equal(sessionDoc.audio.trackId,'prior');
 // Unrelated scene/audio writes cannot terminate the LA.
 sessionDoc.audio.trackId='new-music';
 assert.equal(sessionDoc.legendary.active,true);
 await api.clearLegendary('wrong-event');
 assert.equal(sessionDoc.legendary.active,true,'stale auto-clear cannot end a new LA');
 await api.toggleLegendary(cue);
 assert.equal(sessionDoc.legendary.active,false);
 assert.equal(sessionDoc.legendary.serial,2);
 assert.equal(sessionDoc.audio.trackId,'new-music');
});

test('Asya short clears by event id only, while other full LAs have no timeout',()=>{
 const actions=read('legendaryActions.js');
 assert.match(actions,/momentaryDurationMs: 1800[\s\S]*visualDurationMs: 500/);
 assert.match(actions,/if \(!legendaryState\?\.active \|\| !meta\?\.momentaryDurationMs\) return/);
 assert.match(actions,/clearLegendary\?\.\(legendaryState\.id\)/);
 assert.match(actions,/legendary-persistent-status/);
});
