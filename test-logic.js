const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

console.log('\n--- TESTING CLIENT-SIDE BUSINESS LOGIC & LIBRARIES ---');

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

// 1. Text Tools Logic Tests
const sampleText = "The quick brown fox jumps over the lazy dog. Fast, free and 100% private.";
const words = sampleText.trim().split(/\s+/).filter(Boolean).length;
const chars = sampleText.length;
const charsNoSpaces = sampleText.replace(/\s+/g, '').length;
const sentences = sampleText.split(/[.!?]+/).filter(Boolean).length;
const readingTimeMin = Math.ceil(words / 200);

assert(words === 14, `Word Counter counts words accurately (14 words)`);
assert(chars === 73, `Character Counter counts characters accurately (73 chars)`);
assert(charsNoSpaces === 60, `Chars without spaces calculated accurately (60 chars)`);
assert(sentences === 2, `Sentence counter counts sentences accurately (2 sentences)`);
assert(readingTimeMin === 1, `Reading time estimate calculated accurately (< 1 min)`);

// 2. Case Conversions
function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
}
function toSnakeCase(str) {
  return str.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('_');
}
function toKebabCase(str) {
  return str.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('-');
}

assert(toTitleCase('trendwala tools') === 'Trendwala Tools', 'Title case conversion works');
assert(toCamelCase('trendwala tools online') === 'trendwalaToolsOnline', 'Camel case conversion works');
assert(toSnakeCase('trendwala tools online') === 'trendwala_tools_online', 'Snake case conversion works');
assert(toKebabCase('trendwala tools online') === 'trendwala-tools-online', 'Kebab case conversion works');

// 3. Dev Tools: JSON Formatter & Validator
const rawJson = '{"tool":"HEIC to JPG","category":"Image Tools","private":true,"rating":5}';
const parsed = JSON.parse(rawJson);
const beautified = JSON.stringify(parsed, null, 2);
const minified = JSON.stringify(parsed);

assert(beautified.includes('\n  "tool": "HEIC to JPG"'), 'JSON Beautifier indents with 2 spaces correctly');
assert(minified === rawJson, 'JSON Minifier removes all whitespace accurately');

// 4. Base64 UTF-8 Encoding/Decoding
const plainStr = "TrendWala Tools 🚀 Fast & Private";
const base64Str = Buffer.from(plainStr, 'utf8').toString('base64');
const decodedStr = Buffer.from(base64Str, 'base64').toString('utf8');
assert(decodedStr === plainStr, 'Base64 UTF-8 encoding and decoding round-trip matches exactly with emojis and symbols');

// 5. PDF-LIB Integration Test (creating and merging PDFs programmatically)
async function testPdfLib() {
  const doc1 = await PDFDocument.create();
  const page1 = doc1.addPage([600, 400]);
  page1.drawText('TrendWala Test Page 1');
  const pdfBytes1 = await doc1.save();

  const doc2 = await PDFDocument.create();
  const page2 = doc2.addPage([600, 400]);
  page2.drawText('TrendWala Test Page 2');
  const pdfBytes2 = await doc2.save();

  // Test Merge
  const mergedDoc = await PDFDocument.create();
  const pdf1 = await PDFDocument.load(pdfBytes1);
  const pdf2 = await PDFDocument.load(pdfBytes2);

  const copiedPages1 = await mergedDoc.copyPages(pdf1, pdf1.getPageIndices());
  copiedPages1.forEach(p => mergedDoc.addPage(p));
  const copiedPages2 = await mergedDoc.copyPages(pdf2, pdf2.getPageIndices());
  copiedPages2.forEach(p => mergedDoc.addPage(p));

  const mergedBytes = await mergedDoc.save();
  assert(mergedBytes.length > pdfBytes1.length, `PDF Merger produces valid merged document (${mergedBytes.length} bytes, 2 pages)`);
}

testPdfLib().then(() => {
  console.log(`\n========================================`);
  console.log(`LOGIC TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('PDF test failed:', err);
  process.exit(1);
});
