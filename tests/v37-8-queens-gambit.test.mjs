import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test("Queen's Gambit is registered for Alexandria while Jeanette remains intact", () => {
  const js = file('legendaryActions.js');
  assert.match(js, /'alexandria-queens-gambit'/);
  assert.match(js, /Alexandria: 'alexandria-queens-gambit'/);
  assert.match(js, /Jeanette: 'jeanette-lunar-eclipse'/);
  assert.match(js, /themeAudio: 'assets\/legendary\/alexandria\/alexandria-theme-a-dramatic-irony\.mp3'/);
  assert.match(js, /dmLegendaryAlexandria/);
  assert.match(js, /legendary-queen-active/);
});

test('the Queen cinematic uses supplied artwork, has no mandatory portrait, and ends in a decoy marker', () => {
  const js = file('legendaryActions.js');
  const css = file('legendaryQueens-v37-8.css');
  const html = file('index.html');
  assert.ok(html.indexOf('legendaryEclipse-v37-7.css') < html.indexOf('legendaryQueens-v37-8.css'));
  assert.match(html, /legendaryActions\.js\?v=(37\.8|38\.0|38\.2|38\.3|38\.4|38\.5)/);
  assert.match(js, /legendary-queen-scene/);
  assert.match(js, /DECOY ACTIVE/);
  assert.match(css, /@keyframes queenSacrifice/);
  assert.match(css, /@keyframes queenStatusAppear/);
  assert.match(css, /queen-intro-offset/);
});

test("Supplied Queen's Gambit SFX and image assets exist in the package", () => {
  const names = ['white-queen.png', 'alexandria-emblem.png', 'red-torn-cloth.png', 'brambles.png', 'chessboard.jpg', 'palace-column.png', 'heartbeat.mp3', 'body-drop.mp3', 'chess-knock.mp3', 'reveal-strike.mp3'];
  for (const name of names) assert.ok(statSync(new URL('../assets/legendary/alexandria/' + name, import.meta.url)).size > 1000, name);
  const js = file('legendaryActions.js');
  for (const name of ['heartbeat.mp3','body-drop.mp3','chess-knock.mp3','reveal-strike.mp3']) assert.match(js, new RegExp(name.replace('.', '\\.')));
  assert.match(js, /if \(meta\.actionKey === 'alexandria-queens-gambit'\) return startQueenAudio/);
});
