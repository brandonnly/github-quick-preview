# Verification

Version 1.0.1 passed syntax checking and Mozilla's `web-ext lint` with zero errors, warnings, or notices. The generated XPI passed archive integrity and reproducibility checks.

All 14 browser checks in `tests/verify.js` passed against `tests/fixture.html`. They cover:

- Reusing the existing image element and source without creating image resource requests.
- Gallery filtering and document order, including before/after images.
- Left/right navigation, actual-size zoom, and first/last boundaries.
- Closing with Escape and restoring the image, keyboard focus, scroll position, and scroll lock.
- Preserving modified clicks and handling images added by new comments.
- Closing during GitHub navigation and activating after navigation to an issue.

The extension was also tested in Zen on a GitHub pull request with 32 eligible screenshots. Opening a screenshot, navigating in both directions, and closing the viewer kept the same tab and restored focus to the screenshot link. These checks passed with both a temporary install and a persistent install.

See the README for commands to repeat validation and run the fixture locally.
