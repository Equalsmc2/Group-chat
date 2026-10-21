# Soul Seekers v30 — Firebase setup

v30 removes the DM email/password login completely.

## 1. Authentication

In **Firebase Console → Authentication → Sign-in method**:

- Enable **Anonymous** authentication.
- Email/Password is **not required** for Soul Seekers v30.

The site signs browsers in anonymously in the background. There is no login screen.

## 2. Publish the v30 Firestore rules

Open **Firebase Console → Firestore Database → Rules** and replace/merge your current Soul Seekers rules with the included `firestore.rules`, then publish them.

The important v30 change is the `roles/{uid}` rule: a signed-in client can create/update only its own role record as `dm: true, mode: "trusted-desktop"`.

Normal desktop clients perform this enrollment automatically. The dedicated `?tv=1` client does not.

## 3. Open the DM laptop

Open the normal site URL. No credentials are needed.

DM CONTROL should briefly show **DIRECTOR / CONNECTING**, then become **DIRECTOR / TRUSTED**.

If it stays on setup:

- `Anonymous Firebase Authentication is required` → enable Anonymous Auth.
- `Director auto-enrollment was blocked` → publish the v30 `firestore.rules`.

## 4. Open the TV

Use:

`YOUR_SITE_URL/?tv=1`

Click **ARM DISPLAY + AUDIO** once. The TV uses a separate anonymous identity and follows DM broadcast state.

## Trust warning

This is deliberately convenience-first. Anyone who opens the normal desktop URL can become a director automatically. Use this only when you trust the people with access to the site/link.
