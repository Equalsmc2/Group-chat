import assert from 'node:assert/strict';
import { normalizeSessionState, shouldPresentOverlay } from '../sessionCore.js';
assert.equal(normalizeSessionState({audio:{volume:0}}).audio.volume,0);
for(const kind of ['revelation','introduction','illustration','victory','defeat'])assert.equal(normalizeSessionState({overlay:{kind}}).overlay.kind,kind);
const now=10000,base={id:'new',active:true,durationMs:1000};
assert.equal(shouldPresentOverlay({...base,issuedAtMs:0},new Set(),now),false);
assert.equal(shouldPresentOverlay({...base,issuedAtMs:now+20000},new Set(),now),false);
assert.equal(shouldPresentOverlay({...base,issuedAtMs:now},new Set(),now),true);
console.log('V35 zero-volume, cue types, and timestamp regressions passed');
