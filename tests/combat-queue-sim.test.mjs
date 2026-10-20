import assert from 'node:assert/strict';

// Pure simulation of the v29 combat writer's latest-snapshot-wins contract.
// Firebase itself is not imported here; this validates the queue semantics that
// keep offline/local DM edits from being erased or duplicated on reconnect.
class QueueModel {
  constructor(write) {
    this.pending = null;
    this.version = 0;
    this.writer = null;
    this.online = true;
    this.dm = true;
    this.write = write;
  }
  edit(snapshot) {
    this.pending = structuredClone(snapshot);
    this.version++;
    return this.flush();
  }
  flush() {
    if (this.writer) return this.writer;
    if (!this.pending || !this.online || !this.dm) return Promise.resolve(false);
    let lastAttempted = 0;
    this.writer = (async () => {
      let wrote = false;
      while (this.pending && this.online && this.dm) {
        const snapshot = structuredClone(this.pending);
        const version = this.version;
        lastAttempted = version;
        const ok = await this.write(snapshot, version);
        if (!ok) break;
        wrote = true;
        if (version === this.version) {
          this.pending = null;
          break;
        }
      }
      return wrote && !this.pending;
    })().finally(() => {
      this.writer = null;
      if (this.pending && this.online && this.dm && this.version > lastAttempted) {
        queueMicrotask(() => void this.flush());
      }
    });
    return this.writer;
  }
}

// Offline edits coalesce to the newest state and publish once after reconnect.
{
  const writes = [];
  const q = new QueueModel(async (snapshot) => { writes.push(snapshot.hp); return true; });
  q.online = false;
  await q.edit({ hp: 30 });
  await q.edit({ hp: 18 });
  assert.equal(writes.length, 0);
  assert.equal(q.pending.hp, 18);
  q.online = true;
  await q.flush();
  assert.deepEqual(writes, [18]);
  assert.equal(q.pending, null);
}

// An edit arriving while a write is in flight causes one latest-state follow-up,
// and an older acknowledgement never clears the newer pending edit.
{
  const writes = [];
  let releaseFirst;
  const firstGate = new Promise(resolve => { releaseFirst = resolve; });
  const q = new QueueModel(async (snapshot) => {
    writes.push(snapshot.hp);
    if (writes.length === 1) await firstGate;
    return true;
  });
  const first = q.edit({ hp: 40 });
  await Promise.resolve();
  void q.edit({ hp: 11 });
  releaseFirst();
  await first;
  await new Promise(resolve => setTimeout(resolve, 0));
  if (q.writer) await q.writer;
  assert.deepEqual(writes, [40, 11]);
  assert.equal(q.pending, null);
}

// A failed write stays queued without an automatic retry storm; a new edit is
// allowed to trigger a fresh attempt.
{
  let attempts = 0;
  const q = new QueueModel(async () => { attempts++; return attempts > 1; });
  await q.edit({ hp: 9 });
  assert.equal(attempts, 1);
  assert.equal(q.pending.hp, 9);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(attempts, 1);
  await q.edit({ hp: 8 });
  assert.equal(attempts, 2);
  assert.equal(q.pending, null);
}

console.log('combat queue simulation tests passed');
