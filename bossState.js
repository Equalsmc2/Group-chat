/* Public, versioned boss encounter data. No player/initiative data is stored here. */
export const BOSS_IMAGE_MAX_CHARS = 250000;
export const BOSS_HP_LIMIT = 999999;
export const BOSS_IMAGE_MIME = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const clampBoss = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(Number(v)) ? Math.round(Number(v)) : lo));
export function normalizeBoss(raw = {}) {
  const maxHp = clampBoss(raw.maxHp ?? 100, 1, BOSS_HP_LIMIT);
  const image = typeof raw.imageData === 'string' && raw.imageData.length <= BOSS_IMAGE_MAX_CHARS && BOSS_IMAGE_MIME.test(raw.imageData) ? raw.imageData : '';
  return {
    name: String(raw.name || '').replace(/[\u0000-\u001f]/g, '').slice(0, 60).trim(),
    currentHp: clampBoss(raw.currentHp ?? maxHp, 0, maxHp),
    maxHp,
    visible: raw.visible === true,
    imageData: image,
    revision: Math.max(0, Number(raw.revision) || 0)
  };
}
export function bossDisplay(raw) {
  const b = normalizeBoss(raw);
  const ratio = b.maxHp ? b.currentHp / b.maxHp : 0;
  return {...b, ratio, percent: Math.round(ratio * 100), defeated: b.currentHp === 0};
}
