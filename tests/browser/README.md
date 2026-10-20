# Browser regression harnesses

From the project root, install Playwright as a development dependency and its Chromium browser (`npm install --no-save playwright`, then `npx playwright install chromium`). Run `node tests/browser/integration.cjs` and `node tests/browser/media-lifecycle.cjs`.

These start their own loopback HTTP server, isolate browser profiles, block external network requests, and generate temporary `qa/` evidence. They never access the live Firebase project. Media uses an explicitly mocked YouTube / Audio boundary where indicated. Screenshots contain test data, not initial application data. No test data ships in application state.
