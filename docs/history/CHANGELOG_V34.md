# Soul Seekers v34 — Audio Direction Update

## Added

- New centralized `sfx.js` engine with pooled HTML audio voices, rate limiting, per-cue gains, local UI sounds, cinematic TV sounds, and optional DM preview.
- 26 user-provided SFX assets under `assets/sfx/`.
- Automatic combat audio for turn reveals, damage severity, critical/zero-HP events, healing, new conditions, concentration, and spell-slot expenditure.
- Automatic player-display audio for scene changes, blackout/restore, and presentation overlays.
- Session-authoritative SFX cue state (`sessionState/main.sfx`) so manual DM cues reach the TV live and deduplicate by serial/event time.
- Audio Director **LIVE SOUND DECK** with master SFX enable/volume, DM preview, eight primary cinematic cues, and eight progressive-disclosure extra cues.
- Music ducking under important cinematic SFX, then smooth restore to the active session volume.
- TV arming now unlocks both YouTube session audio and the SFX engine.

## Audio policy

- UI clicks are deliberately quiet and local to the device being operated.
- Cinematic sounds default to the armed TV only, preventing laptop + TV doubling in the room.
- DM cinematic preview is opt-in.
- Phone mode remains texting-only and does not load the desktop SFX engine.
- First/reconnected snapshots prime state silently; stale combat/DM SFX are not replayed.
- Rate limits stop rapid clicks or repeated state renders from becoming audio spam.

## No Firebase rule change required

v34 stores SFX control inside the existing `sessionState` document, which already uses the same Trusted Table Mode permissions.
