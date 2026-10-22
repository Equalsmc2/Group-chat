# Soul Seekers V40.2 — QA and acceptance

- **101/101 Node automated tests passed.**
- **Static audit passed:** 213 unique IDs; locally referenced assets/imports resolved.
- New code passes JavaScript syntax check.
- Ran Chromium rendering in an **isolated HTML/CSS fixture** at **1920×1080** and **1280×720**, using actual bundled CSS and user-supplied character/photo assets. Saved screenshots are `VISUAL_QA/v40-2-*`. The fixture is not a real synchronized website session.
- Compared Stage and Combat screenshots against the original V40.1 captures. See `VISUAL_QA/TV_BEFORE_AFTER.jpg`.
- **Not tested in a live session:** Firebase cross-device triggers, physical TV overscan, sustained 4K performance, cross-device audio handoff, or transitions with every DM cue and Legendary Action. Those parts are unchanged in the original source, but require live testing.
- Browser navigation to the local running site was blocked by environment policy, so live application rendering could not be validated. Visual QA used isolated CSS/HTML rendering rather than claiming full-app acceptance.

**Live verification:** Publish through the included installer, confirm `SS / V40.2`, then test TV Standby/Stage, TV Combat with six players, boss display, and all Legendary Actions from a phone. Confirm no overlap and manual LA cancellation; inspect a 720p television if used.
