import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';
import {LUNAR_TIMELINE,lunarAudioPhase} from '../legendaryTimeline.js';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('six full seconds of bells, then continuous fade, then song',()=>{
 assert.equal(LUNAR_TIMELINE.bellHoldMs,6000);
 assert.equal(LUNAR_TIMELINE.bellFadeMs,1500);
 const fadeEnd=LUNAR_TIMELINE.bellHoldMs+LUNAR_TIMELINE.bellFadeMs;
 assert.equal(fadeEnd,7500);
 assert.equal(LUNAR_TIMELINE.songStartMs,7680);
 assert.ok(LUNAR_TIMELINE.songStartMs>fadeEnd);
 assert.equal(lunarAudioPhase(5999).bellGain,1);
 assert.equal(lunarAudioPhase(6000).phase,'bell-fading');
 assert.ok(lunarAudioPhase(6750).bellGain>0);
 assert.ok(lunarAudioPhase(6750).bellGain<1);
 assert.equal(lunarAudioPhase(fadeEnd).bellGain,0);
 assert.equal(lunarAudioPhase(LUNAR_TIMELINE.songStartMs).phase,'song');
 const p=new URL('../assets/legendary/jeanette/lunar-bell-intro-v37-5.mp3',import.meta.url);
 assert.ok(statSync(p).size>120000,'the longer pre-faded bell MP3 is included');
});

test('YouTube player provides a hard playback hold against TV sync and auto repeat',()=>{
 const music=file('musicPlayer.js');
 assert.match(music,/function suspendForLegendary\(/);
 assert.match(music,/function resumeFromLegendary\(/);
 assert.match(music,/if \(legendarySuspension\) \{\s*\/\/ A sync or autoplay callback/);
 assert.match(music,/if \(legendarySuspension\) \{\s*\/\/ Keep the latest cue/);
 assert.match(music,/if \(legendarySuspension\) break/);
 assert.match(music,/suspendForLegendary,\s*resumeFromLegendary/);
});

test('YouTube was playing: suspend only once, resume from the saved track position',()=>{
 const src=file('musicPlayer.js');
 const methods=src.slice(src.indexOf('function suspendForLegendary()'),src.indexOf('function exposeMusicApi()'));
 const logs=[];
 const window={YT:{PlayerState:{PLAYING:1}}};
 const player={pauseVideo:()=>logs.push('pause'),getCurrentTime:()=>42.25,getPlayerState:()=>1,
   seekTo:(pos)=>logs.push(['seek',pos])};
 const env={window,player,playerReady:true,pendingSessionAudio:null,selectedTrack:{id:'trackA'},
   tracks:new Map(),isPlaying:true,requestedPlay:false,clearTimeout:()=>{},
   duckRestoreTimer:0,musicStatus:()=>{},legendarySuspension:null,
   startPlayback:()=>logs.push('start'),setVolume:()=>{},selectTrack:()=>{}};
 const code=`let {player,playerReady,pendingSessionAudio,selectedTrack,tracks,isPlaying,requestedPlay,duckRestoreTimer,legendarySuspension}=env;
 const {window,clearTimeout,musicStatus,startPlayback,setVolume,selectTrack}=env;\n${methods}\nconst api={suspendForLegendary,resumeFromLegendary,getHold:()=>legendarySuspension};api;`;
 const api=vm.runInNewContext(code,{env});
 api.suspendForLegendary();api.suspendForLegendary();
 assert.deepEqual(logs,['pause']);
 assert.equal(api.getHold().position,42.25);
 api.resumeFromLegendary();
 assert.deepEqual(logs,['pause',['seek',42.25],'start']);
});

test('YouTube was already stopped: do not autoplay when the Legendary Action ends',()=>{
 const src=file('musicPlayer.js');
 const methods=src.slice(src.indexOf('function suspendForLegendary()'),src.indexOf('function exposeMusicApi()'));
 const logs=[];
 const env={window:{YT:{PlayerState:{PLAYING:1}}},player:{pauseVideo:()=>logs.push('pause'),getCurrentTime:()=>10,getPlayerState:()=>2},
   playerReady:true,pendingSessionAudio:null,selectedTrack:{id:'trackA'},tracks:new Map(),isPlaying:false,requestedPlay:false,clearTimeout:()=>{},
   duckRestoreTimer:0,musicStatus:()=>{},legendarySuspension:null,startPlayback:()=>logs.push('start'),setVolume:()=>{},selectTrack:()=>{}};
 const code=`let {player,playerReady,pendingSessionAudio,selectedTrack,tracks,isPlaying,requestedPlay,duckRestoreTimer,legendarySuspension}=env;
 const {window,clearTimeout,musicStatus,startPlayback,setVolume,selectTrack}=env;\n${methods}\n({suspendForLegendary,resumeFromLegendary});`;
 const api=vm.runInNewContext(code,{env});
 api.suspendForLegendary();api.resumeFromLegendary();
 assert.ok(!logs.includes('start'));
});
