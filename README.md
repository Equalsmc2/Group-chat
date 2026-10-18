# Soul Seekers — Act III (v27)

This build introduces the permanent Act III dark painterly-fantasy interface, an ACT:2 → ACT:3 opening transition, and keeps the existing live Combat/TV performance rules from v24-v25.

# v24 Combat live-TV behavior

- Combat state listens to Firestore only while the Combat tab is active.
- Turn changes use `turnSerial` so every open Combat screen receives the same automatic portrait/dialog animation.
- HP and other character-state updates redraw live; HP changes get +/- popups and other changes pulse the affected card.
- Terminal-only systems (chat listener, weather, ambient ornament and map motion) suspend while Combat is active and resume when returning to Terminal.
- Music is now intentionally shared across both desktop tabs: YouTube playback, the compact visualizer and the music library remain live in Combat, and the same single player card moves into a low-profile Combat dock.
- The last desktop tab is remembered; TV mode can also be remembered locally.

# V21 — Live Combat Monitor

- Desktop now has **TERMINAL** and **COMBAT** tabs. Phones remain chat-only.
- COMBAT shows all six uploaded player portraits at once in a 3×2 TV-friendly grid: Magnus, Max, Jeanette, Asya, Alexandria and Fitz. Each card displays remaining/max HP, status effects and remaining/max spell slots.
- **Observer** is the editing mode. When Observer is selected, each card exposes an EDIT button for HP, conditions/custom statuses and spell slots. Other identities see the same board read-only.
- Combat state listens to Firestore document `combatState/party`, so multiple open computers/TVs update live. A localStorage fallback preserves edits in the current browser if Firestore is unavailable.
- See `FIRESTORE_COMBAT_RULES.txt` if the Combat tab reports that Firestore rules block access. Because the site has no authentication, Observer-only editing is a UI convention rather than secure authorization.
- Character portraits are packaged locally under `assets/characters/`.

---

# V20 — Phone chat + desktop QR

- On phones (720 CSS pixels or narrower, or short touch-screen landscape), the site displays ONLY the messaging app: conversation header, character selection, chat history, message field and SEND. The chat fills the visible screen and the messages scroll independently; dashboard, map, music player, weather controls, banner, desktop QR and decorative effects are hidden. Firebase chat still functions.
- When opened on a phone, the desktop atmosphere, weather, map and YouTube music modules are not initialized, reducing mobile bandwidth and CPU use. Desktop retains the original full functionality.
- On the desktop Boston banner, the QR image supplied by the user is displayed at the top-right. It is shipped locally in `assets/soul-seekers-qr.png` and is hidden on phones. QR content is unchanged.
- Launch as usual with START_SITE.bat. No Firebase configuration was changed.

---

## V19 — Visual polish and clutter cleanup

- One animated ring-and-cross in the Boston banner, one centered behind chat messages, and one quiet map sigil. Removed duplicate banner crosses, map wheels, badges, stamps, and footer symbol cluster. These are *decorative* changes; controls are unchanged.
- More breathing space in the music panel; the old-world track title no longer gets pushed behind its heading. On smaller/shorter desktop viewports, the card scrolls independently if necessary so saved songs and controls remain reachable.
- Kept six locally packaged Boston photo-based day/night scenes, automatic rotation, rain/snow and the Motion toggle. Preserved Observer-specific color logic, Firebase chat and song library, and music repeat setting.
- All active effects still use playback state/time, not measured YouTube frequencies. If YouTube says an owner blocked embedding, that track cannot play in the embedded player; use OPEN ON YOUTUBE.

## V18 - Centered message sigil and stronger time-of-day atmosphere

- One large, circular cross sigil is centered over the **scrollable chat message area**, not the text-entry field or chat header. It stays at the visual center while the chat scrolls and responds to playback-timed music pulses. The old input-box sigil, off-center chat sigil, corner watermark, and duplicate send-button plus have been removed.
- Day mode has a brighter Boston photo, sunlight halo, warm shafts of light and visible floating sacred details. Night uses a cooler, darker Boston scene, moonlike halo and subtler atmosphere. The six photo-based Boston banner assets and automatic image rotation are preserved. Each day/night click also advances to a different image in the selected set.
- Motion OFF and system reduced-motion preferences disable the new decorative animation. Music continues to use YouTube playback position rather than actual frequency analysis.
- Existing layout, Firebase chat and saved songs, controls, weather and Observer-only theme colors are unchanged.

# Soul Seekers — The Wounded Eternity · v15

This package is the complete Soul Seekers campaign site. The layout, chat, map, music player, text, controls and individual character message colors remain in place.

## Run

On Windows, extract the entire ZIP, open the `wounded-eternity` folder and double-click `START_SITE.bat`. Keep the server window open. Python 3 is required.

On macOS/Linux, use `START_SITE.sh` or run `python3 -m http.server 8000` from this folder and open `http://localhost:8000`.

## The two worlds

- **Veil mode has been removed in v27.** Act III is now the single permanent desktop visual language; there is no Open/Closed theme switch and no Veil transition script.
- Removed continuous animation of large multi-layer overlays; retained subtle halo/seal animation, with reduced-motion support.
- Historical chat messages insert in a batch and scroll once. New messages preserve your reading position if you have scrolled up.
- Music visualizer is limited to about 30 fps, caches its color gradient and pauses rendering in background tabs; reduced unnecessary glow work.
- Map starts at its intended zoom directly instead of flying through intermediate tile sets; tile filtering is no longer applied twice.
- Theme DOM writes are skipped when the relevant character/accent hasn't changed.

