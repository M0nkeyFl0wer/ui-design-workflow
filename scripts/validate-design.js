#!/usr/bin/env node

/**
 * Design Validation Script
 * Validates UI implementation against specifications
 */

const fs = require('fs');
const path = require('path');

async function validateDesign(url = 'http://localhost:3000', specPath = null) {
  console.log('🔍 Validating Design Implementation...\n');

  let browserAutomation;
  let browserType;

  // Determine which browser automation to use
  if (process.platform === 'android' || fs.existsSync('/data/data/com.termux')) {
    try {
      browserAutomation = require('puppeteer-core');
      browserType = 'puppeteer-core';
    } catch (error) {
      console.error('Puppeteer-core not installed.');
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

  let browser;
  let page;
  const validationResults = {
    url: url,
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    performance: {}
  };

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

    // Set up error tracking
    const consoleErrors = [];
    const pageErrors = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.toString());
    });

    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Navigate to page
    console.log(`📍 Navigating to: ${url}`);
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTime = Date.now() - startTime;

    validationResults.performance.loadTime = `${loadTime}ms`;
    console.log(`✅ Page loaded in ${loadTime}ms`);

    // Run validation checks
    console.log('\n🔍 Running validation checks...\n');

    // 1. Check Console Errors
    validationResults.checks.consoleErrors = consoleErrors.length === 0;
    if (consoleErrors.length > 0) {
      console.log(`❌ Console Errors: ${consoleErrors.length}`);
      validationResults.errors.push(...consoleErrors);
    } else {
      console.log('✅ No console errors');
    }

    // 2. Check Page Errors
    validationResults.checks.pageErrors = pageErrors.length === 0;
    if (pageErrors.length > 0) {
      console.log(`❌ Page Errors: ${pageErrors.length}`);
      validationResults.errors.push(...pageErrors);
    } else {
      console.log('✅ No page errors');
    }

    // 3. Check Network Errors
    validationResults.checks.networkErrors = networkErrors.length === 0;
    if (networkErrors.length > 0) {
      console.log(`❌ Network Errors: ${networkErrors.length}`);
      validationResults.errors.push(...networkErrors.map(e => `${e.status} - ${e.url}`));
    } else {
      console.log('✅ No network errors');
    }

    // 4. Run in-page validation
    const pageValidation = await page.evaluate(() => {
      const results = {
        accessibility: {},
        responsive: {},
        performance: {},
        seo: {}
      };

      // Check accessibility
      results.accessibility.hasAltText = Array.from(document.querySelectorAll('img'))
        .every(img => img.alt !== '');
      results.accessibility.hasProperHeadings = document.querySelector('h1') !== null;
      results.accessibility.hasLangAttribute = document.documentElement.lang !== '';

      // Check responsive design
      results.responsive.hasViewport = document.querySelector('meta[name="viewport"]') !== null;
      results.responsive.noHorizontalScroll = document.body.scrollWidth <= window.innerWidth;
      results.responsive.fontSizeReadable = parseInt(window.getComputedStyle(document.body).fontSize) >= 14;

      // Check performance indicators
      results.performance.imagesOptimized = Array.from(document.querySelectorAll('img'))
        .every(img => img.loading === 'lazy' || img.getBoundingClientRect().top < window.innerHeight);
      results.performance.cssCount = document.styleSheets.length;
      results.performance.domElements = document.querySelectorAll('*').length;

      // Check SEO basics
      results.seo.hasTitle = document.title !== '';
      results.seo.hasMetaDescription = document.querySelector('meta[name="description"]') !== null;
      results.seo.hasCanonicalUrl = document.querySelector('link[rel="canonical"]') !== null;

      return results;
    });

    // Process validation results
    Object.entries(pageValidation).forEach(([category, checks]) => {
      console.log(`\n📋 ${category.charAt(0).toUpperCase() + category.slice(1)}:`);
      Object.entries(checks).forEach(([check, result]) => {
        const status = typeof result === 'boolean' ? (result ? '✅' : '❌') : '📊';
        console.log(`  ${status} ${check}: ${result}`);
        validationResults.checks[`${category}.${check}`] = result;
      });
    });

    // 5. Check against specifications if provided
    if (specPath && fs.existsSync(specPath)) {
      console.log('\n📋 Checking against specifications...');
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

      if (spec.colors) {
        const usedColors = await page.evaluate(() => {
          const colors = new Set();
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            colors.add(style.color);
            colors.add(style.backgroundColor);
            colors.add(style.borderColor);
          });
          return Array.from(colors);
        });

        console.log(`  Found ${usedColors.length} unique colors`);
        validationResults.checks.colorPalette = usedColors;
      }

      if (spec.fonts) {
        const usedFonts = await page.evaluate(() => {
          const fonts = new Set();
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            fonts.add(style.fontFamily);
          });
          return Array.from(fonts);
        });

        console.log(`  Found ${usedFonts.length} unique font families`);
        validationResults.checks.fontFamilies = usedFonts;
      }
    }

    // 6. Take validation screenshot
    const screenshotPath = path.join('screenshots', 'current', `validation-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Validation screenshot: ${screenshotPath}`);
    validationResults.screenshot = screenshotPath;

    // Generate report
    const reportPath = path.join('screenshots', 'current', 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
    console.log(`📊 Report saved: ${reportPath}`);

    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('📋 VALIDATION SUMMARY');
    console.log('═══════════════════════════════════════');

    const totalChecks = Object.keys(validationResults.checks).length;
    const passedChecks = Object.values(validationResults.checks)
      .filter(v => v === true).length;
    const failedChecks = Object.values(validationResults.checks)
      .filter(v => v === false).length;

    console.log(`Total Checks: ${totalChecks}`);
    console.log(`✅ Passed: ${passedChecks}`);
    console.log(`❌ Failed: ${failedChecks}`);
    console.log(`📊 Info: ${totalChecks - passedChecks - failedChecks}`);

    if (validationResults.errors.length === 0) {
      console.log('\n✨ No critical errors found!');
    } else {
      console.log(`\n❌ ${validationResults.errors.length} errors found`);
    }

    return validationResults;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    validationResults.errors.push(error.toString());
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
  const specPath = args[1] || 'design-spec.json';

  validateDesign(url, specPath)
    .then(results => {
      const hasErrors = results.errors.length > 0;
      process.exit(hasErrors ? 1 : 0);
    })
    .catch(error => {
      console.error('Validation error:', error);
      process.exit(1);
    });
}

module.exports = { validateDesign };