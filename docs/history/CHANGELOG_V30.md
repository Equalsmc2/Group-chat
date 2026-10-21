# Soul Seekers — Act III v30 changelog

## Trusted Table Mode

- Removed the DM email/password form.
- Removed Email/Password Firebase Auth imports and credential handling.
- Normal desktop browsers now auto-enroll their anonymous Firebase UID as a trusted DM role.
- TV mode keeps a separate in-memory anonymous identity and does not auto-enroll.
- DM CONTROL now reports `DIRECTOR / TRUSTED` when ready.
- Combat editing language now says `Trusted DM mode` instead of requiring a DM login.
- Updated Firestore rules to permit self-enrollment only for the signed-in client's own trusted role document.

## Preserved systems

No gameplay or presentation system was intentionally removed. v29 DM/TV broadcast state, Combat, turn overlays, Stage, chat, music, visualizer, device heartbeats, private DM notes/cues, realtime listeners, and performance suspension behavior remain in place.

## Deployment

Publish the v30 `firestore.rules` and keep Firebase Anonymous Auth enabled. No DM account creation is required.
