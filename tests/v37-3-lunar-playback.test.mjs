import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LUNAR_TIMELINE, lunarAudioPhase } from '../legendaryTimeline.js';

function makeHarness() {
  const source=readFileSync(new URL('../legendaryActions.js', import.meta.url),'utf8');
  const section=source.slice(source.indexOf('const audioPool = new Map();'), source.indexOf('function ensureUi()'));
  let now=0, nextId=1;
  const tasks=new Map(), logs=[];
  class FakeAudio {
    constructor(url) { this.url=url;this.volume=0;this.loop=false;this.currentTime=0;this.readyState=1;this.duration=url.includes('theme')?234:4.2; }
    play(){logs.push({at:now,type:'play',url:this.url});return Promise.resolve();}
    pause(){logs.push({at:now,type:'pause',url:this.url});}
    load(){}
    addEventListener(){}
  }
  const fakeWindow={SoulSeekerSession:{isTv:()=>false},SoulSeekerMusic:{isPlaying:()=>false}};
  const state={audioRun:0,audioTimeouts:new Set(),audioFrame:0,currentAudioKey:'',audioStartedAt:0,musicPausedForLegendary:false};
  const context=vm.createContext({
    Audio:FakeAudio,Date:{now:()=>now},Math,Number,console,
    state,LUNAR_TIMELINE,lunarAudioPhase,
    document:{body:{classList:{contains:()=>false}},getElementById:()=>null},
    window:fakeWindow,
    getEffectiveLegendary:()=>({active:true}),
    setTimeout:(fn,ms)=>{const id=nextId++;tasks.set(id,{due:now+ms,fn});return id;},
    clearTimeout:id=>tasks.delete(id),
    requestAnimationFrame:fn=>{const id=nextId++;tasks.set(id,{due:now+16,fn});return id;},
    cancelAnimationFrame:id=>tasks.delete(id)
  });
  vm.runInContext(section+';globalThis.api={startLegendaryAudio,stopAllLegendaryAudio,getAudio,state};',context);
  const action={stingerAudio:'lunar-bell-intro.mp3',themeAudio:'lunar-theme-placeholder.mp3'};
  const tick=target=>{
    let turns=0;
    while(true){
      const future=[...tasks].filter(([,t])=>t.due<=target).sort((a,b)=>a[1].due-b[1].due);
      if(!future.length)break;
      const [id,task]=future[0];tasks.delete(id);now=task.due;task.fn();
      if(++turns>1000)throw new Error('runaway audio scheduler');
    }
    now=target;
  };
  return {api:context.api,tick,logs,action};
}

test('actual Lunar sound scheduler stops bell before starting theme',()=>{
  const h=makeHarness();
  h.api.startLegendaryAudio(h.action,{issuedAtMs:0});
  h.tick(LUNAR_TIMELINE.bellHoldMs + 100);
  assert.equal(h.logs.filter(x=>x.type==='play'&&x.url.includes('theme')).length,0);
  h.tick(LUNAR_TIMELINE.songStartMs);
  const theme=h.logs.find(x=>x.type==='play'&&x.url.includes('theme'));
  assert.ok(theme, 'theme started after bell fade');
  const bellPause=h.logs.filter(x=>x.type==='pause'&&x.url.includes('bell'));
  assert.ok(bellPause.length>0 && bellPause.at(-1).at<=theme.at);
  assert.equal(h.api.getAudio(h.action.stingerAudio).volume,0);
});

test('second press cancels bell, pending theme timers, and loop playback',()=>{
  const h=makeHarness();
  h.api.startLegendaryAudio(h.action,{issuedAtMs:0});
  h.tick(800);h.api.stopAllLegendaryAudio();h.tick(10000);
  assert.equal(h.logs.filter(x=>x.type==='play'&&x.url.includes('theme')).length,0);
  assert.equal(h.api.state.audioTimeouts.size,0);
});
