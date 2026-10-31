import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=(name)=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('Quick Combat is the sixth DM workspace placed after Encounter',()=>{
 const html=read('index.html'); const composer=read('experience.js');
 for(const id of ['dmQuickCombatPanel','dmQuickRoster','dmQuickDamageCustom','dmQuickHealCustom','dmQuickConditions','dmQuickUndo','dmQuickSaveHp','dmQuickSetTemp'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(composer,/panels\.length===6/);
 assert.match(composer,/names\.splice\(2,0,'Quick combat'\)/);
 assert.match(html,/quick-combat-v40-15\.css\?v=40\.15/);
 assert.match(html,/quickCombat\.js\?v=40\.15/);
 assert.match(read('desktopApps.js'),/combat\.js\?v=40\.1&fx=40\.14&qc=40\.15/);
});

test('Quick Combat uses the shared authorized mutation path, not separate Firebase documents',async()=>{
 const script=read('combat.js');
 const begin=script.indexOf('async function quickUpdate('),end=script.indexOf('window.SoulSeekerCombat={',begin);
 assert(begin>0 && end>begin);
 const player={currentHp:30,maxHp:50,tempHp:8,statuses:[],concentration:'',deathSuccess:0,deathFailure:0};
 const combatState={players:{Asya:player}};
 let isDm=true,mutations=0;
 const ctx={combatState,CHARACTERS:[{id:'Asya'}],STATUS_OPTIONS:['Poisoned','Prone'],observer:()=>isDm,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),Date,Number,Math};
 ctx.mutate=async(label,fn)=>{mutations++;fn();};
 vm.runInNewContext(script.slice(begin,end)+'\nglobalThis.applyQuick=quickUpdate;',ctx);
 const act=(operation,value,status)=>ctx.applyQuick({characterId:'Asya',operation,value,status});
 assert.equal(await act('damage',10),true); assert.equal(player.tempHp,0);assert.equal(player.currentHp,28);
 assert.equal(await act('heal',60),true);assert.equal(player.currentHp,50);
 assert.equal(await act('setHpPair',{hp:44,max:45}),true);assert.equal(player.maxHp,45);assert.equal(player.currentHp,44);
 assert.equal(await act('status',undefined,'Poisoned'),true);assert.deepEqual([...player.statuses],['Poisoned']);
 assert.equal(await act('status',undefined,'Poisoned'),true);assert.deepEqual([...player.statuses],[]);
 assert.equal(await act('success',3),true);assert.equal(player.deathSuccess,3);
 assert.equal(await act('concentration','Detect thoughts'),true);assert.equal(player.concentration,'Detect thoughts');
 assert.equal(mutations,7);
 assert.equal(await act('status',undefined,'Invalid'),false);
 assert.equal(await act('damage',-4),false);
 assert.equal(await act('setHpPair',{hp:'oops',max:22}),false);
 isDm=false;
 assert.equal(await act('damage',1),false);
 assert.equal(mutations,7);
});

test('DM-only quick editor reflects state updates even when Combat page is not open',()=>{
 const source=read('combat.js');
 assert.match(source,/storeLocalState\(\);if\(isCombatActive\(\)\)renderCombat\(\);else notifyCombatState\(\)/);
 assert.match(source,/if\(isCombatActive\(\)\)renderCombat\(\);else notifyCombatState\(\);\n    remoteChangedIds\.clear\(\)/);
 assert.match(read('quickCombat.js'),/window\.addEventListener\('soulseekers:combatstate'/);
 assert.match(source,/if\(!observer\(\)\)return false;/);
});
