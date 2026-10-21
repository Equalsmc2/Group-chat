# SOUL SEEKERS — ACT III V36.8

## Sun / moon collision repair
- Shrunk the bright celestial disc into the reserved upper-right status corner.
- Shifted the desktop link-status label left to make dedicated space for it.
- On the TV, the crest stays above the Combat card row; sun/moon rays remain softly animated behind the interface.
- Day remains gold, night remains silver; reduced-motion users retain a static celestial mark.

## Scene Lab (new DM workspace)
- Added a 20-photo library containing every image from the provided `Bosten Images.zip`.
- Each photo has a responsive thumbnail and an optimized WebP master; the supplied original archive is not required at runtime.
- Choose separate backgrounds for Terminal, Combat, Stage, and DM Control; or apply the same background to all.
- Added per-scene defaults, a surprise picker, and compression-limited file upload.
- Art selections synchronize through `stageState/scenery` in Firebase (trusted director write, signed-in TV read) or through browser-local sync in PHCode local preview.
- Stage illustrations still take precedence when the DM publishes a foreground illustration; the background is independent.
- Player TV preview follows the active broadcast scene's selected background.

## Additional DM tools
- Scene Lab: one-touch Day / Night and Clear / Rain / Snow / Leaves controls.
- Stage templates: Location, Intermission, Danger, Victory, Standby.
- Quick editable Stage headline and caption, with separate “Update Stage” and “Update + Take Live” actions.
- Existing Encounter, Sound Desk, Cue Studio, and Session workspaces preserved.

## Compatibility
- Uses the project's existing trusted-table Firestore rules: no new Firebase rules required.
- Physical multi-device Firebase and YouTube/audio acceptance must still be tested on deployment.
