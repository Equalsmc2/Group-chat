import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBoss,bossDisplay,BOSS_IMAGE_MAX_CHARS} from '../bossState.js';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');

test('boss is hidden by default and separate from the six player stats',()=>{
 const b=normalizeBoss();
 assert.equal(b.visible,false);
 assert.equal(b.maxHp,100);
 assert.equal(b.currentHp,100);
 assert.equal(b.imageData,'');
 assert.equal('players' in b,false);
});
test('boss health and text are bounded across malformed inputs',()=>{
 const b=normalizeBoss({name:'a'.repeat(100)+'\u0000',maxHp:999999999,currentHp:999999999,visible:'true'});
 assert.equal(b.name.length,60);
 assert.equal(b.maxHp,999999);
 assert.equal(b.currentHp,999999);
 assert.equal(b.visible,false);
 assert.equal(normalizeBoss({maxHp:-15,currentHp:-50}).currentHp,0);
});
test('zero HP is a visible, accessible defeated state',()=>{
 const b=bossDisplay({name:'The Hollow King',maxHp:600,currentHp:0,visible:true});
 assert.equal(b.defeated,true);
 assert.equal(b.ratio,0);
 assert.equal(b.percent,0);
});
test('image data only accepts bounded supported image data URLs',()=>{
 const jpeg='data:image/jpeg;base64,'+Buffer.from('test').toString('base64');
 assert.equal(normalizeBoss({imageData:jpeg}).imageData,jpeg);
 for(const img of ['https://bad.example/x.png','javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','data:image/jpeg;base64,'+'a'.repeat(BOSS_IMAGE_MAX_CHARS)]){
  assert.equal(normalizeBoss({imageData:img}).imageData,'');
 }
});
test('HTML wiring includes boss bar and trusted-DM controls, and sync doc is independent',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'bossEncounter.js'),'utf8');
 for(const id of ['bossBroadcast','bossBroadcastTrack','bossBroadcastFill','dmBossVisible','dmBossName','dmBossCurrentHp','dmBossMaxHp','dmBossImageFile','dmBossSave','dmBossHide'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(js,/doc\(db, 'combatState', 'boss'\)/);
 assert.match(js,/hasDMRole\(\)/);
 assert.match(html,/bossEncounter\.js\?v=40/);
});
