# Soul Seekers v29 — Firebase setup

v29 adds a real authorization boundary for **DM CONTROL**. The DM role is not inferred from the selected chat identity and private DM data is not stored in the player-facing combat document.

## 1. Enable Firebase Authentication

In **Firebase Console → Authentication → Sign-in method** enable:

1. **Anonymous** — used by player/TV browsers so Firestore can be locked to authenticated session clients instead of public internet access.
2. **Email/Password** — used by the DM laptop.

## 2. Create the DM account

In **Authentication → Users**, create the DM's email/password account. Copy its UID.

## 3. Grant the DM role

In Firestore, create this document manually from Firebase Console:

- Collection: `roles`
- Document ID: the DM user's exact Firebase Auth UID
- Field: `dm` (Boolean) = `true`

Do **not** add a client rule that lets browsers write their own `roles` document. `firestore.rules` intentionally forbids that.

## 4. Publish the bundled Firestore rules

Open **Firestore Database → Rules**, replace/reconcile your current rules with the bundled `firestore.rules`, then publish.

The v29 rules provide:

- authenticated player/TV reads of shared chat, music, combat, Stage, and broadcast state;
- chat message creation for authenticated clients;
- DM-only writes to music, combat, Stage, and broadcast state;
- DM-only access to `dmState/*` private notes/cues;
- self-owned, schema-validated device heartbeat writes, with device enumeration visible only to the DM;
- self-only role reads and no client role writes.

If you have other collections used by a different app, merge their rules deliberately instead of deleting them.

## 5. First DM login / migration

Deploy v29, open **DM CONTROL**, and sign in once with the DM account. On verified login, Soul Seekers rewrites the public combat state using the v29 schema so any legacy `dmNote` fields from older builds are removed from the public `combatState/party` document. New private combat notes are stored under `dmState/combatNotes`.

## 6. TV connection

Open the deployed site on the player TV with:

`?tv=1`

Example shape:

`https://YOUR-NAME.github.io/YOUR-REPO/?tv=1`

On the TV, click **ARM DISPLAY + AUDIO** once when prompted. This is a browser-required user gesture for fullscreen/media playback. The TV will then follow the authoritative broadcast scene selected in DM CONTROL.

TV mode uses a **separate named Firebase app with in-memory anonymous Auth**. This is deliberate: even if a DM opens the TV URL in a new tab from an authenticated DM browser, that TV tab does not inherit the DM credential or gain access to `dmState/*`.

## Firestore documents used by v29

| Path | Audience | Writer |
| --- | --- | --- |
| `messages/*` | Shared | Signed-in clients create; DM may modify/delete |
| `musicLibrary/*` | Shared | DM |
| `combatState/party` | Shared | DM |
| `sessionState/main` | Shared | DM |
| `stageState/main` | Shared | DM |
| `dmState/combatNotes` | DM only | DM |
| `dmState/presentation` | DM only | DM |
| `sessionDevices/*` | DM can list | Each client writes its own heartbeat |
| `roles/{uid}` | That user only | Firebase Console/Admin only |

## Troubleshooting

- **DM CONTROL says account is not a DM:** verify the Auth UID exactly matches the `roles/{uid}` document ID and `dm == true` is a Boolean.
- **Player/TV shows FIRESTORE RULES / AUTH:** enable Anonymous Auth and publish the rules.
- **TV does not follow scene changes:** verify the TV URL includes `?tv=1`, then use **Session Control → Force Resync** on the DM laptop.
- **Music does not start automatically:** browser autoplay policy may require clicking **ARM DISPLAY + AUDIO** again after a new browser session or a permission reset.
- **A YouTube track will not play:** some owners disable embedding. Use another track or **OPEN ON YOUTUBE**; the website cannot override YouTube's embed policy.
