import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {BACKGROUNDS, SCENES} from '../backgroundLibrary.js';
const root=path.resolve(import.meta.dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');

test('all uploaded Boston pictures are in the editable gallery',()=>{
 assert(BACKGROUNDS.length >= 20);
 assert.equal(new Set(BACKGROUNDS.map(b=>b.id)).size,BACKGROUNDS.length);
 for(const b of BACKGROUNDS){assert(fs.existsSync(path.join(root,b.path)));assert(fs.existsSync(path.join(root,b.thumb)));}
 assert.deepEqual(SCENES,['terminal','combat','stage','dm']);
});
test('director has independent public Firestore scene state and trusted writes',()=>{
 const js=read('sceneDirector.js');
 assert.match(js,/doc\(db,'stageState','scenery'\)/);
 assert.match(js,/if\(!hasDMRole\(\)\)/);
 assert.match(js,/onSnapshot\(ref/);
 assert.match(js,/isLocalPreview/);
 assert.match(js,/soulseekers:atmosphere-apply/);
 assert.match(js,/setAllBackgrounds/);
 assert.match(js,/maxImageChars=205000/);
});
test('scene lab is first and existing director workspaces are intact',()=>{
 const html=read('index.html');const experience=read('experience.js');
 for(const id of ['dmBackdropScene','dmBackdropGallery','dmBackdropPreview','dmBackdropApply','dmBackdropApplyAll','dmBackdropFile','dmQuickStageTitle','dmQuickStageLive','dmBackdropStatus'])assert(html.includes(`id="${id}"`));
 assert.match(experience,/\['Scene lab','Encounter','Sound desk','Cue studio','Session'\]/);
 assert.match(read('desktopApps.js'),/sceneDirectorUI\.js\?v=40/);
});
test('celestial light has reserved safe crest and scenery spans TV scenes',()=>{
 const css=read('director-v36-8.css');
 assert.match(css,/\.celestial-safe-crest/);
 assert.match(css,/body\.tv-device \.combat-toolbar/);
 for(const c of ['--ss-stage-background','--ss-terminal-background','--ss-combat-background','--ss-dm-background','--ss-preview-background'])assert(css.includes(c));
});
