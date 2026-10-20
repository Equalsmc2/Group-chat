# Soul Seekers v37.2 — Legendary Action Broadcast (Jeanette pass 1)

## Added
- New phone-only **Legendary Action** trigger button under chat input.
- First implemented action: **Jeanette — Lunar Eclipse**.
- New cinematic full-screen cut-in with portrait, moon motif, film-strip styling, and overlay treatment.
- Player-display world-state effect: monochrome / magic-eclipsed presentation while the action is active.
- Toggle behavior: pressing the same Legendary Action again ends the effect.
- DM-side mirror trigger inside the Presentation Director panel for testing.
- Phone-to-DM relay path for Legendary Action requests using a new `legendaryRequests` Firestore collection.

## Changed
- Session state schema now includes a `legendary` branch.
- Session director API now exposes `activateLegendary`, `clearLegendary`, `toggleLegendary`, and `requestLegendary`.
- Desktop loader now imports `sessionDirector.js?v=37.2` so all clients share the same session module instance.
- Top rail build label updated to **V37.2**.

## Assets
- Added Jeanette Lunar Eclipse art / audio bundle under `assets/legendary/jeanette/`.

## Notes
- Theme song support is not wired yet; current build uses the provided SFX assets for the cinematic.
- Architecture is now set up so the other player Legendary Actions can be added as new registry entries instead of custom one-off code.
