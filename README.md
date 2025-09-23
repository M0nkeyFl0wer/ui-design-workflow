# UI Design Workflow 🎨

An automated, iterative UI/UX design workflow with visual feedback through browser automation. Perfect for achieving pixel-perfect designs across multiple devices.

## 🚀 Features

- **Visual Feedback Loop**: Automated screenshot capture for design validation
- **Responsive Testing**: Test across multiple viewports and devices
- **Cross-Platform**: Works on Termux, Desktop, Raspberry Pi, and cloud servers
- **Design Validation**: Automated checks for accessibility, performance, and SEO
- **Iterative Refinement**: Self-correcting workflow until pixel-perfect

## 📦 Installation

### Quick Start
```bash
git clone https://github.com/M0nkeyFl0wer/ui-design-workflow.git
cd ui-design-workflow
npm install
npm run setup
```

### Platform-Specific Setup

#### Desktop (Mac/Linux/Windows)
```bash
npm install
npm install playwright
npx playwright install chromium
```

#### Termux (Android)
```bash
bash scripts/termux-setup.sh
```

#### Raspberry Pi
```bash
npm install
npm install puppeteer
```

#### High-Performance Server
```bash
npm install
npm install playwright
npx playwright install chromium firefox webkit
```

## 🎯 Usage

### Basic Commands

```bash
# Start local server
npm run serve

# Capture screenshot
npm run capture

# Test responsive design
npm run test-responsive

# Validate design
npm run check-errors

# Full UI workflow
npm run ui-design
```

### Remote Browser Connection

For environments without local browser support (like Termux):

1. **Start remote browser** (on desktop):
```bash
chrome --remote-debugging-port=9222 --headless
```

2. **Configure connection** (.env file):
```
REMOTE_BROWSER_URL=ws://YOUR_IP:9222
```

## 📋 Workflow Process

1. **Analyze Specifications** - Review design requirements
2. **Implement Code** - Write HTML/CSS/JavaScript
3. **Capture Screenshot** - Automated visual capture
4. **Validate Design** - Compare against specifications
5. **Iterate** - Refine until pixel-perfect

## 🔧 Configuration

### Environment Variables (.env)
```env
BROWSER_PATH=/usr/bin/chromium
HEADLESS=true
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080
DEVICE_EMULATION=desktop
SCREENSHOT_DIR=screenshots/current
TARGET_URL=http://localhost:3000
```

### Viewport Presets

| Device | Width | Height |
|--------|-------|--------|
| Mobile | 375 | 812 |
| Tablet | 768 | 1024 |
| Desktop | 1920 | 1080 |
| 4K | 2560 | 1440 |

## 📁 Project Structure

```
ui-design-workflow/
├── README.md           # This file
├── CLAUDE.md          # Detailed workflow documentation
├── package.json       # Node dependencies
├── .env              # Configuration
├── config/           # Configuration files
├── docs/            # Documentation
├── examples/        # Example projects
├── scripts/         # Automation scripts
│   ├── capture-screenshot.js
│   ├── test-responsive.js
│   ├── validate-design.js
│   └── setup-ui-workflow.js
├── src/             # Source files
│   ├── components/
│   ├── styles/
│   └── assets/
├── screenshots/     # Visual outputs
│   ├── current/
│   └── archive/
└── tests/          # Test suites
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Full Workflow Guide](./CLAUDE.md)
- [API Reference](./docs/api.md)
- [Examples](./examples/)
- [Troubleshooting](./docs/troubleshooting.md)

## 🛠️ Supported Platforms

| Platform | Browser Engine | Status |
|----------|---------------|--------|
| Desktop | Playwright/Puppeteer | ✅ Full Support |
| Termux | Remote Browser | ✅ Via Remote |
| Raspberry Pi | Puppeteer | ✅ Lightweight |
| Cloud Server | Playwright | ✅ Full Support |

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Built with Claude Code
- Inspired by modern CI/CD practices
- Designed for pixel-perfect implementations

## 📞 Support

- GitHub Issues: [Report bugs or request features](https://github.com/M0nkeyFl0wer/ui-design-workflow/issues)
- Documentation: [CLAUDE.md](./CLAUDE.md)

---

**Author**: M0nkeyFl0wer
**GitHub**: https://github.com/M0nkeyFl0wer
**Blog Reference**: benwest.blog