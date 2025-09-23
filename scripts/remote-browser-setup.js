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
