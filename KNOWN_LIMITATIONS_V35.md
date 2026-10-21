# V35 known limitations

- Real Firebase authentication, rules, latency, cross-device reconnects and production music playback were not exercised against the supplied live project. Run the acceptance checklist before a session.
- Chromium browser tests passed. Firefox could launch but test-page creation hung in this execution environment; Firefox acceptance is not claimed.
- YouTube embeds may be blocked by browser autoplay policy, extensions, network conditions or a track’s embedding restrictions. TV audio needs an initial user gesture; some browsers can require it again after refresh. The visualizer is explicitly playback-reactive, not FFT/frequency analysis.
- Audio routing/fade/duck-related control behavior was tested with an instrumented player/media boundary; physical speaker loudness, mixing and exact timing need a real-device listen. All 26 supplied MP3 payloads are preserved; an MP3 was successfully decoded in Chromium.
- Device presence is heartbeat-based, so a closed client can remain listed for up to 90 seconds. Local mode cannot synchronize separate physical devices.
- The director monitor summarizes authoritative output state; it is not a pixel-for-pixel remote screenshot. A very long cue or densely populated character can require scrolling in its content area; six portrait panels remain present.
- Trusted-table mode intentionally trusts normal desktop visitors. It is not a hostile-user security model, and same-browser local storage is not a security boundary. Private notes are separated from normal TV rendering and public combat payloads.
- Multiple directors editing the same party simultaneously retain the baseline last-writer model. Use one main director during a live session.
- The QR asset is unchanged and may need replacing if you publish at a different URL.
- Existing supplied art and sound assets are retained with their existing provenance. Bundled added fonts include their SIL OFL licenses.
