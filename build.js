/**
 * TrendWala Tools - Programmatic SEO Static Site Generator
 * Generates 100% crawlable static HTML for Homepage, Categories, 30 Tools & Legal Pages
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://tools.trendwala.in';
const tools = require('./data/tools.js');
const categories = require('./data/categories.js');

const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure output directories exist
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Recursively copy directory
function copyDirSync(src, dest) {
  ensureDirSync(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Load Template
function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');
}

// Global Template Renderer (Replaces all occurrences of {{key}})
function renderTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{{${key}}}`).join(value !== undefined && value !== null ? value : '');
  }
  return result;
}

// SVG Icon Helper
function getToolSvgIcon(id) {
  if (id.includes('heic') || id.includes('jpg') || id.includes('png') || id.includes('webp') || id.includes('image')) {
    if (id.includes('crop')) {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`;
    }
    if (id.includes('rotate')) {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`;
    }
    if (id.includes('compress')) {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
    }
    if (id.includes('resize')) {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
    }
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  }

  if (id.includes('pdf')) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
  }

  if (id.includes('word') || id.includes('char') || id.includes('case') || id.includes('duplicate') || id.includes('sort') || id.includes('clean')) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`;
  }

  if (id.includes('json') || id.includes('base64') || id.includes('url')) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
  }

  if (id.includes('qr')) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
  }

  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
}

// Generate Tool Card HTML
function renderToolCard(tool) {
  const badgeClass = tool.badge === 'Popular' ? 'popular' : '';
  const searchKeywords = [
    tool.name.toLowerCase(),
    tool.category.toLowerCase(),
    tool.primaryKeyword.toLowerCase(),
    ...(tool.secondaryKeywords || []).map(k => k.toLowerCase())
  ].join(' ');

  return `
    <a href="/${tool.slug}/" class="tool-card" data-keywords="${searchKeywords}" data-category="${tool.category}">
      <div class="tool-card-top">
        <div class="tool-icon-box">
          ${getToolSvgIcon(tool.id)}
        </div>
        ${tool.badge ? `<span class="tool-badge ${badgeClass}">${tool.badge}</span>` : ''}
      </div>
      <h3 class="tool-card-title">${tool.name}</h3>
      <p class="tool-card-desc">${tool.subtitle || tool.metaDescription}</p>
      <div class="tool-card-footer">
        <span>100% Client-Side</span>
        <span class="tool-card-action">Use Tool &rarr;</span>
      </div>
    </a>
  `;
}

// Generate Interactive Workbench Markup for each tool
function getToolWorkbenchHtml(tool) {
  switch (tool.toolComponent) {
    case 'heic-converter':
      return `
        <div class="dropzone-container" id="image-dropzone">
          <input type="file" id="image-file-input" class="file-input-hidden" accept=".heic,.heif,image/heic,image/heif" multiple aria-label="Upload HEIC photos">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div class="dropzone-title">Drop your iPhone HEIC photos here</div>
            <div class="dropzone-subtitle">or select multiple files from your computer or phone</div>
            <button type="button" class="dropzone-browse-btn">Browse Files</button>
          </div>
        </div>

        <div class="tool-options-panel">
          <div class="tool-options-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Conversion Settings</span>
          </div>
          <div class="options-grid">
            <div class="option-group">
              <div class="option-label">
                <span>Output Quality</span>
                <span class="option-value-badge" id="quality-val">90%</span>
              </div>
              <input type="range" id="conversion-quality" class="custom-range" min="10" max="100" value="90">
            </div>
            <div class="option-group">
              <div class="option-label">Output Format</div>
              <input type="text" class="form-control-input" value="${tool.targetFormat}" readonly>
            </div>
          </div>
        </div>

        <div class="file-queue-list" id="file-queue-list" style="display:none;"></div>

        <div class="progress-container" id="progress-container">
          <div class="progress-header">
            <span id="progress-text">Converting...</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-download-all-zip" class="btn-success-lg" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download All (ZIP)</span>
          </button>
          <button id="btn-start-convert" class="btn-primary-lg" disabled>
            <span>Convert to ${tool.targetFormat}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      `;

    case 'canvas-converter':
      return `
        <div class="dropzone-container" id="image-dropzone">
          <input type="file" id="image-file-input" class="file-input-hidden" accept="image/*" multiple aria-label="Upload images">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div class="dropzone-title">Drop your ${tool.sourceFormat} images here</div>
            <div class="dropzone-subtitle">or select images from your device</div>
            <button type="button" class="dropzone-browse-btn">Browse Images</button>
          </div>
        </div>

        <div class="tool-options-panel">
          <div class="options-grid">
            <div class="option-group">
              <div class="option-label">
                <span>Output Quality</span>
                <span class="option-value-badge" id="quality-val">90%</span>
              </div>
              <input type="range" id="conversion-quality" class="custom-range" min="10" max="100" value="90">
            </div>
            <div class="option-group">
              <div class="option-label">Target Format</div>
              <input type="text" class="form-control-input" value="${tool.targetFormat}" readonly>
            </div>
          </div>
        </div>

        <div class="file-queue-list" id="file-queue-list" style="display:none;"></div>

        <div class="progress-container" id="progress-container">
          <div class="progress-header">
            <span id="progress-text">Processing...</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-download-all-zip" class="btn-success-lg" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download All (ZIP)</span>
          </button>
          <button id="btn-start-convert" class="btn-primary-lg" disabled>
            <span>Convert to ${tool.targetFormat}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      `;

    case 'image-compressor':
      return `
        <div class="dropzone-container" id="image-dropzone">
          <input type="file" id="image-file-input" class="file-input-hidden" accept="image/jpeg,image/png,image/webp" aria-label="Upload image to compress">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </div>
            <div class="dropzone-title">Drop your image here to compress</div>
            <div class="dropzone-subtitle">Supports JPG, PNG, and WebP photos</div>
            <button type="button" class="dropzone-browse-btn">Choose Image</button>
          </div>
        </div>

        <div class="tool-options-panel">
          <div class="option-group">
            <div class="option-label">
              <span>Compression Level</span>
              <span class="option-value-badge" id="compress-quality-val">75%</span>
            </div>
            <input type="range" id="compress-quality" class="custom-range" min="10" max="95" value="75">
          </div>
        </div>

        <div id="compress-preview-container" style="display:none;">
          <div class="preview-compare-grid">
            <div class="compare-card">
              <div class="compare-card-label">Original Image</div>
              <div class="compare-img-box"><img id="comp-orig-img" alt="Original"></div>
              <div class="compare-size-badge" id="comp-orig-size">0 KB</div>
            </div>
            <div class="compare-card" style="border-color:var(--accent-emerald);">
              <div class="compare-card-label" style="color:var(--accent-emerald);">Compressed Image</div>
              <div class="compare-img-box"><img id="comp-result-img" alt="Compressed"></div>
              <div class="compare-size-badge" id="comp-result-size">0 KB</div>
              <div class="compare-savings-badge" id="comp-savings-val">-0%</div>
            </div>
          </div>

          <div class="action-bar" style="margin-top:2rem;">
            <button id="btn-download-compressed" class="btn-success-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Compressed Image</span>
            </button>
          </div>
        </div>
      `;

    case 'image-resizer':
      return `
        <div class="dropzone-container" id="image-dropzone">
          <input type="file" id="image-file-input" class="file-input-hidden" accept="image/*" aria-label="Upload image to resize">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            </div>
            <div class="dropzone-title">Drop your image here to resize</div>
            <div class="dropzone-subtitle">Resize by exact pixels or percentage scale</div>
            <button type="button" class="dropzone-browse-btn">Choose Image</button>
          </div>
        </div>

        <div id="resize-preview-container" style="display:none;">
          <div class="tool-options-panel">
            <div class="tool-options-title">
              <span>Resize Controls</span>
              <span class="option-value-badge" id="resize-dimensions-badge">0 × 0 px</span>
            </div>
            <div class="dimensions-row">
              <div class="dimension-field">
                <label class="option-label">Width (px)</label>
                <input type="number" id="resize-width" class="form-control-input" min="1">
              </div>
              <button id="btn-lock-aspect" class="aspect-lock-btn locked" title="Lock Aspect Ratio">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </button>
              <div class="dimension-field">
                <label class="option-label">Height (px)</label>
                <input type="number" id="resize-height" class="form-control-input" min="1">
              </div>
            </div>

            <div style="margin-top:1.25rem;">
              <label class="option-label" style="margin-bottom:0.5rem;">Quick Percentage Scale</label>
              <div class="button-group-row">
                <button class="btn-toggle-option btn-preset-scale" data-scale="0.25">25%</button>
                <button class="btn-toggle-option btn-preset-scale" data-scale="0.5">50%</button>
                <button class="btn-toggle-option btn-preset-scale" data-scale="0.75">75%</button>
              </div>
            </div>
          </div>

          <div style="text-align:center;margin:1.5rem 0;">
            <img id="resize-preview-img" style="max-height:320px;max-width:100%;border-radius:var(--radius-md);box-shadow:var(--shadow-md);display:inline-block;" alt="preview">
          </div>

          <div class="action-bar">
            <button id="btn-download-resized" class="btn-primary-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Resized Image</span>
            </button>
          </div>
        </div>
      `;

    case 'image-cropper':
      return `
        <div class="dropzone-container" id="image-dropzone">
          <input type="file" id="image-file-input" class="file-input-hidden" accept="image/*" aria-label="Upload image to crop">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
            </div>
            <div class="dropzone-title">Drop your image here to crop</div>
            <div class="dropzone-subtitle">Interactive visual crop with aspect ratio presets</div>
            <button type="button" class="dropzone-browse-btn">Choose Image</button>
          </div>
        </div>

        <div id="cropper-wrapper" style="display:none;">
          <div class="tool-options-panel">
            <div class="option-label" style="margin-bottom:0.5rem;">Aspect Ratio Preset</div>
            <div class="button-group-row">
              <button class="btn-toggle-option btn-crop-ratio active" data-ratio="free">Freeform</button>
              <button class="btn-toggle-option btn-crop-ratio" data-ratio="1:1">1:1 Square</button>
              <button class="btn-toggle-option btn-crop-ratio" data-ratio="16:9">16:9 Landscape</button>
              <button class="btn-toggle-option btn-crop-ratio" data-ratio="4:3">4:3 Standard</button>
              <button class="btn-toggle-option btn-crop-ratio" data-ratio="9:16">9:16 Story</button>
            </div>
          </div>

          <div class="cropper-view-container">
            <img id="cropper-image" alt="Image to crop">
          </div>

          <div class="action-bar">
            <button id="btn-execute-crop" class="btn-success-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Crop &amp; Download</span>
            </button>
          </div>
        </div>
      `;

    case 'image-rotator':
      return `
        <div class="dropzone-container" id="image-dropzone">
          <input type="file" id="image-file-input" class="file-input-hidden" accept="image/*" aria-label="Upload image to rotate">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </div>
            <div class="dropzone-title">Drop your image here to rotate</div>
            <div class="dropzone-subtitle">Rotate 90°, 180° or flip horizontally/vertically</div>
            <button type="button" class="dropzone-browse-btn">Choose Image</button>
          </div>
        </div>

        <div id="rotator-preview-container" style="display:none;">
          <div class="tool-options-panel">
            <div class="option-label" style="margin-bottom:0.75rem;">Rotation &amp; Flip Controls</div>
            <div class="button-group-row">
              <button id="btn-rotate-cw" class="btn-toggle-option">90° Clockwise ↻</button>
              <button id="btn-rotate-ccw" class="btn-toggle-option">90° Counter-Clockwise ↺</button>
              <button id="btn-rotate-180" class="btn-toggle-option">180° Upside-Down</button>
              <button id="btn-flip-h" class="btn-toggle-option">Flip Horizontal ⇄</button>
              <button id="btn-flip-v" class="btn-toggle-option">Flip Vertical ⇅</button>
            </div>
          </div>

          <div style="text-align:center;margin:2rem 0;max-height:450px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
            <canvas id="rotator-canvas" style="max-width:100%;max-height:400px;border-radius:var(--radius-md);box-shadow:var(--shadow-md);"></canvas>
          </div>

          <div class="action-bar">
            <button id="btn-download-rotated" class="btn-success-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Rotated Image</span>
            </button>
          </div>
        </div>
      `;

    case 'image-to-pdf':
      return `
        <div class="dropzone-container" id="pdf-dropzone">
          <input type="file" id="pdf-file-input" class="file-input-hidden" accept="image/*" multiple aria-label="Upload images to PDF">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="dropzone-title">Drop your images here to combine into PDF</div>
            <div class="dropzone-subtitle">Select multiple JPG, PNG, or WebP photos</div>
            <button type="button" class="dropzone-browse-btn">Browse Images</button>
          </div>
        </div>

        <div class="tool-options-panel">
          <div class="options-grid">
            <div class="option-group">
              <label class="option-label">Page Size</label>
              <select id="pdf-page-size" class="form-control-select">
                <option value="a4" selected>A4 Standard</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to Image</option>
              </select>
            </div>
            <div class="option-group">
              <label class="option-label">Orientation</label>
              <select id="pdf-orientation" class="form-control-select">
                <option value="portrait" selected>Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div class="option-group">
              <label class="option-label">Margin</label>
              <select id="pdf-margin" class="form-control-select">
                <option value="0">No Margin (0px)</option>
                <option value="20" selected>Standard (20px)</option>
                <option value="40">Large (40px)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="file-queue-list" id="file-queue-list" style="display:none;"></div>

        <div class="progress-container" id="progress-container">
          <div class="progress-header">
            <span id="progress-text">Generating PDF...</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-create-pdf" class="btn-primary-lg" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Create &amp; Download PDF</span>
          </button>
        </div>
      `;

    case 'pdf-merger':
      return `
        <div class="dropzone-container" id="pdf-dropzone">
          <input type="file" id="pdf-file-input" class="file-input-hidden" accept=".pdf,application/pdf" multiple aria-label="Upload PDFs to merge">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div class="dropzone-title">Drop two or more PDF files here to merge</div>
            <div class="dropzone-subtitle">Reorder documents before merging into a single continuous file</div>
            <button type="button" class="dropzone-browse-btn">Select PDFs</button>
          </div>
        </div>

        <div class="file-queue-list" id="file-queue-list" style="display:none;"></div>

        <div class="progress-container" id="progress-container">
          <div class="progress-header">
            <span id="progress-text">Merging documents...</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-merge-pdf" class="btn-primary-lg" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            <span>Merge PDFs</span>
          </button>
        </div>
      `;

    case 'pdf-splitter':
      return `
        <div class="dropzone-container" id="pdf-dropzone">
          <input type="file" id="pdf-file-input" class="file-input-hidden" accept=".pdf,application/pdf" aria-label="Upload PDF to split">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>
            </div>
            <div class="dropzone-title">Drop your PDF document here to split</div>
            <div class="dropzone-subtitle">Extract specific page ranges or extract all pages to ZIP</div>
            <button type="button" class="dropzone-browse-btn">Choose PDF</button>
          </div>
        </div>

        <div id="split-options-panel" class="tool-options-panel" style="display:none;">
          <div class="tool-options-title">
            <span>Split Options</span>
            <span class="option-value-badge" id="split-total-pages">Total Pages: 0</span>
          </div>

          <div class="option-group" style="margin-bottom:1rem;">
            <label class="option-label">Page Range to Extract</label>
            <input type="text" id="split-range-input" class="form-control-input" placeholder="e.g. 1-3, 5, 8-10">
            <span style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">Use commas for individual pages and hyphens for page ranges.</span>
          </div>

          <div style="display:flex;align-items:center;gap:0.5rem;">
            <input type="checkbox" id="split-all-checkbox" style="width:18px;height:18px;cursor:pointer;">
            <label for="split-all-checkbox" style="font-size:0.95rem;font-weight:600;color:var(--text-primary);cursor:pointer;">
              Extract every single page into separate PDFs (ZIP archive)
            </label>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-execute-split" class="btn-primary-lg" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span>Split &amp; Download</span>
          </button>
        </div>
      `;

    case 'pdf-rotator':
      return `
        <div class="dropzone-container" id="pdf-dropzone">
          <input type="file" id="pdf-file-input" class="file-input-hidden" accept=".pdf,application/pdf" aria-label="Upload PDF to rotate">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </div>
            <div class="dropzone-title">Drop your PDF here to rotate pages permanently</div>
            <div class="dropzone-subtitle">Fix sideways or upside-down scanned document pages</div>
            <button type="button" class="dropzone-browse-btn">Choose PDF</button>
          </div>
        </div>

        <div id="rotate-options-panel" class="tool-options-panel" style="display:none;">
          <div class="tool-options-title">
            <span>Rotation Settings</span>
            <span class="option-value-badge" id="rotate-total-pages">Total Pages: 0</span>
          </div>

          <div class="options-grid">
            <div class="option-group">
              <label class="option-label">Rotation Angle</label>
              <div class="button-group-row">
                <button class="btn-toggle-option btn-rotate-angle active" data-angle="90">90° Clockwise ↻</button>
                <button class="btn-toggle-option btn-rotate-angle" data-angle="180">180° Flip</button>
                <button class="btn-toggle-option btn-rotate-angle" data-angle="270">90° Counter ↺</button>
              </div>
            </div>

            <div class="option-group">
              <label class="option-label">Apply To</label>
              <select id="rotate-apply-to" class="form-control-select">
                <option value="all" selected>All Pages</option>
                <option value="first">First Page Only</option>
                <option value="even">Even Pages Only</option>
                <option value="odd">Odd Pages Only</option>
              </select>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-execute-pdf-rotate" class="btn-primary-lg" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Rotate &amp; Save PDF</span>
          </button>
        </div>
      `;

    case 'pdf-to-jpg':
      return `
        <div class="dropzone-container" id="pdf-dropzone">
          <input type="file" id="pdf-file-input" class="file-input-hidden" accept=".pdf,application/pdf" aria-label="Upload PDF to convert to JPG">
          <div class="dropzone-content">
            <div class="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div class="dropzone-title">Drop your PDF here to convert pages to JPG</div>
            <div class="dropzone-subtitle">High resolution client-side rendering with individual or ZIP download</div>
            <button type="button" class="dropzone-browse-btn">Choose PDF</button>
          </div>
        </div>

        <div class="progress-container" id="progress-container">
          <div class="progress-header">
            <span id="progress-text">Rendering pages...</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
        </div>

        <div id="pdf-pages-container" class="preview-compare-grid" style="display:none;margin-bottom:2rem;"></div>

        <div class="action-bar">
          <button id="btn-download-all-pages-zip" class="btn-success-lg" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download All Pages (ZIP)</span>
          </button>
        </div>
      `;

    case 'word-counter':
      return `
        <div class="stats-bar-grid">
          <div class="stat-box">
            <div class="stat-number" id="stat-words">0</div>
            <div class="stat-label">Words</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-chars">0</div>
            <div class="stat-label">Characters</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-chars-nospace">0</div>
            <div class="stat-label">Chars (No Space)</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-sentences">0</div>
            <div class="stat-label">Sentences</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-paragraphs">0</div>
            <div class="stat-label">Paragraphs</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-reading-time">0 sec</div>
            <div class="stat-label">Reading Time</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-speaking-time">0 sec</div>
            <div class="stat-label">Speaking Time</div>
          </div>
        </div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>Input Text</span>
            <div class="editor-actions">
              <button id="btn-sample-text" class="btn-secondary-sm">Sample Text</button>
              <button id="btn-clear-text" class="btn-secondary-sm">Clear</button>
              <button id="btn-copy-text" class="btn-secondary-sm">Copy</button>
            </div>
          </div>
          <textarea id="text-input-area" class="editor-textarea" placeholder="Paste or type your text here to see real-time statistics..."></textarea>
        </div>
      `;

    case 'character-counter':
      return `
        <div class="stats-bar-grid">
          <div class="stat-box">
            <div class="stat-number" id="stat-chars">0</div>
            <div class="stat-label">Total Characters</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-chars-nospace">0</div>
            <div class="stat-label">Without Spaces</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-words">0</div>
            <div class="stat-label">Words</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-lines">0</div>
            <div class="stat-label">Lines</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-letters">0</div>
            <div class="stat-label">Letters</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-digits">0</div>
            <div class="stat-label">Digits</div>
          </div>
        </div>

        <div class="editor-pane">
          <textarea id="text-input-area" class="editor-textarea" placeholder="Type or paste your text to count characters and track limits..."></textarea>
        </div>

        <div class="social-meters-box">
          <h3 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem;">Platform Character Limits</h3>
          <div class="social-meter-item">
            <div class="social-meter-label">
              <span>Twitter / X Post (Max 280)</span>
              <span id="twitter-val" style="font-family:var(--font-mono);">0 / 280</span>
            </div>
            <div class="social-progress-track">
              <div id="twitter-bar" class="social-progress-bar" style="width:0%;"></div>
            </div>
          </div>

          <div class="social-meter-item">
            <div class="social-meter-label">
              <span>SMS Standard Segment (Max 160)</span>
              <span id="sms-val" style="font-family:var(--font-mono);">0 / 160</span>
            </div>
            <div class="social-progress-track">
              <div id="sms-bar" class="social-progress-bar" style="width:0%;"></div>
            </div>
          </div>

          <div class="social-meter-item">
            <div class="social-meter-label">
              <span>Instagram Caption (Max 2,200)</span>
              <span id="insta-val" style="font-family:var(--font-mono);">0 / 2200</span>
            </div>
            <div class="social-progress-track">
              <div id="insta-bar" class="social-progress-bar" style="width:0%;"></div>
            </div>
          </div>
        </div>
      `;

    case 'case-converter':
      return `
        <div class="tool-options-panel" style="margin-bottom:1.5rem;">
          <div class="option-label" style="margin-bottom:0.75rem;">Transform Case With One Click:</div>
          <div class="button-group-row">
            <button class="btn-toggle-option btn-convert-case" data-case="upper">UPPERCASE</button>
            <button class="btn-toggle-option btn-convert-case" data-case="lower">lowercase</button>
            <button class="btn-toggle-option btn-convert-case" data-case="title">Title Case</button>
            <button class="btn-toggle-option btn-convert-case" data-case="sentence">Sentence case</button>
            <button class="btn-toggle-option btn-convert-case" data-case="camel">camelCase</button>
            <button class="btn-toggle-option btn-convert-case" data-case="snake">snake_case</button>
            <button class="btn-toggle-option btn-convert-case" data-case="kebab">kebab-case</button>
            <button class="btn-toggle-option btn-convert-case" data-case="pascal">PascalCase</button>
            <button class="btn-toggle-option btn-convert-case" data-case="alternating">aLtErNaTiNg</button>
            <button class="btn-toggle-option btn-convert-case" data-case="invert">iNVERT cASE</button>
          </div>
        </div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>Text Content</span>
            <div class="editor-actions">
              <button id="btn-clear-case" class="btn-secondary-sm">Clear</button>
              <button id="btn-copy-case" class="btn-secondary-sm">Copy Result</button>
            </div>
          </div>
          <textarea id="text-input-area" class="editor-textarea" placeholder="Type or paste your text here and click any case style above..."></textarea>
        </div>
      `;

    case 'duplicate-remover':
      return `
        <div class="stats-bar-grid">
          <div class="stat-box">
            <div class="stat-number" id="stat-original-lines">0</div>
            <div class="stat-label">Original Lines</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-unique-lines">0</div>
            <div class="stat-label">Unique Lines</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" id="stat-removed-lines" style="color:var(--accent-emerald);">0</div>
            <div class="stat-label">Duplicates Removed</div>
          </div>
        </div>

        <div class="tool-options-panel">
          <div class="button-group-row">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-case-sensitive"> Case Sensitive
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-trim-lines" checked> Trim Whitespace
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-remove-empty" checked> Remove Empty Rows
            </label>
          </div>
        </div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>List Input / Output</span>
            <button id="btn-copy-dedupe" class="btn-secondary-sm">Copy Unique Lines</button>
          </div>
          <textarea id="text-input-area" class="editor-textarea" placeholder="Paste your list here (emails, keywords, names, numbers)..."></textarea>
        </div>

        <div class="action-bar">
          <button id="btn-dedupe-lines" class="btn-primary-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Remove Duplicate Lines</span>
          </button>
        </div>
      `;

    case 'text-sorter':
      return `
        <div class="tool-options-panel">
          <div class="option-label" style="margin-bottom:0.75rem;">Sort Order:</div>
          <div class="button-group-row" style="margin-bottom:1rem;">
            <button class="btn-toggle-option btn-sort-mode" data-mode="az">Alphabetical (A &rarr; Z)</button>
            <button class="btn-toggle-option btn-sort-mode" data-mode="za">Reverse (Z &rarr; A)</button>
            <button class="btn-toggle-option btn-sort-mode" data-mode="natural">Natural Numerical</button>
            <button class="btn-toggle-option btn-sort-mode" data-mode="reverse">Reverse Order</button>
            <button class="btn-toggle-option btn-sort-mode" data-mode="length-asc">Shortest First</button>
            <button class="btn-toggle-option btn-sort-mode" data-mode="length-desc">Longest First</button>
          </div>
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
            <input type="checkbox" id="opt-sort-case"> Case Sensitive Sorting
          </label>
        </div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>Lines of Text</span>
            <button id="btn-copy-sorted" class="btn-secondary-sm">Copy Sorted Lines</button>
          </div>
          <textarea id="text-input-area" class="editor-textarea" placeholder="Paste lines of text or items to sort..."></textarea>
        </div>
      `;

    case 'text-cleaner':
      return `
        <div class="tool-options-panel">
          <div class="option-label" style="margin-bottom:0.75rem;">Cleaning Options:</div>
          <div class="button-group-row">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-clean-html" checked> Strip HTML Tags
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-clean-spaces" checked> Remove Extra Spaces
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-clean-breaks"> Remove Line Breaks
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-weight:600;font-size:0.9rem;">
              <input type="checkbox" id="opt-clean-emojis"> Remove Emojis
            </label>
          </div>
        </div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>Raw Text</span>
            <button id="btn-copy-clean" class="btn-secondary-sm">Copy Cleaned Text</button>
          </div>
          <textarea id="text-input-area" class="editor-textarea" placeholder="Paste messy text copied from web pages, PDFs, or emails..."></textarea>
        </div>

        <div class="action-bar">
          <button id="btn-execute-clean" class="btn-primary-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Clean Text Now</span>
          </button>
        </div>
      `;

    case 'json-formatter':
      return `
        <div class="tool-options-panel">
          <div class="options-grid">
            <div class="option-group">
              <label class="option-label">Indentation</label>
              <select id="json-indent" class="form-control-select">
                <option value="2" selected>2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tab Character</option>
              </select>
            </div>
            <div class="option-group" style="display:flex;flex-direction:row;align-items:flex-end;gap:0.5rem;">
              <button id="btn-format-json" class="btn-primary-lg" style="padding:0.6rem 1.5rem;font-size:0.95rem;">Pretty Print</button>
              <button id="btn-minify-json" class="btn-secondary-sm" style="padding:0.7rem 1.25rem;">Minify</button>
            </div>
          </div>
        </div>

        <div id="json-error-alert" style="display:none;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);color:var(--accent-rose);padding:1rem;border-radius:var(--radius-md);margin-bottom:1.25rem;font-family:var(--font-mono);font-size:0.9rem;"></div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>JSON Editor</span>
            <div class="editor-actions">
              <button id="btn-sample-json" class="btn-secondary-sm">Sample JSON</button>
              <button id="btn-clear-json" class="btn-secondary-sm">Clear</button>
              <button id="btn-copy-json" class="btn-secondary-sm">Copy</button>
              <button id="btn-download-json" class="btn-secondary-sm">Download .json</button>
            </div>
          </div>
          <textarea id="json-input" class="editor-textarea" placeholder="Paste your raw JSON code or payload here..." style="min-height:380px;"></textarea>
        </div>
      `;

    case 'json-validator':
      return `
        <div id="validation-status-box" style="display:none;margin-bottom:1.5rem;"></div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>JSON Payload</span>
            <button id="btn-clear-json" class="btn-secondary-sm">Clear</button>
          </div>
          <textarea id="json-input" class="editor-textarea" placeholder="Paste your JSON to validate against RFC 8259..." style="min-height:360px;"></textarea>
        </div>

        <div class="action-bar">
          <button id="btn-validate-json" class="btn-primary-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Validate JSON</span>
          </button>
        </div>
      `;

    case 'base64-tool':
      return `
        <div class="workbench-split">
          <div class="editor-pane">
            <div class="editor-header">
              <span>Input Text or String</span>
              <label class="btn-secondary-sm" style="cursor:pointer;">
                Encode File <input type="file" id="base64-file-input" style="display:none;">
              </label>
            </div>
            <textarea id="base64-text-input" class="editor-textarea" placeholder="Enter plain text to encode, or paste Base64 to decode..."></textarea>
          </div>

          <div class="editor-pane">
            <div class="editor-header">
              <span>Result Output</span>
              <button id="btn-copy-base64" class="btn-secondary-sm">Copy Result</button>
            </div>
            <textarea id="base64-result-output" class="editor-textarea" placeholder="Encoded / decoded output will appear here..." readonly></textarea>
          </div>
        </div>

        <div id="base64-image-preview" style="display:none;margin-bottom:1.5rem;text-align:center;padding:1.5rem;background:var(--bg-tertiary);border-radius:var(--radius-md);">
          <div style="font-weight:700;margin-bottom:0.75rem;">Decoded Image Preview</div>
          <img id="base64-preview-img" style="max-height:240px;max-width:100%;border-radius:var(--radius-sm);box-shadow:var(--shadow-md);" alt="Decoded preview">
          <div style="margin-top:1rem;">
            <button id="btn-download-base64-file" class="btn-secondary-sm" style="display:inline-flex;">Download Image File</button>
          </div>
        </div>

        <div class="action-bar">
          <button id="btn-clear-base64" class="btn-secondary-sm" style="padding:0.85rem 1.5rem;">Clear All</button>
          <button id="btn-decode-base64" class="btn-secondary-sm" style="padding:0.85rem 1.5rem;background:var(--bg-secondary);border-color:var(--primary);color:var(--primary);">
            Decode from Base64
          </button>
          <button id="btn-encode-base64" class="btn-primary-lg">
            <span>Encode to Base64</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      `;

    case 'url-tool':
      return `
        <div class="workbench-split">
          <div class="editor-pane">
            <div class="editor-header">
              <span>URL / Text Input</span>
            </div>
            <textarea id="url-input" class="editor-textarea" placeholder="Paste URL or parameter string to encode or decode..."></textarea>
          </div>

          <div class="editor-pane">
            <div class="editor-header">
              <span>Result Output</span>
              <button id="btn-copy-url" class="btn-secondary-sm">Copy Output</button>
            </div>
            <textarea id="url-output" class="editor-textarea" placeholder="Encoded / decoded output will appear here..." readonly></textarea>
          </div>
        </div>

        <div class="action-bar" style="justify-content:flex-start;margin-bottom:1.5rem;">
          <button id="btn-encode-component" class="btn-primary-lg" style="font-size:0.95rem;padding:0.7rem 1.5rem;">Encode Component</button>
          <button id="btn-encode-full" class="btn-secondary-sm" style="padding:0.75rem 1.25rem;">Encode Full URL</button>
          <button id="btn-decode-url" class="btn-secondary-sm" style="padding:0.75rem 1.25rem;background:var(--bg-secondary);border-color:var(--primary);color:var(--primary);">Decode URL</button>
        </div>

        <table id="url-params-table" style="display:none;width:100%;border-collapse:collapse;background:var(--bg-tertiary);border-radius:var(--radius-md);overflow:hidden;font-size:0.9rem;">
          <thead>
            <tr style="background:var(--border-subtle);text-align:left;">
              <th style="padding:10px;">Query Parameter</th>
              <th style="padding:10px;">Value</th>
            </tr>
          </thead>
          <tbody id="url-params-tbody"></tbody>
        </table>
      `;

    case 'qr-tool':
      return `
        <div class="qr-workbench-grid">
          <div class="tool-options-panel" style="margin-bottom:0;">
            <div class="option-group" style="margin-bottom:1rem;">
              <label class="option-label">QR Code Type</label>
              <select id="qr-type-select" class="form-control-select">
                <option value="url" selected>Website URL</option>
                <option value="text">Plain Text</option>
                <option value="wifi">WiFi Network</option>
                <option value="email">Email Address</option>
                <option value="phone">Phone Number</option>
              </select>
            </div>

            <div class="option-group" style="margin-bottom:1rem;">
              <label class="option-label">Content</label>
              <input type="text" id="qr-input-text" class="form-control-input" placeholder="https://tools.trendwala.in" value="https://tools.trendwala.in">
            </div>

            <div id="qr-wifi-fields" style="display:none;flex-direction:column;gap:0.75rem;margin-bottom:1rem;">
              <div>
                <label class="option-label">Network Name (SSID)</label>
                <input type="text" id="qr-wifi-ssid" class="form-control-input" placeholder="MyWiFiNetwork">
              </div>
              <div>
                <label class="option-label">Password</label>
                <input type="password" id="qr-wifi-pass" class="form-control-input" placeholder="Password">
              </div>
              <div>
                <label class="option-label">Encryption</label>
                <select id="qr-wifi-enc" class="form-control-select">
                  <option value="WPA" selected>WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open)</option>
                </select>
              </div>
            </div>

            <div class="options-grid" style="margin-bottom:1rem;">
              <div class="option-group">
                <label class="option-label">Foreground Color</label>
                <input type="color" id="qr-fg-color" value="#000000" style="width:100%;height:44px;padding:2px;background:none;border:none;cursor:pointer;">
              </div>
              <div class="option-group">
                <label class="option-label">Background Color</label>
                <input type="color" id="qr-bg-color" value="#ffffff" style="width:100%;height:44px;padding:2px;background:none;border:none;cursor:pointer;">
              </div>
            </div>

            <div class="options-grid">
              <div class="option-group">
                <label class="option-label">Error Correction</label>
                <select id="qr-ecl-select" class="form-control-select">
                  <option value="L">L (7% Recovery)</option>
                  <option value="M" selected>M (15% Recovery)</option>
                  <option value="Q">Q (25% Recovery)</option>
                  <option value="H">H (30% Recovery)</option>
                </select>
              </div>
              <div class="option-group">
                <div class="option-label">
                  <span>Size</span>
                  <span class="option-value-badge" id="qr-size-val">320px</span>
                </div>
                <input type="range" id="qr-size-slider" class="custom-range" min="160" max="640" value="320">
              </div>
            </div>
          </div>

          <div class="qr-preview-card">
            <div class="qr-canvas-holder">
              <canvas id="qr-canvas"></canvas>
            </div>
            <div class="qr-download-buttons">
              <button id="btn-download-qr-png" class="btn-primary-lg" style="padding:0.75rem 1rem;font-size:0.9rem;justify-content:center;">
                Download PNG
              </button>
              <button id="btn-download-qr-svg" class="btn-secondary-sm" style="padding:0.75rem 1rem;font-size:0.9rem;justify-content:center;background:var(--bg-secondary);border-color:var(--border-strong);">
                Vector SVG
              </button>
            </div>
          </div>
        </div>
      `;

    default:
      return `<div style="padding:2rem;text-align:center;">Tool Workbench Ready</div>`;
  }
}

// Generate Page-Specific Hydration Script
function getToolHydrationScript(tool) {
  let initCode = '';

  switch (tool.toolComponent) {
    case 'heic-converter':
      initCode = `TrendWalaImageTools.initHeicConverter({ targetMime: '${tool.targetMime || 'image/jpeg'}', targetExt: '${tool.targetExt || 'jpg'}' });`;
      break;
    case 'canvas-converter':
      initCode = `TrendWalaImageTools.initCanvasConverter({ targetMime: '${tool.targetMime || 'image/png'}', targetExt: '${tool.targetExt || 'png'}' });`;
      break;
    case 'image-compressor':
      initCode = `TrendWalaImageTools.initImageCompressor();`;
      break;
    case 'image-resizer':
      initCode = `TrendWalaImageTools.initImageResizer();`;
      break;
    case 'image-cropper':
      initCode = `TrendWalaImageTools.initImageCropper();`;
      break;
    case 'image-rotator':
      initCode = `TrendWalaImageTools.initImageRotator();`;
      break;
    case 'image-to-pdf':
      initCode = `TrendWalaPdfTools.initImageToPdf();`;
      break;
    case 'pdf-merger':
      initCode = `TrendWalaPdfTools.initPdfMerger();`;
      break;
    case 'pdf-splitter':
      initCode = `TrendWalaPdfTools.initPdfSplitter();`;
      break;
    case 'pdf-rotator':
      initCode = `TrendWalaPdfTools.initPdfRotator();`;
      break;
    case 'pdf-to-jpg':
      initCode = `TrendWalaPdfTools.initPdfToJpg();`;
      break;
    case 'word-counter':
      initCode = `TrendWalaTextTools.initWordCounter();`;
      break;
    case 'character-counter':
      initCode = `TrendWalaTextTools.initCharacterCounter();`;
      break;
    case 'case-converter':
      initCode = `TrendWalaTextTools.initCaseConverter();`;
      break;
    case 'duplicate-remover':
      initCode = `TrendWalaTextTools.initDuplicateRemover();`;
      break;
    case 'text-sorter':
      initCode = `TrendWalaTextTools.initTextSorter();`;
      break;
    case 'text-cleaner':
      initCode = `TrendWalaTextTools.initTextCleaner();`;
      break;
    case 'json-formatter':
      initCode = `TrendWalaDevTools.initJsonFormatter();`;
      break;
    case 'json-validator':
      initCode = `TrendWalaDevTools.initJsonValidator();`;
      break;
    case 'base64-tool':
      initCode = `TrendWalaDevTools.initBase64Tool();`;
      break;
    case 'url-tool':
      initCode = `TrendWalaDevTools.initUrlTool();`;
      break;
    case 'qr-tool':
      initCode = `TrendWalaQrTool.initQrGenerator();`;
      break;
  }

  // Determine which tool engine script to load
  let engineScript = '';
  if (tool.category === 'image-tools') {
    engineScript = `<script src="/assets/js/tools/image-tools.js" defer></script>`;
  } else if (tool.category === 'pdf-tools') {
    engineScript = `<script src="/assets/js/tools/pdf-tools.js" defer></script>`;
  } else if (tool.category === 'text-tools') {
    engineScript = `<script src="/assets/js/tools/text-tools.js" defer></script>`;
  } else if (tool.category === 'developer-tools') {
    engineScript = `<script src="/assets/js/tools/dev-tools.js" defer></script>`;
  } else if (tool.category === 'utility-tools') {
    engineScript = `<script src="/assets/js/tools/qr-tool.js" defer></script>`;
  }

  // Vendor scripts needed ONLY on this page
  const vendorTags = (tool.vendorScripts || []).map(src => `<script src="${src}" defer></script>`).join('\n  ');

  return `
  ${vendorTags}
  ${engineScript}
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      ${initCode}
    });
  </script>
  `;
}

// =========================================================================
// MAIN BUILD FUNCTION
// =========================================================================
async function buildPlatform() {
  console.log('🚀 Starting TrendWala Tools Static Programmatic Build...\n');

  // 1. Clean and setup dist/
  ensureDirSync(DIST_DIR);
  copyDirSync(PUBLIC_DIR, DIST_DIR);
  console.log('✔ Copied public assets into dist/');

  const layoutTpl = loadTemplate('layout.html');
  const homeTpl = loadTemplate('home.html');
  const toolTpl = loadTemplate('tool.html');
  const categoryTpl = loadTemplate('category.html');
  const pageTpl = loadTemplate('page.html');

  const sitemapUrls = [];

  // 2. Build Homepage
  console.log('⚙ Building Homepage (dist/index.html)...');
  const allToolCardsHtml = tools.map(t => renderToolCard(t)).join('\n');
  const homeContent = homeTpl.replace('{{toolsCardsHtml}}', allToolCardsHtml);

  const homeStructuredData = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TrendWala Tools",
    "url": "${SITE_URL}",
    "description": "Free, fast, and completely private online tools for images, PDFs, text, and code that run directly in your browser without file uploads.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "${SITE_URL}/#search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>
  `;

  let homeHtml = renderTemplate(layoutTpl, {
    title: 'TrendWala Tools — Free Online Tools (Fast, Private & No Upload)',
    metaDescription: 'Free, fast, and private online tools that process data directly in your browser. Convert HEIC to JPG, compress images, merge PDFs, format JSON, and generate QR codes with zero server uploads.',
    canonicalUrl: `${SITE_URL}/`,
    robots: 'index, follow',
    ogType: 'website',
    siteUrl: SITE_URL,
    pageStyles: '',
    structuredData: homeStructuredData,
    activeImage: '',
    activePdf: '',
    activeText: '',
    activeDev: '',
    activeUtil: '',
    content: homeContent,
    pageScripts: ''
  });

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml);
  sitemapUrls.push({ loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' });

  // 3. Build Category Pages
  console.log('⚙ Building 5 Category Pages...');
  for (const catId in categories) {
    const cat = categories[catId];
    const catTools = tools.filter(t => t.category === cat.id);
    const catToolsCardsHtml = catTools.map(t => renderToolCard(t)).join('\n');

    const catFeaturesHtml = (cat.features || []).map(f => `
      <div class="feature-box">
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>
    `).join('\n');

    const catFaqHtml = (cat.faqs || []).map((faq, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}">
        <button class="faq-question">
          <span>${faq.q}</span>
          <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="faq-answer">
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('\n');

    let catContent = renderTemplate(categoryTpl, {
      categoryName: cat.name,
      categoryBadge: cat.badge,
      h1: cat.h1,
      subtitle: cat.subtitle,
      description: cat.description,
      toolsCardsHtml: catToolsCardsHtml,
      featuresHtml: catFeaturesHtml,
      faqHtml: catFaqHtml
    });

    const catStructuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "${SITE_URL}/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "${cat.name}",
          "item": "${SITE_URL}/${cat.slug}/"
        }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": ${JSON.stringify((cat.faqs || []).map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      })))}
    }
    </script>
    `;

    let catHtml = renderTemplate(layoutTpl, {
      title: cat.title,
      metaDescription: cat.metaDescription,
      canonicalUrl: `${SITE_URL}/${cat.slug}/`,
      robots: 'index, follow',
      ogType: 'website',
      siteUrl: SITE_URL,
      pageStyles: '',
      structuredData: catStructuredData,
      activeImage: cat.id === 'image-tools' ? 'active' : '',
      activePdf: cat.id === 'pdf-tools' ? 'active' : '',
      activeText: cat.id === 'text-tools' ? 'active' : '',
      activeDev: cat.id === 'developer-tools' ? 'active' : '',
      activeUtil: cat.id === 'utility-tools' ? 'active' : '',
      content: catContent,
      pageScripts: ''
    });

    const catDir = path.join(DIST_DIR, cat.slug);
    ensureDirSync(catDir);
    fs.writeFileSync(path.join(catDir, 'index.html'), catHtml);
    sitemapUrls.push({ loc: `${SITE_URL}/${cat.slug}/`, priority: '0.9', changefreq: 'weekly' });
  }

  // 4. Build All 30 Tool Pages
  console.log('⚙ Building 30 Programmatic SEO Tool Pages...');
  for (const tool of tools) {
    const cat = categories[tool.category] || { name: 'Tools', slug: tool.category };

    // How to steps
    const stepsHtml = (tool.instructions || []).map(step => `
      <div class="step-card">
        <div class="step-number">${step.step}</div>
        <h3>${step.title}</h3>
        <p>${step.desc}</p>
      </div>
    `).join('\n');

    // Key features
    const featuresHtml = (tool.keyFeatures || []).map(feat => `
      <div class="feature-box">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ${feat.title}
        </h3>
        <p>${feat.desc}</p>
      </div>
    `).join('\n');

    // FAQs
    const faqHtml = (tool.faq || []).map((faq, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}">
        <button class="faq-question">
          <span>${faq.q}</span>
          <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="faq-answer">
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('\n');

    // Related tools cards
    const relatedCardsHtml = (tool.relatedTools || [])
      .map(slug => tools.find(t => t.slug === slug))
      .filter(Boolean)
      .map(t => renderToolCard(t))
      .join('\n');

    const workbenchHtml = getToolWorkbenchHtml(tool);

    let toolContent = renderTemplate(toolTpl, {
      categorySlug: cat.slug,
      categoryName: cat.name,
      toolName: tool.name,
      h1: tool.h1,
      subtitle: tool.subtitle,
      toolWorkbenchHtml: workbenchHtml,
      privacyExplanation: tool.privacyExplanation,
      howToStepsHtml: stepsHtml,
      featuresHtml: featuresHtml,
      intro: tool.intro,
      faqHtml: faqHtml,
      relatedToolsHtml: relatedCardsHtml
    });

    // Schema JSON-LD (WebApplication, FAQPage, BreadcrumbList)
    const structuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "${tool.name}",
      "url": "${SITE_URL}/${tool.slug}/",
      "description": "${tool.metaDescription.replace(/"/g, '\\"')}",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "${SITE_URL}/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "${cat.name}",
          "item": "${SITE_URL}/${cat.slug}/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "${tool.name}",
          "item": "${SITE_URL}/${tool.slug}/"
        }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": ${JSON.stringify((tool.faq || []).map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      })))}
    }
    </script>
    `;

    const toolStyles = (tool.vendorStyles || []).map(href => `<link rel="stylesheet" href="${href}">`).join('\n  ');
    const hydrationScript = getToolHydrationScript(tool);

    let toolHtml = renderTemplate(layoutTpl, {
      title: tool.title,
      metaDescription: tool.metaDescription,
      canonicalUrl: `${SITE_URL}/${tool.slug}/`,
      robots: 'index, follow',
      ogType: 'website',
      siteUrl: SITE_URL,
      pageStyles: toolStyles,
      structuredData: structuredData,
      activeImage: tool.category === 'image-tools' ? 'active' : '',
      activePdf: tool.category === 'pdf-tools' ? 'active' : '',
      activeText: tool.category === 'text-tools' ? 'active' : '',
      activeDev: tool.category === 'developer-tools' ? 'active' : '',
      activeUtil: tool.category === 'utility-tools' ? 'active' : '',
      content: toolContent,
      pageScripts: hydrationScript
    });

    const toolDir = path.join(DIST_DIR, tool.slug);
    ensureDirSync(toolDir);
    fs.writeFileSync(path.join(toolDir, 'index.html'), toolHtml);
    sitemapUrls.push({ loc: `${SITE_URL}/${tool.slug}/`, priority: '0.8', changefreq: 'weekly' });
  }

  // 5. Build Legal & Informational Pages
  console.log('⚙ Building Legal & Information Pages (about, privacy, terms, contact, 404)...');
  const legalPages = [
    {
      slug: 'about',
      title: 'About Us — TrendWala Tools',
      h1: 'About TrendWala Tools',
      subtitle: 'Building the next generation of private, browser-first digital utilities.',
      body: `
        <p>Welcome to <strong>TrendWala Tools</strong>, an ultra-fast, 100% private web platform designed to streamline your daily digital tasks without sacrificing confidentiality or data sovereignty.</p>
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">Our Mission: 100% Client-Side Computing</h2>
        <p>In today's cloud-centric ecosystem, virtually every document converter and image compression website silently uploads your sensitive photographs, private contracts, medical bills, and developer API tokens to remote processing servers. This poses severe data loss and privacy risks.</p>
        <p>TrendWala Tools is built on a fundamentally different philosophy: <strong>your device is powerful enough to process your own files</strong>. Using modern browser standards like WebAssembly (WASM), HTML5 2D Canvas, and client-side cryptography, our tools run directly inside your browser memory.</p>
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">Global &amp; Unrestricted</h2>
        <p>Whether you are in the United States, United Kingdom, India, Canada, Australia, or anywhere across the globe, TrendWala Tools provides instantaneous performance with zero network transfer lag, zero subscription fees, and no mandatory signups.</p>
      `
    },
    {
      slug: 'privacy',
      title: 'Privacy Guarantee — TrendWala Tools',
      h1: 'Privacy Policy & Guarantee',
      subtitle: 'Transparent, technically verified client-side privacy. Your files never leave your device.',
      body: `
        <div class="privacy-callout">
          <div class="privacy-callout-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="privacy-callout-body">
            <h3>Zero Server Upload Guarantee</h3>
            <p>Your photos, PDF documents, text, and JSON data are processed locally inside your web browser. Nothing is uploaded to our processing servers or stored in any database.</p>
          </div>
        </div>
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">How We Protect Your Data</h2>
        <p>When you use an image converter, PDF tool, text cleaner, or developer utility on TrendWala Tools:</p>
        <ul style="margin:1rem 0 1.5rem 1.5rem;color:var(--text-secondary);line-height:1.7;">
          <li><strong>Local In-Memory Execution:</strong> The file bytes are read by your web browser's local JavaScript/WebAssembly engine into temporary RAM.</li>
          <li><strong>Zero Transmission:</strong> We do not operate a remote conversion server or file upload backend. No files are transferred across the network.</li>
          <li><strong>Instant Cleanup:</strong> As soon as you close your browser tab or click "Clear", the in-memory blobs are completely released from your device memory.</li>
        </ul>
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">Analytics &amp; Cookies</h2>
        <p>We respect Do Not Track (DNT) headers and do not track individual identity. We store your theme preference (Dark or Light mode) locally in your browser's <code>localStorage</code> without any personal tracking identifiers.</p>
      `
    },
    {
      slug: 'terms',
      title: 'Terms of Service — TrendWala Tools',
      h1: 'Terms of Service',
      subtitle: 'Clear and simple conditions for using TrendWala Tools.',
      body: `
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">1. Acceptance of Terms</h2>
        <p>By accessing or using TrendWala Tools (tools.trendwala.in), you agree to be bound by these Terms of Service.</p>
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">2. Free &amp; Commercial Use</h2>
        <p>All 30 tools on this platform are completely free for both personal and commercial use. You retain 100% intellectual property and copyright ownership of all files and content processed using our utilities.</p>
        <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:1.5rem 0 0.5rem;">3. Disclaimer of Warranty</h2>
        <p>The tools and services are provided "as is" without warranty of any kind, express or implied. While we ensure high standard algorithms, TrendWala Tools is not liable for data loss or formatting discrepancies.</p>
      `
    },
    {
      slug: 'contact',
      title: 'Contact Support — TrendWala Tools',
      h1: 'Contact & Feedback',
      subtitle: 'Have a feature request or need help? We would love to hear from you.',
      body: `
        <p>TrendWala Tools is continuously growing. If you would like to suggest a new tool, report an issue, or ask a question, please get in touch with our team:</p>
        <div style="background:var(--bg-tertiary);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:2rem;margin:1.5rem 0;">
          <h3 style="font-size:1.15rem;font-weight:700;color:var(--text-primary);margin-bottom:0.5rem;">Email Us</h3>
          <p style="color:var(--text-secondary);font-size:1.05rem;"><strong>support@trendwala.in</strong></p>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.5rem;">We typically respond to inquiries within 24–48 business hours.</p>
        </div>
      `
    }
  ];

  for (const page of legalPages) {
    let bodyHtml = renderTemplate(pageTpl, {
      pageTitle: page.title,
      h1: page.h1,
      subtitle: page.subtitle,
      pageBodyHtml: page.body
    });

    let html = renderTemplate(layoutTpl, {
      title: `${page.title} | TrendWala Tools`,
      metaDescription: `${page.subtitle} - TrendWala Tools`,
      canonicalUrl: `${SITE_URL}/${page.slug}/`,
      robots: 'index, follow',
      ogType: 'website',
      siteUrl: SITE_URL,
      pageStyles: '',
      structuredData: '',
      activeImage: '',
      activePdf: '',
      activeText: '',
      activeDev: '',
      activeUtil: '',
      content: bodyHtml,
      pageScripts: ''
    });

    const pageDir = path.join(DIST_DIR, page.slug);
    ensureDirSync(pageDir);
    fs.writeFileSync(path.join(pageDir, 'index.html'), html);
    sitemapUrls.push({ loc: `${SITE_URL}/${page.slug}/`, priority: '0.5', changefreq: 'monthly' });
  }

  // 6. Build 404 Page
  const error404Content = `
    <div class="container" style="text-align:center;padding:5rem 1.5rem 8rem;">
      <div style="font-size:5rem;font-weight:900;color:var(--primary);line-height:1;margin-bottom:1rem;">404</div>
      <h1 style="font-size:2.25rem;font-weight:800;color:var(--text-primary);margin-bottom:1rem;">Page Not Found</h1>
      <p style="font-size:1.15rem;color:var(--text-secondary);max-width:560px;margin:0 auto 2.5rem;">
        The tool or page you are looking for may have moved, been renamed, or does not exist.
      </p>
      <div style="display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;">
        <a href="/" class="btn-primary-lg">Return to Homepage</a>
        <a href="/image-tools/" class="btn-secondary-sm" style="padding:0.85rem 1.5rem;">Explore Image Tools</a>
        <a href="/pdf-tools/" class="btn-secondary-sm" style="padding:0.85rem 1.5rem;">Explore PDF Tools</a>
      </div>
    </div>
  `;

  let error404Html = renderTemplate(layoutTpl, {
    title: 'Page Not Found (404) | TrendWala Tools',
    metaDescription: 'The requested page could not be found.',
    canonicalUrl: `${SITE_URL}/404.html`,
    robots: 'noindex, follow',
    ogType: 'website',
    siteUrl: SITE_URL,
    pageStyles: '',
    structuredData: '',
    activeImage: '',
    activePdf: '',
    activeText: '',
    activeDev: '',
    activeUtil: '',
    content: error404Content,
    pageScripts: ''
  });

  fs.writeFileSync(path.join(DIST_DIR, '404.html'), error404Html);

  // 7. Generate sitemap.xml
  console.log('⚙ Generating sitemap.xml with ' + sitemapUrls.length + ' indexed URLs...');
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(item => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');

  // 8. Generate robots.txt
  console.log('⚙ Generating robots.txt...');
  const robotsTxt = `# robots.txt for TrendWala Tools
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf-8');

  // 9. Generate netlify.toml for root and dist
  console.log('⚙ Generating netlify.toml...');
  const netlifyToml = `# Netlify Configuration for TrendWala Tools (tools.trendwala.in)

[build]
  publish = "dist"
  command = "node build.js"

# Explicit 200 pass-through for sitemap and robots before any fallback
[[redirects]]
  from = "/sitemap.xml"
  to = "/sitemap.xml"
  status = 200

[[redirects]]
  from = "/robots.txt"
  to = "/robots.txt"
  status = 200

[[redirects]]
  from = "/sitemap"
  to = "/sitemap.xml"
  status = 301

[[redirects]]
  from = "/compress"
  to = "/compress/image/"
  status = 301

[[redirects]]
  from = "/resize"
  to = "/resize/image/"
  status = 301

[[redirects]]
  from = "/crop"
  to = "/crop/image/"
  status = 301

[[redirects]]
  from = "/rotate"
  to = "/rotate/image/"
  status = 301

# Fallback for 404
[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404

# Specific XML Content-Type and Caching Headers for sitemap.xml
[[headers]]
  for = "/sitemap.xml"
  [headers.values]
    Content-Type = "application/xml"
    X-Content-Type-Options = "nosniff"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=0, must-revalidate"

# Specific Plaintext Headers for robots.txt
[[headers]]
  for = "/robots.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=0, must-revalidate"

# Security and Caching Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;

  fs.writeFileSync(path.join(__dirname, 'netlify.toml'), netlifyToml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'netlify.toml'), netlifyToml, 'utf-8');

  // 10. Generate dist/_headers and dist/_redirects for Netlify edge CDN guarantee
  console.log('⚙ Generating dist/_headers and dist/_redirects...');
  const netlifyHeaders = `# Netlify _headers for TrendWala Tools
/sitemap.xml
  Content-Type: application/xml
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=0, must-revalidate

/robots.txt
  Content-Type: text/plain; charset=UTF-8
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;
  fs.writeFileSync(path.join(DIST_DIR, '_headers'), netlifyHeaders, 'utf-8');

  const netlifyRedirects = `# Netlify _redirects for TrendWala Tools
/sitemap.xml    /sitemap.xml        200
/robots.txt     /robots.txt         200
/sitemap        /sitemap.xml        301
/compress       /compress/image/    301
/resize         /resize/image/      301
/crop           /crop/image/        301
/rotate         /rotate/image/      301
/*              /404.html           404
`;
  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), netlifyRedirects, 'utf-8');

  // 11. Generate dist/version.json for live verification
  let commitHash = process.env.COMMIT_REF || '';
  if (!commitHash) {
    try {
      const git = require('isomorphic-git');
      commitHash = await git.resolveRef({ fs, dir: __dirname, ref: 'HEAD' });
    } catch (_) {}
  }
  const versionData = {
    site: SITE_URL,
    commit: commitHash,
    sitemapUrl: `${SITE_URL}/sitemap.xml`,
    sitemapCount: sitemapUrls.length,
    builtAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(DIST_DIR, 'version.json'), JSON.stringify(versionData, null, 2), 'utf-8');

  console.log(`\n🎉 BUILD COMPLETE! Generated 1 Homepage, 5 Category Pages, 30 Tool Pages, 5 Legal/Info Pages, sitemap.xml, robots.txt, and Netlify config in ${DIST_DIR}`);
}

buildPlatform().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
