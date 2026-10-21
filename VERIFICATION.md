# Verification

The Chromium 1.0.2 package was checked on October 21, 2026. All 25 browser checks below passed again in the collaborative Chromium browser. The ZIP contains only `manifest.json` and `preview.js`; the viewer matches the shared source byte for byte. Its Manifest V3 configuration keeps the `https://github.com/*` content-script match and adds no API permissions or background process. Both Chromium and Firefox archives passed integrity and reproducibility checks.

The Chromium folder was loaded in Dia 1.53.0 through **Load unpacked** with Developer mode enabled. Dia shows GitHub Quick Preview 1.0.2 enabled with no extension errors. On a public GitHub issue with four screenshots, opening the first image displayed the viewer, Right moved to the second image, Left returned to the first, and Escape restored focus to the original screenshot link on the same issue page. These checks used the installed extension and actual keyboard input.

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

The original version was tested in Zen on a GitHub pull request with 32 eligible screenshots. Opening a screenshot, navigating in both directions, and closing the viewer kept the same tab and restored focus to the screenshot link. Those checks passed with both a temporary install and a persistent install. Version 1.0.2's automated checks ran in the collaborative Chromium browser.

Mozilla approved and signed version 1.0.2 for unlisted distribution. The signed archive contains the reviewed JavaScript unchanged and an equivalent manifest; Mozilla reformatted the JSON during signing. The signed package was installed in Zen 1.22.3b through **Install Add-on From File…**, replacing the unsigned copy. Zen reports version 1.0.2 as signed, active, and enabled with `xpinstall.signatures.required` restored to its default value of `true`.

See the README for commands to repeat validation and run the fixture locally.
