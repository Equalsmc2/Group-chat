# Soul Seekers v33 — Full Act III Interface Reinvention

## Visual / UX

- Added a final `act3-v33.css` authority layer covering every desktop-facing view.
- Centralized the dark/gold visual system and removed legacy red as a general UI accent.
- Rebuilt the main tab/navigation strip so Terminal, Combat, The Stage, DM Control, atmosphere controls, and TV control no longer fight for the same narrow space.
- Reworked typography, hierarchy, spacing, panel silhouettes, gold editorial strokes, focus states, and motion primitives.
- Added responsive layouts for narrower laptops and short-height displays.
- Preserved reduced-motion behavior.

## Terminal

- Stronger editorial header and hierarchy.
- Larger primary chat working area.
- Stage preview and music become deliberate secondary presentation surfaces rather than generic cards.
- Input and character selection remain functional and readable.

## Combat

- Full-width theatrical combat header and initiative order.
- Six-character 3×2 board retained on normal TV-sized desktop layouts.
- Existing HP, temp HP, death saves, AC, speed, passive perception, conditions, concentration, spell slots, custom resources, turn economy, editing, history/undo, rest tools, and turn-order controls preserved.
- Active-turn styling and turn-splash presentation brought into the dark/gold system.
- Combat music dock remains visible.

## The Stage

- Reworked as a full cinematic presentation canvas with oversized editorial typography and restrained idle state.
- Existing chapter/location/dialogue/announcement/revelation/boss/illustration presentation data preserved.

## DM Control

- The real director dashboard is now visible in PHCode immediately rather than being replaced by a giant Firebase setup gate.
- Broadcast Director is the lead workspace.
- Combat, Audio, Presentation, and Session sections are arranged as progressive-disclosure director panels.
- Buttons and controls wrap instead of clipping off-screen.
- Existing director shortcuts and broadcast operations preserved.

## PHCode local two-window testing

- Normal localhost/PHCode desktop preview is locally trusted as a director.
- `?tv=1` remains a separate player-display client.
- Added same-origin `BroadcastChannel`/`localStorage` fallback sync for:
  - broadcast scene / blackout / overlays / audio session state,
  - Stage state,
  - Combat state and turn events,
  - Chat messages.
- Firebase is still used when available and remains required for real cross-device play.

## Files / architecture

- No Map/Leaflet feature restored.
- No Veil mode restored.
- Existing Firebase, music, chat, combat, Stage, and player portraits preserved.
- The redesign is an additive authority layer rather than a destructive rewrite of all working application logic.
