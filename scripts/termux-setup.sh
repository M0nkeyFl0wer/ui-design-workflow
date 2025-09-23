#!/data/data/com.termux/files/usr/bin/bash

# Termux-specific setup script for UI Workflow
echo "🚀 Setting up UI Workflow for Termux..."

# Update packages
echo "📦 Updating packages..."
pkg update -y

# Install required packages
echo "📦 Installing dependencies..."
pkg install -y nodejs python

# Alternative: Use Firefox instead of Chromium for Termux
echo "🦊 Checking Firefox availability..."
if pkg list-installed 2>/dev/null | grep -q firefox; then
    echo "✅ Firefox is installed"
else
    echo "📦 Installing Firefox..."
    pkg install -y firefox || echo "⚠️  Firefox not available, will use remote browser option"
fi

# Install Python packages for alternative screenshot methods
echo "🐍 Installing Python screenshot tools..."
pip install selenium webdriver-manager playwright-python || echo "⚠️  Some Python packages failed to install"

# Create alternative launcher for remote browser connection
cat > scripts/remote-browser-setup.js << 'EOF'
#!/usr/bin/env node

/**
 * Remote Browser Setup for Termux
 * Connects to a browser running on another machine
 */

const fs = require('fs');

console.log(`
═══════════════════════════════════════════════════════════════
  REMOTE BROWSER SETUP FOR TERMUX
═══════════════════════════════════════════════════════════════

Since Termux has limitations with running browsers locally,
you can connect to a browser running on another machine.

Options:

1. Use Chrome DevTools Protocol (Recommended)
   - On your desktop/laptop, start Chrome with:
     chrome --remote-debugging-port=9222 --headless

   - Set REMOTE_BROWSER_URL in .env:
     REMOTE_BROWSER_URL=ws://YOUR_COMPUTER_IP:9222

2. Use BrowserStack or Similar Service
   - Sign up for BrowserStack
   - Add credentials to .env:
     BROWSERSTACK_USERNAME=your_username
     BROWSERSTACK_ACCESS_KEY=your_key

3. Use SSH Tunnel to Local Machine
   - On your desktop: chrome --remote-debugging-port=9222
   - On Termux: ssh -L 9222:localhost:9222 user@desktop
   - Set REMOTE_BROWSER_URL=ws://localhost:9222

4. Use a Lightweight Alternative
   - Use curl/wget for basic HTML capture
   - Use Python + BeautifulSoup for parsing

═══════════════════════════════════════════════════════════════
`);

// Update .env with remote browser option
const envContent = fs.readFileSync('.env', 'utf8');
if (!envContent.includes('REMOTE_BROWSER_URL')) {
    fs.appendFileSync('.env', `
# Remote Browser Configuration (for Termux)
REMOTE_BROWSER_URL=
BROWSERSTACK_USERNAME=
BROWSERSTACK_ACCESS_KEY=
USE_REMOTE_BROWSER=false
`);
    console.log('✅ Added remote browser configuration to .env');
}
EOF

echo "✅ Created remote browser setup script"

# Create lightweight HTML server
cat > scripts/serve-ui.py << 'EOF'
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
EOF

chmod +x scripts/serve-ui.py

echo "✅ Created Python server script"

# Create curl-based screenshot alternative
cat > scripts/curl-capture.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

URL=${1:-"http://localhost:3000/example-ui.html"}
OUTPUT=${2:-"screenshots/current/curl-capture.html"}

echo "📸 Capturing HTML from $URL..."
mkdir -p screenshots/current

# Capture HTML
curl -s "$URL" > "$OUTPUT"

# Extract important info
echo "📋 Page Analysis:"
echo "Title: $(grep -o '<title>.*</title>' "$OUTPUT" | sed 's/<[^>]*>//g')"
echo "Meta Description: $(grep -o 'name="description" content="[^"]*"' "$OUTPUT" | sed 's/.*content="//;s/"//')"
echo "Headers: $(grep -o '<h[1-6]>.*</h[1-6]>' "$OUTPUT" | wc -l) found"
echo "Images: $(grep -o '<img' "$OUTPUT" | wc -l) found"
echo "Links: $(grep -o '<a' "$OUTPUT" | wc -l) found"

echo "✅ HTML saved to: $OUTPUT"
EOF

chmod +x scripts/curl-capture.sh

echo "✅ Created curl-based capture script"

echo "
═══════════════════════════════════════════════════════════════
✨ TERMUX SETUP COMPLETE!
═══════════════════════════════════════════════════════════════

Available Commands:
  npm run serve        - Start local web server
  ./scripts/curl-capture.sh  - Capture HTML (basic)
  node scripts/remote-browser-setup.js  - Setup remote browser

For full browser automation:
  1. Connect to a desktop browser remotely (see instructions above)
  2. Or use your desktop/laptop for browser testing
  3. Or use cloud services like BrowserStack

Your Termux environment is ready for development!
The CLAUDE.md file contains the full workflow documentation.
"