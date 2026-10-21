require('fs').mkdirSync('qa',{recursive:true});
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve('.'),results=[],errors=[];
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.mp3':'audio/mpeg'})[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end('Not found')}}).listen(8765,'127.0.0.1');
const pass=name=>{results.push(name);console.log('PASS',name)};
(async()=>{
const b=await chromium.launch({headless:true,args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:1440,height:900}});
await c.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1')?r.continue():r.abort());
await c.addInitScript(()=>{
 sessionStorage.setItem('soulSeekersAct3IntroV29','seen');window.__test={players:0,loads:0,paints:0,volume:70,sounds:[]};
 const draw=CanvasRenderingContext2D.prototype.fillRect;CanvasRenderingContext2D.prototype.fillRect=function(...args){if(this.canvas.id==='visualizerCanvas')window.__test.paints++;return draw.apply(this,args)};
 HTMLMediaElement.prototype.play=function(){window.__test.sounds.push(this.src);return Promise.resolve()};HTMLMediaElement.prototype.pause=function(){};
 window.YT={PlayerState:{PLAYING:1,PAUSED:2,ENDED:0,BUFFERING:3,CUED:5},Player:class{
 constructor(id,options){window.__test.players++;this.events=options.events;this.id=options.videoId;queueMicrotask(()=>this.events.onReady({target:this}));}
 cueVideoById(id){this.id=id;window.__test.loads++;}loadVideoById(id){this.id=id;window.__test.loads++;this.playVideo();}
 playVideo(){this.events.onStateChange({data:1,target:this});}pauseVideo(){this.events.onStateChange({data:2,target:this});}
 getCurrentTime(){return performance.now()/1000}getVideoData(){return{title:'QA transport',author:'Test'}}getVolume(){return window.__test.volume}setVolume(v){window.__test.volume=v}getPlayerState(){return 1}
 }};
});
const dm=await c.newPage(),tv=await c.newPage();const base='http://127.0.0.1:8765/index.html?phcodeLivePreview=true';
for(const [p,url] of [[dm,base],[tv,base+'&tv=1']]){p.on('pageerror',e=>errors.push(e.message));await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.SoulSeekerSession&&window.SoulSeekerMusic);}
await dm.bringToFront();await dm.evaluate(()=>window.SoulSeekerMusic.play());await dm.waitForTimeout(250);console.log('MEDIA',await dm.evaluate(()=>({test:window.__test,playing:window.SoulSeekerMusic.isPlaying(),hidden:document.hidden,classes:document.body.className,status:document.querySelector('#musicStatus').textContent,view:document.body.dataset.view})));await dm.waitForFunction(()=>window.__test.paints>100,{}, {timeout:3000});const loads=await dm.evaluate(()=>window.__test.loads);await dm.evaluate(()=>window.SoulSeekerShell.navigate('combat'));await dm.waitForTimeout(150);assert.equal(await dm.evaluate(()=>window.__test.players),1);assert.equal(await dm.evaluate(()=>window.__test.loads),loads);assert(await dm.evaluate(()=>window.SoulSeekerMusic.isPlaying()));pass('Mocked YouTube transport persists without re-cue across Terminal/Combat');
await dm.evaluate(()=>window.SoulSeekerShell.navigate('dm'));await dm.waitForTimeout(100);let count=await dm.evaluate(()=>window.__test.paints);await dm.waitForTimeout(250);assert.equal(await dm.evaluate(()=>window.__test.paints),count);pass('Visualizer stops drawing in DM workspace while playback continues');
await dm.evaluate(()=>window.SoulSeekerShell.navigate('combat'));await dm.waitForTimeout(150);assert(await dm.evaluate(()=>window.__test.paints)>count);await dm.emulateMedia({reducedMotion:'reduce'});await dm.waitForTimeout(100);count=await dm.evaluate(()=>window.__test.paints);await dm.waitForTimeout(200);assert.equal(await dm.evaluate(()=>window.__test.paints),count);pass('Visualizer resumes in Combat and suspends with reduced motion');
await dm.evaluate(()=>{window.SoulSeekerMusic.setVolume(90,300);window.SoulSeekerMusic.setVolume(0,0)});await dm.waitForTimeout(400);assert.equal(await dm.evaluate(()=>window.__test.volume),0);pass('New volume command cancels older fade');
await tv.bringToFront();await tv.evaluate(()=>window.SoulSeekerSession.armTv());await dm.evaluate(()=>window.SoulSeekerSession.setAudio({trackId:'tk2eUGISZpk',volume:35,playing:true}));await tv.waitForFunction(()=>window.SoulSeekerMusic.isPlaying()&&window.__test.volume===35);pass('TV receives track/play/volume through session state (mocked YouTube)');
await dm.evaluate(()=>{window.SoulSeekerSFX.setPreviewEnabled(true);window.__test.sounds=[]});await dm.evaluate(()=>window.SoulSeekerSession.triggerSfx('spell-impact'));await dm.waitForFunction(()=>window.__test.sounds.some(x=>x.includes('spell-impact')));pass('Explicit DM cinematic preview plays locally');
await dm.evaluate(()=>window.SoulSeekerSession.setBlackout(true));await dm.evaluate(()=>window.SoulSeekerSession.restoreState({broadcast:{scene:'stage',blackout:false},audio:{volume:0}}));await tv.waitForFunction(()=>document.body.dataset.view==='stage'&&!document.body.classList.contains('broadcast-blackout'));pass('Director restore uses fresh serials and restores output');
await dm.evaluate(()=>window.SoulSeekerCombat.startCombat());await dm.evaluate(()=>window.SoulSeekerCombat.advanceTurn(1));const serial=await dm.evaluate(()=>window.SoulSeekerCombat.getState().encounter.turnSerial);await dm.evaluate(()=>window.SoulSeekerCombat.undo());assert((await dm.evaluate(()=>window.SoulSeekerCombat.getState().encounter.turnSerial))>serial);await dm.evaluate(()=>window.SoulSeekerCombat.advanceTurn(1));await tv.waitForFunction(n=>window.SoulSeekerCombat.getState().encounter.turnSerial>n,serial+1);pass('Combat undo preserves future turn-event progression');
await tv.evaluate(()=>{const s=window.SoulSeekerSession.getState();s.overlay={id:'stale-qa',active:true,title:'OLD',issuedAtMs:Date.now()-60000,durationMs:1000};window.dispatchEvent(new StorageEvent('storage',{key:'soulSeekersLocalSessionV34',newValue:JSON.stringify(s)}));});assert.equal(await tv.locator('#broadcastOverlay').isVisible(),false);pass('Stale reconnect overlay suppressed');
const assets=await dm.evaluate(async()=>{const response=await fetch('assets/sfx/heal.mp3');const buffer=await response.arrayBuffer();const ctx=new AudioContext();const decoded=await ctx.decodeAudioData(buffer);const duration=decoded.duration;await ctx.close();return duration;});assert(assets>0);pass('Bundled MP3 decodes in Chromium');
assert.deepEqual(errors,[]);fs.writeFileSync('qa/media-results.json',JSON.stringify({results,errors},null,2));await b.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
