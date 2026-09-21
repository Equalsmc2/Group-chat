# V20 — Phone chat + desktop QR

- On phones (720 CSS pixels or narrower, or short touch-screen landscape), the site displays ONLY the messaging app: conversation header, character selection, chat history, message field and SEND. The chat fills the visible screen and the messages scroll independently; dashboard, map, music player, weather controls, banner, desktop QR and decorative effects are hidden. Firebase chat still functions.
- When opened on a phone, the desktop atmosphere, weather, map and YouTube music modules are not initialized, reducing mobile bandwidth and CPU use. Desktop retains the original full functionality.
- On the desktop Boston banner, the QR image supplied by the user is displayed at the top-right. It is shipped locally in `assets/soul-seekers-qr.png` and is hidden on phones. QR content is unchanged.
- Launch as usual with START_SITE.bat. No Firebase configuration was changed.

---

## V19 — Visual polish and clutter cleanup

- One animated ring-and-cross in the Boston banner, one centered behind chat messages, and one quiet map sigil. Removed duplicate banner crosses, map wheels, badges, stamps, and footer symbol cluster. These are *decorative* changes; controls are unchanged.
- More breathing space in the music panel; the old-world track title no longer gets pushed behind its heading. On smaller/shorter desktop viewports, the card scrolls independently if necessary so saved songs and controls remain reachable.
- Kept six locally packaged Boston photo-based day/night scenes, automatic rotation, rain/snow, the Motion toggle and gold/ink ancient Veil. Preserved Observer-specific color logic, Firebase chat and song library, and music repeat setting.
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

- **VEIL / CLOSED:** Modern supernatural Boston / Persona-inspired graphic interface, retaining crosses, seals, and halo-like symbols. When *Observer* is selected, the accent follows the sender of the latest message. When another character is selected, the accent stays on that character regardless of later senders.
- **VEIL / OPEN:** An older, darker, more austere gold-and-ink sacred codex. Boston imagery remains under a sepia/gold treatment. The Veil only changes presentation, not campaign data.

## v11 performance work

- The Veil crossfades two snapshots in browsers with View Transitions support instead of repainting every themed background during a long transition; there is a simple fallback for other browsers.
- Removed continuous animation of large multi-layer overlays; retained subtle halo/seal animation, with reduced-motion support.
- Historical chat messages insert in a batch and scroll once. New messages preserve your reading position if you have scrolled up.
- Fixed bottom-of-chat position when switching between different font sizes across the Veil.
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

- The site's existing Boston banner image remains visible in both Veil states. A pair of slow-turning seal rings, drifting Orthodox/Catholic-style crosses, and a faint halo live over the banner; the map gains its own unobtrusive cartographic seal. The chat's existing seal and header/music flourishes move gently even when nothing is playing.
- While YouTube reports **PLAYING**, the banner halo and cross, map cross, and music-cover seal pulse in concert with the existing sound visualizer. They stop pulsing on pause, buffering, error or track end. Playback **continues** when you switch Veil states or disable decorative motion.
- **Technical limitation:** YouTube's embedded player provides its play/pause state and playback time, **not raw audio amplitudes** to website JavaScript. This is a **playback-timed musical animation**, not analysis of actual bass, drum hits or vocals. The visualizer was already a generated animation; no new video dock is added.
- The new **MOTION / ON** button turns ambient and reactive ornament motion on/off, remembering your preference in this browser when localStorage is available. OS reduced-motion settings are respected, and off-screen tabs pause decorative work. Actual music controls and chat remain usable.
- The shared Firebase song library, controls, text, Boston map and Observer-only character-theme behavior are unchanged. Only dedicated decorative layers receive music-pulse updates, capped to the canvas refresh rate, to avoid animating the whole page's gradients.

## Customize

- `themes.css`: both complete visual themes and performance adjustments.
- `css.css`: shared layout and foundational styles.
- `js.js`: chat and character colors. `refreshThemeState()` implements Observer vs selected-character accent behavior.
- `atmosphere.js`: Veil toggle, transition and banner pointer effects.
- `firebase.js`: single shared Firebase app and database connection.
- `musicPlayer.js`: saved Firebase/locally cached music library, YouTube controls, metadata lookup and ambient visualizer.
- `bostonMap.js`: Leaflet map.

The six day/night Boston images and the SVG artwork are packaged locally. Live Firebase chat, Leaflet map tiles, YouTube and Google Fonts require internet. The interactive map keeps its local illustration fallback. Firebase configuration has not changed.

## v15 — Day, night and weather

- **LOOP ON** is the default for music. At the end of a YouTube track, it loads that same track again; you can toggle **LOOP OFF** to let NEXT advance through saved songs instead. This is saved in your current browser, not Firebase. YouTube's own embed restrictions still apply.
- The **DAY / NIGHT** button switches between daylight and nighttime Boston. Each time mode has **three distinct, bundled Boston scenes** (morning, noon, golden hour; blue night, midnight, amber night). Scenes crossfade approximately every 13.5 seconds while MOTION is on. Day/night selection is remembered by this browser. On first visit it starts from the browser's local time (day from 7 a.m. to 7 p.m.).
- The **CLEAR → RAIN → SNOW** button cycles through clear skies, rainfall and snowfall. Rain and snow are optional in *either* day or night, and retain the current Veil aesthetic. Weather selection is remembered in this browser.
- Additional slow fog bands and drifting tiny sacred motifs give the banner movement even during clear weather; pre-existing halos, seals and music-linked animation remain.
- The six scenery images are packaged as local compressed `.webp` illustrations under `assets/`; no remote picture service is required. The city arrangement remains the same between the six illustrated time-of-day treatments. The separate interactive Leaflet Boston map is unchanged.
- Rain/snow draw to one pointer-transparent canvas at about 30 fps, capped in particle count and pixel ratio. They pause when the page is hidden, MOTION is OFF, or reduced-motion is preferred. Music and chat work independently of decorative motion.
- `sceneWeather.js` / `sceneWeather.css` own scene selection, crossfade, fog and optional precipitation. The existing `sacredMotion.js` still handles the holy music-linked ornament layers.
