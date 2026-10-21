> Current version: V38.3. Jeanette Lunar Eclipse now holds the bells for six full seconds, fades over 1.5 seconds, waits for silence, then starts the user-supplied instrumental version of Through Patches of Violet. Normal YouTube playback remains suspended until the action ends. For the background tools, see [SCENE_LAB_GUIDE_V36_8.md](SCENE_LAB_GUIDE_V36_8.md).

# SOUL SEEKERS — ACT III / V36.5

Latest stable continuation package. V36.5 is a small UI polish pass over the real V36.4 source; no core gameplay systems were intentionally removed. See `CHANGELOG_V36_5.md` and `TEST_REPORT_V36_5.md`.

**PHCode preview:** `index.html?phcodeLivePreview=true` (desktop). **TV preview:** `index.html?phcodeLivePreview=true&tv=1`.

Weather is client-local (Clear → Rain → Snow → Leaves). Use the sidebar day/night control. Animation pauses with Motion Off, reduced motion, hidden tabs, or texting-only phone view. This does not currently broadcast atmosphere settings across Firebase devices.

**Latest local baseline: v36.3** — repaired desktop day/weather control initialization, compact 1080p TV Combat layout, stronger contrast, and boss header. See `CHANGELOG_V36_3.md` and `TEST_REPORT_V36_3.md`.

# Soul Seekers — Act III / V36.2

An updated working V34 project. The original chat, combat, Stage, trusted-table Firebase model, music player, and cinematic SFX remain the application’s foundation.

## Start here

- **PHCode:** open this folder, then preview `index.html?phcodeLivePreview=true`.
- **Player TV test:** open the same origin with `index.html?phcodeLivePreview=true&tv=1`.
- **Windows local server:** run `START_SITE.bat` (Python 3 required).
- **macOS/Linux local server:** run `sh START_SITE.sh` (Python 3 required).
- **GitHub Pages:** upload the contents of the Pages ZIP so `index.html` is at the repository’s publishing root. There is no build step.

Normal desktop is the director. Only `?tv=1` enters TV mode. Phone-width clients show chat only. No email/password sign-in was added.

**Local previews are now deliberately isolated from Firebase.** They synchronize between tabs on the same browser profile and exact origin. Use `&cloud=1` on local previews to explicitly test the configured Firebase project. Hosted Pages URLs use Firebase by default. See SETUP_V35.md before testing across physical devices.

## What changed

A permanent dark/gold editorial navigation rail; redesigned Terminal with an intentional empty state; six portrait columns for encounters and dedicated TV scaling; a director booth with a persistent output monitor and Encounter / Sound desk / Cue studio / Session workspaces; extended Stage cue types; bundled fonts; synchronization, accessibility, and performance fixes.

## V36.1 update

This release fixes character-switching corruption of the Terminal empty state and adds a character-specific desktop identity strip. The V35/V36 infrastructure is unchanged. See `CHANGELOG_V36_1.md` and `TEST_REPORT_V36_1.md`.

## V36.2: Boss encounters

**DM Control → Combat Director → Boss Health Display** now has a separate, optional enemy/boss HP bar: name, current/max HP, quick +/-1, +/-10, +/-25, refill, and **SHOW ON COMBAT / TV**. Upload a JPG, PNG or WebP boss portrait (12 MB input limit; automatically compressed) or remove it. The player Combat/TV scene displays the portrait and gold HP bar above the six-character board. The boss bar remains hidden until the DM enables it.

The boss data and compressed image use a dedicated shared Firestore document `combatState/boss` covered by the project's existing `firestore.rules`; no Firebase Storage setup is needed. Local PHCode previews share data only within the same browser origin/profile. Real cross-device sharing uses the deployed Firebase app. One boss can be displayed at a time, and the boss does not join initiative. See `CHANGELOG_V36_2.md` and `TEST_REPORT_V36_2.md`.

## Documents

