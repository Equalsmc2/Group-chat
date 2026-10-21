# Soul Seekers v29 — test/debug report

This report distinguishes tests actually executed in the build environment from integration checks that still require the deployed Firebase project and physical/session devices.

## Automated/static tests performed

- JavaScript syntax validation with Node `--check` for every shipped `.js` module.
- Pure session-state unit tests for scene validation, audio normalization, overlay freshness, reconnect dedupe, new-event handling, and bounded event history.
- Local multi-client simulation covering DM scene broadcast, TV follow state, rapid unique overlay events, stale reconnect suppression, blackout state, and audio serial state.
- Combat writer simulation covering offline edit coalescing, edits arriving during an in-flight write, old-acknowledgement protection, and no automatic retry storm after a failed write.
- Combat turn-event simulation covering TV scene handoff, fresh-event preservation, duplicate suppression, and stale reconnect suppression.
- HTML duplicate-ID scan.
- Local asset/reference scan for missing relative files.
- CSS brace-balance validation.
- Source scan confirming Leaflet, `bostonMap.js`, map fallback, and Veil stylesheet are not shipped/referenced.
- Dynamic DM device/cue rows were hardened to use `textContent`/DOM nodes instead of interpolating client-controlled text into HTML.
- ZIP integrity tests after packaging.
- Chromium runtime smoke testing was **attempted**, but the managed build environment blocks both `127.0.0.1` and `file://` navigation by organization policy. No successful visual Chromium render is claimed.

## Not falsely claimed as tested

- No real two-physical-device Firebase session was available in this environment.
- Firebase Authentication providers and the final Firestore rules cannot be enabled/published from this source bundle; they require your Firebase Console.
- The provided Firestore rules were not run against the Firebase Emulator Suite unless explicitly noted by the packaging log.
- Firefox is not installed in the build environment, so a real Firefox runtime test could not be performed here. The source uses standards-based modules/APIs and should still be checked on your actual Firefox TV/laptop before game night.
- A real Chromium UI render also could not be completed because local navigation is blocked by the environment policy; static DOM/CSS/source checks were used instead.
- YouTube owner-specific embed behavior and browser autoplay policy vary by video/browser and require a real browser permission test.

## Required deployment acceptance test

After Firebase setup, test with two devices:

1. DM laptop signs into DM CONTROL and shows DIRECTOR / VERIFIED.
2. TV opens `?tv=1`, arms display/audio, and appears in Session Control.
3. Broadcast Terminal → Combat → Stage from DM; TV follows each scene.
4. Advance combat turn; TV receives one portrait/turn event and it auto-dismisses.
5. Rapidly advance/reverse/reannounce; verify no stale duplicate event appears after refresh.
6. Change HP, conditions, spell slots/resources; verify TV updates live.
7. Fire a dialogue/announcement overlay; verify it appears and dismisses automatically.
8. Refresh TV; verify current scene/state restores but expired overlay does not replay.
9. Blackout and restore picture.
10. Play/pause/change music; confirm only the intended TV output produces session audio unless DM preview was explicitly enabled.
11. Sign out DM; verify editing and private cue/note access lock immediately.
12. Open site as anonymous player and manually navigate to DM CONTROL; verify only the login gate is available and private Firestore reads are denied.
13. Repeat in current Firefox and a Chromium-based browser.
