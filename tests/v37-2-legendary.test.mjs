import assert from 'node:assert/strict';
import { normalizeSessionState } from '../sessionCore.js';

const blank = normalizeSessionState({});
assert.equal(blank.legendary.active, false);
assert.equal(blank.legendary.serial, 0);
assert.equal(blank.legendary.actionKey, '');

const live = normalizeSessionState({
  legendary: {
    active: true,
    serial: 3,
    actionKey: 'jeanette-lunar-eclipse',
    characterId: 'Jeanette',
    title: 'LUNAR ECLIPSE',
    body: 'Magic falls silent.',
    visualKey: 'lunar-eclipse',
    issuedAtMs: 12345
  }
});
assert.equal(live.legendary.active, true);
assert.equal(live.legendary.serial, 3);
assert.equal(live.legendary.actionKey, 'jeanette-lunar-eclipse');
assert.equal(live.legendary.characterId, 'Jeanette');
assert.equal(live.legendary.visualKey, 'lunar-eclipse');
