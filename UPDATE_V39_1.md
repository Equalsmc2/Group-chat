# V39.1 — Queen’s Gambit fullscreen vines

Replaced the visible tiled/mirrored brambles with the single generated transparent
PNG approved in this conversation: assets/legendary/alexandria/queens-gambit-vines-fullscreen.png.
The PNG is 1672 × 941 RGBA (approximately 16:9). One centered, non-repeating
cover layer fills the screen, preserving image proportions. Different aspect
ratios, including portrait phones, crop centrally rather than stretch.

The old left/right vine layers are hidden and their animations disabled.
Additional canopy pseudo-elements are removed. The single image fades in
with the existing entrance timing and remains at its final opacity until
manual cancellation through the existing synchronized controller.
Reduced-motion mode shows the final image without animation.

White/red UI, cut-in, pillars/fabric, theme audio, and all action controllers
are unchanged from V39.0. No Firebase rule or session-state changes.

Validation: 85 automated tests passed; static audit passed with 212 unique
HTML IDs and valid local assets/imports. PNG alpha channel confirmed.
Browser visual QA and real-device synchronization were not rerun because
browser preview remains unavailable. See QA_REPORT_V39.md for outstanding
acceptance checks; that report documents the earlier broad refinement pass.

Install: extract the entire archive, run INSTALL_FULL_WEBSITE.bat, select your
GitHub Desktop repository, then commit/push and hard-refresh after deployment.
