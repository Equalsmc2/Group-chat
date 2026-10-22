import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('saved combat loads during initialization, before later const declarations',()=>{
 const s=read('combat.js');
 const funcs=s.slice(s.indexOf('function blankCharacter()'),s.indexOf('function storeLocalState()'));
 const clamp=s.match(/const clamp=.*?;/)[0];
 const init='const restored=loadLocalState();';
 const order=s.indexOf('const clamp=')<s.indexOf('combatState=loadPendingState()')?clamp+'\n'+init:init+'\n'+clamp;
 const ctx={localStorage:{getItem:()=>JSON.stringify({players:{Asya:{currentHp:31,maxHp:48,spellSlots:{1:{remaining:2,max:4}}}},encounter:{activeId:'Asya',started:true,round:3}})}};
 vm.runInNewContext("const CHARACTERS=[{id:'Asya'}];const STORAGE_KEY='test';\n"+funcs+'\n'+order+"\nresult=restored;",ctx);
 assert.equal(ctx.result.players.Asya.currentHp,31);
 assert.equal(ctx.result.encounter.round,3);
});
test('only V40 bundle is active, and all original LA timing layers remain ordered',()=>{
 const html=read('index.html'),css=read('presentation-v40.css');
 assert.equal((html.match(/rel="stylesheet"/g)||[]).length,1);
 assert.match(html,/SS \/ V40/);
 let pos=-1;
 for(const name of ['legendaryActions.css','legendaryEntrance-v37-6.css','legendaryEclipse-v37-7.css','legendaryQueens-v37-8.css','legendaryAsya-v38-4.css','v39-9-queen-composition.css']){
  const next=css.indexOf('SOURCE: '+name);assert.ok(next>pos,name);pos=next;
 }
 assert.ok(css.includes('@keyframes queenSacrificeV399'));
});
