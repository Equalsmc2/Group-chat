import assert from 'node:assert/strict';

const FRESH_MS = 6500;
function fresh(event, now){ return event.issuedAtMs > 0 && now-event.issuedAtMs <= FRESH_MS; }
class TvCombatClient {
  constructor(){ this.scene='terminal'; this.lastSerial=0; this.presented=[]; }
  receive(event, now){
    if(event.serial<=this.lastSerial) return;
    if(!fresh(event,now)){ this.lastSerial=event.serial; return; }
    // A fresh turn remains pending while the TV is on another broadcast scene.
    if(this.scene!=='combat') return;
    this.lastSerial=event.serial; this.presented.push(event.id);
  }
}
const tv=new TvCombatClient();
const t=10_000;
const event={serial:1,id:'turn-asya',issuedAtMs:t};
tv.receive(event,t+100);
assert.deepEqual(tv.presented,[]);
tv.scene='combat';
tv.receive(event,t+350);
assert.deepEqual(tv.presented,['turn-asya']);
tv.receive(event,t+500);
assert.deepEqual(tv.presented,['turn-asya'],'same event dedupes');

const stale={serial:2,id:'turn-max-old',issuedAtMs:t};
const reconnect=new TvCombatClient();reconnect.scene='combat';reconnect.receive(stale,t+9000);
assert.deepEqual(reconnect.presented,[],'stale reconnect turn does not replay');
assert.equal(reconnect.lastSerial,2,'stale serial is consumed');

const rapid={serial:2,id:'turn-max-new',issuedAtMs:t+1000};
tv.receive(rapid,t+1200);
assert.deepEqual(tv.presented,['turn-asya','turn-max-new']);
console.log('combat turn-event simulation tests passed');
