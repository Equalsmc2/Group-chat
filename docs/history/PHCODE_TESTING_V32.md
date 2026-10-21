# Soul Seekers v32 — PHCode / Phoenix Code testing

## Deterministic client modes
- Open `index.html` normally: desktop/DM client.
- Open the same preview URL with `?tv=1`: player TV client.
- TV mode is no longer remembered in localStorage.

## One-computer two-client test
1. Start the normal PHCode preview and confirm the header says `V32`.
2. Use the normal page as the DM client and open **DM CONTROL**.
3. Click **TV MODE** / open-player-display. v32 opens a second window using `?tv=1`. If PHCode blocks the popup, copy the current preview URL and append `?tv=1` manually.
4. In the TV window press **ARM DISPLAY + AUDIO** once.
5. Back on DM Control, broadcast Terminal, Combat, and Stage. The TV window should follow.
6. Change HP or advance a turn. The TV should update live and play the turn presentation.

If the plain URL ever shows **ARM THE TV**, check the address: TV is now triggered only by `?tv=1` (or the explicit legacy `?display=tv` compatibility parameter).
