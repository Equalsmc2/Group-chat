# Soul Seekers v30 — test report

## Performed

- Ran `node --check` against every shipped top-level JavaScript file: passed.
- Ran the static package audit: passed with 169 unique HTML IDs, no duplicate IDs, and all checked local references/imports present.
- Ran session-core automated tests: passed.
- Ran simulated multi-client DM→TV state tests: passed.
- Ran combat latest-snapshot write queue simulation: passed.
- Ran combat turn-event freshness/deduplication simulation: passed.
- Confirmed the HTML no longer contains DM email/password inputs or a credential form.
- Confirmed v30 Firestore rules include trusted self-enrollment for `roles/{uid}`.

## Not performed

- No real Firebase Console changes were made from this environment.
- No real two-physical-device session was performed against the user's live Firebase project.
- No live Firefox/Chromium cross-device acceptance test was claimed.

After deployment, verify on the real project that the laptop reaches `DIRECTOR / TRUSTED`, the TV remains player-facing, and DM actions propagate live.
