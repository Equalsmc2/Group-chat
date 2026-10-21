# V35 test report

## Executed

The browser integration run used a real headless Chromium 141 build, two pages sharing one isolated browser profile, the actual packaged HTML/modules/CSS/assets, and a local HTTP server. External network requests were blocked. No live Firebase state was modified.

### Browser integration — 18 checks passed

- PHCode DM/TV roles and dependency-free boot
- All three broadcast scenes follow automatically
- Blackout / restore affects only TV
- Chat exactly once on DM and TV, including refresh
- HP, temp HP, AC, conditions, slots, resources, concentration synchronize without DM notes
- Turn cut-in and timed dismissal
- Rapid turn advancement converges
- Quick HP damage/heal and keyboard action economy
- Cue studio sends boss Stage and broadcasts
- Dialogue overlay expiry and refresh deduplication
- Interruptible overlay clear
- Saved cue and actual local device monitor
- Cinematic SFX routes only to TV and setting changes do not duplicate events (instrumented media)
- Zero music volume preserved
- One persistent music engine across views
- All four desktop views and six TV portraits bounded at all six requested sizes
- 390px phone chat only, desktop engines absent, message sync
- No uncaught application errors

### Media and lifecycle — 10 checks passed

- Mocked YouTube transport persists without re-cue across Terminal/Combat
- Visualizer stops drawing in DM workspace while playback continues
- Visualizer resumes in Combat and suspends with reduced motion
- New volume command cancels older fade
- TV receives track/play/volume through session state (mocked YouTube)
- Explicit DM cinematic preview plays locally
- Director restore uses fresh serials and restores output
- Combat undo preserves future turn-event progression
- Stale reconnect overlay suppressed
- Bundled MP3 decodes in Chromium

### Source and packaging

- Five retained Node simulation/asset suites passed; added V35 regressions cover volume zero, additive cue kinds, and missing/future event timestamps.
- HTML IDs, relative imports, local asset references and CSS brace audit passed.
- SHA-256 comparison: all 26 unique supplied sound-file payloads are present unchanged in assets/sfx.
- Final archive checks passed: index.html is at the Pages ZIP root; the PHCode ZIP contains one named project folder. Both archives passed CRC validation and contain identical project files.

### Responsive / visual review

Desktop navigation bounds and document horizontal overflow were checked in Terminal, Combat, Stage and DM Control at 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440 and 3840×2160. All six TV portrait panel bounds were checked at every size. Phone-only behavior was checked at 390×844.

Screenshots were inspected for Terminal, DM workspaces, Combat, Stage, phone chat and 1080p TV. The pass corrected legacy decorative shapes crossing headings, navigation growth, identity-panel collapse, inherited phone navigation, and concentration clipping. Fonts are bundled so offline layout matches the intended typography. The dimension checks establish viewport bounds, not a claim that arbitrary maximum-length data can never require scrolling.

### Bugs discovered through testing

The initial rapid-turn test failed: the TV’s local-storage echo could restore an older combat snapshot on the director. Monotonic revision gating and removing the receive-side storage write corrected it; the repeated nine-turn sequence then converged on both clients. Phone testing found old desktop CSS revealing navigation; an explicit phone layout authority corrected it. Test-code issues (backdrop locator, viewport assignment, media timing) were corrected without weakening application assertions.

## Not passed / not claimed

Firefox 153 launched, but creating test pages hung in this environment. No Firefox UI acceptance is claimed. Browser audio routing tests instrumented HTMLMediaElement/YouTube callbacks; they do not establish audible sound quality. Real network Firebase sync, live YouTube embeds and physical TV/fullscreen policies still require acceptance on your equipment.

## Real-device acceptance before play

1. Deploy the complete ZIP and reload both laptop and TV. Keep the normal URL on the laptop and ?tv=1 on the TV. Confirm LIVE / FIREBASE.
2. Arm the TV and listen to a music track plus a quiet SFX; confirm the laptop stays silent unless preview is enabled.
3. Broadcast Terminal, Combat, Stage; blackout and restore; trigger and clear a dialogue/boss cue.
4. Edit HP, conditions, a slot and a resource. Advance turns rapidly, undo, and advance again. Confirm a new cut-in still appears and dismisses.
5. Refresh the TV and briefly disconnect/reconnect it. Confirm state catches up and old overlays/SFX do not replay.
6. Test Firefox on the laptop, real TV 1080p/4K, and phone chat. Check the most densely populated character and longest cue you expect to use.
7. Switch Terminal ↔ Combat while music plays. Check motion OFF / reduced motion and long-session behavior.

No requested feature was intentionally removed. Remaining limitations and baseline last-writer constraints are listed in KNOWN_LIMITATIONS_V35.md.
