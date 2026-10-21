# Soul Seekers V38.6 — Direct Legendary Sync

- Phones write `sessionState/main.legendary` directly through an atomic Firestore transaction. No open DM desktop tab or relay needed.
- Firestore rules allow signed-in players to update only the `legendary` field with an approved action; other session fields remain DM-only.
- Removed 8-second speculative local Legendary display; the shared Firestore state controls activation and duration.
- Jeanette, Alexandria and Asya full LAs persist until explicitly ended. Asya short remains ~850ms by design.
- Late scene/audio snapshots with lower Legendary serial are ignored in the LA viewer.
- Unified the sessionDirector module version across entry points.
- Added a persistent LA status label, a visible Firebase sync error message and a one-click Firestore rules helper.
- All original character visual/audio assets and music loops retained.
