# Soul Seekers V39.9 — QA / delivery

- Based on the user's full V39.8 website ZIP and source directory.
- 94/94 Node automated tests passed, including 3 new V39.9 checks.
- Python static audit passed: 213 unique IDs, referenced imports/assets valid.
- Source scripts pass `node --check`.
- Complete ZIP integrity was checked after packaging.
- V39.9 build marker is included in the website, and INSTALL_FULL_WEBSITE.bat checks for that exact marker.
- The queen's new art is a lossless transparency crop of the original image; the source art remains untouched.
- Entrance slash and visible impact are synchronized with the existing sound cue at 4250ms, with the fall beginning afterward.
- Existing data model, Firestore rules, session sync, and all other Legendary Actions are unchanged.

Browser rendering: A headless Chromium screenshot attempt stalled in this environment, so live TV/phone visuals are not verified. Test on a real device after upload and use the version indicator in the lower-right corner.