- CHANGELOG_V36_2.md — boss encounter display and image upload.
- TEST_REPORT_V36_2.md — verified tests and acceptance checklist.
- CHANGELOG_V35.md — changes and fixes.
- ARCHITECTURE_V35.md — audit, dependency map, state boundaries, and implementation choices.
- TEST_REPORT_V35.md — actual automated and visual checks, blocked checks, acceptance checklist.
- SETUP_V35.md — PHCode, Firebase, deployment, upgrade, and rollback.
- KNOWN_LIMITATIONS_V35.md — remaining practical limitations.
- docs/history/ — unmodified earlier release documentation; not V35 test evidence.

`npm test` runs the dependency-free Node regression suites. `python3 tests/static-audit.py` checks packaging. Browser harnesses are provided under tests/browser/ and require Playwright; see their README.


## Jeanette Legendary Action

V37.3 includes Jeanette’s Lunar Eclipse cinematic, spinning film reels, and a temporary theme with a bell fade-out. See [LUNAR_ECLIPSE_V37_3_GUIDE.md](LUNAR_ECLIPSE_V37_3_GUIDE.md).


## Alexandria — Queen's Gambit (V37.9 visual polish)
Select **Alexandria** in phone mode and press Legendary Action; the DM can also test from Cue Studio. The opening chess cinematic uses the supplied queen, ribbon, vines, chessboard and SFX, and leaves a small **DECOY ACTIVE** marker until toggled off. No custom full-body portrait or music track is needed for this base version. Music can be installed in a later update. This is a visual/broadcast status effect, not an automatic rule or invisibility engine; the DM adjudicates the actual ability and 0-HP trigger.


## V38.0 notes
- Queen's Gambit thorn layer expanded to fill the stage more fully.
- Red cloth now drops beside the pillars instead of sweeping across the center.
- While Queen's Gambit is active, UI chrome shifts into a red/white state until the action is cleared.


## V38.1 notes
- Queen's Gambit now preserves the Persona-style cut-in/flash screen instead of suppressing it.
- The Queen cut-in is styled in red/white and uses a chess-queen mark.
- Queen's Gambit pushes the general UI farther into a red/white state while active.
- Legendary script cache-buster updated to `v=38.1`.


## V38.2 notes
- Queen's Gambit cut-in now uses Alexandria's supplied portrait instead of the white queen piece.
- Queen's Gambit no longer follows the darker UI treatment; it now forces a stronger white/red interface state while active.
- Legendary cache-busters updated to `v=38.2`.


## V38.3 — Queen's Gambit music + both Legendary Action song loops
- Alexandria / Queen's Gambit now plays the user-supplied **A Dramatic Irony** after the opening SFX (~5.65 s from activation). The supplied 112.8-second score loops automatically while the action stays active.
- Jeanette / Lunar Eclipse keeps the six-second bell hold, gradual fade, and brief pause before her instrumental starts. Her instrumental also loops until Lunar Eclipse ends.
- Starting either action holds existing YouTube music; ending it stops Legendary audio and restores YouTube only if it was previously playing.
- Both scores support replay when reactivated, and the Queen score catches up to a synced late-joining TV using the action timestamp.
- Verify audio on a browser/TV after using its audio-unlock control; browsers may block uninitiated playback.


## V38.6 IMPORTANT
Run `OPEN_FIREBASE_RULES.bat` in the install package and publish `firestore.rules` in Firebase Console. Without this one-time step, direct Legendary Action sync from phones cannot work.


## V38.7 — Legendary Action visual refinement

- Queen’s Gambit thorns now enter from the sides and canopy then remain over the entire scene until the LA is explicitly ended.
- Queen’s Gambit uses white/red UI styling instead of a global grayscale/brightness filter.
- Asya’s display name: **CHANNEL 0: DEAD AIR**. Description: **The upcoming 60 seconds of time are erased.**
- New interrupted-transmission / missing-frame motifs emphasize the time-skip concept; Asya’s full invert effect and looping Blood Drain theme remain in place.
- Firebase action keys are unchanged so the V38.6 security rules and cross-device sync remain compatible.
