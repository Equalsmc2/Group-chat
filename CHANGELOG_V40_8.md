# Soul Seekers V40.8 — Dead Air: Paired Reality Glitches

- Fixed a mode gap: Asya SHORT now visibly affects the DM computer as well as normal phone and TV clients.
- Effects render onto the real .site-shell and a separate fullscreen overlay, above the TV Stage and Combat interface.
- Every quick trigger selects one of eight structural disruptions (flip, mirror, tear, zoom, roll, tilt, stutter, skew) and one of eight signal corruptions (pixel-blocks, chroma, solarize, posterize, macroblock, scanline, ghost, dropout). 64 combinations.
- Selections are derived deterministically from the already-synchronized activation ID and issued timestamp, so Firebase rules and data shape need not change.
- Each device runs the same combination for 500ms when it receives the event; the existing 1800ms delivery window remains so TVs can receive it.
- No text/title card is displayed for the short glitch; existing randomized Asya time-skip sounds are preserved.
- Added TEST_ASYA_EFFECTS.html for testing combinations locally or from GitHub Pages.
- Restored original website transform/filter at end; motion-reduction setting honored.
