# Soul Seekers V40.12 — Neon Breakcore + Private Short Dead Air

## Full Dead Air
- Dramatic 4.8-second neon-blue and hot-pink intro: broken speedlines, frame loss, shredded portrait reveal, transmission artifacts, and site displacement.
- Retains existing sound timing and three user-provided time-skip sounds, plus the persistent inverted world afterward.
- The full action explicitly reveals Asya and the Dead Air cinematic; this is intended for the full activation only.

## Short Dead Air (kept secret)
- Precisely 500 milliseconds of abstract neon blue/pink frame corruption plus existing two-part deterministic glitch.
- **No Asya picture, portrait fragment, character name, ability title, description, or mechanical clue is rendered.**
- Clears any portrait/title/caption data from the shared visual cinematic elements during the burst; no visual lingering or changed audio.
- Works on DM, TV, and phone via the existing shared activation event; no extra sounds or network calls.
- The website's underlying Firestore session record still contains a recognizable internal action key and character ID, so this protects the on-screen reveal, not against users deliberately inspecting developer tools or raw Firebase data. Truly private action metadata would need a larger permission model change.

## Technical
- Reuses original website sound libraries; no new image/audio downloads.
- Edited the current V40.11 experimental effect because it had inadvertently shown Asya's portrait during SHORT.
- `TEST_ASYA_BREAKCORE.html` provides a visual-only browser preview. Load over a local web server.
