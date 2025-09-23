#!/usr/bin/env node

/**
 * Screenshot Capture Script
 * Captures screenshots of web pages for visual validation
 */

const fs = require('fs');
const path = require('path');

// Determine which library to use based on environment
let browserAutomation;
let browserType;

if (process.platform === 'android' || fs.existsSync('/data/data/com.termux')) {
  // Use puppeteer-core for Termux/Android
  try {
    browserAutomation = require('puppeteer-core');
    browserType = 'puppeteer-core';
  } catch (error) {
    console.error('Puppeteer-core not installed. Run: npm install puppeteer-core');
    process.exit(1);
  }
} else {
  // Try Playwright first, then Puppeteer for desktop
  try {
    browserAutomation = require('playwright');
    browserType = 'playwright';
  } catch (error) {
    try {
      browserAutomation = require('puppeteer');
      browserType = 'puppeteer';
    } catch (error2) {
      console.error('No browser automation library found. Install playwright or puppeteer.');
      process.exit(1);
    }
  }
}

async function captureScreenshot(url = 'http://localhost:3000', outputPath = null) {
  console.log(`📸 Capturing screenshot using ${browserType}...`);

  let browser;
  let page;

  try {
    // Launch browser based on type
    if (browserType === 'playwright') {
      browser = await browserAutomation.chromium.launch({
        headless: true
      });
      page = await browser.newPage();
    } else if (browserType === 'puppeteer-core') {
      // For Termux, need to specify chromium path
      const chromeLauncher = require('chrome-launcher');
      const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
      });

      browser = await browserAutomation.connect({
        browserURL: `http://localhost:${chrome.port}`
      });
      page = await browser.newPage();
    } else {
      // Regular puppeteer
      browser = await browserAutomation.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
    }

    // Set viewport
    await page.setViewport({
      width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
      height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
    });

    // Listen for console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
      if (msg.type() === 'error') {
        console.error('❌ Console Error:', msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error);
    });

    // Navigate to URL
    console.log(`🔗 Navigating to: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    }).catch(error => {
      console.error('Failed to navigate:', error.message);
      return null;
    });

    if (response && !response.ok()) {
      console.warn(`⚠️  Page returned status: ${response.status()}`);
    }

    // Take screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = outputPath ||
      path.join('screenshots', 'current', `screenshot-${timestamp}.png`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved: ${screenshotPath}`);

    // Save console logs
    if (consoleLogs.length > 0) {
      const logsPath = screenshotPath.replace('.png', '-logs.json');
      fs.writeFileSync(logsPath, JSON.stringify(consoleLogs, null, 2));
      console.log(`📝 Console logs saved: ${logsPath}`);
    }

    return {
      screenshot: screenshotPath,
      logs: consoleLogs,
      status: response ? response.status() : null
    };

  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0] || process.env.TARGET_URL || 'http://localhost:3000';
  const outputPath = args[1] || null;

  captureScreenshot(url, outputPath)
    .then(result => {
      console.log('\n✨ Capture complete!');
      if (result.logs.filter(l => l.type === 'error').length > 0) {
        console.log('⚠️  Console errors detected. Check logs for details.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Failed to capture screenshot:', error);
      process.exit(1);
    });
}

module.exports = { captureScreenshot };