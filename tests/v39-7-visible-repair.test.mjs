import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASYA_QUOTE, displayedAsyaText } from '../storyCopy.js';
const get = (f) => readFileSync(new URL(`../${f}`,import.meta.url),'utf8');

test('replaces only old Asya placeholder text on already-saved scenes', () => {
  assert.match(ASYA_QUOTE,/From which stars have we fallen/);
  for (const old of ['print("HelloWorld")', 'Print("Hello World")', "print('hello world');"])
    assert.equal(displayedAsyaText(old, 'Asya'), ASYA_QUOTE);
  assert.equal(displayedAsyaText('print("HelloWorld")','Max'),'print("HelloWorld")');
  assert.equal(displayedAsyaText('A new custom quote','Asya'),'A new custom quote');
});

test('stage and live DM overlay render Asya legacy copy without altering Firestore state',()=>{
  assert.match(get('stage.js'),/displayedAsyaText\(stageState.body, stageState.characterId\)/);
  assert.match(get('sessionDirector.js'),/displayedAsyaText\(item.body \|\| '', item.characterId\)/);
  assert.match(get('combat.js'),/quote:ASYA_QUOTE/);
  assert.match(get('experience.js'),/body:ASYA_QUOTE/);
});

test('full website exposes V39.8 and loads a new, final presentation CSS',()=>{
  const html=get('index.html');const css=get('v39-8-presentation-fixes.css');
  assert.match(html,/SS \/ V39\.9/);
  assert.match(html,/v39-8-presentation-fixes\.css\?v=39\.9/);
  assert.match(html,/desktopApps\.js\?v=39\.7/);
  assert.match(css,/@layer soulseekers35/);
  assert.match(css,/queenSacrificeV398/);
  assert.match(css,/queenSlashV398/);
  assert.match(css,/stage-roman/);
});
