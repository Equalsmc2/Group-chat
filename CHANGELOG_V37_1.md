# Soul Seekers v37.1 — performance patch

- Replaced continuous full-page sheen loops with brief, event-based view transitions and hover feedback.
- Removed always-running animated box-shadow pulses on large Combat/DM panels.
- Removed pointer-driven parallax updates that restyled the entire document each frame.
- Replaced large backdrop blurs with legible translucent fills, retaining Boston scenery and silver/gold identity.
- Reduced weather particle caps, canvas pixel ratio, and low-power redraw frequency.
- Removed redundant periodic weather masking work and stopped restarting weather when unrelated body classes change.
- Kept the top-right crescent/sun, with slower disc-only animation and static rays.
- Kept the existing scenes, character layouts, sound cues, TV mode, and Scene Lab data systems.
