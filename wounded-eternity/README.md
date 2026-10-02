# Soul Seekers — The Wounded Eternity · V25

A one-screen Boston campaign dashboard with shared phone DM controls, music,
day/night, weather, and a Persona-inspired Catholic/Orthodox visual identity.

**Start here:** Read START_HERE.md, then run START_SITE.bat (Windows) or
START_SITE.sh (macOS/Linux). Python 3 and an internet connection are required.
For hosting, upload the complete folder to your existing website.

## V25 changes

- Observer follows the latest sender; selected characters keep their own colors.
- Layered rain and drifting snow cover the page and the DM dialog.
- Local effects toggle on mobile; reduced-motion support and bounded animation.
- Polished contrast, focus, hover states, spacing, and chat readability.
- Four high-resolution scenes, day/night sun and moon, and no desktop page scroll.

Live shared controls require the existing Firebase project to permit access to
campaignState/main. FIRESTORE_SESSION_RULES.txt contains the scoped setup snippet;
keep existing chat/music rules. The site has no login, so DM is a shared remote,
not a protected administrator role. Music playback may need a local PLAY click.

No live Firebase rules were changed or website hosting deployed for this build.
Browser verification used simulated Firebase/YouTube services, including color
behavior, weather, mobile controls, and layout. Live audio/network services remain
subject to their own availability and permissions.
