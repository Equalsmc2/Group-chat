# V25 — Atmosphere and polish

## Accent colors

Observer follows the latest chat sender. When you select Max, Jeanette, Magnus,
Asya, Alexandria, or Fitz, the interface and formerly red accents stay in that
character's color regardless of who messages next. Message colors still identify
their individual senders. An empty conversation starts in Observer gold.

## Weather and visual improvements

- Rain has varied depth, wind, highlighted streaks, and small ground splashes.
- Snow drifts at different speeds with a few larger crystalline foreground flakes.
- Weather covers the entire viewport, including phones and the DM dialog, without
  intercepting clicks, scrolling, or typing. Modern browsers use the top layer;
  older browsers fall back to an overlay above the main page.
- The DM panel includes a local Visual effects switch, connected to desktop Motion.
  Reduced motion and hidden tabs stop the animation. Clear skies clear the canvas.
- Particle counts and pixel density are capped; weather runs at approximately
  30 frames per second. Phones use fewer particles.
- Improved focus rings, button feedback, error contrast, message surfaces,
  music status readability, and mobile panel spacing.

The Persona-inspired sacred identity, sun/moon, four high-resolution Boston
scenes, and one-screen desktop layout remain. Chat history and the phone DM panel
can scroll internally. Backgrounds rotate every 20 seconds with Motion on.
The arrow beside the location changes the image only on the current screen.
Artwork information is in ARTWORK.md.

## Phone DM remote

1. Extract the full folder and run START_SITE.bat, or host these files on your usual website.
2. Open the updated website on your phone. Tap **DM** at the top-left.
3. Choose day/night, clear/rain/snow, a saved song, or paste a YouTube link. Play,
   pause, next, and loop control the shared room. Changes save immediately;
   wait for **Live · shared with everyone** before making the next change.
4. Open this same updated version on the other screens. They subscribe to the
   shared room automatically. Older V20 pages need to be replaced/refreshed.

## One-time Firebase setup

This package uses your existing Firebase project and default database. It adds
one document: `campaignState/main`. If DM says sync is blocked, add the scoped
block in FIRESTORE_SESSION_RULES.txt to the existing Firestore rules and publish
them. Do not replace the existing chat/music rules. Then tap Retry connection.
The first successful control change creates the room document.

The database edition and deployed rules could not be inspected here because
the Firebase CLI/account connection was unavailable. No production data or
rules were changed. Cross-browser synchronization was tested with a simulated
Firestore service; live synchronization depends on your deployed rules.

## What changes for players

- Phones keep the full-screen chat. The DM dialog scrolls, supports keyboard
  navigation/Escape, and closes back to chat without losing messages.
- Phones act as silent remotes, avoiding extra music from every player's phone.
- Desktop screens receive the selected song, play/pause, loop, day, and weather.
- A new visitor receives the current shared settings. Loading the site never
  overwrites the room with that visitor's local preferences.
- A browser may require its listener to click PLAY once before sound is allowed.
  YouTube embedding restrictions still apply. Playback positions are approximate,
  not sample-accurate audio synchronization. With loop off, a finished song stops;
  tap Next to choose the next shared song.
- Scene-photo rotation and animation preferences remain local. The shared time
  and weather still match across screens.
- Lost connections and failed saves are shown clearly. Offline commands are not
  queued to unexpectedly overwrite the room later.

The existing site has no login: anyone with site access can use DM controls.
This is a convenience remote, not a protected administrator account.

## Hosting

Upload the entire updated folder to the same host you normally use. To test on a
phone over your home Wi-Fi, start a server from this folder with
`py -3 -m http.server 8000 --bind 0.0.0.0` and use the computer's LAN address with
port 8000. The normal launcher only allows this computer; localhost on the phone
refers to the phone itself. Windows may ask you to allow access on your private network.
Your existing QR image is unchanged; it will point to the new version only after
you replace the files at its existing destination.

Implementation uses Firestore realtime listeners because connected screens must
receive changes automatically. Reference: https://firebase.google.com/docs/firestore/query-data/listen


