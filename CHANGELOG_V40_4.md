# Soul Seekers — V40.4 / Asya Dead Air Time-Skip Repair

Baseline: complete V40.2 ON AIR website, retaining the V40.2 TV changes, all DM tools, all three Legendary Actions and the existing Firebase configuration and rules.

## Fixed in V40.4
- Fixed a V40.3 deployment mistake: the previous package identified itself as V40.2 and reused V40.1 CSS and JavaScript cache keys. `index.html`, installer and displayed version now consistently say `SS / V40.4`.
- Loaded `asya-timeskip-v40-4.css?v=40.4` AFTER the presentation bundle and updated `legendaryActions.js?v=40.4` so the new rules actually take effect.
- Full Dead Air: removes animated TV static, static GIF, scanline/radio-grid/rings/bar elements and general noise overlay; replaces them with brief temporal tear imagery over a quiet dark red/violet atmosphere. Full cut-in, Asya quote, sustained world inversion and looping Blood Drain music remain.
- Full Dead Air: soundtrack now uses an audible excerpt from the user's `king-crimson-time-skip-sound-effect.mp3` (source begins nearly two seconds silent); theme starts about 2.95 seconds after activation.
- Short Dead Air: genuine 500 ms website glitch (inversion/offset/time slices), no named fullscreen card, no title, and no static texture. The short action uses a separate 500 ms time-skip excerpt.
- New audio paths are versioned (`time-skip-v40-4.mp3`, `time-skip-short-v40-4.mp3`) to prevent browsers from reusing cached V40.3 audio clips.
- Firebase action keys are unchanged; `asya-channel-o-unaired` and `asya-channel-o-short` still use the established schema, and the short action's internal title is retained for compatibility but never displayed in the effect.

## Installation
Extract this ZIP, run `INSTALL_FULL_WEBSITE.bat`, commit and push through GitHub Desktop. Confirm `SS / V40.4` in the bottom right after reloading BOTH phone and TV. No new Firebase Rules step is needed.
