# Soul Seekers V39.0 — UI refinement candidate

Based on the supplied V38.7 complete website. No framework, new backend,
new session controller, or replacement artwork was introduced.

## DM Control

- Corrected the original sticky-header rule so the header stays in document
  flow instead of covering the monitor and forms while scrolling.
- Made the dashboard non-shrinking inside its scroll container.
- Reorganized existing DOM nodes: monitor on the left; five-workspace
  navigation, broadcast controls and selected workspace on the right.
- Moved the existing Sound Deck into Sound Desk. Existing element IDs,
  controls and event handlers survive the move.
- Added tab/tabpanel associations, selected states, one keyboard tab stop,
  Left/Right navigation and Home/End support to workspaces.
- Corrected the four-column rule for five workspace buttons.
- Removed minimum-width traps from broadcast and audio grids.
- Gave background-picker rows minimum content height, non-shrinking images,
  readable labels, and contained category text.
- Adjusted monitor typography and narrow-window layout; larger DM buttons
  use a shared 44px control-height token.

## Terminal, Combat and Stage

- Added consistent interior chat padding and wrapping headers.
- Removed the music column's unnecessary 300px minimum row height.
- Added compact desktop combat arrangements: three columns at up to 1450px,
  two columns at up to 1100px, with side-by-side portraits and data.
- Compact TVs use three columns/two rows; wider TVs retain six columns.
- Constrained portrait names and moved active badges below initiative badges.
- Improved editor label sizing and responsive status-control grids.
- Bounded Stage text within the scene, improved title line height and reduced
  maximum TV title size; illustration mode and supplied scenery are retained.
- Music titles in the combat dock truncate rather than displacing controls.
- Short-screen sidebar sizing keeps navigation and atmosphere controls reachable.

## Phone and motion

- VisualViewport resize handling adjusts phone height for a soft keyboard;
  repeated resize events coalesce into one frame. Pinch zoom does not lock height.
- Safe-area padding and 16px character selectors support phone use.
- Navigation entrances move in the direction of the selected tab, with a
  single cancellable animation-frame request and timeout.
- Rapid tab switching, page hiding and reduced-motion changes cancel stale
  entrance effects. No new continuous animation loop was added.
- Motion Off settles ordinary interface animation rather than freezing it
  midway through an entrance. Legendary Action state is unaffected.

## Legendary Actions

- Fixed a specificity conflict that could make Alexandria's kicker white on white.
- Removed the white slash behind white Queen's Gambit copy for clearer reading.
- Suppressed Jeanette's eclipse ticker during Queen's Gambit and Dead Air.
- Added wrapping to flash-card titles and descriptions.
- Persistent thorns, white/red theme, eclipse bells/reels, Asya inversion,
  short/full variants, loop themes and cancellation remain in the original code.

## Engineering and package

- Edited existing owning stylesheets; no extra override stylesheet was loaded.
- Updated cache-busters for changed sources and added five behavior tests.
- Four older tests now accept updated cache versions while retaining their
  stylesheet-order, effect and controller assertions.
- Kept all 124 baseline assets byte-for-byte, and retained every baseline file.
- Firebase files/rules, session core/director, combat logic, audio player,
  Legendary Action logic and timeline are byte-identical to V38.7.
- Complete installer retained with V39 labels and SHA-256 verification.

These are implementation changes, not measured frame-rate improvements or
certification of pixel-perfect layouts. See the QA report for verification limits.
