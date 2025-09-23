#!/usr/bin/env node

/**
 * Setup script for UI Workflow with Puppeteer
 * Configures browser automation for visual feedback
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function setup() {
  console.log('🚀 Setting up UI Design Workflow...\n');

  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);

  // Check if running on Android/Termux
  const isTermux = process.platform === 'android' ||
                   fs.existsSync('/data/data/com.termux');

  if (isTermux) {
    console.log('📱 Detected Termux/Android environment');
    await setupTermux();
  } else {
    console.log('💻 Detected Desktop environment');
    await setupDesktop();
  }

  // Create environment file
  await createEnvFile();

  // Create package.json scripts
  await updatePackageScripts();

  console.log('\n✨ Setup complete! Run "npm run ui-design" to start.\n');
}

async function setupTermux() {
  console.log('\nConfiguring for Termux...');

  try {
    // Check if chromium is installed
    const { stdout } = await execPromise('which chromium');
    console.log('✅ Chromium found at:', stdout.trim());
  } catch (error) {
    console.log('⚠️  Chromium not found. Installing...');
    try {
      await execPromise('pkg install chromium -y');
      console.log('✅ Chromium installed');
    } catch (installError) {
      console.log('❌ Failed to install chromium. Please run: pkg install chromium');
    }
  }

  // Check puppeteer-core
  if (!fs.existsSync('node_modules/puppeteer-core')) {
    console.log('Installing puppeteer-core...');
    await execPromise('npm install puppeteer-core chrome-launcher');
  }
}

async function setupDesktop() {
  console.log('\nConfiguring for Desktop...');

  // Check if playwright is installed
  if (!fs.existsSync('node_modules/playwright')) {
    console.log('Installing Playwright...');
    try {
      await execPromise('npm install playwright');
      await execPromise('npx playwright install chromium');
      console.log('✅ Playwright installed with Chromium');
    } catch (error) {
      console.log('⚠️  Falling back to Puppeteer...');
      await execPromise('npm install puppeteer');
      console.log('✅ Puppeteer installed');
    }
  }
}

async function createEnvFile() {
  const envContent = `# UI Workflow Configuration
BROWSER_PATH=${process.platform === 'android' ? '/usr/bin/chromium' : ''}
HEADLESS=true
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080
DEVICE_EMULATION=desktop
SCREENSHOT_DIR=screenshots/current
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env configuration file');
}

async function updatePackageScripts() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  packageJson.scripts = {
    ...packageJson.scripts,
    "ui-design": "node scripts/capture-screenshot.js",
    "capture": "node scripts/capture-screenshot.js",
    "test-responsive": "node scripts/test-responsive.js",
    "check-errors": "node scripts/validate-design.js",
    "setup": "node scripts/setup-ui-workflow.js"
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json scripts');
}

// Run setup
setup().catch(console.error);