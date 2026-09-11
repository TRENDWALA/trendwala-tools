const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const tools = require('./data/tools');
const categories = require('./data/categories');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

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

console.log('================================================================');
console.log('FINAL PRE-DEPLOYMENT PRODUCTION VERIFICATION');
console.log('Target Platform: Netlify (tools.trendwala.in)');
console.log('================================================================\n');

// 1. FRESH PRODUCTION BUILD
console.log('--- 1. EXECUTING FRESH PRODUCTION BUILD ---');
try {
  // Clean dist
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
    console.log('  Cleaned existing dist/ directory');
  }
  // Run build
  execSync('node build.js', { cwd: ROOT, stdio: 'pipe' });
  assert(fs.existsSync(DIST), 'Fresh production build completed and dist/ directory created');
} catch (err) {
  assert(false, `Build execution failed: ${err.message}`);
}

// 2. CONFIRM DIST REGENERATED
console.log('\n--- 2. CONFIRMING DIST REGENERATION ---');
assert(fs.existsSync(path.join(DIST, 'index.html')), 'dist/index.html generated successfully');
assert(fs.existsSync(path.join(DIST, 'assets')), 'dist/assets/ directory generated successfully');

// 3. CONFIRM ALL 30 TOOLS ARE PRESENT
console.log('\n--- 3. CONFIRMING ALL 30 TOOLS ARE PRESENT ---');
assert(tools.length === 30, `Tools registry contains exactly 30 tools (found ${tools.length})`);
for (const tool of tools) {
  const toolPath = path.join(DIST, tool.slug.replace(/^\//, ''), 'index.html');
  assert(fs.existsSync(toolPath), `Tool static route exists: /${tool.slug.replace(/^\//, '')}/`);
}

// 4. CONFIRM ALL P-SEO STATIC PAGES ARE PRESENT
console.log('\n--- 4. CONFIRMING ALL P-SEO STATIC PAGES ARE PRESENT ---');
for (const cat of Object.values(categories)) {
  const catPath = path.join(DIST, cat.slug, 'index.html');
  assert(fs.existsSync(catPath), `Category hub page exists: /${cat.slug}/`);
}
const infoPages = ['about', 'privacy', 'terms', 'contact', '404.html'];
for (const page of infoPages) {
  const pagePath = page.endsWith('.html') ? path.join(DIST, page) : path.join(DIST, page, 'index.html');
  assert(fs.existsSync(pagePath), `Informational page exists: /${page}/`);
}

// 5. CONFIRM SITEMAP.XML AND ROBOTS.TXT
console.log('\n--- 5. CONFIRMING SITEMAP.XML AND ROBOTS.TXT ---');
const sitemapPath = path.join(DIST, 'sitemap.xml');
const robotsPath = path.join(DIST, 'robots.txt');
assert(fs.existsSync(sitemapPath), 'dist/sitemap.xml exists');
assert(fs.existsSync(robotsPath), 'dist/robots.txt exists');

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locCount = (sitemapContent.match(/<loc>/g) || []).length;
assert(locCount === 40, `sitemap.xml contains exactly 40 indexed production URLs (found ${locCount})`);

const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('Sitemap: https://tools.trendwala.in/sitemap.xml'), 'robots.txt points to https://tools.trendwala.in/sitemap.xml');

// 6. CONFIRM CANONICAL URLS USE https://tools.trendwala.in/
console.log('\n--- 6. CONFIRMING CANONICAL URLS ACROSS ALL PAGES ---');
function getAllHtmlFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const allHtmlFiles = getAllHtmlFiles(DIST);
let canonicalMismatch = 0;
for (const file of allHtmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (path.basename(file) === '404.html') continue; // 404 doesn't need canonical
  const match = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!match || !match[1].startsWith('https://tools.trendwala.in/')) {
    canonicalMismatch++;
    console.error(`  [FAIL] Missing or invalid canonical in: ${path.relative(DIST, file)}`);
  }
}
assert(canonicalMismatch === 0, `All ${allHtmlFiles.length} HTML pages have valid https://tools.trendwala.in/ canonical URLs`);

// 7. SEARCH DIST FILES FOR LOCALHOST REFERENCES
console.log('\n--- 7. AUDITING DIST FILES FOR LOCALHOST / DEV URLS ---');
function getAllFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allDistFiles = getAllFiles(DIST);
let localhostOccurrences = [];
const disallowedPatterns = [/localhost:\d+/i, /127\.0\.0\.1/i, /10\.71\.\d+\.\d+/i];

