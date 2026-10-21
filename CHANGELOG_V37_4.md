# SOUL SEEKERS / ACT III — V37.4

## Jeanette / Lunar Eclipse cinematic refinement

- Reduced the persistent reel size and moved both spools toward the bottom corners so they no longer sit over the six character portraits.
- Subdued the oversized moon, filmstrip, photo ghosts and vertical film borders. The cinematic still opens with its animated Jeanette cut-in, shutters, monochrome treatment and rotating reels.
- Reduced multiple stacked grayscale/brightness effects on combat so essential HP and character details stay readable.
- Replaced the small generic status caption with **LUNAR ECLIPSE // ALL MAGIC ECLIPSED // JEANETTE EXEMPT**.

## Audio timeline

- Bells remain at full volume for **3.00 seconds**.
- Bell volume fades from 3.00 through **4.15 seconds**. The intro MP3 itself contains this fade so it isn't dependent on a browser animation loop.
- The theme begins at **4.33 seconds** after a short silent separation. No intentional bell/theme overlap.
- Second-press ending cancels pending theme-start callbacks and stops the Legendary Action audio.

## YouTube transport handoff

- YouTube audio now has a dedicated, local-only `suspendForLegendary` / `resumeFromLegendary` transport hold.
- Music is paused while Lunar Eclipse is active, including when a synchronized TV audio update arrives mid-action.
- On ending the action, music returns to the same track/time only if it was previously playing. Music that was already stopped remains stopped.
- The shared DM music cue is **not** altered by this local pause, avoiding accidental cross-device changes.

## Scope

No changes to Combat mechanics, party HP, boss state, Firestore security rules, Stage, Scene Lab, or the player phone request permissions.
