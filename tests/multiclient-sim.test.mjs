import assert from 'node:assert/strict';
import { normalizeSessionState, shouldPresentOverlay, rememberEvent } from '../sessionCore.js';

class Client {
  constructor(name){ this.name=name; this.seen=new Set(); this.state=normalizeSessionState({}); this.presented=[]; }
  receive(raw, now){
    this.state=normalizeSessionState(raw);
    if(shouldPresentOverlay(this.state.overlay,this.seen,now)){
      this.presented.push(this.state.overlay.id);
      rememberEvent(this.seen,this.state.overlay.id);
    }
  }
}

const dm = new Client('dm');
const tv = new Client('tv');
let shared = normalizeSessionState({});
const t0=1_000_000;

// Authoritative scene broadcast.
shared=normalizeSessionState({...shared,broadcast:{scene:'combat',serial:1,transition:'ink',blackout:false}});
tv.receive(shared,t0);
assert.equal(tv.state.broadcast.scene,'combat');
assert.equal(tv.state.broadcast.serial,1);

// Temporary event appears once.
shared=normalizeSessionState({...shared,overlay:{id:'turn-max-1',active:true,kind:'dialogue',title:'MAX',body:'Just business',durationMs:3000,issuedAtMs:t0}});
tv.receive(shared,t0+10);
tv.receive(shared,t0+20);
assert.deepEqual(tv.presented,['turn-max-1']);

// Rapid distinct event interrupts/dedupes correctly at state level.
shared=normalizeSessionState({...shared,overlay:{id:'turn-asya-2',active:true,kind:'dialogue',title:'ASYA',body:'From which stars have we fallen to meet each other here?',durationMs:3000,issuedAtMs:t0+100}});
tv.receive(shared,t0+110);
assert.deepEqual(tv.presented,['turn-max-1','turn-asya-2']);

// Reconnected client does not replay an expired temporary event.
const reconnectedTv = new Client('tv-reconnected');
reconnectedTv.receive(shared,t0+10_000);
assert.equal(reconnectedTv.presented.length,0);
assert.equal(reconnectedTv.state.broadcast.scene,'combat','persistent scene still restores');

// Blackout and current scene persist independently.
shared=normalizeSessionState({...shared,broadcast:{...shared.broadcast,blackout:true,serial:2}});
tv.receive(shared,t0+10_100);
assert.equal(tv.state.broadcast.blackout,true);
assert.equal(tv.state.broadcast.scene,'combat');

// Audio commands are serial authoritative state, not fire-and-forget guesses.
shared=normalizeSessionState({...shared,audio:{trackId:'tk2eUGISZpk',playing:true,volume:63,serial:4,fadeMs:750}});
tv.receive(shared,t0+10_200);
assert.equal(tv.state.audio.serial,4);
assert.equal(tv.state.audio.volume,63);
assert.equal(tv.state.audio.playing,true);


// Cinematic SFX is also authoritative state. A serial identifies the cue event,
// while volume/enabled remain persistent session settings.
shared=normalizeSessionState({...shared,sfx:{enabled:true,volume:68,serial:3,id:'sfx-3',cue:'spell-impact',eventVolume:.9,issuedAtMs:t0+10_250}});
tv.receive(shared,t0+10_260);
assert.equal(tv.state.sfx.serial,3);
assert.equal(tv.state.sfx.cue,'spell-impact');
assert.equal(tv.state.sfx.volume,68);

// DM receives the same public state model; UI policy decides not to render the
// player presentation overlay on the private director console.
dm.receive(shared,t0+10_200);
assert.equal(dm.state.broadcast.scene,'combat');

console.log('multi-client simulation tests passed');
