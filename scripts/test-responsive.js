#!/usr/bin/env node

/**
 * Responsive Design Testing Script
 * Tests UI across multiple viewport sizes and devices
 */

const fs = require('fs');
const path = require('path');
const { captureScreenshot } = require('./capture-screenshot');

// Viewport configurations
const viewports = {
  'mobile-small': { width: 320, height: 568, name: 'iPhone SE' },
  'mobile': { width: 375, height: 812, name: 'iPhone X/11/12' },
  'mobile-large': { width: 414, height: 896, name: 'iPhone XR/11 Pro Max' },
  'tablet': { width: 768, height: 1024, name: 'iPad' },
  'tablet-landscape': { width: 1024, height: 768, name: 'iPad Landscape' },
  'laptop': { width: 1366, height: 768, name: 'Laptop' },
  'desktop': { width: 1920, height: 1080, name: 'Full HD Desktop' },
  '4k': { width: 2560, height: 1440, name: '2K/4K Display' }
};

// Device emulation profiles
const devices = [
  'iPhone SE',
  'iPhone 12',
  'iPhone 14 Pro Max',
  'Pixel 5',
  'Samsung Galaxy S21',
  'iPad',
  'iPad Pro',
  'Surface Pro 7'
];

async function testResponsive(url = 'http://localhost:3000') {
  console.log('🔍 Starting Responsive Design Tests...\n');

  const results = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testDir = path.join('screenshots', 'responsive', timestamp);

  // Create test directory
  fs.mkdirSync(testDir, { recursive: true });

  // Load appropriate browser automation
  let browserAutomation;
  let browserType;

  if (process.platform === 'android' || fs.existsSync('/data/data/com.termux')) {
    try {
      browserAutomation = require('puppeteer-core');
      browserType = 'puppeteer-core';
    } catch (error) {
      console.error('Puppeteer-core not installed. Run: npm install puppeteer-core');
      process.exit(1);
    }
  } else {
    try {
      browserAutomation = require('playwright');
      browserType = 'playwright';
    } catch (error) {
      try {
        browserAutomation = require('puppeteer');
        browserType = 'puppeteer';
      } catch (error2) {
        console.error('No browser automation library found.');
        process.exit(1);
      }
    }
  }

  // Test each viewport
  for (const [key, viewport] of Object.entries(viewports)) {
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);

    let browser;
    let page;

    try {
      // Launch browser
      if (browserType === 'playwright') {
        browser = await browserAutomation.chromium.launch({ headless: true });
        page = await browser.newPage();
      } else if (browserType === 'puppeteer-core') {
        const chromeLauncher = require('chrome-launcher');
        const chrome = await chromeLauncher.launch({
          chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
        });
        browser = await browserAutomation.connect({
          browserURL: `http://localhost:${chrome.port}`
        });
        page = await browser.newPage();
      } else {
        browser = await browserAutomation.launch({
          headless: true,
          args: ['--no-sandbox']
        });
        page = await browser.newPage();
      }

      // Set viewport
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: key.includes('mobile') ? 2 : 1,
        hasTouch: key.includes('mobile') || key.includes('tablet'),
        isMobile: key.includes('mobile')
      });

      // Navigate and capture
      await page.goto(url, { waitUntil: 'networkidle2' });

      const screenshotPath = path.join(testDir, `${key}-${viewport.width}x${viewport.height}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✅ Captured: ${screenshotPath}`);

      // Check for responsive issues
      const issues = await page.evaluate(() => {
        const problems = [];

        // Check for horizontal scroll
        if (document.body.scrollWidth > window.innerWidth) {
          problems.push('Horizontal scroll detected');
        }

        // Check for elements outside viewport
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            problems.push(`Element exceeds viewport: ${el.tagName}.${el.className}`);
          }
        });

        // Check font sizes
        const bodyFontSize = window.getComputedStyle(document.body).fontSize;
        if (parseInt(bodyFontSize) < 14) {
          problems.push(`Font size too small: ${bodyFontSize}`);
        }

        return problems;
      });

      results.push({
        viewport: key,
        width: viewport.width,
        height: viewport.height,
        screenshot: screenshotPath,
        issues: issues
      });

      if (issues.length > 0) {
        console.log(`⚠️  Issues found: ${issues.join(', ')}`);
      }

      await browser.close();

    } catch (error) {
      console.error(`❌ Error testing ${viewport.name}:`, error.message);
      results.push({
        viewport: key,
        error: error.message
      });
      if (browser) await browser.close();
    }
  }

  // Generate report
  const reportPath = path.join(testDir, 'responsive-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Report saved: ${reportPath}`);

  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`Total viewports tested: ${results.length}`);
  const passed = results.filter(r => !r.error && (!r.issues || r.issues.length === 0)).length;
  const failed = results.length - passed;
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  return results;
}

// CLI usage
if (require.main === module) {
  const url = process.argv[2] || process.env.TARGET_URL || 'http://localhost:3000';

  testResponsive(url)
    .then(results => {
      const hasErrors = results.some(r => r.error || (r.issues && r.issues.length > 0));
      process.exit(hasErrors ? 1 : 0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testResponsive, viewports };