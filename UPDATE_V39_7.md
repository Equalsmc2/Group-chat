# Soul Seekers V39.7 — Visible fixes + deployment verification

- V39.7 is now visible at the lower-right corner and in the top rail: this is how to verify that GitHub Pages deployed this exact version.
- The Windows installer has been relabeled V39.7. It confirms the copied index.html contains the V39.7 version stamp.
- Fixed the Asya quote in multiple places: the turn-splash, DM dialogue preset, operator label, and the display of old `print("HelloWorld")` scenes that were already saved in Firebase. Existing saved values are not silently overwritten.
- Adjusted the Queen's Gambit TV and phone layouts independently: queen lower, title separated, and slash aligned to her position before the fall.
- Added translucent dark-glass treatment to information sections without fading portraits or text; strengthened the large III outline.
- Fresh CSS filename and script cache versions reduce the chance of an old cached page hiding changes.

## Installing
1. Extract the whole ZIP and run `INSTALL_FULL_WEBSITE.bat`.
2. Paste the folder path from GitHub Desktop -> Repository -> Show in Explorer.
3. In GitHub Desktop, click **Commit to main**, then **Push origin**. Copying the files is not enough.
4. On the published Pages URL, confirm **SS / V39.7** appears at the bottom right.
5. If it does not, check the selected Pages branch/folder and hard-refresh or use a private window.
6. If it does show but the changes are still wrong, share the exact page URL or screenshot.

The patch does not require Firebase rules changes. Full cross-device rendering must be tested on your actual devices.
