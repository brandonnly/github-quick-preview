# Privacy

GitHub Quick Preview does not collect, store, or transmit personal data. It has no analytics, telemetry, remote code, or third-party services.

The content script runs on `https://github.com/*` so it can work when GitHub navigates between pages without a full reload. The viewer activates only on pull request and issue routes. It reads screenshot elements and their captions, displays them in a modal on the current page, and restores them when the viewer closes.

The extension does not change screenshot URLs, fetch images, or preload other screenshots. Images that GitHub has not loaded yet remain subject to GitHub's normal loading behavior.

The extension does not use browser storage or access GitHub's API. All viewer state remains in the current page's memory and is discarded when the viewer closes or the page unloads.

You can inspect the complete source in [extension/preview.js](extension/preview.js).
