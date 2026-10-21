# Soul Seekers v33 — Test report

## Checks performed

### Source / syntax

- All project JavaScript files were checked with `node --check`.
- CSS was parsed for syntax errors and brace balance.
- HTML IDs were checked for duplicates.
- Local CSS/JS/image references in `index.html` were checked for missing files.
- Final ZIP archives were integrity-tested after packaging.

### Static Chromium visual QA

Because this environment blocks direct localhost/file navigation, desktop visual QA was performed with system Chromium using Playwright `page.setContent()` and inlined project CSS/fixture content.

The following views were inspected at a 1536×960 desktop-sized viewport:

- Terminal
- Combat
- The Stage
- DM Control

Observed/fixed during this pass:

- all four desktop tab buttons remain visible,
- TV control remains visible,
- DM Control buttons no longer disappear behind the old auth gate,
- DM director panels wrap rather than clipping horizontally,
- six Combat cards fit in a 3×2 board at the QA viewport,
- the new dark/gold hierarchy is consistent across all four views.

### Simulation tests

The bundled project tests were executed with Node and passed:

- `tests/session-core.test.mjs`
- `tests/multiclient-sim.test.mjs`
- `tests/combat-queue-sim.test.mjs`
- `tests/combat-turn-event-sim.test.mjs`

### Local synchronization architecture

The v33 local-preview fallback code was syntax-checked for Session, Combat, Stage, and Chat synchronization through `BroadcastChannel`/`localStorage` while preserving Firebase paths for production.

## Not performed / still requires user environment

- No claim is made that a real two-physical-device Firebase session passed in this environment.
- No claim is made that the user's production Firestore rules/auth settings are currently correct.
- Firefox runtime testing was not available in this environment.
- YouTube behavior still depends on browser/network/embed permissions.

Use `PHCODE_TESTING_V33.md` for same-computer testing, then perform one real DM-laptop + TV acceptance test after Firebase is enabled and the build is deployed.
