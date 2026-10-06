# GitHub Quick Preview

A Firefox extension for Zen and Firefox. Click a screenshot in a GitHub pull request or issue to open a full-screen preview on the current page.

The viewer uses the existing image element and leaves its URL untouched. It restores the image when you navigate or close, without opening a tab or preloading the gallery. GitHub may still load images that were not loaded yet.

## Controls

| Action | Control |
| --- | --- |
| Previous / next image | Left / right arrow, or the side buttons |
| First / last image | Home / End |
| Zoom / fit | Click the image, or use Actual size / Fit |
| Close | Escape, the close button, or the empty image background |

Images follow document order, including before/after tables and comments. Badges, emoji, avatars, and images in collapsed details are excluded. Closing the viewer restores keyboard focus and page scroll. Command-click, Control-click, Shift-click, and middle-click keep the browser's usual behavior.

## Install

Requires Firefox 142 or newer, or a compatible Zen version.

Version 1.0.2 has been submitted to Mozilla for unlisted signing and is awaiting review. Signed packages will be available on [GitHub Releases](https://github.com/brandonnly/github-quick-preview/releases). Download a signed `.xpi`, open `about:addons`, and choose **Install Add-on From File** from the gear menu. Building from source produces an unsigned development package.

For a temporary development install, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `extension/manifest.json`. Temporary installs disappear when the browser exits.

## Privacy

The extension runs on `github.com` and activates on pull request and issue pages. It needs access to those pages to intercept screenshot clicks and display the viewer. It has no background process, analytics, external services, storage, or data collection. See [PRIVACY.md](PRIVACY.md).

## Develop and package

The extension is plain JavaScript with no runtime dependencies or build step.

```sh
node --check extension/preview.js
npx --yes web-ext lint --source-dir extension
python3 scripts/package.py
```

The packaging script uses Python 3's standard library and writes `dist/github-quick-preview-<version>.xpi`. It reads the version from the manifest and produces a reproducible archive containing only the files under `extension/`.

To test the viewer, run:

```sh
python3 scripts/test-server.py
```

Open `http://127.0.0.1:8765/tests/fixture.html` and try the controls. To run the automated browser checks, evaluate the contents of `tests/verify.js` in that page's developer console. The fixture uses local SVG images over HTTP and changes its URL to imitate a pull request route. The test server counts image requests when they arrive, so the network check detects requests before they finish. See [VERIFICATION.md](VERIFICATION.md) for coverage.

## Signing releases

Submit the generated XPI to the [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/) using the **On your own** distribution option. This signs the extension for distribution through GitHub without listing it in Mozilla's public catalog. Download the signed XPI from the submission and attach it to a GitHub release.

Keep the extension ID stable and increase `version` in `extension/manifest.json` for each release. The plain, unminified extension files are the complete source; there is no separate compiled bundle.

## License

[MIT](LICENSE), copyright Brandon Ly.
