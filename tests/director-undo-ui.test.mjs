import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('offscreen combat undo follows history and permissions without changing game state',()=>{
 const source=readFileSync(new URL('../experience.js',import.meta.url),'utf8');
 const start=source.indexOf(' const syncUndoControls=');
 const end=source.indexOf(" window.addEventListener('soulseekers:combatstate',e=>syncUndoControls",start);
 const buttons=Object.fromEntries(['combatUndo','dmCombatUndo','dmQuickUndo'].map(id=>[id,{disabled:true}]));
 let authorized=true;
 const ctx={$:id=>buttons[id],window:{SoulSeekerCombat:{isDM:()=>authorized}}};
 vm.runInNewContext(source.slice(start,end)+'\nglobalThis.sync=syncUndoControls;',ctx);
 const state={encounter:{history:[{label:'damage'}]}};
 ctx.sync(state);assert(Object.values(buttons).every(b=>!b.disabled));
 authorized=false;ctx.sync(state);assert(Object.values(buttons).every(b=>b.disabled));
 authorized=true;ctx.sync({encounter:{history:[]}});assert(Object.values(buttons).every(b=>b.disabled));
 assert.equal(state.encounter.history.length,1);
});
