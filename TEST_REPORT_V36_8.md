# V36.8 test report

## Verified locally
- `npm test`: 32 of 32 passed (including four new Scene Lab integration/static tests).
- `python tests/static-audit.py`: passed; CSS, HTML references, imports, and asset packaging valid.
- JS syntax checks: sceneDirector.js, sceneDirectorUI.js, sceneWeather.js passed.
- Isolated Chromium render at 1366×768, 1600×900, and 1920×1080: top-right crest does not overlap desktop status badge, DM badge, or TV Combat card area.
- Isolated browser with mocked data transport: 20 gallery items render; picking Fall4 + Apply updates saved Stage background; Snow updates atmosphere; Scene Lab and four original workspace tabs all appear.

## Not verified here
- Full PHCode live runtime and multi-physical-device Firebase behavior (browser networking in this environment blocks local URLs).
- Real YouTube playback, TV audio and uploaded photo latency on a physical display.
