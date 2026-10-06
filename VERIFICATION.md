# Verification

Version 1.0.2 passed syntax checking and Mozilla's `web-ext lint` with zero errors, warnings, or notices. The generated XPI passed archive integrity and reproducibility checks.

All 25 browser checks in `tests/verify.js` passed against `tests/fixture.html`. They cover:

- Reusing the existing image element and source without starting new HTTP image requests, verified by the local test server's request counter.
- Gallery filtering and document order, including before/after images.
- Left/right navigation, rendered fit and actual-size dimensions, and first/last boundaries.
- Closing with Escape and restoring the image, keyboard focus, scroll position, and scroll lock.
- Preserving modified clicks and sibling text links, opening image-only links from the keyboard, and handling images added by new comments.
- Closing during GitHub navigation and activating after navigation to an issue.
- Restoring individual overflow axes, including different property priorities.
- Excluding broken and pending small badges, and preserving picture elements and their source children.

The new regression checks were also run with each fixed bug deliberately reintroduced in memory. Each failed at the intended assertion. Injecting an extra image request failed the network check. A separate trusted Enter/Escape check opened and closed the viewer without navigation and restored focus to the screenshot link.

The original version was tested in Zen on a GitHub pull request with 32 eligible screenshots. Opening a screenshot, navigating in both directions, and closing the viewer kept the same tab and restored focus to the screenshot link. Those checks passed with both a temporary install and a persistent install. Version 1.0.2's automated checks ran in the collaborative Chromium browser; the reviewed update has not yet been installed in Zen.

See the README for commands to repeat validation and run the fixture locally.
