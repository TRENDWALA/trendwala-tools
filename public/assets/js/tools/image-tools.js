/**
 * TrendWala Tools - Image Tools Module
 * 100% Client-Side: HEIC Converter, Canvas Converters, Compressor, Resizer, Cropper, Rotator
 */

window.TrendWalaImageTools = (function () {
  'use strict';

  // Helper to format bytes into KB/MB
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Trigger file download helper
  function triggerDownload(blobOrUrl, filename) {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof blobOrUrl !== 'string') {
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }

  // =========================================================================
  // 1. HEIC Converter (HEIC to JPG, PNG, WebP) - Priority #1
  // =========================================================================
  function initHeicConverter(config) {
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const queueList = document.getElementById('file-queue-list');
    const qualitySlider = document.getElementById('conversion-quality');
    const qualityVal = document.getElementById('quality-val');
    const convertBtn = document.getElementById('btn-start-convert');
    const downloadAllBtn = document.getElementById('btn-download-all-zip');
    const clearBtn = document.getElementById('btn-clear-queue');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!dropzone || !fileInput) return;

    let filesQueue = []; // { file, id, status, resultBlob, resultUrl, originalSize, convertedSize }
    const targetMime = config.targetMime || 'image/jpeg';
    const targetExt = config.targetExt || 'jpg';

    if (qualitySlider && qualityVal) {
      qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value + '%';
      });
    }

    function renderQueue() {
      queueList.innerHTML = '';
      if (filesQueue.length === 0) {
        queueList.style.display = 'none';
        if (convertBtn) convertBtn.disabled = true;
        if (downloadAllBtn) downloadAllBtn.style.display = 'none';
        return;
      }

      queueList.style.display = 'flex';
      if (convertBtn) convertBtn.disabled = false;

      let allDone = true;

      filesQueue.forEach((item, index) => {
        if (item.status !== 'done') allDone = false;

        const card = document.createElement('div');
        card.className = 'file-item-card';

        let badgeClass = item.status;
        let badgeText = item.status === 'ready' ? 'Ready' : (item.status === 'processing' ? 'Converting...' : (item.status === 'done' ? 'Done' : 'Error'));

        let previewHtml = item.resultUrl
          ? `<img class="file-thumb-preview" src="${item.resultUrl}" alt="preview">`
          : `<div class="file-thumb-preview" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

        let actionBtnHtml = item.status === 'done'
          ? `<button class="btn-file-download" data-index="${index}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>`
          : '';

        card.innerHTML = `
          <div class="file-item-info">
            ${previewHtml}
            <div class="file-details">
              <div class="file-name-text">${item.file.name}</div>
              <div class="file-meta-row">
                <span>Original: ${formatBytes(item.originalSize)}</span>
                ${item.convertedSize ? `<span>• Converted: ${formatBytes(item.convertedSize)}</span>` : ''}
                <span class="file-status-badge ${badgeClass}">${badgeText}</span>
              </div>
            </div>
          </div>
          <div class="file-item-actions">
            ${actionBtnHtml}
            <button class="btn-file-remove" data-index="${index}" title="Remove file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;

        queueList.appendChild(card);
      });

      if (downloadAllBtn) {
        downloadAllBtn.style.display = (allDone && filesQueue.length > 1) ? 'inline-flex' : 'none';
      }

      // Attach download & remove listeners
      queueList.querySelectorAll('.btn-file-download').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          const item = filesQueue[idx];
          if (item && item.resultBlob) {
            const outName = item.file.name.replace(/\.[^/.]+$/, '') + '.' + targetExt;
            triggerDownload(item.resultBlob, outName);
          }
        });
      });

      queueList.querySelectorAll('.btn-file-remove').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          if (filesQueue[idx] && filesQueue[idx].resultUrl) {
            URL.revokeObjectURL(filesQueue[idx].resultUrl);
          }
          filesQueue.splice(idx, 1);
          renderQueue();
        });
      });
    }

    function handleFiles(files) {
      if (!files || files.length === 0) return;
      Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        // Allow HEIC, HEIF, or generic images
        filesQueue.push({
          file: file,
          id: Math.random().toString(36).substring(7),
          status: 'ready',
          originalSize: file.size,
          resultBlob: null,
          resultUrl: null,
          convertedSize: null
        });
      });
      renderQueue();
    }

    // Dropzone Events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      fileInput.value = '';
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        filesQueue.forEach(item => {
          if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
        });
        filesQueue = [];
        renderQueue();
      });
    }

    // Convert Action
    if (convertBtn) {
      convertBtn.addEventListener('click', async () => {
        if (filesQueue.length === 0) return;
        convertBtn.disabled = true;
        if (progressContainer) progressContainer.style.display = 'block';

        const quality = qualitySlider ? (parseInt(qualitySlider.value, 10) / 100) : 0.9;
        const total = filesQueue.length;

        for (let i = 0; i < total; i++) {
          const item = filesQueue[i];
          if (item.status === 'done') continue;

          item.status = 'processing';
          renderQueue();

          if (progressText) progressText.textContent = `Processing ${i + 1} of ${total}: ${item.file.name}...`;
          if (progressBar) progressBar.style.width = Math.round(((i) / total) * 100) + '%';

          try {
            // Check if heic2any is loaded
            if (typeof heic2any !== 'function') {
              throw new Error('HEIC conversion engine not yet loaded. Please wait a moment.');
            }

            const conversionResult = await heic2any({
              blob: item.file,
              toType: targetMime,
              quality: quality
            });

            // heic2any may return an array if animated or multi-image
            const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
            item.resultBlob = blob;
            item.resultUrl = URL.createObjectURL(blob);
            item.convertedSize = blob.size;
            item.status = 'done';
          } catch (err) {
            console.error('HEIC conversion error for file:', item.file.name, err);
            // Fallback: if it's already a standard image or heic2any failed on non-heic
            try {
              const fallbackBlob = await convertImageFallback(item.file, targetMime, quality);
              item.resultBlob = fallbackBlob;
              item.resultUrl = URL.createObjectURL(fallbackBlob);
              item.convertedSize = fallbackBlob.size;
              item.status = 'done';
            } catch (fallbackErr) {
              item.status = 'error';
              window.showToast(`Error converting ${item.file.name}: ${err.message || 'Unsupported format'}`, 'error');
            }
          }

          if (progressBar) progressBar.style.width = Math.round(((i + 1) / total) * 100) + '%';
          renderQueue();
        }

        const errorCount = filesQueue.filter(f => f.status === 'error').length;
        const doneCount = filesQueue.filter(f => f.status === 'done').length;

        if (errorCount === 0 && doneCount > 0) {
          if (progressText) progressText.textContent = 'Conversion Complete!';
          window.showToast('All files converted successfully!', 'success');
        } else if (doneCount > 0 && errorCount > 0) {
          if (progressText) progressText.textContent = `Completed with ${errorCount} error(s)`;
          window.showToast(`Converted ${doneCount} file(s), ${errorCount} failed`, 'warning');
        } else {
          if (progressText) progressText.textContent = 'Conversion failed';
          window.showToast('Failed to convert file(s). Please check format.', 'error');
        }

        if (convertBtn) convertBtn.disabled = false;
      });
    }

    // Download All ZIP
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', async () => {
        const completed = filesQueue.filter(f => f.status === 'done' && f.resultBlob);
        if (completed.length === 0) return;

        if (typeof JSZip === 'undefined') {
          window.showToast('ZIP library not loaded', 'error');
          return;
        }

        downloadAllBtn.disabled = true;
        const originalText = downloadAllBtn.innerHTML;
        downloadAllBtn.innerHTML = `<div class="spinner"></div> Archiving...`;

        try {
          const zip = new JSZip();
          completed.forEach((item, idx) => {
            const baseName = item.file.name.replace(/\.[^/.]+$/, '');
            const outName = `${baseName}_converted.${targetExt}`;
            zip.file(outName, item.resultBlob);
          });

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          triggerDownload(zipBlob, `trendwala_converted_${targetExt}_files.zip`);
          window.showToast('ZIP download started!', 'success');
        } catch (err) {
          console.error('ZIP generation error:', err);
          window.showToast('Failed to generate ZIP archive', 'error');
        } finally {
          downloadAllBtn.disabled = false;
          downloadAllBtn.innerHTML = originalText;
        }
      });
    }
  }

  // Fallback for standard images via Canvas
  function convertImageFallback(file, mimeType, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');

          // White background for JPEG to handle transparent PNG/HEIC
          if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          }, mimeType, quality);
        };
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // =========================================================================
  // 2. Canvas Image Converter (JPG to PNG/WebP, PNG to JPG/WebP)
  // =========================================================================
  function initCanvasConverter(config) {
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const queueList = document.getElementById('file-queue-list');
    const qualitySlider = document.getElementById('conversion-quality');
    const qualityVal = document.getElementById('quality-val');
    const convertBtn = document.getElementById('btn-start-convert');
    const downloadAllBtn = document.getElementById('btn-download-all-zip');
    const clearBtn = document.getElementById('btn-clear-queue');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!dropzone || !fileInput) return;

    let filesQueue = [];
    const targetMime = config.targetMime || 'image/png';
    const targetExt = config.targetExt || 'png';

    if (qualitySlider && qualityVal) {
      qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value + '%';
      });
    }

    function renderQueue() {
      queueList.innerHTML = '';
      if (filesQueue.length === 0) {
        queueList.style.display = 'none';
        if (convertBtn) convertBtn.disabled = true;
        if (downloadAllBtn) downloadAllBtn.style.display = 'none';
        return;
      }

      queueList.style.display = 'flex';
      if (convertBtn) convertBtn.disabled = false;

      let allDone = true;

      filesQueue.forEach((item, index) => {
        if (item.status !== 'done') allDone = false;

        const card = document.createElement('div');
        card.className = 'file-item-card';

        let badgeClass = item.status;
        let badgeText = item.status === 'ready' ? 'Ready' : (item.status === 'processing' ? 'Converting...' : (item.status === 'done' ? 'Done' : 'Error'));

        let previewHtml = item.resultUrl
          ? `<img class="file-thumb-preview" src="${item.resultUrl}" alt="preview">`
          : (item.originalUrl ? `<img class="file-thumb-preview" src="${item.originalUrl}" alt="preview">` : `<div class="file-thumb-preview"></div>`);

        let actionBtnHtml = item.status === 'done'
          ? `<button class="btn-file-download" data-index="${index}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>`
          : '';

        card.innerHTML = `
          <div class="file-item-info">
            ${previewHtml}
            <div class="file-details">
              <div class="file-name-text">${item.file.name}</div>
              <div class="file-meta-row">
                <span>Original: ${formatBytes(item.originalSize)}</span>
                ${item.convertedSize ? `<span>• Converted: ${formatBytes(item.convertedSize)}</span>` : ''}
                <span class="file-status-badge ${badgeClass}">${badgeText}</span>
              </div>
            </div>
          </div>
          <div class="file-item-actions">
            ${actionBtnHtml}
            <button class="btn-file-remove" data-index="${index}" title="Remove file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;

        queueList.appendChild(card);
      });

      if (downloadAllBtn) {
        downloadAllBtn.style.display = (allDone && filesQueue.length > 1) ? 'inline-flex' : 'none';
      }

      queueList.querySelectorAll('.btn-file-download').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          const item = filesQueue[idx];
          if (item && item.resultBlob) {
            const outName = item.file.name.replace(/\.[^/.]+$/, '') + '.' + targetExt;
            triggerDownload(item.resultBlob, outName);
          }
        });
      });

      queueList.querySelectorAll('.btn-file-remove').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          if (filesQueue[idx] && filesQueue[idx].resultUrl) {
            URL.revokeObjectURL(filesQueue[idx].resultUrl);
          }
          if (filesQueue[idx] && filesQueue[idx].originalUrl) {
            URL.revokeObjectURL(filesQueue[idx].originalUrl);
          }
          filesQueue.splice(idx, 1);
          renderQueue();
        });
      });
    }

    function handleFiles(files) {
      if (!files || files.length === 0) return;
      Array.from(files).forEach(file => {
        const objUrl = URL.createObjectURL(file);
        filesQueue.push({
          file: file,
          id: Math.random().toString(36).substring(7),
          status: 'ready',
          originalSize: file.size,
          originalUrl: objUrl,
          resultBlob: null,
          resultUrl: null,
          convertedSize: null
        });
      });
      renderQueue();
    }

    ['dragenter', 'dragover'].forEach(ev => {
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(ev => {
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      fileInput.value = '';
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        filesQueue.forEach(item => {
          if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
          if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        });
        filesQueue = [];
        renderQueue();
      });
    }

    if (convertBtn) {
      convertBtn.addEventListener('click', async () => {
        if (filesQueue.length === 0) return;
        convertBtn.disabled = true;
        if (progressContainer) progressContainer.style.display = 'block';

        const quality = qualitySlider ? (parseInt(qualitySlider.value, 10) / 100) : 0.9;
        const total = filesQueue.length;

        for (let i = 0; i < total; i++) {
          const item = filesQueue[i];
          if (item.status === 'done') continue;

          item.status = 'processing';
          renderQueue();

          if (progressText) progressText.textContent = `Converting ${i + 1} of ${total}: ${item.file.name}...`;

          try {
            const blob = await convertImageFallback(item.file, targetMime, quality);
            item.resultBlob = blob;
            item.resultUrl = URL.createObjectURL(blob);
            item.convertedSize = blob.size;
            item.status = 'done';
          } catch (err) {
            console.error('Conversion error:', err);
            item.status = 'error';
          }

          if (progressBar) progressBar.style.width = Math.round(((i + 1) / total) * 100) + '%';
          renderQueue();
        }

        if (progressText) progressText.textContent = 'Conversion Complete!';
        if (convertBtn) convertBtn.disabled = false;
        window.showToast('Images converted successfully!', 'success');
      });
    }

    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', async () => {
        const completed = filesQueue.filter(f => f.status === 'done' && f.resultBlob);
        if (completed.length === 0) return;

        if (typeof JSZip === 'undefined') {
          window.showToast('ZIP library not loaded', 'error');
          return;
        }

        downloadAllBtn.disabled = true;
        const originalText = downloadAllBtn.innerHTML;
        downloadAllBtn.innerHTML = `<div class="spinner"></div> Archiving...`;

        try {
          const zip = new JSZip();
          completed.forEach((item) => {
            const baseName = item.file.name.replace(/\.[^/.]+$/, '');
            zip.file(`${baseName}.${targetExt}`, item.resultBlob);
          });
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          triggerDownload(zipBlob, `trendwala_converted_${targetExt}.zip`);
        } catch (err) {
          window.showToast('ZIP generation failed', 'error');
        } finally {
          downloadAllBtn.disabled = false;
          downloadAllBtn.innerHTML = originalText;
        }
      });
    }
  }

  // =========================================================================
  // 3. Image Compressor (With Live Size Comparison)
  // =========================================================================
  function initImageCompressor() {
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const qualitySlider = document.getElementById('compress-quality');
    const qualityVal = document.getElementById('compress-quality-val');
    const previewContainer = document.getElementById('compress-preview-container');
    const origImgEl = document.getElementById('comp-orig-img');
    const origSizeEl = document.getElementById('comp-orig-size');
    const compImgEl = document.getElementById('comp-result-img');
    const compSizeEl = document.getElementById('comp-result-size');
    const savingsEl = document.getElementById('comp-savings-val');
    const downloadBtn = document.getElementById('btn-download-compressed');
    const clearBtn = document.getElementById('btn-clear-compress');

    if (!dropzone || !fileInput) return;

    let currentFile = null;
    let currentBlob = null;
    let originalUrl = null;
    let compressedUrl = null;

    if (qualitySlider && qualityVal) {
      qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value + '%';
        if (currentFile) compressCurrentFile();
      });
    }

    async function compressCurrentFile() {
      if (!currentFile) return;
      const quality = parseInt(qualitySlider.value, 10) / 100;
      const mime = currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg';

      try {
        const blob = await convertImageFallback(currentFile, mime, quality);
        currentBlob = blob;

        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        compressedUrl = URL.createObjectURL(blob);

        if (compImgEl) compImgEl.src = compressedUrl;
        if (compSizeEl) compSizeEl.textContent = formatBytes(blob.size);

        if (savingsEl && currentFile.size > 0) {
          const diff = currentFile.size - blob.size;
          const percent = Math.round((diff / currentFile.size) * 100);
          if (percent > 0) {
            savingsEl.textContent = `-${percent}% (${formatBytes(diff)} saved)`;
            savingsEl.style.color = 'var(--accent-emerald)';
          } else {
            savingsEl.textContent = `0% change`;
            savingsEl.style.color = 'var(--text-muted)';
          }
        }

        if (downloadBtn) downloadBtn.disabled = false;
      } catch (err) {
        console.error('Compression failed:', err);
      }
    }

    function handleFile(file) {
      if (!file) return;
      currentFile = file;
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      originalUrl = URL.createObjectURL(file);

      if (origImgEl) origImgEl.src = originalUrl;
      if (origSizeEl) origSizeEl.textContent = formatBytes(file.size);

      if (previewContainer) previewContainer.style.display = 'block';
      compressCurrentFile();
    }

    ['dragenter', 'dragover'].forEach(ev => dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }));

    ['dragleave', 'drop'].forEach(ev => dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }));

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!currentBlob || !currentFile) return;
        const ext = currentFile.type === 'image/png' ? 'png' : 'jpg';
        const name = currentFile.name.replace(/\.[^/.]+$/, '') + '_compressed.' + ext;
        triggerDownload(currentBlob, name);
        window.showToast('Compressed image downloaded!', 'success');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        currentFile = null;
        currentBlob = null;
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        if (previewContainer) previewContainer.style.display = 'none';
        if (downloadBtn) downloadBtn.disabled = true;
      });
    }
  }

  // =========================================================================
  // 4. Image Resizer (Pixel & Percentage scaling with aspect ratio lock)
  // =========================================================================
  function initImageResizer() {
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const lockAspectBtn = document.getElementById('btn-lock-aspect');
    const presetButtons = document.querySelectorAll('.btn-preset-scale');
    const previewContainer = document.getElementById('resize-preview-container');
    const previewImg = document.getElementById('resize-preview-img');
    const dimensionsBadge = document.getElementById('resize-dimensions-badge');
    const downloadBtn = document.getElementById('btn-download-resized');

    if (!dropzone || !fileInput) return;

    let originalImg = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let lockAspect = true;
    let currentFile = null;

    if (lockAspectBtn) {
      lockAspectBtn.addEventListener('click', () => {
        lockAspect = !lockAspect;
        lockAspectBtn.classList.toggle('locked', lockAspect);
      });
    }

    function handleFile(file) {
      if (!file) return;
      currentFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        originalImg = new Image();
        originalImg.onload = () => {
          originalWidth = originalImg.naturalWidth;
          originalHeight = originalImg.naturalHeight;
          if (widthInput) widthInput.value = originalWidth;
          if (heightInput) heightInput.value = originalHeight;
          if (dimensionsBadge) dimensionsBadge.textContent = `${originalWidth} × ${originalHeight} px`;
          if (previewImg) previewImg.src = e.target.result;
          if (previewContainer) previewContainer.style.display = 'block';
          if (downloadBtn) downloadBtn.disabled = false;
        };
        originalImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    if (widthInput && heightInput) {
      widthInput.addEventListener('input', () => {
        const w = parseInt(widthInput.value, 10);
        if (lockAspect && originalWidth > 0 && !isNaN(w)) {
          heightInput.value = Math.round((w / originalWidth) * originalHeight);
        }
      });

      heightInput.addEventListener('input', () => {
        const h = parseInt(heightInput.value, 10);
        if (lockAspect && originalHeight > 0 && !isNaN(h)) {
          widthInput.value = Math.round((h / originalHeight) * originalWidth);
        }
      });
    }

    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const scale = parseFloat(btn.getAttribute('data-scale'));
        if (originalWidth > 0 && !isNaN(scale)) {
          widthInput.value = Math.round(originalWidth * scale);
          heightInput.value = Math.round(originalHeight * scale);
        }
      });
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!originalImg || !currentFile) return;
        const targetW = parseInt(widthInput.value, 10) || originalWidth;
        const targetH = parseInt(heightInput.value, 10) || originalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImg, 0, 0, targetW, targetH);

        const mime = currentFile.type || 'image/jpeg';
        canvas.toBlob((blob) => {
          if (blob) {
            const ext = currentFile.name.split('.').pop() || 'jpg';
            const name = currentFile.name.replace(/\.[^/.]+$/, '') + `_${targetW}x${targetH}.${ext}`;
            triggerDownload(blob, name);
            window.showToast('Resized image downloaded!', 'success');
          }
        }, mime, 0.92);
      });
    }
  }

  // =========================================================================
  // 5. Image Cropper (Interactive Presets: 1:1, 16:9, 4:3, 9:16, Free)
  // =========================================================================
  function initImageCropper() {
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const cropContainer = document.getElementById('cropper-wrapper');
    const cropImg = document.getElementById('cropper-image');
    const ratioButtons = document.querySelectorAll('.btn-crop-ratio');
    const cropExecuteBtn = document.getElementById('btn-execute-crop');
    const downloadBtn = document.getElementById('btn-download-crop');

    if (!dropzone || !fileInput) return;

    let cropper = null;
    let currentFile = null;
    let croppedBlob = null;

    function handleFile(file) {
      if (!file) return;
      currentFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (cropper) cropper.destroy();
        cropImg.src = e.target.result;
        cropContainer.style.display = 'block';

        if (typeof Cropper === 'undefined') {
          window.showToast('Cropper library loading...', 'error');
          return;
        }

        cropper = new Cropper(cropImg, {
          aspectRatio: NaN, // Freeform initially
          viewMode: 1,
          autoCropArea: 0.8,
          responsive: true
        });

        if (cropExecuteBtn) cropExecuteBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }

    ratioButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        ratioButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const ratioVal = btn.getAttribute('data-ratio');
        if (!cropper) return;
        if (ratioVal === 'free') {
          cropper.setAspectRatio(NaN);
        } else {
          const [w, h] = ratioVal.split(':').map(Number);
          cropper.setAspectRatio(w / h);
        }
      });
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    if (cropExecuteBtn) {
      cropExecuteBtn.addEventListener('click', () => {
        if (!cropper || !currentFile) return;
        const canvas = cropper.getCroppedCanvas({
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });

        const mime = currentFile.type || 'image/jpeg';
        canvas.toBlob((blob) => {
          if (blob) {
            croppedBlob = blob;
            const ext = currentFile.name.split('.').pop() || 'jpg';
            const name = currentFile.name.replace(/\.[^/.]+$/, '') + '_cropped.' + ext;
            triggerDownload(blob, name);
            window.showToast('Cropped image downloaded!', 'success');
          }
        }, mime, 0.95);
      });
    }
  }

  // =========================================================================
  // 6. Image Rotator (90° CW, 90° CCW, 180°, Flip H, Flip V)
  // =========================================================================
  function initImageRotator() {
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const rotateCwBtn = document.getElementById('btn-rotate-cw');
    const rotateCcwBtn = document.getElementById('btn-rotate-ccw');
    const rotate180Btn = document.getElementById('btn-rotate-180');
    const flipHBtn = document.getElementById('btn-flip-h');
    const flipVBtn = document.getElementById('btn-flip-v');
    const previewCanvas = document.getElementById('rotator-canvas');
    const previewContainer = document.getElementById('rotator-preview-container');
    const downloadBtn = document.getElementById('btn-download-rotated');

    if (!dropzone || !fileInput) return;

    let originalImg = null;
    let currentAngle = 0; // 0, 90, 180, 270
    let flipH = false;
    let flipV = false;
    let currentFile = null;

    function renderTransformed() {
      if (!originalImg || !previewCanvas) return;
      const ctx = previewCanvas.getContext('2d');
      const rads = (currentAngle * Math.PI) / 180;
      const isPerpendicular = currentAngle === 90 || currentAngle === 270;

      const newWidth = isPerpendicular ? originalImg.naturalHeight : originalImg.naturalWidth;
      const newHeight = isPerpendicular ? originalImg.naturalWidth : originalImg.naturalHeight;

      previewCanvas.width = newWidth;
      previewCanvas.height = newHeight;

      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.save();

      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(rads);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(originalImg, -originalImg.naturalWidth / 2, -originalImg.naturalHeight / 2);

      ctx.restore();
    }

    function handleFile(file) {
      if (!file) return;
      currentFile = file;
      currentAngle = 0;
      flipH = false;
      flipV = false;

      const reader = new FileReader();
      reader.onload = (e) => {
        originalImg = new Image();
        originalImg.onload = () => {
          if (previewContainer) previewContainer.style.display = 'block';
          if (downloadBtn) downloadBtn.disabled = false;
          renderTransformed();
        };
        originalImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    if (rotateCwBtn) {
      rotateCwBtn.addEventListener('click', () => {
        currentAngle = (currentAngle + 90) % 360;
        renderTransformed();
      });
    }

    if (rotateCcwBtn) {
      rotateCcwBtn.addEventListener('click', () => {
        currentAngle = (currentAngle - 90 + 360) % 360;
        renderTransformed();
      });
    }

    if (rotate180Btn) {
      rotate180Btn.addEventListener('click', () => {
        currentAngle = (currentAngle + 180) % 360;
        renderTransformed();
      });
    }

    if (flipHBtn) {
      flipHBtn.addEventListener('click', () => {
        flipH = !flipH;
        renderTransformed();
      });
    }

    if (flipVBtn) {
      flipVBtn.addEventListener('click', () => {
        flipV = !flipV;
        renderTransformed();
      });
    }

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!previewCanvas || !currentFile) return;
        const mime = currentFile.type || 'image/jpeg';
        previewCanvas.toBlob((blob) => {
          if (blob) {
            const ext = currentFile.name.split('.').pop() || 'jpg';
            const name = currentFile.name.replace(/\.[^/.]+$/, '') + '_rotated.' + ext;
            triggerDownload(blob, name);
            window.showToast('Rotated image downloaded!', 'success');
          }
        }, mime, 0.95);
      });
    }
  }

  // Public Interface
  return {
    initHeicConverter,
    initCanvasConverter,
    initImageCompressor,
    initImageResizer,
    initImageCropper,
    initImageRotator
  };
})();
