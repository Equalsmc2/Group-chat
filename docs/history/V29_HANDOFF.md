# Soul Seekers — ACT III v29 handoff

## What changed

v29 separates one codebase into two synchronized experiences: a Firebase-authorized **DM CONTROL** director console and a read-only **player TV client**. The permanent art direction is dark/gold ACT III. The Map runtime is removed and replaced by **THE STAGE**. Terminal, Combat, chat, portraits, combat state, music library, shared YouTube player, and the Combat visualizer are preserved.

## DM CONTROL at a glance

- **Broadcast Director:** send Terminal / Combat / Stage to TV, choose transitions, blackout/restore, clear overlays, undo director state, preview current TV composition.
- **Combat Director:** previous/start/reannounce/next turn, order editor, roster edits, combat undo.
- **Audio Director:** choose saved track, play/pause/next, volume/fade, optional local DM preview.
- **Presentation Director:** dialogue/chapter/location/boss/revelation/announcement cues, portraits/illustrations, Stage publish, private cue queue.
- **Session Control:** live device heartbeat list, Firebase health, TV launcher, force resync.

## Connect laptop + TV

1. Complete `FIREBASE_SETUP_V29.md`.
2. DM opens the normal deployed URL and signs in under **DM CONTROL**.
3. TV opens the same URL with `?tv=1`.
4. Click **ARM DISPLAY + AUDIO** once on the TV.
5. Use Broadcast Director on the laptop. The TV follows the authoritative scene automatically.

## Security boundary

A selected character name is not authorization. DM writes require Firebase Email/Password Auth plus `roles/{uid}.dm == true`. TV mode uses a separate named Firebase app with in-memory anonymous Auth, so a TV tab opened from the DM browser cannot inherit the DM credential. `dmState/*` is denied to player/TV clients by Firestore rules.

## Testing status

Executed in the build environment: JavaScript syntax checks, session-state unit tests, two-client state simulation, combat offline-writer simulation, combat turn-event simulation, duplicate-ID scan, local asset/import scan, CSS brace validation, Map/Leaflet/Veil-runtime removal scan, and ZIP integrity checks.

Not available in the build environment: a real two-physical-device Firebase session, Firestore Emulator rules execution, a successful Chromium visual render (managed environment blocks local navigation), and Firefox runtime testing. Run the acceptance checklist in `TEST_REPORT_V29.md` after deployment.

## Important limitation

The YouTube IFrame API does not expose decoded audio samples to the page. The existing YouTube visualizer is therefore explicitly **playback-reactive**, not a fake FFT. True frequency analysis would require a direct audio source that can be routed through Web Audio.
