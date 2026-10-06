import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[1]
image_requests = []
request_lock = Lock()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/__image_requests":
            with request_lock:
                body = json.dumps(image_requests).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if Path(path).suffix.lower() in {".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"}:
            with request_lock:
                image_requests.append(self.path)
        super().do_GET()


if __name__ == "__main__":
    print("Open http://127.0.0.1:8765/tests/fixture.html", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
