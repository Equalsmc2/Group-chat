# Soul Seekers / V36.3 — Test report

- **Automated Node regression suite:** 17/17 passed, including three new V36.3 checks. `npm test`.
- **JavaScript syntax:** `node --check` passed for all top-level JS modules.
- **Static project audit:** passed, with 196 unique HTML IDs, valid asset/import paths and no removed Map or Veil restoration.
- **Isolated browser scene controls:** day/night label toggled NIGHT→DAY, weather label CLEAR→RAIN, and the atmosphere ready marker was set correctly after evaluating the real `sceneWeather.js` against a minimal DOM fixture.
- **Isolated TV CSS/markup visualization:** Chromium headless at 1366×768, 1600×900 and 1920×1080, with one example boss and six mock populated cards composed from the real CSS and HTML hooks. No card had internal content overflow in this **representative fixture**. The boss, party roster, full normal metadata, and ticker fit inside the viewport.
- **Scope limits:** Cannot run the full website via loopback because browser navigation is blocked here. The TV fixture is not an end-to-end application launch; it uses simulated text/data and packaged character artwork. Live Firebase across devices, actual TV audio, real YouTube playback, DM upload flow, and user PHCode mode still require on-site testing.

## Suggested manual smoke test

1. Open `index.html?phcodeLivePreview=true` in PHCode. At the Terminal and again at DM Control, click the day selector and weather selector; verify label/art changes. Rain/snow move on the Terminal only, while the sidebar shows a static effect outside Terminal.
2. Open `index.html?phcodeLivePreview=true&tv=1` and arm the display. Broadcast Combat with six characters and a published boss. At 1920×1080 confirm all normal stats/actions and the compact music ticker are visible together.
3. Trigger turn announcements for Magnus and Max. Confirm the headline and quote read as pale text over dark ink, then auto-dismiss.
4. Test Firebase from two **different** devices. Confirm boss HP, image, turn changes, TV scene and SFX/music after one initial TV user gesture. The automated tests do not cover this.
