const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FIXTURES_DIR = path.join(__dirname, 'test', 'fixtures');
const SAMPLE1 = path.join(FIXTURES_DIR, 'sample1.heic');
const SAMPLE2 = path.join(FIXTURES_DIR, 'sample2.heic');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function runMobileTests() {
  console.log('=====================================================');
  console.log('STARTING REAL MOBILE BROWSER AUTOMATION TESTS');
  console.log('Simulating: iPhone 14 / iOS Safari (390 x 844, Touch)');
  console.log('Target Server: http://localhost:4173');
  console.log('=====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Emulate Mobile Device (iPhone 14)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');

  // Track page errors
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('--- 1. HOMEPAGE MOBILE RESPONSIVENESS & OVERFLOW ---');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Verify NO horizontal overflow (scrollWidth should not exceed clientWidth)
  const overflowTest = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    return {
      docWidth,
      scrollWidth,
      bodyWidth,
      hasOverflow: scrollWidth > docWidth || bodyWidth > docWidth
    };
  });
  assert(!overflowTest.hasOverflow, `Homepage fits mobile viewport without horizontal overflow (${overflowTest.docWidth}px wide)`);

  console.log('\n--- 2. MOBILE NAVIGATION DRAWER & HAMBURGER MENU ---');
  const hamburgerVisible = await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    if (!btn) return false;
    const style = window.getComputedStyle(btn);
    return style.display !== 'none' && btn.offsetHeight > 0;
  });
  assert(hamburgerVisible, 'Mobile hamburger menu toggle button is visible on mobile');

  // Tap hamburger menu to open drawer
  await page.tap('#mobile-menu-btn');
  await page.waitForFunction(() => {
    const drawer = document.getElementById('mobile-drawer-menu');
    return drawer && drawer.classList.contains('open');
  }, { timeout: 3000 });

  const isDrawerActive = await page.$eval('#mobile-drawer-menu', el => el.classList.contains('open'));
  assert(isDrawerActive, 'Mobile navigation drawer opened on touch tap');

  // Verify drawer links
  const drawerLinksCount = await page.$$eval('.mobile-drawer-link', links => links.length);
  assert(drawerLinksCount >= 5, `Mobile drawer contains ${drawerLinksCount} navigation links`);

  // Tap hamburger menu again to close drawer
  await page.tap('#mobile-menu-btn');
  await page.waitForFunction(() => {
    const drawer = document.getElementById('mobile-drawer-menu');
    return drawer && !drawer.classList.contains('open');
  }, { timeout: 3000 });

  const isDrawerClosed = await page.$eval('#mobile-drawer-menu', el => !el.classList.contains('open'));
  assert(isDrawerClosed, 'Mobile drawer closed cleanly on second tap');

  console.log('\n--- 3. DARK / LIGHT THEME TOGGLE ON MOBILE ---');
  const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.tap('#theme-toggle-btn');
  const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  assert(toggledTheme !== initialTheme, `Theme successfully toggled from "${initialTheme}" to "${toggledTheme}" on touch tap`);

  await page.tap('#theme-toggle-btn');
  const revertedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  assert(revertedTheme === initialTheme, `Theme successfully toggled back to "${revertedTheme}" on second tap`);

  console.log('\n--- 4. MOBILE TOOL SEARCH INTERACTION ---');
  const searchInput = await page.$('#home-search-input');
  await searchInput.tap();
  await searchInput.type('heic');

  // Verify tool cards filtered
  const visibleCardsCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.tool-card'));
    return cards.filter(c => c.style.display !== 'none').length;
  });
  assert(visibleCardsCount >= 3 && visibleCardsCount <= 6, `Search filtered to ${visibleCardsCount} HEIC tool cards on mobile`);

  // Clear search
  await page.evaluate(() => {
    const inp = document.getElementById('home-search-input');
    inp.value = '';
    inp.dispatchEvent(new Event('input'));
  });

  console.log('\n--- 5. HEIC TO JPG CONVERTER MOBILE INTERACTION ---');
  await page.goto('http://localhost:4173/convert/heic-to-jpg/', { waitUntil: 'networkidle0' });

  // Verify no horizontal overflow on tool page
  const toolPageOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    return scrollWidth <= docWidth;
  });
  assert(toolPageOverflow, 'HEIC tool page fits mobile viewport without horizontal scroll');

  // Verify dropzone is present and touch friendly
  const dropzoneSizing = await page.evaluate(() => {
    const dz = document.getElementById('image-dropzone');
    const rect = dz.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      touchTargetAdequate: rect.height >= 120 && rect.width >= 280
    };
  });
  assert(dropzoneSizing.touchTargetAdequate, `Dropzone is generously sized for touch (${dropzoneSizing.width}x${dropzoneSizing.height}px)`);

  // Upload test fixture
  const fileInput = await page.$('#image-file-input');
  await fileInput.uploadFile(SAMPLE1);

  await page.waitForSelector('.file-item-card', { timeout: 5000 });
  const itemCardRendered = await page.evaluate(() => {
    const card = document.querySelector('.file-item-card');
    const rect = card.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  assert(itemCardRendered, 'File item card rendered properly on mobile viewport');

  // Touch/drag quality slider
  await page.evaluate(() => {
    const slider = document.getElementById('conversion-quality');
    slider.value = 85;
    slider.dispatchEvent(new Event('input'));
  });
  const qualityText = await page.$eval('#quality-val', el => el.textContent.trim());
  assert(qualityText === '85%', `Quality slider value updated to ${qualityText} on touch input`);

  // Tap Convert button
  const convertBtn = await page.$('#btn-start-convert');
  await convertBtn.tap();

  // Wait for conversion completion
  await page.waitForFunction(() => {
    const badge = document.querySelector('.file-status-badge');
    return badge && badge.textContent.trim() === 'Done';
  }, { timeout: 60000 });

  assert(true, 'HEIC to JPG conversion completed on mobile browser');

  // Verify touch targets for download button
  const downloadBtnTouchTarget = await page.evaluate(() => {
    const btn = document.querySelector('.btn-file-download');
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.height >= 38 && rect.width >= 80;
  });
  assert(downloadBtnTouchTarget, 'Individual Download button meets touch target usability guidelines');

  // Test FAQ accordion tap
  console.log('\n--- 6. MOBILE FAQ ACCORDION TOUCH INTERACTION ---');
  const firstFaqQuestion = await page.$('.faq-question');
  if (firstFaqQuestion) {
    const wasOpen = await page.$eval('.faq-item', el => el.classList.contains('open'));
    await firstFaqQuestion.tap();
    await page.waitForFunction((initialOpen) => {
      const item = document.querySelector('.faq-item');
      return item && item.classList.contains('open') !== initialOpen;
    }, { timeout: 3000 }, wasOpen);

    const toggledOpen = await page.$eval('.faq-item', el => el.classList.contains('open'));
    assert(toggledOpen !== wasOpen, `FAQ accordion item toggled smoothly on touch tap (${wasOpen} -> ${toggledOpen})`);
  }

  // Small screen test (iPhone SE: 375 x 667)
  console.log('\n--- 7. TESTING EXTRA SMALL MOBILE VIEWPORT (iPhone SE 375x667) ---');
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  const smallScreenOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  });
  assert(smallScreenOverflow, 'No horizontal overflow on small 375px mobile viewport (iPhone SE)');

  assert(pageErrors.length === 0, `Zero mobile console errors or uncaught exceptions during test`);

  await browser.close();

  console.log(`\n=====================================================`);
  console.log(`MOBILE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=====================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runMobileTests().catch(err => {
  console.error('Mobile test failed:', err);
  process.exit(1);
});
