# SOUL SEEKERS — V36.5 polish QA

## Verification performed

- All bundled Node regression tests passed (24/24), including new V36.5 coverage.
- JavaScript source syntax validation passed.
- DOM/CSS isolated browser render tested at 1600 × 900 for day and night; verified sidebar remained dark, celestial beacon is visible, and day/weather glyphs are no longer forcibly hidden.
- An isolated browser interaction test clicked all weather states (Clear, Rain, Snow, Leaves), changed day/night, and simulated all four desktop views. No script errors were captured in that limited fixture.
- All referenced static CSS, scripts, and file assets checked for existence.
- GitHub Pages archive is flat with index.html at the ZIP root.

## Not verified

- Complete multi-module runtime under PHCode (local file/localhost navigation restrictions in this test environment).
- Real Firestore write/read between physical devices, cross-device day/night atmosphere, TV audio, browser-specific graphics acceleration, and YouTube iframe playback.
- Weather selection remains client-local, as in prior versions. The update changes which desktop views display that client's weather; it does not make weather a Firebase broadcast control.
