# Soul Seekers V39.7 QA Report

- Automated JS/Node suite: **89 passed, 0 failed** (`npm test`).
- Static audit: passed (213 unique IDs; linked CSS, scripts and assets resolved).
- JavaScript syntax: passed for experience, combat, stage, session director, legendary actions.
- Headless browser static-fixture verification (1366x768, TV class): V39.7 stamp visible; computed queen 33% screen-top with left aligned at 27%; slash aligned at the same x-coordinate; large III 3.8px stroke and .44 opacity; combat-card background translucent.
- Full live Firebase/TV deployment was **not** verified; browser network access to the locally served project was blocked, so live runtime and cross-device integration still require manual testing.
- Installer copies all contents of WEBSITE to the local GitHub Desktop repository; you must commit and push before GitHub Pages can change.
