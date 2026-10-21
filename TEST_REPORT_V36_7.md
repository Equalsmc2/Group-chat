# Soul Seekers / V36.7 verification

## Automated

- 28/28 Node regression tests passed (`npm test`).
- HTML, CSS asset, JS import and ID static audit passed (`python tests/static-audit.py`).
- JavaScript syntax passed for `sceneWeather.js` and `desktopApps.js` (`node --check`).

## Isolated Chromium interaction check

The actual HTML and all local stylesheets were loaded into an isolated Chromium document (the full web application's external services were not started). The real `sceneWeather.js` source was then executed against those controls.

- Night active-tab background computed to `rgb(204, 214, 226)` (silver).
- Day active-tab background computed to `rgb(217, 180, 95)` (gold), after its CSS transition.
- Night `SOUL SEEKERS` sidebar accent computed to a silver color.
- Day sidebar accent computed to gold.
- The top-right celestial disc is present and its `celestialOrbFloat` animation is active.
- Four full-viewport SVG beam paths are present; `celestialRayBreathe` is active.
- The duplicate sidebar celestial icon is hidden.
- Day/night button actually switches displayed label DAY ↔ NIGHT.
- The weather button actually switches CLEAR → RAIN.
- The celestial element and weather canvas remain displayed when `tv-device` is enabled.

## Still requires testing on the user's setup

- Full PHCode app with live Firebase and music.
- TV browser or second physical device behavior.
- Visual preference and readability on the actual projector/TV, especially weather layered over dense Combat UI.
