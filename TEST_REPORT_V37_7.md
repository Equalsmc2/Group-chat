# Soul Seekers V37.7 — QA report

- Node automated regression suite: **58 / 58 passed**.
- Static DOM, imports and asset audit: **passed (212 unique IDs)**.
- JavaScript syntax checks: **passed** for legendaryActions.js, desktopApps.js and sessionDirector.js.
- Isolated Chromium visual checks at **1600 × 900** and **390 × 844**: the eclipse moon and rays share the bell centerline and use layers 1 / 2 / 3 for moon / moonbeams / bells, with cropped bells (480px wide, top -192px on desktop).
- The synchronized six-second entrance and its delayed-progress catch-up logic are unchanged, as are the **6s bell hold**, **1.5s fade**, **7.68s theme start** and YouTube pause/resume logic.
- **Not tested:** Physical TV with live Firebase and actual speaker playback. Test on your devices after deployment.
