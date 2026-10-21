# Soul Seekers — ACT III · v36.3 / Combat legibility & atmosphere repair

Baseline: **the exact v36.2 PHCode project**. No source has been reconstructed.

## Changes

- Separate lightweight day/night + weather control initialization from the deferred Terminal, YouTube and session imports. Controls initialize on desktop even when other subsystems are still loading or unavailable. Keep animation suspended outside Terminal.
- If browser canvas rendering is unavailable, the scene selectors still initialize, update labels and switch scene artwork without crashing.
- Improve feedback from the day/night and weather controls, including static rain/snow cues on the sidebar while other desktop tabs are selected, with no hidden animation loop.
- Add an explicit v36.3 CSS composition layer after v36.2; this lives in **the same `soulseekers35` cascade layer** to override older important declarations correctly.
- Make boss HP strip compact, retain optional artwork, name, current/max HP, and gold health meter, and reduce crowding above the six combat cards.
- Keep all six portrait cards displayed simultaneously. Reallocate viewport height from oversized header/music dock, use flexible card rows and put concise status/spell/resource fields on fewer lines. Long custom datasets still scroll *within their own card* rather than getting chopped off.
- Keep YouTube engine/visualizer in the compact Combat music ticker; do not restart the player or change music sync.
- Raise contrast for header/turn dialogue, metrics, status, action indicators and particularly the turn splash headline.
- Add regression checks `tests/v36-3-regressions.test.mjs`.

## Compatibility and scope

Preserved: V36.2 boss state and image upload, party HP/initiative/saves/resources/conditions, Terminal/chat, Stage, DM Control, audio engine and SFX, trusted Firebase/local synchronization, TV mode, and phone texting-only behavior. No Map, Veil mode or password-login restoration.

## Verification

- `npm test`: see `TEST_REPORT_V36_3.md`.
- Static packaging audit: see `TEST_REPORT_V36_3.md`.
- Isolated browser rendering at 1366×768, 1600×900 and 1920×1080 with representative six-card data, including a visible boss: no card overflow in that fixture.
- Isolated live-script DOM check: day→night or night→day and clear→rain correctly update labels; real on-device PHCode test remains necessary.

These checks **do not** claim full browser runtime operation, Firebase on multiple devices, YouTube streaming, TV audio, or live uploads were tested end to end.
