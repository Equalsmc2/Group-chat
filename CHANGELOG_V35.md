# V35 — The Third Movement

## Design and workflow

- Replaced the desktop top-tab composition with a persistent numbered navigation rail, gold selection plate, skyline identity, environment controls, and the supplied QR.
- Rebuilt Terminal around the message thread, expressive empty-state typography, integrated Stage preview, and a compact music desk.
- Introduced six portrait columns with gold active-turn hierarchy, distinct HP feedback, preserved quick editing, visible economy, and dedicated TV typography scaling.
- Reorganized DM Control into a persistent program summary and four focused workspaces. Broadcast and emergency actions remain available above the workspaces.
- Added cue rehearsal, editable Dialogue / Chapter / Boss / Victory templates, and independent local UI-sound preference. Templates do not broadcast until explicitly fired.
- Extended Stage and overlay types to support revelation, character introduction, illustration, victory, and defeat consistently. Added type-specific styling.
- Bundled Barlow Condensed, Cormorant Garamond, and DM Sans with their SIL OFL licenses so the layout does not depend on Google Fonts availability.

## Reliability fixes

- Localhost / PHCode now boot without downloading Firebase SDK modules and do not silently write test changes into the live project. Existing browser synchronization channels remain.
- Fixed combat state echo rollback during rapid local turn changes with monotonic local revision guards; duplicate deliveries no longer rewrite storage.
- Fixed local chat duplication on storage echoes, used collision-resistant message IDs, and enforced the existing 1200-character message limit in the input.
- Kept zero volume at zero instead of normalizing it to 70. Cancels superseded music volume fades.
- Stops hidden-view visualizer work and respects reduced motion / ambient-motion preference without stopping music or essential state listeners.
- Deduplicates identical Stage renders. Persists SFX event IDs to avoid replay from subsequent state deliveries.
- Requires identified, timestamped fresh overlays; restores only their remaining lifetime. Undo clears old overlays and advances broadcast/audio serials.
- Combat undo advances turn serials so subsequent legitimate turns are not suppressed.
- Replaced the local device-monitor placeholder with timestamped browser-tab heartbeats.
- Local private combat notes are retained separately and are never included in the public combat payload.
- URL-only TV mode; removed the legacy `display=tv` alias and in-place fallback role mutation. Launch TV does not fullscreen the director laptop.
- Normal phone clients do not enroll as directors. The trusted-table security philosophy and Firestore rule file remain unchanged.

## Accessibility and retention

- Keyboard-operable action economy, arrow-key tab navigation, visible focus, modal focus containment, skip-to-content, and a visible intro skip button.
- Setup notices no longer hide the entire desktop director workspace; unavailable write controls are disabled.
- Preserved all six portraits, exact turn lines, all 26 supplied sound-file payloads, music library/player, combat editor and resources, turn ordering, undo, rest controls, intro, atmosphere controls, and phone-only chat.

No database migration or account/password setup is required. Do not mix V34 and V35 clients in one session; reload both after upgrading.
