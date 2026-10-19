# Soul Seekers v36.2 — Test Report

## Verified in this environment

- `npm test`: **14 passed, 0 failed**, including five boss state / validation / wiring regression tests and the original v36.1 suites.
- `python3 tests/static-audit.py`: passed; **196 unique element IDs**, local file imports / CSS refs valid.
- `node --check bossEncounter.js` and `node --check bossState.js`: passed.
- Isolated Chromium DOM test, mocked Firebase: populated DM boss name/HP, uploaded 900×900 PNG, canvas conversion to JPEG data URL (24,299 characters), set visible, applied −25 HP (625 → 600), and asserted the public bar read `600 / 625 HP`. Both control and broadcast layouts were visually inspected. No JavaScript page errors in this isolated test.
- The six-character markup and `combat.js` were not changed; boss ribbon is a separate flex item above `#combatGrid`.
- The existing Firestore rule `match /combatState/{docId}` covers the new `combatState/boss` document without a rules change.

## Not verified / user's acceptance tests

- The environment blocks localhost and intercepted HTTP navigation (`net::ERR_BLOCKED_BY_ADMINISTRATOR`); **a full application browser smoke test was not completed**. Browser test above runs the real boss module's DOM behavior with mocked Firebase, not all app modules.
- Real PHCode preview, Firebase synchronization across independent computers/phones, uploaded-image cloud persistence, and TV screen arm / audio behavior were not executed here.
- 1080p/4K complete six-card TV composition with the new boss ribbon should be verified in a normal PHCode or deployed browser. TV retains existing six-column CSS layout and gains one boss ribbon; individual portrait cards are not re-rendered or removed by the new module.

## Recommended acceptance checklist

1. Open `index.html?phcodeLivePreview=true`, go to **DM Control → Combat Director**.
2. Set a boss name and max HP; click **SAVE BOSS**. Choose **UPLOAD IMAGE** and check the preview. Enable **SHOW ON COMBAT / TV**.
3. Navigate to **Combat** and confirm one boss health ribbon plus all six characters; change HP by clicking damage/heal controls in DM Control.
4. Open `index.html?phcodeLivePreview=true&tv=1` in another tab on the same browser origin/profile; arm display if needed; take the Combat scene live from DM Control. Verify name/HP/image sync, defeat at zero HP, and HIDE BAR.
5. With deployed Firebase, repeat on **two different physical devices** on the same deployed origin. Inspect `#dmBossSync` if data doesn't persist; cloud writes require the existing trusted-table Firestore rules.
6. Open the application at a real phone width and ensure only texting is visible; no boss controls, Combat, Stage or DM interface.