for (const file of allDistFiles) {
  const ext = path.extname(file).toLowerCase();
  if (!['.html', '.js', '.css', '.xml', '.txt', '.json'].includes(ext)) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of disallowedPatterns) {
    if (pattern.test(content)) {
      localhostOccurrences.push({ file: path.relative(DIST, file), pattern: pattern.toString() });
    }
  }
}
assert(localhostOccurrences.length === 0, `Zero localhost or internal LAN IP references found in dist/ (Found ${localhostOccurrences.length})`);

// 8. CHECK FOR BROKEN INTERNAL LINKS
console.log('\n--- 8. CHECKING FOR BROKEN INTERNAL LINKS ---');
let brokenLinks = [];
let totalLinksChecked = 0;

for (const file of allHtmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Match href and src attributes starting with /
  const linkMatches = content.matchAll(/(?:href|src)="(\/[^"#?]+)(?:[#?][^"]*)?"/gi);
  for (const match of linkMatches) {
    const rawTarget = match[1];
    totalLinksChecked++;
    let resolvedTarget;
    if (rawTarget.endsWith('/')) {
      resolvedTarget = path.join(DIST, rawTarget.substring(1), 'index.html');
    } else if (path.extname(rawTarget)) {
      resolvedTarget = path.join(DIST, rawTarget.substring(1));
    } else {
      resolvedTarget = path.join(DIST, rawTarget.substring(1), 'index.html');
    }

    if (!fs.existsSync(resolvedTarget)) {
      brokenLinks.push({
        source: path.relative(DIST, file),
        target: rawTarget,
        resolved: resolvedTarget
      });
    }
  }
}
assert(brokenLinks.length === 0, `All ${totalLinksChecked} internal link references resolve successfully to existing files (0 broken links)`);
if (brokenLinks.length > 0) {
  console.error('Broken links found:', JSON.stringify(brokenLinks.slice(0, 5), null, 2));
}

// 9. CONFIRM NETLIFY.TOML
console.log('\n--- 9. CONFIRMING NETLIFY.TOML CONFIGURATION ---');
const netlifyTomlPath = path.join(ROOT, 'netlify.toml');
assert(fs.existsSync(netlifyTomlPath), 'netlify.toml exists in root');
const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');
assert(tomlContent.includes('publish = "dist"'), 'netlify.toml specifies publish = "dist"');
assert(tomlContent.includes('command = "node build.js"'), 'netlify.toml specifies command = "node build.js"');
assert(tomlContent.includes('X-Frame-Options'), 'Security headers configured in netlify.toml');
assert(tomlContent.includes('Cache-Control'), 'Asset caching configured in netlify.toml');
assert(tomlContent.includes('to = "/404.html"'), '404 fallback redirect configured in netlify.toml');

// 10. CONFIRM NO BACKEND / SERVER DEPENDENCY
console.log('\n--- 10. CONFIRMING NO BACKEND / SERVER RUNTIME DEPENDENCIES ---');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const backendDeps = ['express', 'koa', 'fastify', 'mongoose', 'pg', 'mysql', 'sqlite3', 'redis'];
const hasBackendDep = Object.keys(pkg.dependencies || {}).some(d => backendDeps.includes(d));
assert(!hasBackendDep, 'No backend framework or database driver dependencies in package.json');

// 11. CONFIRM NO USER FILES ARE UPLOADED TO ANY SERVER
console.log('\n--- 11. CONFIRMING ZERO SERVER FILE UPLOADS (PRIVACY AUDIT) ---');
const toolJsFiles = [
  path.join(DIST, 'assets/js/core.js'),
  path.join(DIST, 'assets/js/tools/image-tools.js'),
  path.join(DIST, 'assets/js/tools/pdf-tools.js'),
  path.join(DIST, 'assets/js/tools/text-tools.js'),
  path.join(DIST, 'assets/js/tools/dev-tools.js'),
  path.join(DIST, 'assets/js/tools/qr-tool.js')
];

let suspiciousCalls = 0;
for (const file of toolJsFiles) {
  const code = fs.readFileSync(file, 'utf8');
  // Check for any fetch/XMLHttpRequest that posts data or calls external endpoints
  const hasOutboundUpload = /(?:fetch\s*\(\s*['"]https?:|\.post\s*\(|XMLHttpRequest|upload\s*\.\s*addEventListener)/i.test(code);
  if (hasOutboundUpload) {
    suspiciousCalls++;
    console.error(`  [WARN] Potential external request found in: ${path.basename(file)}`);
  }
}
assert(suspiciousCalls === 0, 'Zero external network uploads or API requests in tool JavaScript code (100% private client-side processing)');

console.log(`\n================================================================`);
console.log(`FINAL PRE-DEPLOYMENT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================================================\n`);

process.exit(failed > 0 ? 1 : 0);
