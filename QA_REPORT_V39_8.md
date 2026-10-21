# V39.8 — Queen's Gambit layout QA

- Based on two user screenshots showing the V39.7 version stamp; V39.7 really was deployed but the cut-in card covered the chess piece and the slash hit too low.
- Redesigned cut-in / piece composition, retaining the existing animation synchronization timing and audio.
- Rendered static isolated browser fixtures in Chromium at **1600 × 900 (TV layout)** and **390 × 844 (mobile)** with full background, queen, and portrait imagery. The cut-in card no longer covers the queen; the slash crosses the queen, rather than the bottom of its base.
- This is a **browser visual fixture**, not an end-to-end live Firebase test.
- Verified existing automated regression suite and referenced static assets.
- V39.8 is an entire website ZIP with a Windows GitHub Desktop installer and a verifiable SS / V39.8 on-screen build stamp.

After deployment, activate Alexandria on both phone and TV and confirm their real-time sync still behaves normally. No Firestore changes are necessary.
