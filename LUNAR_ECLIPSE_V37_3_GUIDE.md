# Soul Seekers Act III / v37.3 — Jeanette: Lunar Eclipse

## How to use
1. Extract the PHCode project and launch `index.html` normally.
2. On the phone view, choose **Jeanette** in the character selector.
3. Tap **Jeanette // Lunar Eclipse**. The cinematic interrupts the phone/TV presentation, and the displayed world switches to monochrome.
4. Tap **End Legendary** a second time to remove the effect and stop all Legendary Action audio.
5. The DM can test the same toggle in **DM Control → Cue Studio**, under the Legendary Action trigger.

## Audio timing
- 0.00–1.90 seconds: Jeanette's bell stinger (shortened from the user's longer bell recording to keep downloads light).
- 1.90–3.50 seconds: bells fade smoothly to silence.
- 3.50–3.75 seconds: deliberate silent beat.
- At 3.75 seconds: **Through Patches of Violet (Female Version)** starts as a placeholder theme and repeats while the Legendary Action remains active.
- Press again to stop the bells/theme, cancel pending timers, remove the overlay, and restore the site's usual music if it was previously playing.
- If the TV joins the session late, playback jumps to the appropriate part of the theme instead of replaying the bells.

## Visual changes
- Two continuously rotating photo film reels (opposing directions).
- Moving tape strip, photos, shutter effect, lunar rings, title slam, and animated scene marker.
- Persistent monochrome/magic-eclipsed presentation until toggled off.
- Reduced-motion accessibility mode disables nonessential cinematic movement.

## Sync / deployment notes
- Keep the `firestore.rules` from the v37.2+ project deployed for phone requests to reach the trusted DM desktop in live Firebase mode. The new v37.3 build does not require any additional rules changes.
- Arm/unlock the TV's audio with its on-screen permission control before expecting sound from remotely-triggered actions. Browsers otherwise block autoplay.
- The visual effect communicates the Legendary Action; it **does not automatically modify D&D spellcasting rules**, suppress actual spell buttons, or calculate the radius.
- The theme is a temporary supplied asset; replace `assets/legendary/jeanette/lunar-theme-placeholder.mp3` with a permitted final track before publishing widely.

## V37.5 audio revision

The bells play for **6.00 seconds at full strength**, followed by a **1.50-second fade to silence**. The instrumental **Through Patches of Violet (6-38)** starts at **7.68 seconds** after activation. The normal YouTube player stays paused until the effect ends, then resumes its previous playback position if it was playing.
