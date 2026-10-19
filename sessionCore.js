export const PLAYER_SCENES = Object.freeze(['terminal', 'combat', 'stage']);
export const TRANSITIONS = Object.freeze(['ink', 'cut', 'fade', 'hard']);

export function safeScene(value) {
  return PLAYER_SCENES.includes(value) ? value : 'terminal';
}
export function safeTransition(value) {
  return TRANSITIONS.includes(value) ? value : 'ink';
}
export function makeEventId(prefix = 'evt') {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}
export function normalizeSessionState(raw = {}) {
  const broadcast = raw.broadcast || {};
  const overlay = raw.overlay || {};
  const audio = raw.audio || {};
  const sfx = raw.sfx || {};
  const legendary = raw.legendary || {};
  return {
    schema: 1,
    broadcast: {
      scene: safeScene(broadcast.scene),
      serial: Math.max(0, Number(broadcast.serial) || 0),
      transition: safeTransition(broadcast.transition),
      blackout: Boolean(broadcast.blackout)
    },
    overlay: {
      id: typeof overlay.id === 'string' ? overlay.id : '',
      active: Boolean(overlay.active),
      kind: ['chapter','dialogue','boss','location','announcement','critical','victory','defeat','revelation','introduction','illustration'].includes(overlay.kind) ? overlay.kind : 'announcement',
      title: String(overlay.title || '').slice(0, 160),
      body: String(overlay.body || '').slice(0, 600),
      characterId: String(overlay.characterId || '').slice(0, 40),
      imageUrl: String(overlay.imageUrl || '').slice(0, 1200),
      durationMs: Math.max(800, Math.min(20000, Number(overlay.durationMs) || 4200)),
      issuedAtMs: Math.max(0, Number(overlay.issuedAtMs) || 0)
    },
    audio: {
      trackId: String(audio.trackId || '').slice(0, 120),
      playing: Boolean(audio.playing),
      volume: Math.max(0, Math.min(100, Number.isFinite(Number(audio.volume)) ? Number(audio.volume) : 70)),
      serial: Math.max(0, Number(audio.serial) || 0),
      fadeMs: Math.max(0, Math.min(15000, Number(audio.fadeMs) || 0))
    },
    sfx: {
      enabled: sfx.enabled !== false,
      volume: Math.max(0, Math.min(100, Number.isFinite(Number(sfx.volume)) ? Number(sfx.volume) : 72)),
      serial: Math.max(0, Number(sfx.serial) || 0),
      id: String(sfx.id || '').slice(0, 120),
      cue: String(sfx.cue || '').slice(0, 64),
      eventVolume: Math.max(0, Math.min(1.25, Number.isFinite(Number(sfx.eventVolume)) ? Number(sfx.eventVolume) : 1)),
      issuedAtMs: Math.max(0, Number(sfx.issuedAtMs) || 0)
    },
    legendary: {
      id: String(legendary.id || '').slice(0, 120),
      active: Boolean(legendary.active),
      serial: Math.max(0, Number(legendary.serial) || 0),
      actionKey: String(legendary.actionKey || '').slice(0, 80),
      characterId: String(legendary.characterId || '').slice(0, 40),
      title: String(legendary.title || '').slice(0, 160),
      body: String(legendary.body || '').slice(0, 600),
      visualKey: String(legendary.visualKey || '').slice(0, 80),
      issuedAtMs: Math.max(0, Number(legendary.issuedAtMs) || 0)
    }
  };
}
export function eventIsFresh(overlay, now = Date.now()) {
  if (!overlay?.active || !overlay.id) return false;
  if (!overlay.issuedAtMs || overlay.issuedAtMs > now + 1500) return false;
  return now <= overlay.issuedAtMs + overlay.durationMs + 1500;
}
export function shouldPresentOverlay(overlay, seenIds, now = Date.now()) {
  if (!eventIsFresh(overlay, now)) return false;
  return !seenIds.has(overlay.id);
}
export function rememberEvent(seenIds, id, max = 64) {
  if (!id) return seenIds;
  seenIds.add(id);
  while (seenIds.size > max) {
    const first = seenIds.values().next().value;
    seenIds.delete(first);
  }
  return seenIds;
}
