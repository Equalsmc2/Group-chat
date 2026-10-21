# Testing Soul Seekers v33 in PHCode / Phoenix Code

v33 is designed to be testable locally before Firebase is fully working.

## 1. Open the DM / desktop client

Use Phoenix Code's normal Live Preview on `index.html`.

A URL such as this is correct:

`http://localhost:63051/wounded-eternity/index.html?phcodeLivePreview=true`

You should see the desktop site with these tabs:

- TERMINAL
- COMBAT
- THE STAGE
- DM CONTROL

Open **DM CONTROL**. In local preview it should show **DIRECTOR / LOCAL PREVIEW** and the actual director dashboard immediately.

## 2. Open a local TV client

Duplicate/open another browser tab using the same localhost host/port and add `tv=1`.

Example:

`http://localhost:63051/wounded-eternity/index.html?phcodeLivePreview=true&tv=1`

The TV client should show **ARM THE TV**. Click **ARM DISPLAY + AUDIO** once.

## 3. Test broadcast control

In the DM window:

1. Open DM CONTROL.
2. Broadcast **Terminal**.
3. Broadcast **Combat**.
4. Broadcast **The Stage**.
5. Toggle blackout and restore picture.
6. Fire a presentation overlay.

The TV window should follow using local browser synchronization even if Firestore rules are not yet correct.

## 4. Test Combat

In DM CONTROL or Combat:

1. Start/advance a turn.
2. Confirm the TV switches/follows Combat when broadcast there.
3. Confirm the active character turn portrait/dialogue appears and dismisses automatically.
4. Change HP/status/resource values and confirm the local TV window updates.

## 5. Test Chat / Stage

- Send a chat message and confirm it reaches the second same-origin local window.
- Change/fire a Stage presentation and confirm the TV updates.

## What local preview does NOT prove

The PHCode fallback only tests two windows/tabs on the same browser origin. It does **not** prove real two-laptop Firebase synchronization or Firestore security rules.

For a real laptop + TV test, enable Anonymous Authentication and publish `firestore.rules`, then deploy/open the hosted site on both devices.
