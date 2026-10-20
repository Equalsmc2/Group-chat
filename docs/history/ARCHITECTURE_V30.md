# Soul Seekers v30 architecture note

v30 keeps the v29 split between synchronized state and local rendering, but changes authorization to a trusted-table model.

## Client roles

### Normal desktop

1. Sign in anonymously with browser-local persistence.
2. Auto-create/update `roles/{anonymousUid}` as `{ dm: true, mode: "trusted-desktop" }`.
3. Firestore rules then allow DM writes and access to `dmState/*`.

### TV (`?tv=1`)

1. Initialize a separate named Firebase app.
2. Sign in anonymously with in-memory persistence.
3. Do not create a DM role.
4. Read player-facing session/combat/stage/music/chat data only.

This preserves the normal DM/TV separation without requiring credentials, but it is intentionally not a strong hostile-user security model.
