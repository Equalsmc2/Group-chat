/* Lunar Eclipse sound sequence. All times are milliseconds from activation.
   Music may NEVER begin before the bells have faded to silence. */
export const LUNAR_TIMELINE = Object.freeze({
  bellHoldMs: 6000,
  bellFadeMs: 1500,
  songStartMs: 7680,
  introAnimationMs: 1650
});

export function lunarAudioPhase(elapsedMs) {
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  const fadeEnd = LUNAR_TIMELINE.bellHoldMs + LUNAR_TIMELINE.bellFadeMs;
  if (elapsed < LUNAR_TIMELINE.bellHoldMs) return { phase:'bell', bellGain:1, songOffsetMs:0 };
  if (elapsed < fadeEnd) return {
    phase:'bell-fading',
    bellGain:Math.max(0, 1-(elapsed-LUNAR_TIMELINE.bellHoldMs)/LUNAR_TIMELINE.bellFadeMs),
    songOffsetMs:0
  };
  if (elapsed < LUNAR_TIMELINE.songStartMs) return { phase:'silence', bellGain:0, songOffsetMs:0 };
  return { phase:'song', bellGain:0, songOffsetMs:elapsed-LUNAR_TIMELINE.songStartMs };
}
