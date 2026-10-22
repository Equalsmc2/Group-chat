# Soul Seekers V40.4 — Verification Report

- Automated tests: **105 / 105 pass** with `npm test`; including V40.4 regression coverage.
- Static audit: **PASS** (`python tests/static-audit.py`), 213 unique IDs and local CSS/JS/asset references resolve.
- JavaScript syntax: `node --check legendaryActions.js` **PASS**.
- Computed CSS in locally generated Chromium fixtures: verified at **1920×1080** and **390×844** that full Asya static/noise/scanline/grid/ring/bar elements compute to `display:none`, while the short cinematic overlay computes to `display:none` and its website glitch computes to a `0.5s` animation.
- Audio clips generated from the exact user-provided `king-crimson-time-skip-sound-effect.mp3`, starting at about 2 seconds to skip its silent lead-in. Full ~2.85 sec; short ~0.55 sec including encoder padding.
- Firebase rules unchanged. Session director and action IDs unchanged. Other LAs retain their original assets and action timing.

**Limits:** This environment prevents browser navigation to the local served website; browser QA is therefore a rendered CSS/DOM fixture, not a live end-to-end Firebase deployment test. Actual GitHub Pages caching, audio autoplay permission on TV, half-second events delivered across networks, and real-device frame timing still require checking on the deployed site. No real cross-device test was performed.
