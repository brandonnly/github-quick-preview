# GitHub Quick Preview

A browser extension for Dia, Chrome, Zen, and Firefox. Click a screenshot in a GitHub pull request or issue to open a full-screen preview on the current page.

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

### Dia and Chrome

1. Download the [Chromium 1.0.2 ZIP](https://github.com/brandonnly/github-quick-preview/releases/download/chromium-v1.0.2/github-quick-preview-1.0.2-chromium.zip).
2. Extract the ZIP into a folder you intend to keep, such as `Documents/GitHub Quick Preview`. The folder should contain `manifest.json` and `preview.js`.
3. In Dia or Chrome, open `chrome://extensions`. Dia may display this as `dia://extensions`.
4. Enable **Developer mode**, click **Load unpacked**, and select the extracted folder.
5. Reload any GitHub pull request or issue tabs that were already open, then click a screenshot.

Keep Developer mode enabled and leave the extracted folder in place. The local extension stays installed after the browser quits. If you use separate browser profiles, load it in each profile where you want screenshot previews.

To update, replace the files in that same folder with the newer Chromium release, click the extension's **Reload** button on `chrome://extensions`, and reload your GitHub tabs. Updates are installed manually. The Chromium build uses Manifest V3 and the same viewer code as the Firefox build. See [Chrome's local extension installation guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) for the browser's installation flow.

### Zen and Firefox

Requires Firefox 142 or newer, or a compatible Zen version.

1. Download the [Mozilla-signed 1.0.2 installer](https://github.com/brandonnly/github-quick-preview/releases/download/v1.0.2/github-quick-preview-1.0.2-signed.xpi).
2. In Zen or Firefox, open `about:addons`.
3. Open the gear menu and choose **Install Add-on From File…**, then select the downloaded `.xpi`.
4. Confirm the installation. The extension needs access to `github.com` to display screenshot previews.
5. Reload any GitHub pull request or issue tabs that were already open, then click a screenshot.

This install stays installed when the browser quits. Keep extension signature verification enabled; the signed installer works with the normal browser settings. If you previously set `xpinstall.signatures.required` to `false` in Zen, install the signed version first, then restore it to `true` in `about:config`.

To update, download the newest signed Firefox installer from [GitHub Releases](https://github.com/brandonnly/github-quick-preview/releases) and install it the same way. The stable extension ID lets it replace your existing copy. Updates are installed manually.

## Privacy

The extension runs on `github.com` and activates on pull request and issue pages. It needs access to those pages to intercept screenshot clicks and display the viewer. It has no background process, analytics, external services, storage, or data collection. See [PRIVACY.md](PRIVACY.md).

## Develop and package

The viewer is plain JavaScript with no runtime dependencies. Both browser builds share `extension/preview.js` and the version in `extension/manifest.json`.

For Firefox development, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `extension/manifest.json`. Reload your GitHub tab after loading the extension. Temporary installs disappear when the browser exits.

```sh
node --check extension/preview.js
npx --yes web-ext lint --source-dir extension
python3 scripts/package.py
```

The packaging script uses Python 3's standard library and produces reproducible archives. By default it builds both browsers:

| Output | Purpose |
| --- | --- |
| `dist/github-quick-preview-chromium/` | Load unpacked in Dia or Chrome |
| `dist/github-quick-preview-<version>-chromium.zip` | Distribute the Chromium build |
| `dist/github-quick-preview-<version>.xpi` | Submit the unsigned Firefox build to Mozilla for signing |

Use `python3 scripts/package.py --browser chromium` or `--browser firefox` to build only one browser. The Chromium build changes the manifest to version 3 and removes Firefox-specific settings. It copies the viewer unchanged and adds no permissions or background process. For Chromium development, load `dist/github-quick-preview-chromium` and rebuild, reload the extension, and reload the GitHub tab after changing the source.

To test the viewer, run:

```sh
python3 scripts/test-server.py
```

Open `http://127.0.0.1:8765/tests/fixture.html` and try the controls. To run the automated browser checks, evaluate the contents of `tests/verify.js` in that page's developer console. The fixture uses local SVG images over HTTP and changes its URL to imitate a pull request route. The test server counts image requests when they arrive, so the network check detects requests before they finish. See [VERIFICATION.md](VERIFICATION.md) for coverage.

## Signing releases

Publish Chromium ZIPs under `chromium-v<version>` tags. Users extract the ZIP and load its folder through Developer mode as described above.

Submit the generated XPI to the [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/) using the **On your own** distribution option. This signs the extension for distribution through GitHub without listing it in Mozilla's public catalog. Download the signed XPI from the submission and attach it to a GitHub release.

Keep the extension ID stable and increase `version` in `extension/manifest.json` for each release. The plain, unminified extension files are the complete source; there is no separate compiled bundle.

Distribute the signed file exactly as Mozilla provides it. Renaming it is fine; editing or repackaging its contents invalidates the signature. Update the installer link above when publishing a new release.

## License

[MIT](LICENSE), copyright Brandon Ly.
