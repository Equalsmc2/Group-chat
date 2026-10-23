# Soul Seekers V40.8 — QA and Verification

## Automated verification

- 118 / 118 Node test cases passed, including 4 new tests for paired combination selection, TV/DM rendering, stylesheet links and short-effect timing.
- `legendaryActions.js` parses with `node --check`.
- 64 / 64 possible glitch pairs were reached in a seeded 1,000-activation distribution check.
- The new `asya-deadair-v40-8.css` is the last stylesheet in the installed `index.html`.
- The site build marker and installer assert `SS / V40.8`.

## Browser-rendered checks actually performed

The standalone TV/phone fixture was loaded in headless Chromium using inline CSS because local website URL navigation was disallowed by the browsing environment. This is a style/rendering check, not a Firebase end-to-end test.

- 1920 × 1080: flip + pixel, tear + chroma, zoom + macroblock, mirror + dropout.
- 390 × 844: the same four combinations.
- All 8 combinations had the intended *two* CSS animations active and a visible separate fullscreen overlay.
- Their application transforms were not the identity during effect playback, and returned to normal once the local 500 ms trigger ended. No uncaught browser script exceptions in these fixtures.
- Additional production-DOM source rendering confirmed that TV's `#stageView` and `#combatView` are inside `.site-shell`, that CSS keyframes target the true root, and that the overlay remains separate.
- Screenshots in `VISUAL_QA` depict the **test fixture**, not a real Firebase-connected TV session.

## Remaining live-device checks

- Trigger Asya SHORT from a phone, observing the TV and DM computer. Confirm `SS / V40.8` on each and verify a fullscreen flip/tear plus distinct display corruption for half a second.
- Trigger multiple times; each activation should produce a new deterministically seeded pair, although repeats can occur by chance.
- TV must be audio-enabled (ARM DISPLAY + AUDIO) to play short time-skip sounds initiated remotely.
- Firebase timing and actual hardware/Zen browser rendering have **not** been tested here.

No Firestore security rule changes were made. Jeanette, Alexandria and Asya FULL action code remains in place.
