# Soul Seekers ACT III — V36.2: Boss Encounter Broadcast

## New: DM-controlled boss health display

- One optional boss encounter ribbon appears **above** the six character cards in Combat. It never replaces one of the six characters and is not added to party initiative.
- The DM can name the boss; set current and maximum HP; apply quick damage/healing of 1, 10, or 25; refill HP; and show/hide the entire display. Zero HP remains visible until explicitly hidden and reads **TARGET NEUTRALIZED**.
- The DM can upload one JPEG, PNG, or WebP portrait using **DM Control → Combat Director → Boss Health Display**. The browser resamples the uploaded image into a small JPEG data URL before publishing it; the original file is neither uploaded nor stored. Files over 12 MB are rejected. Compressed images are restricted to about 250,000 data-URL characters to keep Firestore documents within the 1 MiB limit.
- The boss has its own `combatState/boss` Firestore document, so ordinary party turn/HP saves don't repeatedly include boss image bytes. Existing `firestore.rules` already allow read access for signed-in player/TV clients and write access for DM roles.
- In PHCode/local mode, boss data syncs between tabs/windows sharing the same browser origin/profile via BroadcastChannel and storage events. With hosted Firebase, it follows the normal Firestore role/snapshot model.
- The boss presentation only occupies Combat, including the dedicated player-TV Combat scene. Stage, Terminal, combat cards, turn popups, cinematic SFX, and music retain their V36.1 behavior. Phones remain texting-only and do not subscribe to boss art.

## Files changed

- Added `bossState.js`, `bossEncounter.js`, `boss-v36-2.css`, `tests/boss-state.test.mjs`.
- Added presentation and director controls to `index.html`.
- Updated `package.json` to 36.2.0 and this documentation.
- No existing chat, combat, session, Stage, music, sound or Firebase implementation files were modified.

## Known limits

- Exactly **one boss display** is supported at a time; this is a broadcast HP display, not a monster stat block or another initiative actor.
- Very large/complex images lose detail through JPEG compression. Animated images and SVG are not accepted.
- The uploaded image is stored in the **public boss Firestore document** and is readable by signed-in players/TV clients. Don't upload secret/DM-only artwork.
- True end-to-end remote Firestore multi-device and PHCode testing must be performed by the user; isolated browser tests do not prove physical-device sync.
