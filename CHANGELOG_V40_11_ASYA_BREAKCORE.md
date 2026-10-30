# V40.11 Asya Dead Air — Neon Breakcore Intro

This is a visual patch on top of the cleaned V40.10 website. Existing action keys, Firestore state, combat monitor, other Legendary Actions and the three user-selected time skip recordings are unchanged.

## Full Dead Air
- A more dramatic 4.8-second entrance: cyan/pink transmission impact, radial shredded speedlines, corrupted frame strips, and multiple copies of Asya's existing portrait drifting out of alignment.
- The actual website briefly jumps and loses temporal slices before returning to its original geometry; the existing sustained Dead Air world inversion remains.
- The entrance transitions into the original low-distraction persistent state instead of leaving permanent full-screen noise.
- The existing shared activation timestamp drives the animation offset for viewers joining late, with no additional Firebase data.

## Short Dead Air
- A brief fragmented-portrait ghost appears amid the existing paired structural/signal glitch, with bright blue and pink highlights.
- The new fragment is strictly tied to the existing 500ms burst class; it cannot linger after the class is cleared.
- No title card, no duplicated sound, no new trigger.

## Compatibility & verification
- The new presentation CSS is appended to the last existing stylesheet to retain exactly seven production stylesheet links.
- Full and short cinematics reuse the existing bundled `asya-cutin.jpg`; no third-party image fetching or extra binary assets.
- The web build stamp remains V40.10 for compatibility with version-locked integration checks; the contents are this V40.11 visual patch.
- Automated Node regression suite: 130/130 passing after changes.
- Chromium executable could not produce even a blank-page screenshot in this environment. Live TV, phone and Firebase end-to-end audiovisual tests are **not** verified here.

Open `TEST_ASYA_BREAKCORE.html` from a locally served copy of WEBSITE to see local FULL and SHORT visual previews without Firebase. Avoid relying on browser autoplay for audio previews; the preview intentionally has no sound.
