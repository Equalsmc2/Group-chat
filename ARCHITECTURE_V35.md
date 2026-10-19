# V35 architecture and source audit

## Audit and implementation sequence

The attached V34 archive was extracted as the baseline. Source inspection covered the HTML shell, all application modules, CSS layers, asset references, rules, prior architecture notes, and existing tests before changes. The plan was: preserve state owners; isolate local transport; correct event/animation defects; recompose the shell and director workflow; extend cue rendering; run two-client and responsive QA; package the unchanged feature set with new release documentation.

## Ownership and dependencies

| System | Owner | Dependencies / state |
|---|---|---|
| Transport / trusted identity | firebase.js, firebaseTransport.js | Production uses original Firebase 10.8.1 modules and config; local previews select a no-cloud adapter |
| Chat | js.js | messages collection; existing local chat cache/channel; hidden messages defer DOM insertion |
| Desktop loader | desktopApps.js | Lazy desktop modules; phone boot does not load combat/music/Stage/director |
| Shell and combat | combat.js | combatState/party; serialized pending-write queue; local revision; private notes in dmState/combatNotes |
| Session broadcast | sessionDirector.js, sessionCore.js | sessionState/main; scene, blackout, overlay, audio, SFX; local session channel; device heartbeats |
| Persistent presentation | stage.js | stageState/main; normalized cue state and local Stage channel |
| Director | dmControl.js | Existing public APIs; private reusable cue queue in dmState/presentation; device subscription |
| Music | musicPlayer.js | One YouTube player; musicLibrary; local track cache; music card moves between Terminal and Combat |
| Cinematic effects | sfx.js | 26 cues; pooled Audio elements; cooldowns, preview opt-in, volume hierarchy and ducking |
| UI composition | experience.js, act3-v35.css | Existing DOM nodes/IDs retained and moved; no extra Firebase subscriptions or media engines |
| Atmosphere / intro | bannerMotion.js, sacredMotion.js, sceneWeather.js, actTransition.js | View/visibility lifecycle; nonblocking skippable intro |

The main runtime direction is director action → owning state API → Firebase or local channel → normalized client state → view-specific renderer → optional fresh, deduplicated presentation/SFX.

## Audit findings addressed

V34 had overlapping CSS authorities, tiny director controls, hidden-view visualizer restart, zero-volume coercion, mismatched cue-type allowlists, replay-prone Stage rerenders, inaccessible clickable economy spans, a misleading local device placeholder, and a setup gate hiding the work surface. Real multi-client testing additionally exposed local combat storage echoes reverting rapid changes. All are addressed in V35.

No duplicate YouTube instance is introduced. Existing single realtime subscriptions remain guarded. The redesign moves the existing music card, never reconstructs its player. The new experience module owns composition and accessibility only. V35’s named CSS layer gives its important structural rules priority over unlayered legacy overrides; earlier styles remain to protect editor and effect behavior.

## State vs events

Combat and Stage are persistent state. Combat turns carry a serial, event ID and issue timestamp. Session overlays carry ID, active flag, kind, issue timestamp and duration. SFX carries ID, serial and timestamp. Seen-event caches are bounded and stored per tab. Stale overlays do not replay after reconnection; clearing and undoing do not resurrect an old overlay. Stage snapshots update the screen but identical deliveries do not repeat entry animation.

Local combat state adds a monotonic `localRevision` field. Receiving clients ignore older/equal revisions and do not write received state back to storage. Legacy local state without that field normalizes to zero and advances on the next edit. Private local notes use a separate key; TV code does not subscribe to or render them.

## Runtime / security boundaries

Normal desktop is trusted and anonymously enrolls its role in production. TV uses a separate named Firebase app and in-memory identity, does not enroll, and cannot navigate to DM Control through the shell API. Phone entry does not enroll as a director. This remains trusted-table convenience, not hostile-user authentication.

Realtime state stays alive while inactive views stop rendering. The visualizer runs only in Terminal/Combat while visible and motion is allowed. Expensive weather/ambient work remains scoped to Terminal. Audio playback continues across views. Back-forward-cache restoration reloads the page to recreate subscriptions that were released on pagehide.

## Firestore expectations

Existing paths and rules are retained. The supplied rules allow trusted desktop enrollment, public reads by authenticated clients, director writes, DM-only documents, and owned device heartbeats. No indexes or backend functions were added. Production Firebase behavior still requires the real-device acceptance pass in TEST_REPORT_V35.md.
