# Soul Seekers v29 architecture

## Design principle

Soul Seekers is now two synchronized applications sharing one codebase:

- **DM laptop:** private director/control surface.
- **Player TV:** read-only cinematic presentation client.

The shared database carries small authoritative state documents. Expensive visuals are local and event-driven.

## Module map

| Module | Responsibility | Background behavior |
| --- | --- | --- |
| `firebase.js` | Firebase app, Auth bootstrap, verified DM role | Always available |
| `sessionCore.js` | Pure scene/event normalization + dedupe helpers | No DOM/network |
| `sessionDirector.js` | Broadcast scene, overlays, audio cues, device heartbeats, TV mode | Firestore session listener stays live |
| `combat.js` | Existing combat model/UI, realtime party state, turn events | Combat state listener stays live; hidden combat rendering is minimized |
| `stage.js` | Persistent public Stage composition | Stage state listener stays live |
| `dmControl.js` | Private DM director UI | Private listeners start only after DM role verification |
| `musicPlayer.js` | Single YouTube player, library, shared player card/visualizer | Audio may continue intentionally; canvas stops outside Terminal/Combat |
| `js.js` | Shared chat/messages | Realtime listener stays live; hidden DOM rendering is deferred |
| `bannerMotion.js` | Terminal banner motion | Loaded lazily and active only on Terminal |
| `sacredMotion.js` | Terminal ambient symbols | Loaded lazily and active only on Terminal |
| `sceneWeather.js` | Terminal day/night/weather canvas | Loaded lazily and active only on Terminal |
| `desktopApps.js` | Desktop feature loader | Loads only needed visual modules |
| `actTransition.js` | ACT II → ACT III title sequence | One-shot only |

## Public vs private Firestore state

Public/player-facing state:
- `combatState/party`
- `sessionState/main`
- `stageState/main`
- `musicLibrary/*`
- `messages/*`

Private DM state:
- `dmState/combatNotes`
- `dmState/presentation`

Authorization state:
- `roles/{uid}`

Operational telemetry:
- `sessionDevices/{clientId}` (DM-readable; each device writes only its own validated heartbeat; rules restrict accepted fields/types/lengths)


## Combat write resilience

Combat reads remain realtime on every desktop view, but DM writes use a **single coalescing writer** rather than launching overlapping Firestore writes. The newest local combat snapshot is cached in `localStorage` until Firestore acknowledges it. If the laptop goes offline, later edits replace the queued snapshot; reconnect publishes the newest state. An older acknowledgement cannot clear a newer pending edit, and a failed write is not retry-spammed.

## Broadcast event model

Persistent state and temporary events are intentionally different:

- The current player-facing scene is persistent (`broadcast.scene`). A reconnecting TV immediately restores it.
- Temporary overlays carry a unique event ID, issue time, and duration. Clients keep a bounded seen-ID set and ignore stale events after reconnect.
- Scene and audio changes have serial counters so a client can distinguish a new command from unchanged state.
- The TV never needs to poll or infer what the DM is doing.

## Performance model

Essential realtime listeners remain connected so hidden tabs do not become stale. Render-heavy work is view-owned:

- weather and ambient Terminal loops stop outside Terminal;
- visualizer canvas runs only where it is actually displayed (Terminal/Combat);
- Stage and DM CONTROL do not keep invisible visualizers running;
- Map/Leaflet is removed completely;
- transitions use transform/opacity rather than layout-thrashing effects;
- reduced-motion disables nonessential motion.

## Security model

A selected character name is never an authorization mechanism. DM writes require a Firebase-authenticated account whose UID has `roles/{uid}.dm == true`. Private DM documents are server-rule protected. Player/TV clients cannot read them even if they manually inspect or alter page CSS.

TV mode initializes a separate named Firebase app using **in-memory anonymous Auth**. This prevents a TV window opened from the DM browser from inheriting the DM's persistent Firebase Auth session. The server-side rules remain the final authorization boundary.
