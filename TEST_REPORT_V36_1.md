# Soul Seekers V36.1 — Verification Report

## Completed

- `npm test`: **9 passing**, including three new DOM-helper assertions that verify:
  1. The empty-state decorative element cannot become a message.
  2. Switching characters changes only real message perspective and retains failed-send/animation flags.
  3. Malformed sender-less children do not affect message counts.
- `python3 tests/static-audit.py`: **passed** (174 unique IDs; referenced assets, scripts, and imports verified).
- `node --check` for changed JavaScript: **passed**.
- **Isolated Chromium DOM/style render** using the actual source HTML/CSS and the actual V36.1 UI-composition code with offline substitutes for network-dependent modules: passed at 1440×900 and 1920×1080. Checked that the character strip appears, reacts to Asya selection, leaves the decorative empty state intact, counts two manually inserted messages, and correctly switches in/out perspectives. Browser page-error count for this isolated test: zero.

## Not validated in this environment

- An actual end-to-end PHCode/local HTTP server browser session: Chromium blocked loopback navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, including navigation through a route-based request mock. Screenshots therefore come from **isolated document/DOM rendering**, not a complete application boot.
- Live Firebase sign-in, two-physical-device behavior, real YouTube playback, and actual TV audio routing. These require a real local/hosted session.
- Browser rendering at every smaller desktop resolution (test at 1440 and 1920 only); phone and TV systems were not run end-to-end in the isolated render.

## Quick user acceptance checklist

1. In PHCode normal preview, select **Asya**, **Max**, then **Observer** before sending. The radio-silence card should remain normal; the count should stay `0 SIGNALS`.
2. Send two messages as different characters. The empty card should vanish, the counter should read `2 SIGNALS`, and switching identities should align each bubble correctly.
3. Visit DM CONTROL and verify the SOUND DECK is immediately visible; trigger one cue with the player TV armed.
4. Use the explicit `&tv=1` preview and verify six portraits in Combat and that the operator strip is not shown.
5. Open the page at phone width; it should provide texting only.
6. In the hosted Firebase version, test a real DM laptop + TV + phone to verify remote state and audio.
