# Soul Seekers V37.5 Verification

- Node regression suite: **51/51 passing**.
- Python static audit: **PASS** (212 unique HTML IDs, imports and referenced static files valid).
- JS syntax: `legendaryActions.js` and `desktopApps.js` both pass `node --check`.
- Actual bell audio file measured at **7.500 seconds** of PCM playback. The last 100 ms of the recording is near-silent following a fade baked into the MP3.
- Intro sequence in code: **6,000 ms** hold + **1,500 ms** fade + **180 ms** silent gap; new instrumental starts at **7,680 ms**.
- Replaced Jeanette's old V37.4 vocal placeholder audio with the supplied instrumental MP3.
- Existing YouTube hold/resume tests remain passing; physical TV browser autoplay behavior still requires user verification.
- Small eclipse-build-up visual treatment added; reduced-motion preference honored.
