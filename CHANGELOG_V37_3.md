# Soul Seekers / v37.3 cinematic polish

- Added two rotating film reels and moving photo film strip to Jeanette's Lunar Eclipse presentation.
- Added motion-staged shutter entrance, photo floats, lunar rings, title animation and persistent status ticker.
- Added user-supplied **Through Patches of Violet (Female Version)** as Jeanette's temporary theme.
- Implemented a deterministic audio sequence: short bell hit, controlled bell fade, silent beat, then theme. The two sounds never intentionally overlap.
- Prefetches the theme during the bell cue to reduce transition latency.
- Cancels sound effects and all scheduled playback when the action is toggled off.
- Temporarily pauses the usual YouTube music while the theme plays and resumes it afterward when appropriate.
- Late-joining TVs start at the theme's elapsed position instead of replaying the stinger.
- Kept accessibility reduced-motion support and the existing phone, DM, and TV trigger architecture.
