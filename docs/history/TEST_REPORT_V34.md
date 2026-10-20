# Soul Seekers v34 — Test Report

## Passed

- `node --check` on all shipped JavaScript and `.mjs` tests.
- Existing session-core, multi-client, combat queue, and combat turn-event simulations.
- New SFX asset presence test: 26/26 cue files present and non-empty.
- Session normalization test for SFX volume/cue/serial.
- Multi-client simulation confirms SFX session state reaches the TV-side model.
- Static audit: unique DOM IDs, local refs/imports/assets valid.
- FFmpeg decode integrity check on every shipped MP3.

## Browser/runtime limitation in this environment

A Chromium two-page runtime test was attempted with the system Chromium binary, but navigation to localhost is blocked by the execution environment administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore I am not claiming a live browser audio-playback test here.

## Required real-session acceptance check

1. Open DM client and TV client.
2. Arm TV audio once.
3. Broadcast Combat; confirm scene sting plays once.
4. Advance turn; confirm turn sting + portrait animation play together on TV.
5. Change HP down/up; confirm impact/heal cue plays once.
6. Fire a Sound Deck cue; confirm TV plays it and DM stays silent unless preview is enabled.
7. Verify music ducks briefly under a major cue and restores.
8. Refresh TV; confirm old SFX do not replay.
