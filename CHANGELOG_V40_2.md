# Soul Seekers V40.2 — ON AIR TV Creative Pass

**Baseline:** supplied V40.1 repaired ZIP. This is the complete website, not an incremental patch.

## Major visual changes
- TV Stage: editorial title treatment, diagonal broadcast surface, corner framing marks, broadcast side information, photo-friendly shadows, revised location/dialogue/idle compositions, more visible Roman III, slow scene drift.
- TV Combat: large angled section title and round status, active initiative accent, more graphic cut-corner character panels, portrait-led cards, readable compact data areas, increased HP bar presence, boss broadcast treatment.
- Transitions: brief scene-change ON AIR sweep with a concise title, event-based only. Normal turn changes receive a brief emphasis instead of an intrusive screen wipe.
- All new styling/animations are scoped to TV mode at >=721px and respect reduced motion / MOTION OFF.

## Preservation and integration
- No change to Firestore rules, Firebase state schema, DM commands, chat, player quotes, character artwork, audio or Legendary Action timelines.
- V40.1 baseline CSS and all original media retained; additional stylesheet and a presentational TV script are loaded separately.
- Visible build stamp updated to SS / V40.2. Full Windows installer verifies the copied files.

## Files
- `WEBSITE/broadcast-v40-2.css` — new TV art direction and animation.
- `WEBSITE/broadcast-v40-2.js` — cosmetic ON AIR transitions only.
- `WEBSITE/index.html` — linked V40.2 files, build indicator.
- `WEBSITE/tests/v40-2-broadcast.test.mjs` — regression checks.
- Existing version-check tests and package metadata updated.
