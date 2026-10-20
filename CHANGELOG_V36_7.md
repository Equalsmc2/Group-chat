# Soul Seekers — Act III / V36.7

## Fixed from V36.6

- Fixed malformed HTML head: V36.5's stylesheet link lacked a closing `>`, merging it with V36.6's stylesheet link and breaking stylesheet loading.
- Fixed browser caching of the main desktop/atmosphere script by updating cache-busting query strings.
- Replaced the tiny 260px sun/moon ray treatment with a full-screen SVG light field: an animated solar disc or silver crescent in the upper-right with rays extending toward the bottom of the screen.
- Corrected the CSS cascade: night overrides are placed inside the original `soulseekers35` layer so they can override old `!important` gold styles.
- Night palette now affects the active tab, sidebar identity, Terminal text accents, DM controls, Stage accents, Combat UI, inputs, and borders; day remains gold.
- Removed the duplicate sidebar sun/moon orb. The top-right celestial light is the only hero celestial ornament.
- Kept prior boss HP, weather effects, user Boston photos, TV compatibility, audio, phone messaging, and character systems.

## Limitations

- Live Firebase and physical TV multi-device operation still need on-device verification.
- Isolated-browser functional/rendering tests check styles and control behavior but do not run the full connected PHCode application.
