# SOUL SEEKERS V37.4 — Verification

- `npm test`: **51 passing tests**.
- `python tests/static-audit.py`: passed, 212 unique element IDs.
- `node --check legendaryActions.js` and `node --check musicPlayer.js`: passed.
- Timed state tests exercise 3-second bell hold, 1.15-second fade, and silence before the theme starts.
- Transport tests exercise resuming YouTube from a saved position, and remaining stopped when previously paused.
- Includes a pre-faded MP3; the original bell recording remains in the project for future changes.

**Device test still needed:** Real YouTube playback and multi-device Firebase/TV synchronization must be checked on a browser with working network access and TV audio unlocked. Some YouTube videos cannot play in embedded players and browser autoplay restrictions may require an initial tap.
