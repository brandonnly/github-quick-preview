import argparse
import json
from pathlib import Path
import shutil
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parents[1]
source = root / "extension"
dist = root / "dist"


def archive_files(output, files):
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for name, content in sorted(files.items()):
            entry = ZipInfo(name)
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            archive.writestr(entry, content)
    print(output)


def package(browser):
    files = {
        path.relative_to(source).as_posix(): path.read_bytes()
        for path in source.rglob("*") if path.is_file()
    }
    manifest = json.loads(files["manifest.json"])
    version = manifest["version"]
    dist.mkdir(exist_ok=True)

    if browser == "firefox":
        archive_files(dist / f"github-quick-preview-{version}.xpi", files)
        return

    manifest["manifest_version"] = 3
    del manifest["browser_specific_settings"]
    files["manifest.json"] = (json.dumps(manifest, indent=2) + "\n").encode()

    unpacked = dist / "github-quick-preview-chromium"
    if unpacked.exists():
        shutil.rmtree(unpacked)
    unpacked.mkdir()
    for name, content in files.items():
        path = unpacked / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    print(unpacked)
    archive_files(dist / f"github-quick-preview-{version}-chromium.zip", files)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Package GitHub Quick Preview for Firefox or Chromium.")
    parser.add_argument("--browser", choices=["firefox", "chromium", "all"], default="all")
    args = parser.parse_args()
    for browser in (["firefox", "chromium"] if args.browser == "all" else [args.browser]):
        package(browser)
