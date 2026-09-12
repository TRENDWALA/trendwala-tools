const fs = require('fs');
const path = require('path');
const tools = require('./data/tools');
const categories = require('./data/categories');

const DIST = path.join(__dirname, 'dist');
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

console.log('\n--- 1. VERIFYING TOOLS & PAGES IN DIST ---');
assert(fs.existsSync(path.join(DIST, 'index.html')), 'Homepage exists (dist/index.html)');

// Verify all 30 tools
assert(tools.length === 30, `Registry contains exactly 30 tools (found ${tools.length})`);
for (const tool of tools) {
  const toolPath = path.join(DIST, tool.slug.replace(/^\//, ''), 'index.html');
  assert(fs.existsSync(toolPath), `Tool page exists: ${tool.slug}`);
}

// Verify 5 categories
for (const cat of Object.values(categories)) {
  const catPath = path.join(DIST, cat.slug, 'index.html');
  assert(fs.existsSync(catPath), `Category page exists: ${cat.slug}`);
}

// Verify Info pages
const infoPages = ['about', 'privacy', 'terms', 'contact', '404.html'];
for (const page of infoPages) {
  const pagePath = page.endsWith('.html') ? path.join(DIST, page) : path.join(DIST, page, 'index.html');
  assert(fs.existsSync(pagePath), `Info page exists: ${page}`);
}

console.log('\n--- 2. VERIFYING VENDOR AND SCRIPT ASSETS ---');
const vendorAssets = [
  'main.css',
  'tools.css',
  'core.js',
  'image-tools.js',
  'pdf-tools.js',
  'text-tools.js',
  'dev-tools.js',
  'qr-tool.js',
  'vendor/heic2any.min.js',
  'vendor/pdf-lib.min.js',
  'vendor/jszip.min.js',
  'vendor/pdf.min.js',
  'vendor/pdf.worker.min.js',
  'vendor/cropper.min.js',
  'vendor/cropper.min.css',
  'vendor/qrcode.min.js'
];

for (const asset of vendorAssets) {
  let assetPath;
  if (asset.endsWith('.css')) {
    assetPath = asset.includes('vendor/') 
      ? path.join(DIST, 'assets', asset) 
      : path.join(DIST, 'assets/css', asset);
  } else if (asset.includes('vendor/')) {
    assetPath = path.join(DIST, 'assets', asset);
  } else if (asset === 'core.js') {
    assetPath = path.join(DIST, 'assets/js/core.js');
  } else {
    assetPath = path.join(DIST, 'assets/js/tools', asset);
  }
  
  const exists = fs.existsSync(assetPath);
  const size = exists ? fs.statSync(assetPath).size : 0;
  assert(exists && size > 50, `Asset verified: ${asset} (${size} bytes)`);
}

console.log('\n--- 3. VERIFYING SITEMAP & ROBOTS.TXT ---');
const sitemapPath = path.join(DIST, 'sitemap.xml');
const robotsPath = path.join(DIST, 'robots.txt');
assert(fs.existsSync(sitemapPath), 'sitemap.xml exists');
assert(fs.existsSync(robotsPath), 'robots.txt exists');

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(sitemapContent.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'sitemap.xml starts with valid XML declaration');
assert(sitemapContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'sitemap.xml has valid <urlset> namespace');
assert(sitemapContent.trim().endsWith('</urlset>'), 'sitemap.xml closes with </urlset>');

const urlMatches = Array.from(sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
assert(urlMatches.length === 40, `sitemap contains exactly 40 indexed URLs (found ${urlMatches.length})`);
assert(new Set(urlMatches).size === urlMatches.length, 'sitemap contains zero duplicate URLs');

const invalidUrls = urlMatches.filter(u => !u.startsWith('https://tools.trendwala.in/'));
assert(invalidUrls.length === 0, `All URLs are absolute HTTPS under https://tools.trendwala.in/ (invalid: ${invalidUrls.length})`);
assert(!urlMatches.some(u => u.includes('localhost') || u.startsWith('http://')), 'Zero localhost or HTTP URLs in sitemap loc elements');
assert(!sitemapContent.includes('404.html'), 'Zero non-indexable URLs (404) in sitemap');

assert(sitemapContent.includes('https://tools.trendwala.in/'), 'sitemap includes root URL');
assert(sitemapContent.includes('https://tools.trendwala.in/convert/heic-to-jpg/'), 'sitemap includes priority HEIC tool');

const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('Sitemap: https://tools.trendwala.in/sitemap.xml'), 'robots.txt references Sitemap: https://tools.trendwala.in/sitemap.xml');

// Netlify configuration checks
const netlifyTomlContent = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
assert(netlifyTomlContent.includes('for = "/sitemap.xml"'), 'netlify.toml has headers for /sitemap.xml');
assert(netlifyTomlContent.includes('Content-Type = "application/xml; charset=UTF-8"'), 'netlify.toml specifies application/xml for sitemap.xml');
assert(fs.existsSync(path.join(DIST, '_headers')), 'dist/_headers exists');
assert(fs.existsSync(path.join(DIST, '_redirects')), 'dist/_redirects exists');

console.log('\n--- 4. VERIFYING SEO, CANONICAL & JSON-LD ON HEIC PAGE ---');
const heicHtml = fs.readFileSync(path.join(DIST, 'convert/heic-to-jpg/index.html'), 'utf8');
assert(heicHtml.includes('<title>HEIC to JPG Converter Online Free'), 'Title tag present and accurate');
assert(heicHtml.includes('rel="canonical" href="https://tools.trendwala.in/convert/heic-to-jpg/"'), 'Canonical URL is exact');
assert(heicHtml.includes('application/ld+json'), 'JSON-LD scripts present');
assert(heicHtml.includes('"@type": "WebApplication"'), 'WebApplication schema present');
assert(heicHtml.includes('"@type": "BreadcrumbList"'), 'BreadcrumbList schema present');
assert(heicHtml.includes('"@type": "FAQPage"'), 'FAQPage schema present');
assert(!heicHtml.includes('{{'), 'No unrendered {{template_vars}} remaining');

// Check JSON-LD validity
const jsonLdBlocks = heicHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
assert(jsonLdBlocks.length === 3, `HEIC page has 3 JSON-LD blocks (found ${jsonLdBlocks.length})`);
for (let i = 0; i < jsonLdBlocks.length; i++) {
  const jsonStr = jsonLdBlocks[i].replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '').trim();
  try {
    const parsed = JSON.parse(jsonStr);
    assert(parsed['@context'] === 'https://schema.org', `JSON-LD block #${i + 1} (${parsed['@type']}) is valid JSON`);
  } catch (err) {
    assert(false, `JSON-LD block #${i + 1} failed JSON parse: ${err.message}`);
  }
}

console.log('\n--- 5. VERIFYING ZERO EXTERNAL UPLOADS / COMPLETE CLIENT-SIDE PRIVACY ---');
const jsFiles = [
  path.join(DIST, 'assets/js/core.js'),
  path.join(DIST, 'assets/js/tools/image-tools.js'),
  path.join(DIST, 'assets/js/tools/pdf-tools.js'),
  path.join(DIST, 'assets/js/tools/text-tools.js'),
  path.join(DIST, 'assets/js/tools/dev-tools.js'),
  path.join(DIST, 'assets/js/tools/qr-tool.js')
];

let suspiciousCalls = 0;
for (const file of jsFiles) {
  const code = fs.readFileSync(file, 'utf8');
  // Check if there are any fetch or axios or server POST calls sending FormData or blobs
  const hasExternalPost = /fetch\s*\(\s*['"]https?:|\.post\s*\(|XMLHttpRequest/i.test(code);
  if (hasExternalPost) {
    suspiciousCalls++;
    console.error(`  [WARN] Potential external request found in ${path.basename(file)}`);
  }
}
assert(suspiciousCalls === 0, 'Zero external network uploads or API requests in tool JavaScript code (100% private client-side processing)');

console.log(`\n========================================`);
console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

process.exit(failed > 0 ? 1 : 0);
