# Soul Seekers V40.10 — Asya exactly-three audio / duplicate prevention

- Removed the previous six skip-variant selection pool from Asya Legendary Actions. Only the three non-theme recordings in Asya(3).zip are selectable, with a 0.5-second cut of each for short Dead Air.
- Source names: `kingu-crimson-no-noriyoku_iyDMsv0.mp3`, `tv-static-yt-audio.mp3`, and `we-are-number-one-but-king-crimson-mp3cut.mp3`. The second recording is named TV static in the supplied archive; it was included because the user specified three sounds.
- Normalize the three sounds for more consistent levels; use exactly one per trigger. Blood Drain remains the looping theme for full Dead Air and is not in the skip sound pool.
- In-page and short-term same-browser cross-tab duplicate-activation guards stop repeated Firebase snapshots from firing the same skip sound twice. Distinct new activations remain playable.
- `TEST_ASYA_AUDIO.html` now plays the actual three clips individually or randomly, and `TEST_ASYA_EFFECTS.html` uses those same three quick clips.
- No change to existing 500ms glitch animation, pair randomization, Firebase rules, or other Legendary Actions.
