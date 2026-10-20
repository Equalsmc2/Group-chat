# V35 setup, PHCode testing, deployment and migration

## PHCode / Phoenix Code

1. Extract the normal project ZIP, open the `soul-seekers-v35` folder in PHCode, and preview `index.html`.
2. Director URL: `index.html?phcodeLivePreview=true`.
3. TV URL on the **same exact preview origin**: `index.html?phcodeLivePreview=true&tv=1`.
4. Activate the TV with its initial audio/fullscreen button. Then use DM Control from the director window.
5. Test Combat, Stage, blackout, next turn, and chat. Local mode works without Firebase SDK downloads or credentials.

Local sync is same-origin, same-browser-profile only. Different ports, private windows, browser profiles, and physical devices do not share localStorage/BroadcastChannel. A phone emulation window in that profile can test local chat; your physical phone needs the hosted cloud site.

`START_SITE.bat` and `START_SITE.sh` start a Python HTTP server on port 8000. Do not open `index.html` directly through `file://`; JavaScript modules need HTTP. The PHCode ZIP and Pages ZIP contain the same application code; only the outer folder layout differs.

## Firebase / live-device use

The supplied Firebase configuration and `firestore.rules` are preserved. This run did not change the project’s live database or deploy rules.

- Anonymous Authentication must be enabled.
- The hosted domain must be allowed by your Firebase Authentication setup.
- Publish the included trusted-table rules if the project is still using older incompatible rules.
- Open the normal hosted URL on the director laptop, and append `?tv=1` on the TV.
- Use the normal hosted URL on phones; they receive chat only.
- For cloud testing from localhost/PHCode, add `&cloud=1` (or `?cloud=1` if it is the first parameter) to **both** clients. This explicitly uses your real project and can change real session data.

A `LOCAL PREVIEW` badge is not Firebase connectivity. `LIVE / FIREBASE` is shown only after a real session snapshot. If cloud setup is unavailable, the desktop workspaces remain inspectable, but cloud write controls require the trusted role.

## GitHub Pages

Use `Soul_Seekers_V35_GitHub_Pages.zip`. Extract/upload its contents at the Pages publishing root: `index.html`, JS/CSS, `assets/`, and the rest of the files. No npm build is required. Keep filename case and relative paths unchanged. The supplied static QR image is preserved; if your deployment URL differs from the original campaign URL, replace that QR with one for your actual URL.

## Migration / rollback

1. Back up your current deployed files and use a session break for the upgrade.
2. Replace the complete static application, including the new transport, experience, fonts and CSS files.
3. Reload the DM and TV clients together. Do not run mixed V34/V35 clients against the same session during play.
4. No Firestore collection migration is required. Existing party data, saved music and cues are retained. New cue kinds are additive.
5. Existing local cache keys remain compatible. New local revision and private-note fields are initialized automatically. Local preview no longer automatically publishes into the cloud; use the explicit cloud test URL only when intended.
6. To roll back, restore your backed-up static files. Data remains in the same existing collections. V34 may normalize new cue kinds to its older defaults.

## Working controls

The main navigation changes only the laptop’s view. DM Control’s Terminal / Combat / Stage buttons broadcast immediately. Target + transition + TAKE LIVE is the deliberate alternative. Blackout darkens only player-facing output. The monitor is a state summary, not a second live YouTube/video render.

Encounter keeps next/previous, ordering, editing and undo close together. Cue studio templates only fill the form; FIRE OVERLAY and SET STAGE + BROADCAST are explicit actions. Sound desk separates local UI feedback, DM cinematic preview, and player-facing effects. Space advances a turn while in DM Control and not typing; Alt+1/2/3 broadcasts a scene; Alt+B toggles blackout.
