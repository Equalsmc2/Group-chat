import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('only the three user supplied skip clips are selectable, with exactly three derived short clips',()=>{
 const js=read('legendaryActions.js');
 for(const name of ['king-crimson','tv-static','king-crimson-cut']) {
  assert.match(js,new RegExp('asya-skip-'+name+'-v4010\\.mp3'));
  assert.match(js,new RegExp('asya-skip-'+name+'-short-v4010\\.mp3'));
  assert.ok(existsSync(new URL('../assets/legendary/asya/asya-skip-'+name+'-v4010.mp3',import.meta.url)));
  assert.ok(existsSync(new URL('../assets/legendary/asya/asya-skip-'+name+'-short-v4010.mp3',import.meta.url)));
 }
 const full=js.split('const ASYA_FULL_SOUND_VARIANTS = [')[1].split('];')[0];
 const short=js.split('const ASYA_SHORT_SOUND_VARIANTS = [')[1].split('];')[0];
 assert.equal((full.match(/url:/g)||[]).length,3);
 assert.equal((short.match(/url:/g)||[]).length,3);
 assert.doesNotMatch(full+short,/v407|signal-chirp|static-burst|time-skip-v40-[45]/);
});
test('duplicate session snapshots cannot restart the same Asya time skip audio',()=>{
 const js=read('legendaryActions.js');
 assert.match(js,/function claimOneAsyaSkipSound\(/);
 assert.match(js,/function startAsyaAudio\([\s\S]*?if \(!claimOneAsyaSkipSound\(meta, legendaryState\)\) return;[\s\S]*?stopAllLegendaryAudio/);
 assert.match(js,/function startAsyaShortAudio\([\s\S]*?if \(!claimOneAsyaSkipSound\(meta, legendaryState\)\) return;[\s\S]*?stopAllLegendaryAudio/);
 const block=js.substring(js.indexOf('const ASYA_AUDIO_CLAIM_KEY ='),js.indexOf('const ASYA_GLITCH_VARIANTS ='));
 const ctx={localStorage:{data:{},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=v}},Date,Set,Number,String,JSON};
 vm.runInNewContext(block+'\n globalThis.claim=claimOneAsyaSkipSound;',ctx);
 const meta={actionKey:'asya-channel-o-short'};
 assert.equal(ctx.claim(meta,{id:'event-A',issuedAtMs:100}),true);
 assert.equal(ctx.claim(meta,{id:'event-A',issuedAtMs:100}),false);
 assert.equal(ctx.claim(meta,{id:'event-B',issuedAtMs:200}),true);
});
test('V40.10 deployment stamp and audio test page use the new three-only pool',()=>{
 const html=read('index.html'),testPage=read('TEST_ASYA_AUDIO.html');
 assert.match(html,/SS \/ V40\.10/);
 assert.match(html,/legendaryActions\.js\?v=40\.10/);
 assert.match(testPage,/const clips=\[/);
 assert.doesNotMatch(testPage,/v407|v40-5\.mp3/);
});
test('the same activation only claims audio once across simulated tabs using shared origin storage',()=>{
 const source=read('legendaryActions.js');
 const block=source.substring(source.indexOf('const ASYA_AUDIO_CLAIM_KEY ='),source.indexOf('const ASYA_GLITCH_VARIANTS ='));
 const store={};
 const makeStorage=()=>({getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}});
 const newTab=()=>{
   const ctx={localStorage:makeStorage(),Date,Set,Number,String,JSON};
   vm.runInNewContext(block+'\nglobalThis.claim=claimOneAsyaSkipSound;',ctx);
   return ctx;
 };
 const tab1=newTab(),tab2=newTab();
 const meta={actionKey:'asya-channel-o-short'};
 const cue={id:'firebase-action-77',issuedAtMs:500,serial:77};
 assert.equal(tab1.claim(meta,cue),true);
 assert.equal(tab2.claim(meta,cue),false,'same browser origin must not double-play in two tabs');
 assert.equal(tab2.claim(meta,{id:'firebase-action-78',issuedAtMs:900,serial:79}),true,'a new action can still play');
});
