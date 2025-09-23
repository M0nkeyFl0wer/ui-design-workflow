# Claude Code Agentic UI Designer Workflow

## Overview
This document outlines the iterative UI/UX design workflow using Claude Code with visual feedback through automated browser screenshots.

## System Architecture

### Core Components
1. **Claude Code** - AI-powered UI/UX Designer and Front-End Developer
2. **Puppeteer/Playwright** - Browser automation for visual feedback
3. **Screenshot Capture** - Visual validation system
4. **Iterative Loop** - Self-correcting design process

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Chrome/Chromium browser

### Installation Steps

#### For Termux/Android
```bash
# Install dependencies
pkg update && pkg upgrade
pkg install nodejs chromium

# Initialize project
npm init -y
npm install puppeteer-core chrome-launcher

# Run setup script
node setup-ui-workflow.js
```

#### For Desktop (Linux/Mac/Windows)
```bash
# Install Playwright
npm init -y
npm install playwright
npx playwright install chromium

# Or use Puppeteer
npm install puppeteer
```

#### For Remote Machines (via SSH)
```bash
# Connect via SSH
ssh user@remote-machine

# Run desktop installation steps
# Configure headless mode for remote servers
```

## Workflow Process

### 1. Analyze Spec
Review all acceptance criteria including:
- UI mockups/Figma designs
- Style guides
- Visual references
- Technical requirements

### 2. Implement & Tool
Write/modify front-end code:
- HTML structure
- CSS styling
- JavaScript functionality
- Framework components (React, Vue, etc.)

### 3. Capture Output
Use browser automation to:
```javascript
// Example capture code
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'current-design.png', fullPage: true });
const logs = await page.evaluate(() => console.logs);
```

### 4. Validate & Compare
Compare generated screenshots against:
- Original specifications
- Design mockups
- Acceptance criteria
- Console errors

### 5. Self-Correction
If refinement needed:
- Identify discrepancies
- Modify code
- Return to Step 2
- Repeat until pixel-perfect

## Commands & Scripts

### Quick Start Commands
```bash
# Start UI design workflow
npm run ui-design

# Capture screenshot of current work
npm run capture

# Run responsive tests
npm run test-responsive

# Check console errors
npm run check-errors
```

### Environment Variables
```bash
# .env file
BROWSER_PATH=/usr/bin/chromium
HEADLESS=true
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080
DEVICE_EMULATION=desktop
```

## Design Principles

### Visual Standards
- **Modern**: Clean, contemporary aesthetics
- **Non-generic**: Avoid template-like designs
- **Pixel-perfect**: Exact alignment and spacing
- **Accessible**: WCAG 2.1 AA compliance

### Technical Standards
- Semantic HTML5
- CSS Grid/Flexbox for layouts
- Responsive design (mobile-first)
- Performance optimized
- Cross-browser compatible

## Mobile Responsiveness Testing

### Viewport Configurations
```javascript
const viewports = {
  mobile: { width: 375, height: 812 },     // iPhone X
  tablet: { width: 768, height: 1024 },    // iPad
  desktop: { width: 1920, height: 1080 },  // Full HD
  '4k': { width: 3840, height: 2160 }      // 4K Display
};
```

### Device Emulation
```javascript
// Emulate specific devices
const devices = puppeteer.devices;
await page.emulate(devices['iPhone 15']);
await page.emulate(devices['iPad Pro']);
```

## Error Handling

### Console Error Monitoring
```javascript
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('Console Error:', msg.text());
  }
});
```

### Network Request Monitoring
```javascript
page.on('response', response => {
  if (!response.ok()) {
    console.error(`Failed request: ${response.url()} - ${response.status()}`);
  }
});
```

## Project Structure
```
project/
├── CLAUDE.md           # This workflow documentation
├── package.json        # Node dependencies
├── .env               # Environment configuration
├── scripts/
│   ├── setup-ui-workflow.js
│   ├── capture-screenshot.js
│   └── validate-design.js
├── screenshots/       # Visual outputs
│   ├── current/
│   └── archive/
├── src/              # Source code
│   ├── components/
│   ├── styles/
│   └── assets/
└── tests/
    ├── visual/
    └── responsive/
```

## Acceptance Criteria Template

When requesting UI work, provide:

### Required
1. **Design Task**: Specific feature/component description
2. **Tech Stack**: Frameworks and libraries to use
3. **Visual Context**:
   - Screenshots/mockups
   - Color schemes (hex codes)
   - Typography specs
   - Reference URLs

### Optional
- Mobile responsiveness requirements
- Specific device viewports
- Animation/interaction details
- Performance targets

## SSH Key Configuration

For remote machine access:
```bash
# Generate SSH key pair (if needed)
ssh-keygen -t ed25519 -C "ui-workflow"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key to remote machine
ssh-copy-id user@remote-machine
```

## Troubleshooting

### Common Issues

#### Termux/Android Limitations
- Use `puppeteer-core` instead of `playwright`
- Install chromium via `pkg install chromium`
- Run in headless mode only

#### Remote Server Setup
- Ensure Xvfb installed for headless operation
- Configure proper display variables
- Use SSH tunneling for local preview

#### Performance Optimization
- Limit concurrent browser instances
- Clear cache between iterations
- Use appropriate viewport sizes

## Quick Reference

### Essential Commands
```bash
# Check setup
node -v
npm list puppeteer-core

# Test browser connection
node -e "const puppeteer = require('puppeteer-core'); console.log('Puppeteer ready');"

# Run workflow
npm run ui-workflow

# Clean up
rm -rf screenshots/archive/*
```

### Keyboard Shortcuts (when using locally)
- `Ctrl+S` - Save and capture screenshot
- `Ctrl+R` - Refresh browser preview
- `Ctrl+D` - Toggle device emulation
- `Ctrl+E` - Export current design

## Updates & Maintenance

### Keep Dependencies Updated
```bash
npm update
npm audit fix
```

### Backup Configurations
```bash
cp CLAUDE.md CLAUDE.md.backup
cp package.json package.json.backup
```

---

*Last Updated: 2025*
*Version: 1.0.0*
*Workflow Type: Agentic UI Design with Visual Feedback*