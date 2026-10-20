# Firebase setup — Soul Seekers v33

v33 keeps Trusted Table Mode: no email/password login is required.

## Required for real multi-device sessions

1. Open Firebase Console for the Soul Seekers project.
2. Go to **Authentication → Sign-in method**.
3. Enable **Anonymous** authentication.
4. Go to **Firestore Database → Rules**.
5. Replace/merge the rules with the included `firestore.rules` and publish.
6. Hard-refresh both the DM laptop and TV after deployment/rule changes.

## Client URLs

DM laptop:

`YOUR_SITE_URL/`

TV:

`YOUR_SITE_URL/?tv=1`

Click **ARM DISPLAY + AUDIO** once on the TV so the browser allows fullscreen/audio behavior.

## Trusted-table security model

Normal desktop clients are intentionally allowed to become trusted directors through anonymous authentication. The dedicated `?tv=1` client does not auto-enroll during normal use.

This is suitable for a private trusted group. It is not a hostile-user security model for a public website.

## PHCode exception

On localhost / Phoenix Code Live Preview, v33 exposes the DM UI immediately and provides same-origin browser fallback synchronization. This is for local testing only; it does not replace Firebase for two physical devices.
