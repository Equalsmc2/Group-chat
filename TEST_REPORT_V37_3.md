# v37.3 Test report

- `npm test`: **47/47 passed**, including bell fade ordering and cancellation simulation.
- `python tests/static-audit.py`: passed, all 212 unique IDs and static references verified.
- JavaScript syntax: checked for all changed modules.
- Isolated Chromium at 1600×900 and 390×844: rotating reels and cinematic cut-in rendered, with no HTML or CSS parsing error observed in those isolated scenes.
- Browser in this environment blocks localhost navigation, so full PHCode runtime/live Firebase/actual physical TV audio were not verified.
