import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read = file => readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('release manifest lists only retired files, and active stylesheets and images resolve',()=>{
  const manifest=JSON.parse(read('CLEANUP_MANIFEST.json'));
  const html=read('index.html');
  for(const old of [...manifest.retired_css,...manifest.retired_assets]){
    assert.match(old,/^[a-z0-9_./-]+$/i);
    assert.ok(!old.includes('..'));
    assert.ok(!existsSync(new URL('../'+old,import.meta.url)), 'obsolete file is gone: '+old);
  }
  for(const name of [...manifest.converted_images])assert.ok(existsSync(new URL('../'+name,import.meta.url)));
  assert.match(read('backgroundLibrary.js'),/night-bus\.webp/);
  assert.match(read('presentation-v40.css'),/queens-gambit-vines-fullscreen\.webp/);
  assert.equal((html.match(/rel="stylesheet"/g)||[]).length,8);
});

test('repeated identical scene snapshots do not reapply full CSS or broadcast another event',()=>{
  const source=read('sceneDirector.js');
  const chunk=source.slice(source.indexOf('function accept('),source.indexOf('async function commit('));
  const calls={css:0,events:0};
  const state={backgrounds:{terminal:'town',combat:'fall3',stage:'winter',dm:'skyline'},serial:0,weather:'',timeOfDay:''};
  const sandbox={calls,state,JSON,SCENES:['terminal','combat','stage','dm'],
    localStorage:{setItem(){}},channel:null,storageKey:'test',
    CustomEvent:class{constructor(type,args){this.type=type;this.detail=args.detail;}},
    window:{dispatchEvent(){calls.events++;}},
    normalize:value=>structuredClone(value),
    setSceneCss:()=>{calls.css++},publicState:()=>structuredClone(state)
  };
  vm.runInNewContext(`let current=state,cssInitialized=false;${chunk}\naccept({...state});accept({...state});`,sandbox);
  assert.equal(calls.css,1,'only the initial CSS application');
  assert.equal(calls.events,0,'no change notification for identical state');
});
