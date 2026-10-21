# Soul Seekers V38.7 — Legendary Action presentation refinement

## Alexandria — Queen's Gambit
- Added a large thorn canopy and enlarged, persistent brambles framing all four edges on desktop and phone.
- Preserved the five-second thorn entrance but changed its final animation frame to remain on screen until the LA is ended.
- Removed page-wide grayscale, brightness and saturation filtering for Queen's Gambit.
- Replaced UI colors using explicit white and crimson red styling including an override for existing V35 important rules.
- Kept the Alexandria flash card, columns, cloth, decoy marker, and theme intact.

## Asya — CHANNEL 0: DEAD AIR
- Renamed the displayed Legendary Action from CHANNEL Ø: UNAIRED to CHANNEL 0: DEAD AIR.
- New public description: **The upcoming 60 seconds of time are erased.**
- Added missing-frame/causal-splice streaks and strengthened red spectral ghosting using CSS only.
- Kept full invert until manually ended, looping Blood Drain, and separate instant/short static burst.
- Preserved internal `asya-channel-o-unaired` ID for backwards compatibility with V38.6 Firebase rules.

## Delivery
- Full website source and assets packaged with Windows `INSTALL_FULL_WEBSITE.bat` and SHA256 verification.
- No Firestore rules changes from V38.6.
