# Soul Seekers V39.9 — Queen's Gambit full composition fix

- Source: complete V39.8 website, including every existing asset and installer.
- Corrected a persistent overlap: the cut-in card now lives in the **right** lane, the queen in the **left** lane. This is a visible split composition instead of another small positional nudge.
- Losslessly trimmed transparent empty margins from the original white-queen graphic into `assets/legendary/alexandria/white-queen-trimmed-v399.png` without altering the artwork, making the piece larger and fully visible.
- Timed the slash and a NEW impact burst to `reveal-strike.mp3` at 4.25 seconds (81.7% of 5.2s intro). The queen begins falling only after impact.
- Card now slides in from the right instead of passing over the queen.
- Preserved full-screen translucent vines, red/white mode, music, existing other LAs, and Firebase synchronization.
- `SS / V39.9` build badge and complete GitHub Desktop installer; both update and check the new version.

## Manual QA
After installation, launch Queen's Gambit on phone and TV. Verify the upper-right character card never covers the left-side queen and the slash crosses the upper body, followed by the queen falling. Verify the overlay remains until stopped and other LAs still function. Browser rendering was not live-verified in this environment.
