import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const f = n => readFileSync(new URL(`../${n}`, import.meta.url), 'utf8');
test('DM writes update only changed state branches; no stale Legendary overwrite', () => {
 const director=f('sessionDirector.js');
 assert.match(director, /await setDoc\(STATE_REF, \{ \.\.\.patch, updatedAt:/);
 assert.doesNotMatch(director, /await setDoc\(STATE_REF, \{ \.\.\.merged, updatedAt:/);
});
test('phone relay claims each request atomically to avoid accidental off toggles',()=>{
 const source=f('legendaryActions.js');
 assert.match(source,/await runTransaction\(db, async tx =>/);
 assert.match(source,/if \(!current\.exists\(\) \|\| current\.data\(\)\?\.processed\) return false/);
 assert.match(source,/tx\.update\(requestRef, \{ processed:true/);
 assert.match(source,/if \(!claimed\) return/);
 assert.match(f('firebaseTransport.js'),/runTransaction/);
});
test('only the short Asya flash auto-clears; full actions wait for an explicit stop',()=>{
 const source=f('legendaryActions.js');
 assert.match(source,/momentaryDurationMs: 850/);
 assert.match(source,/if \(!legendaryState\?\.active \|\| !meta\?\.momentaryDurationMs\) return/);
 assert.match(source,/clearLegendary\?\.\(\)/);
});
