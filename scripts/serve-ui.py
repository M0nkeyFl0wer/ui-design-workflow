#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = "src"

os.chdir(DIRECTORY)

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🌐 Server running at http://localhost:{PORT}")
    print(f"📁 Serving files from: {DIRECTORY}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()
