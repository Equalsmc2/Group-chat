# Soul Seekers — V37.1 performance test report

- Automated Node test suite: **40 / 40 passed**.
- Static packaging audit: **passed**, with 212 unique IDs and no missing referenced assets/imports.
- JavaScript syntax check: `sceneWeather.js` and `uiMotion-v37.js` passed.
- Isolated Chromium CSS comparison (simulated Combat page):
  - V37.0 large panel blur: `blur(14px) saturate(1.08)` -> V37.1: `none`.
  - Elements with active backdrop blur: 8 -> 0 in the isolated sample.
  - Top-right celestial disc remains 86px; the moon mask CSS still resolves.
  - The continuous animation load in the isolated sample is lower.

## Not verified

This environment cannot launch the complete local website in Chromium because localhost navigation is blocked. Real PHCode performance, Firebase synchronization on multiple devices, browser audio/YouTube, and measured FPS on the user's machine must be tested there.
