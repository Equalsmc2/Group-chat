# SOUL SEEKERS V39.3 — TV Mode Legendary Action Fix

## Changes
- CSS is now loaded with a new `v=39.3` cache key so TVs do not reuse V39.1 styling.
- Queen's Gambit has separate landscape TV framing: chess piece left, large title right, slash over both.
- The improved slash stays intact, and the full-screen vines settle to 18% opacity while the LA remains active.
- The TV client uses the explicit `?tv=1` mode even if other modules temporarily change `tv-device` styling.
- Legendary Action presentation is reapplied when the Firebase authentication role updates.

## Validation
- `npm test`: 86 / 86 passing
- Static asset/import audit: passed (212 unique HTML IDs)
- Static verification of TV breakpoint, cache versions, and action-state handlers: passed
- Visual browser preview was attempted but blocked by the browser environment; live TV rendering and Firebase synchronization still require device testing.

## Deploy
Extract ZIP, run `INSTALL_FULL_WEBSITE.bat` to install all website files into your GitHub Desktop repository, then commit/push. Reload the TV page with Ctrl+Shift+R, or close and reopen the `?tv=1` page to refresh the CSS.

No Firebase rule changes are needed for this patch.
