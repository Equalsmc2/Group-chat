# V39.0 QA report

**Status: automated checks passed; browser/device acceptance pending.**

## Executed checks

| Check | Result |
|---|---|
| Supplied V38.7 baseline suite | 80 tests passed |
| Updated suite | 85 tests passed, 0 failed, 0 skipped |
| Static audit | 212 unique HTML IDs; local HTML/CSS asset paths and module imports valid |
| JavaScript syntax | 58 JS/MJS files passed `node --check` |
| Media preservation | All 124 original assets match the baseline bytes |
| Source completeness | Every baseline file retained |
| Critical logic preservation | Firebase config/transport/rules, session core/director, combat, music player, Legendary Action controller/timeline unchanged |
| Installer review | Recursive copy, .git exclusion, robocopy error handling and SHA-256 verification retained; Windows execution not performed |

The five new tests execute motion/viewport code in a Node VM and workspace
composition against a minimal DOM fixture. They verify coalescing, cancellation,
reduced-motion handling, pinch-zoom fallback, preserved control ownership,
selected panels and keyboard navigation. They do not render a browser layout.
The existing suite includes local synchronization/state simulations and source
regressions; it is not evidence of a live Firebase end-to-end session.

## Screenshot review

Reviewed all ten supplied screenshots. Concrete findings addressed in source:
transparent sticky DM header over scrolled forms; four navigation columns for
five workspaces; gallery tracks shrinking below their image/label contents;
Queen's Gambit white-on-white label; eclipse ticker leaking into another action;
combat music title and portrait-label crowding.

Selected supplied screenshots are in `BEFORE_REFERENCE/`, labelled as references.
No new browser-rendered before/after comparison was produced. The supported
browser preview capability was unavailable in this environment, and the Sites
workflow prohibits substituting an improvised browser path in that situation.

## Resolution acceptance matrix

No resolution below was browser-rendered during this pass.

| Requested size | Implemented layout target | Browser status |
|---|---|---|
| 1920 × 1080 | Six combat columns; two-column DM | Not run |
| 1600 × 900 | Six combat columns; two-column DM | Not run |
| 1366 × 768 | Three combat columns/two rows; compact sidebar | Not run |
| 1280 × 720 | Three combat columns/two rows; compact sidebar | Not run |
| 390 × 844 | Dedicated phone chat and LA controls | Not run |
| 360 × 800 | Dedicated phone chat and LA controls | Not run |

Very dense status/resource lists may require scrolling, especially in compact
TV cards. Visibility of every possible saved-session combination is not certified.
No FPS, GPU-load or real-phone keyboard performance measurement was made.

## Required acceptance on the installed site

Use a test session before a live game. Keep another client open to confirm sync.

1. At every desktop size above, open Terminal, Combat, Stage and DM Control.
   Confirm no horizontal page scroll, clipped controls or inaccessible buttons.
   Scroll DM Control fully; verify its header does not cover forms.
2. Open Scene Lab, Encounter, Sound Desk, Cue Studio and Session. Switch using
   both the mouse and keyboard. Verify all original controls remain available.
   Confirm the Sound Deck's enabled/volume/cue controls work inside Sound Desk.
3. In Scene Lab, select several images; verify thumbnails and labels fit.
   Assign backgrounds to each scene; check preview and TV presentation.
4. Switch Day/Night and clear/rain/snow/leaves. Check contrast, Motion Off and
   the OS reduced-motion preference; quickly switch views several times.
5. Populate all six combat cards with realistic HP, temporary HP, statuses,
   spell slots, concentration and resources. Start/advance/end turns and edit
   values. Add a boss with a long name. Repeat in TV mode and fullscreen.
6. Put a long headline/body and then an illustration on Stage. Verify the
   image, caption, character portrait and footer remain readable.
7. On actual 390px and 360px phones, choose each character, send long messages,
   open/dismiss the keyboard and rotate the phone. Confirm the composer and
   Legendary Action controls are reachable and no focus zoom occurs.
8. Jeanette full action: check cut-in, moon, bells, reels, grayscale, intro
   audio and looping theme. Wait beyond the opening, then cancel manually.
   Confirm ordinary music restores across desktop/TV.
9. Alexandria full action: confirm readable flash-card label, persistent
   full-screen thorns, pillars/fabric, red/white UI without global grayscale,
   looping theme and manual cancellation. Check no Jeanette ticker appears.
10. Asya full action: verify CHANNEL 0: DEAD AIR, exact public description,
    persistent inversion, static and looping Blood Drain until cancellation.
    Verify Short is brief and does not cancel a full action incorrectly.
11. Trigger actions from a phone while observing desktop and TV; test a late
    joining client, reconnect, cancellation and normal-music restoration.
12. Run the Windows installer against your GitHub Desktop checkout. Confirm
    SHA-256 verification succeeds, then commit/push. Verify GitHub Pages
    loads `index.html` at the website root and relative assets load normally.

## Reproducing automated checks

From `WEBSITE/`, with Node and Python installed:

```sh
npm test
python tests/static-audit.py
```

Older versioned reports and browser test scripts are retained for provenance.
They are not reports of V39 browser tests. Current results are recorded here
and in `QA_EVIDENCE/automated-tests.txt`.
