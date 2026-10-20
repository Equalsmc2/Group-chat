import assert from 'node:assert/strict';
import { normalizeSessionState, shouldPresentOverlay, rememberEvent, safeScene } from '../sessionCore.js';

assert.equal(safeScene('combat'), 'combat');
assert.equal(safeScene('dm'), 'terminal');

const s = normalizeSessionState({ broadcast: { scene: 'stage', serial: 7 }, audio: { volume: 999 }, sfx: { volume: 999, cue: 'critical-burst', serial: 4 } });
assert.equal(s.broadcast.scene, 'stage');
assert.equal(s.broadcast.serial, 7);
assert.equal(s.audio.volume, 100);
assert.equal(s.sfx.volume, 100);
assert.equal(s.sfx.cue, 'critical-burst');
assert.equal(s.sfx.serial, 4);

const seen = new Set();
const now = 100000;
const overlay = { id: 'evt-1', active: true, issuedAtMs: now, durationMs: 3000 };
assert.equal(shouldPresentOverlay(overlay, seen, now + 100), true);
rememberEvent(seen, 'evt-1');
assert.equal(shouldPresentOverlay(overlay, seen, now + 200), false, 'same event must not replay');
assert.equal(shouldPresentOverlay({ ...overlay, id: 'evt-2' }, seen, now + 200), true, 'new event plays');
assert.equal(shouldPresentOverlay({ ...overlay, id: 'evt-old', issuedAtMs: now - 10000 }, seen, now), false, 'stale reconnect event is ignored');

for (let i = 0; i < 100; i++) rememberEvent(seen, `x-${i}`, 64);
assert.ok(seen.size <= 64, 'event dedupe memory is bounded');
console.log('session-core tests passed');