## Music library and audio-style player in v13

- The large YouTube video dock from v12 has been removed. The existing horizontal canvas is the **animated visualizer**; it stays put in the music card. The YouTube iframe is kept off-screen. **YouTube or your browser may block background/hidden playback**; there is no YouTube-supported, guaranteed invisible-audio-only player. If PLAY does not work, the player displays a status and **OPEN ON YOUTUBE ↗** opens that track directly. YouTube may also block embedding for individual videos.
- Every valid YouTube link or ID you enter with **LOAD** is added immediately to a **SAVED ♫** dropdown, deduplicated by video ID, and saved to browser localStorage. You can change tracks from the dropdown or with NEXT. No pasted link is needed again after it has been saved.
- The site tries to get a real **song title and channel name** from YouTube metadata via Noembed / oEmbed and the YouTube player. If lookup fails, you can click **RENAME** to enter a track name yourself.
- The same Firebase project as the chat is used for a new Firestore `musicLibrary` collection. The site tries to sync every saved track, including locally cached songs on connection, and listens for new tracks saved on other browsers. A successful cloud save is displayed as **Firebase synced**; if rules or the network reject a write it explicitly says **saved here / not in Firebase**. Press **SYNC** to retry when access has been configured.
- If the collection does not have suitable read/write rules, you must enable them in **Firebase Console → Firestore Database → Rules**; see `FIRESTORE_MUSIC_RULES.txt` for a scoped example and its security warning. **Do not replace your chat rules.** This ZIP cannot change your live Firebase settings.
- Links pasted into earlier website versions were not stored in Firebase or localStorage by those versions, so they cannot be restored automatically. The original built-in default track is retained and v13 saves links entered from now on.
- Always launch with `START_SITE.bat` or a real local web server, **not** by opening the HTML as a file. YouTube, Firestore and metadata lookup require internet access.

## v14 — The Living Sanctum / music-synced sacred imagery

- The existing Boston banner, seal rings and restrained sacred motifs remain part of the permanent Act III presentation.
- While YouTube reports **PLAYING**, the banner/map ornaments pulse with the existing decorative visualizer while Terminal is visible. Playback itself continues when switching to Combat or disabling decorative motion.
- **Technical limitation:** YouTube's embedded player provides its play/pause state and playback time, **not raw audio amplitudes** to website JavaScript. This is a **playback-timed musical animation**, not analysis of actual bass, drum hits or vocals. The visualizer was already a generated animation; no new video dock is added.
- The new **MOTION / ON** button turns ambient and reactive ornament motion on/off, remembering your preference in this browser when localStorage is available. OS reduced-motion settings are respected, and off-screen tabs pause decorative work. Actual music controls and chat remain usable.
- The shared Firebase song library, controls, text, Boston map and Observer-only character-theme behavior are unchanged. Only dedicated decorative layers receive music-pulse updates, capped to the canvas refresh rate, to avoid animating the whole page's gradients.

## Customize

- `themes.css`: retained legacy/shared theme scaffolding and performance adjustments; Act III is the only selectable presentation in v27.
- `css.css`: shared layout and foundational styles.
- `js.js`: chat and character colors. `refreshThemeState()` implements Observer vs selected-character accent behavior.
- `firebase.js`: single shared Firebase app and database connection.
- `musicPlayer.js`: saved Firebase/locally cached music library, YouTube controls, metadata lookup and ambient visualizer.
- `bostonMap.js`: Leaflet map.

The six day/night Boston images and the SVG artwork are packaged locally. Live Firebase chat, Leaflet map tiles, YouTube and Google Fonts require internet. The interactive map keeps its local illustration fallback. Firebase configuration has not changed.

## v15 — Day, night and weather

- **LOOP ON** is the default for music. At the end of a YouTube track, it loads that same track again; you can toggle **LOOP OFF** to let NEXT advance through saved songs instead. This is saved in your current browser, not Firebase. YouTube's own embed restrictions still apply.
- The **DAY / NIGHT** button switches between daylight and nighttime Boston. Each time mode has **three distinct, bundled Boston scenes** (morning, noon, golden hour; blue night, midnight, amber night). Scenes crossfade approximately every 13.5 seconds while MOTION is on. Day/night selection is remembered by this browser. On first visit it starts from the browser's local time (day from 7 a.m. to 7 p.m.).
- The **CLEAR → RAIN → SNOW** button cycles through clear skies, rainfall and snowfall in either day or night. Weather selection is remembered in this browser.
- Additional slow fog bands and drifting tiny sacred motifs give the banner movement even during clear weather; pre-existing halos, seals and music-linked animation remain.
- The six scenery images are packaged as local compressed `.webp` illustrations under `assets/`; no remote picture service is required. The city arrangement remains the same between the six illustrated time-of-day treatments. The separate interactive Leaflet Boston map is unchanged.
- Rain/snow draw to one pointer-transparent canvas at about 30 fps, capped in particle count and pixel ratio. They pause when the page is hidden, MOTION is OFF, or reduced-motion is preferred. Music and chat work independently of decorative motion.
- `sceneWeather.js` / `sceneWeather.css` own scene selection, crossfade, fog and optional precipitation. The existing `sacredMotion.js` still handles the holy music-linked ornament layers.


## v22 Combat Monitor
Desktop Combat tab now includes initiative/round tracking, active-turn splash dialogue, temp HP, death saves, concentration, AC/speed/passive perception, custom resources, direct spell-slot controls for Observer, HP change popups, undo history, short/long rest helpers, reaction state, and a full-screen TV mode. Combat state continues to use Firestore document `combatState/party`.
