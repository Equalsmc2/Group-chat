# Soul Seekers — Act III v29 changelog

## Architecture / synchronization

- Added Firebase Anonymous + Email/Password Auth bootstrap.
- TV clients use an isolated named Firebase app with in-memory anonymous Auth so DM credentials cannot bleed into a player-display tab.
- Added verified DM roles through `roles/{uid}.dm == true`.
- Added authoritative `sessionState/main` for TV scene, blackout, presentation overlay, and audio cue state.
- Added event IDs, serials, freshness windows, and client-side dedupe so cinematic overlays do not replay after reconnects.
- Added device heartbeats and DM-only device monitoring, with server-rule validation of heartbeat fields/types/lengths.
- Kept essential Firestore listeners alive across views while suspending hidden rendering loops.
- Added a coalescing offline combat-write queue: DM edits are cached locally, latest-state-wins, and resynchronize without duplicate retry storms when the connection returns.
- Separated private DM data from public combat/session data.

## DM CONTROL

- Broadcast Director: Terminal / Combat / Stage target, transition style, blackout, clear overlay, director undo, live preview.
- Combat Director: current turn, previous/start/reannounce/next, order editor, combat undo, roster editing.
- Audio Director: shared library selection, play/pause/next, volume/fade, optional local DM preview.
- Presentation Director: dialogue, chapter/location/boss/revelation/announcement cues, portraits, illustrations, Stage publishing, private cue queue.
- Session Control: Firebase/session health, active device monitor, resync, TV client launcher.
- Keyboard shortcuts: Space (next combat turn while in DM CONTROL), Alt+1/2/3 (broadcast Terminal/Combat/Stage), Alt+B (blackout).

## Player TV / Stage

- Added dedicated TV presentation mode via `?tv=1`.
- TV follows DM broadcast scene without physical operation at the TV.
- Added one-time display/audio arming gate for browser permission requirements.
- Added THE STAGE and removed the interactive Map feature and Leaflet runtime entirely.
- Added reusable player-facing cinematic overlay system with auto-dismiss and reconnect dedupe.

## Visual redesign

- Gold is now the centralized default accent: `#D9B45F`, highlight `#F4D98B`, antique `#97752F`.
- Dark Act III identity extended across Terminal, Combat, Stage, DM CONTROL, transitions, focus states, and dialogs.
- Legacy decorative red is overridden to gold; red remains for danger/critical semantic states.
- Reworked asymmetrical editorial panels, typography, navigation strokes, cinematic masks, turn splash, Stage compositions, and director-console presentation.
- ACT II → ACT III opening retained, upgraded, skippable, reduced-motion aware, and limited to once per browsing session unless `?intro=1` is used.

## Combat

- Preserved HP, temp HP, conditions, resources, spell slots, concentration, death saves, initiative/order, rounds, undo/rest controls, active-turn splash dialogue, and TV layout.
- Combat editing now requires verified DM authorization instead of the old selectable “Observer” identity.
- Turn events now include freshness metadata so a TV scene transition cannot swallow a just-issued turn splash, while reconnects do not replay old turn animations.
- DM-only notes now live in `dmState/combatNotes`, not public combat state.

## Music

- Preserved one shared YouTube player and music library across Terminal/Combat.
- Visualizer remains available in Combat and suspends on Stage/DM CONTROL where it is not visible.
- Fixed duplicate animation-frame scheduling in volume fades.
- Added pending audio-cue recovery when TV receives a cue before its music library snapshot.
- The YouTube iframe API does not expose decoded audio samples; v29 explicitly presents its canvas as playback/transport-reactive rather than falsely claiming frequency analysis.

## Removed

- Leaflet and `bostonMap.js`.
- Boston map fallback asset.
- Legacy `themes.css` / Veil-mode stylesheet.
- UI-only “Observer means DM” authorization.
