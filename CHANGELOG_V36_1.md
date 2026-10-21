# Soul Seekers — Act III / V36.1

**Approach:** Keep V35's clean navigation and V36's real-time and audio systems. Restore small, character-driven moments without rewriting the app.

## Fixed

- Character selection no longer treats the decorative `terminal-empty` element as a message. Only actual `.message` nodes with a sender are updated.
- Message-perspective switching now uses `classList.toggle` instead of resetting `className`; this preserves `message-failed`, animation, and other flags.
- Thread counts are calculated from valid direct message nodes, not presentation elements.

## Added / refined

- A desktop-only **current operator / personal frequency** strip immediately above the chat, using the six existing portrait assets (and a separate Observer seal).
- The strip responds to the selected sender, with each character's already-established turn dialogue used as optional flavor text.
- An asymmetric ACT III graphic, angled portrait mask, character-derived color accent, and subtle typographic hierarchy.
- Incoming messages receive a slightly stronger character-color boundary; the empty state picks up the active thread accent.
- Tactile sound-deck button feedback and a modest active-combatant portrait treatment on desktop, respecting reduced motion.
- Dependency-free regression tests for empty-state safety and message CSS-class preservation.

## Intentionally unchanged

- Message transport, Firebase configuration/rules, trusted tabletop mode, local BroadcastChannel sync, sender payloads, combat stats, DM turn order, music, SFX event routing, TV layouts, phone-only texting, Stage cues, and ACT III intro.
- No Map, Veil mode, or email/password sign-in introduced.

## Local previews

- Director/desktop: `index.html?phcodeLivePreview=true`
- Player TV: `index.html?phcodeLivePreview=true&tv=1`

See `TEST_REPORT_V36_1.md` for verification scope and limitations.
