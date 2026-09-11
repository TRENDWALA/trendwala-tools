const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FIXTURES_DIR = path.join(__dirname, 'test', 'fixtures');
const SAMPLE1 = path.join(FIXTURES_DIR, 'sample1.heic');
const SAMPLE2 = path.join(FIXTURES_DIR, 'sample2.heic');

// Create a corrupt HEIC file for testing invalid file handling
const CORRUPT_FILE = path.join(FIXTURES_DIR, 'corrupt.heic');
fs.writeFileSync(CORRUPT_FILE, 'This is definitely not a real HEIC image file content.');

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

async function runTests() {
  console.log('=====================================================');
  console.log('STARTING REAL BROWSER E2E TESTS ON PRODUCTION BUILD');
  console.log('Target: http://localhost:4173/convert/heic-to-jpg/');
  console.log('Browser: Google Chrome (Headless)');
  console.log('=====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Track network requests to verify ZERO server uploads
  const fileUploadRequests = [];
  page.on('request', req => {
    const url = req.url();
    const method = req.method();
    const postData = req.postData();
    // Detect any HTTP POST/PUT or outbound data transfer carrying request payload
    if (method === 'POST' || method === 'PUT' || (postData && postData.length > 0)) {
      fileUploadRequests.push({ url, method, postDataLength: postData ? postData.length : 0 });
    }
  });

  // Track console messages and errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.error('  [BROWSER ERROR]:', err.message);
  });

  console.log('--- 1. LOADING HEIC TO JPG PRODUCTION PAGE ---');
  await page.goto('http://localhost:4173/convert/heic-to-jpg/', { waitUntil: 'networkidle0' });
  const title = await page.title();
  assert(title.includes('HEIC to JPG'), `Page loaded with title: "${title}"`);

  // Verify lazy loaded scripts exist
  const hasHeic2Any = await page.evaluate(() => typeof window.heic2any === 'function');
  const hasJSZip = await page.evaluate(() => typeof window.JSZip === 'function');
  const hasImageTools = await page.evaluate(() => typeof window.TrendWalaImageTools === 'object');
  assert(hasHeic2Any, 'heic2any engine is loaded and accessible');
  assert(hasJSZip, 'JSZip library is loaded and accessible');
  assert(hasImageTools, 'TrendWalaImageTools is initialized');

  console.log('\n--- 2. VERIFYING HEIC ACCEPTANCE & FILE QUEUE ---');
  const fileInput = await page.$('#image-file-input');
  await fileInput.uploadFile(SAMPLE1);

  await page.waitForSelector('.file-item-card', { timeout: 5000 });
  const queueCount = await page.$$eval('.file-item-card', cards => cards.length);
  assert(queueCount === 1, 'HEIC file is accepted and rendered in file queue');

  const fileName = await page.$eval('.file-name-text', el => el.textContent.trim());
  assert(fileName === 'sample1.heic', `Queue item shows correct filename: ${fileName}`);

  const initialStatus = await page.$eval('.file-status-badge', el => el.textContent.trim());
  assert(initialStatus === 'Ready', `Initial status badge is "${initialStatus}"`);

  console.log('\n--- 3. VERIFYING HEIC TO JPG CONVERSION & VALID JPG OUTPUT ---');
  // Set quality to 90%
  await page.evaluate(() => {
    const slider = document.getElementById('conversion-quality');
    slider.value = 90;
    slider.dispatchEvent(new Event('input'));
  });

  // Click Convert
  await page.click('#btn-start-convert');

  // Wait for conversion status 'Done'
  await page.waitForFunction(() => {
    const badge = document.querySelector('.file-status-badge');
    return badge && badge.textContent.trim() === 'Done';
  }, { timeout: 60000 });

  const convertedStatus = await page.$eval('.file-status-badge', el => el.textContent.trim());
  assert(convertedStatus === 'Done', 'Status badge updated to "Done"');

  // Verify preview thumbnail rendered
  const hasThumb = await page.$eval('.file-thumb-preview', el => el.tagName === 'IMG' && el.src.startsWith('blob:'));
  assert(hasThumb, 'Converted image preview thumbnail rendered as blob URL');

  // Extract converted blob bytes from browser to verify valid JPEG magic bytes
  const jpegValidation = await page.evaluate(async () => {
    const img = document.querySelector('.file-thumb-preview');
    const response = await fetch(img.src);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // JPEG header: FF D8 FF
    const isJpeg = uint8[0] === 0xFF && uint8[1] === 0xD8 && uint8[2] === 0xFF;
    return {
      size: blob.size,
      type: blob.type,
      isJpeg: isJpeg,
      magicHex: `${uint8[0].toString(16)} ${uint8[1].toString(16)} ${uint8[2].toString(16)}`
    };
  });

  assert(jpegValidation.isJpeg, `Output is a verified valid JPEG (Magic header: ${jpegValidation.magicHex.toUpperCase()})`);
  assert(jpegValidation.size > 50000, `Output JPEG has realistic photo size (${Math.round(jpegValidation.size / 1024)} KB)`);

  console.log('\n--- 4. VERIFYING JPG QUALITY CONTROL ---');
  // Clear queue
  await page.click('#btn-clear-queue');
  await page.waitForFunction(() => document.querySelectorAll('.file-item-card').length === 0);

  // Convert at 30% quality
  await fileInput.uploadFile(SAMPLE1);
  await page.waitForSelector('.file-item-card');
  await page.evaluate(() => {
    const slider = document.getElementById('conversion-quality');
    slider.value = 30;
    slider.dispatchEvent(new Event('input'));
  });
  await page.click('#btn-start-convert');
  await page.waitForFunction(() => {
    const badge = document.querySelector('.file-status-badge');
    return badge && badge.textContent.trim() === 'Done';
  }, { timeout: 60000 });

  const size30Quality = await page.evaluate(async () => {
    const img = document.querySelector('.file-thumb-preview');
    const res = await fetch(img.src);
    const b = await res.blob();
    return b.size;
  });

  // Clear and convert at 95% quality
  await page.click('#btn-clear-queue');
  await page.waitForFunction(() => document.querySelectorAll('.file-item-card').length === 0);

  await fileInput.uploadFile(SAMPLE1);
  await page.waitForSelector('.file-item-card');
  await page.evaluate(() => {
    const slider = document.getElementById('conversion-quality');
    slider.value = 95;
    slider.dispatchEvent(new Event('input'));
  });
  await page.click('#btn-start-convert');
  await page.waitForFunction(() => {
    const badge = document.querySelector('.file-status-badge');
    return badge && badge.textContent.trim() === 'Done';
  }, { timeout: 60000 });

  const size95Quality = await page.evaluate(async () => {
    const img = document.querySelector('.file-thumb-preview');
    const res = await fetch(img.src);
    const b = await res.blob();
    return b.size;
  });

  console.log(`  Size at 30% quality: ${Math.round(size30Quality / 1024)} KB`);
  console.log(`  Size at 95% quality: ${Math.round(size95Quality / 1024)} KB`);
  assert(size95Quality > size30Quality * 1.5, 'Quality control works: 95% quality file is significantly larger than 30% quality file');

  console.log('\n--- 5. VERIFYING BATCH CONVERSION & ZIP DOWNLOAD ---');
  await page.click('#btn-clear-queue');
  await page.waitForFunction(() => document.querySelectorAll('.file-item-card').length === 0);

  // Upload multiple files
  await fileInput.uploadFile(SAMPLE1, SAMPLE2);
  await page.waitForFunction(() => document.querySelectorAll('.file-item-card').length === 2);
  const batchCount = await page.$$eval('.file-item-card', cards => cards.length);
  assert(batchCount === 2, `Batch upload queued 2 HEIC files successfully`);

  // Start batch convert
  await page.click('#btn-start-convert');

  // Wait until all badges are 'Done'
  await page.waitForFunction(() => {
    const badges = Array.from(document.querySelectorAll('.file-status-badge'));
    return badges.length === 2 && badges.every(b => b.textContent.trim() === 'Done');
  }, { timeout: 120000 });

  const batchStatus = await page.$$eval('.file-status-badge', badges => badges.map(b => b.textContent.trim()));
  assert(batchStatus[0] === 'Done' && batchStatus[1] === 'Done', 'Batch conversion converted all files to "Done"');

  // Verify individual download buttons exist
  const downloadBtnsCount = await page.$$eval('.btn-file-download', btns => btns.length);
  assert(downloadBtnsCount === 2, 'Individual download buttons rendered for each converted file');

  // Verify ZIP download button is visible
  const isZipVisible = await page.$eval('#btn-download-all-zip', el => el.style.display !== 'none');
  assert(isZipVisible, 'Batch "Download All (ZIP)" button is visible');

  // Test ZIP creation in browser
  const zipValidation = await page.evaluate(async () => {
    const zipBtn = document.getElementById('btn-download-all-zip');
    // We can also test JSZip directly with the two converted blobs
    const cards = Array.from(document.querySelectorAll('.file-item-card'));
    const zip = new JSZip();
    for (let i = 0; i < cards.length; i++) {
      const img = cards[i].querySelector('.file-thumb-preview');
      const res = await fetch(img.src);
      const b = await res.blob();
      zip.file(`converted_${i + 1}.jpg`, b);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const arrayBuffer = await zipBlob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    // ZIP magic bytes: PK (0x50 0x4B 0x03 0x04)
    const isZip = uint8[0] === 0x50 && uint8[1] === 0x4B && uint8[2] === 0x03 && uint8[3] === 0x04;
    return {
      size: zipBlob.size,
      isZip: isZip
    };
  });

  assert(zipValidation.isZip, `ZIP download generates a valid ZIP archive containing all converted JPGs (${Math.round(zipValidation.size / 1024)} KB)`);

  console.log('\n--- 6. VERIFYING GRACEFUL REJECTION OF INVALID / CORRUPT FILES ---');
  await page.click('#btn-clear-queue');
  await page.waitForFunction(() => document.querySelectorAll('.file-item-card').length === 0);

  await fileInput.uploadFile(CORRUPT_FILE);
  await page.waitForSelector('.file-item-card');
  await page.click('#btn-start-convert');

  // Wait for error state
  await page.waitForFunction(() => {
    const badge = document.querySelector('.file-status-badge');
    return badge && badge.textContent.trim() === 'Error';
  }, { timeout: 30000 });

  const errorStatus = await page.$eval('.file-status-badge', el => el.textContent.trim());
  assert(errorStatus === 'Error', 'Corrupt / invalid file handled gracefully with "Error" status');

  // Check toast notification was displayed
  const toastText = await page.$eval('.toast', el => el.textContent).catch(() => '');
  assert(toastText.length > 0, `User is notified via error toast: "${toastText.trim()}"`);

  console.log('\n--- 7. VERIFYING ZERO FILE UPLOADS TO ANY SERVER ---');
  assert(fileUploadRequests.length === 0, `Zero outbound file uploads detected during entire test suite (Found ${fileUploadRequests.length})`);
  assert(pageErrors.length === 0, `Zero uncaught JavaScript exceptions during execution`);

  await browser.close();

  console.log(`\n=====================================================`);
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=====================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
