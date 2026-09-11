/**
 * TrendWala Tools - PDF Tools Module
 * 100% Client-Side: Image to PDF, PDF Merge, PDF Split, PDF Rotate, PDF to JPG
 */

window.TrendWalaPdfTools = (function () {
  'use strict';

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

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
  // 1. Image to PDF Converter (and JPG to PDF, PNG to PDF)
  // =========================================================================
  function initImageToPdf() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const queueList = document.getElementById('file-queue-list');
    const pageSizeSelect = document.getElementById('pdf-page-size');
    const orientationSelect = document.getElementById('pdf-orientation');
    const marginSelect = document.getElementById('pdf-margin');
    const convertBtn = document.getElementById('btn-create-pdf');
    const clearBtn = document.getElementById('btn-clear-queue');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!dropzone || !fileInput) return;

    let imagesQueue = []; // { file, url, name, size }

    function renderQueue() {
      queueList.innerHTML = '';
      if (imagesQueue.length === 0) {
        queueList.style.display = 'none';
        if (convertBtn) convertBtn.disabled = true;
        return;
      }

      queueList.style.display = 'flex';
      if (convertBtn) convertBtn.disabled = false;

      imagesQueue.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'file-item-card';
        card.innerHTML = `
          <div class="file-item-info">
            <img class="file-thumb-preview" src="${item.url}" alt="thumb">
            <div class="file-details">
              <div class="file-name-text">Page ${index + 1}: ${item.file.name}</div>
              <div class="file-meta-row">
                <span>${formatBytes(item.file.size)}</span>
              </div>
            </div>
          </div>
          <div class="file-item-actions">
            ${index > 0 ? `<button class="btn-secondary-sm btn-move-up" data-index="${index}" title="Move Up">↑</button>` : ''}
            ${index < imagesQueue.length - 1 ? `<button class="btn-secondary-sm btn-move-down" data-index="${index}" title="Move Down">↓</button>` : ''}
            <button class="btn-file-remove" data-index="${index}" title="Remove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;
        queueList.appendChild(card);
      });

      queueList.querySelectorAll('.btn-move-up').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          const temp = imagesQueue[idx];
          imagesQueue[idx] = imagesQueue[idx - 1];
          imagesQueue[idx - 1] = temp;
          renderQueue();
        });
      });

      queueList.querySelectorAll('.btn-move-down').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          const temp = imagesQueue[idx];
          imagesQueue[idx] = imagesQueue[idx + 1];
          imagesQueue[idx + 1] = temp;
          renderQueue();
        });
      });

      queueList.querySelectorAll('.btn-file-remove').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          if (imagesQueue[idx] && imagesQueue[idx].url) URL.revokeObjectURL(imagesQueue[idx].url);
          imagesQueue.splice(idx, 1);
          renderQueue();
        });
      });
    }

    function handleFiles(files) {
      if (!files) return;
      Array.from(files).forEach(file => {
        imagesQueue.push({
          file: file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        });
      });
      renderQueue();
    }

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      fileInput.value = '';
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        imagesQueue.forEach(i => URL.revokeObjectURL(i.url));
        imagesQueue = [];
        renderQueue();
      });
    }

    if (convertBtn) {
      convertBtn.addEventListener('click', async () => {
        if (imagesQueue.length === 0) return;
        if (typeof PDFLib === 'undefined') {
          window.showToast('PDF-Lib library not loaded yet', 'error');
          return;
        }

        convertBtn.disabled = true;
        if (progressContainer) progressContainer.style.display = 'block';

        const pageSize = pageSizeSelect ? pageSizeSelect.value : 'a4';
        const orientation = orientationSelect ? orientationSelect.value : 'portrait';
        const marginVal = marginSelect ? parseInt(marginSelect.value, 10) : 20;

        try {
          const pdfDoc = await PDFLib.PDFDocument.create();

          for (let i = 0; i < imagesQueue.length; i++) {
            const item = imagesQueue[i];
            if (progressText) progressText.textContent = `Embedding image ${i + 1} of ${imagesQueue.length}...`;
            if (progressBar) progressBar.style.width = Math.round(((i + 1) / imagesQueue.length) * 100) + '%';

            const arrayBuffer = await item.file.arrayBuffer();
            let embeddedImage;

            // Detect PNG vs JPEG
            const isPng = item.file.type === 'image/png' || item.file.name.toLowerCase().endsWith('.png');
            if (isPng) {
              try {
                embeddedImage = await pdfDoc.embedPng(arrayBuffer);
              } catch (e) {
                // Fallback: render to canvas and embed as PNG/JPG
                embeddedImage = await embedViaCanvas(pdfDoc, item.file);
              }
            } else {
              try {
                embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
              } catch (e) {
                embeddedImage = await embedViaCanvas(pdfDoc, item.file);
              }
            }

            let pageWidth, pageHeight;
            if (pageSize === 'a4') {
              pageWidth = 595.28;
              pageHeight = 841.89;
            } else if (pageSize === 'letter') {
              pageWidth = 612.0;
              pageHeight = 792.0;
            } else { // fit to image
              pageWidth = embeddedImage.width + (marginVal * 2);
              pageHeight = embeddedImage.height + (marginVal * 2);
            }

            if (orientation === 'landscape' && pageSize !== 'fit') {
              const temp = pageWidth;
              pageWidth = pageHeight;
              pageHeight = temp;
            }

            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Calculate scaled dimensions to fit page with margins
            const maxWidth = pageWidth - (marginVal * 2);
            const maxHeight = pageHeight - (marginVal * 2);

            const scale = Math.min(maxWidth / embeddedImage.width, maxHeight / embeddedImage.height, 1);
            const drawWidth = embeddedImage.width * scale;
            const drawHeight = embeddedImage.height * scale;

            // Center image on page
            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            page.drawImage(embeddedImage, {
              x: x,
              y: y,
              width: drawWidth,
              height: drawHeight
            });
          }

          if (progressText) progressText.textContent = 'Saving PDF document...';
          const pdfBytes = await pdfDoc.save();
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          triggerDownload(pdfBlob, 'trendwala_converted_document.pdf');
          window.showToast('PDF created successfully!', 'success');
        } catch (err) {
          console.error('PDF creation error:', err);
          window.showToast('Error creating PDF: ' + err.message, 'error');
        } finally {
          convertBtn.disabled = false;
        }
      });
    }

    async function embedViaCanvas(pdfDoc, file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
              const buf = await blob.arrayBuffer();
              const emb = await pdfDoc.embedPng(buf);
              resolve(emb);
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  // =========================================================================
  // 2. PDF Merger
  // =========================================================================
  function initPdfMerger() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const queueList = document.getElementById('file-queue-list');
    const mergeBtn = document.getElementById('btn-merge-pdf');
    const clearBtn = document.getElementById('btn-clear-queue');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!dropzone || !fileInput) return;

    let pdfQueue = []; // { file, name, size }

    function renderQueue() {
      queueList.innerHTML = '';
      if (pdfQueue.length === 0) {
        queueList.style.display = 'none';
        if (mergeBtn) mergeBtn.disabled = true;
        return;
      }

      queueList.style.display = 'flex';
      if (mergeBtn) mergeBtn.disabled = pdfQueue.length < 2;

      pdfQueue.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'file-item-card';
        card.innerHTML = `
          <div class="file-item-info">
            <div class="file-thumb-preview" style="display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,0.1);color:var(--primary);font-weight:800;font-size:1.1rem;">
              ${index + 1}
            </div>
            <div class="file-details">
              <div class="file-name-text">${item.file.name}</div>
              <div class="file-meta-row">
                <span>${formatBytes(item.file.size)}</span>
              </div>
            </div>
          </div>
          <div class="file-item-actions">
            ${index > 0 ? `<button class="btn-secondary-sm btn-move-up" data-index="${index}" title="Move Up">↑</button>` : ''}
            ${index < pdfQueue.length - 1 ? `<button class="btn-secondary-sm btn-move-down" data-index="${index}" title="Move Down">↓</button>` : ''}
            <button class="btn-file-remove" data-index="${index}" title="Remove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;
        queueList.appendChild(card);
      });

      queueList.querySelectorAll('.btn-move-up').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          const temp = pdfQueue[idx];
          pdfQueue[idx] = pdfQueue[idx - 1];
          pdfQueue[idx - 1] = temp;
          renderQueue();
        });
      });

      queueList.querySelectorAll('.btn-move-down').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          const temp = pdfQueue[idx];
          pdfQueue[idx] = pdfQueue[idx + 1];
          pdfQueue[idx + 1] = temp;
          renderQueue();
        });
      });

      queueList.querySelectorAll('.btn-file-remove').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-index'), 10);
          pdfQueue.splice(idx, 1);
          renderQueue();
        });
      });
    }

    function handleFiles(files) {
      if (!files) return;
      Array.from(files).forEach(file => {
        if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
          pdfQueue.push({ file: file, name: file.name, size: file.size });
        }
      });
      renderQueue();
    }

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      fileInput.value = '';
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        pdfQueue = [];
        renderQueue();
      });
    }

    if (mergeBtn) {
      mergeBtn.addEventListener('click', async () => {
        if (pdfQueue.length < 2) {
          window.showToast('Please add at least 2 PDF files to merge', 'error');
          return;
        }

        if (typeof PDFLib === 'undefined') {
          window.showToast('PDF library not loaded', 'error');
          return;
        }

        mergeBtn.disabled = true;
        if (progressContainer) progressContainer.style.display = 'block';

        try {
          const mergedPdf = await PDFLib.PDFDocument.create();

          for (let i = 0; i < pdfQueue.length; i++) {
            const item = pdfQueue[i];
            if (progressText) progressText.textContent = `Merging ${i + 1} of ${pdfQueue.length}: ${item.file.name}...`;
            if (progressBar) progressBar.style.width = Math.round(((i + 1) / pdfQueue.length) * 100) + '%';

            const arrayBuffer = await item.file.arrayBuffer();
            const donorPdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
          }

          if (progressText) progressText.textContent = 'Saving merged document...';
          const mergedBytes = await mergedPdf.save();
          const blob = new Blob([mergedBytes], { type: 'application/pdf' });
          triggerDownload(blob, 'trendwala_merged_document.pdf');
          window.showToast('PDF files merged successfully!', 'success');
        } catch (err) {
          console.error('Merge error:', err);
          window.showToast('Error merging PDFs: ' + err.message, 'error');
        } finally {
          mergeBtn.disabled = false;
        }
      });
    }
  }

  // =========================================================================
  // 3. PDF Splitter
  // =========================================================================
  function initPdfSplitter() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const optionsPanel = document.getElementById('split-options-panel');
    const totalPagesEl = document.getElementById('split-total-pages');
    const rangeInput = document.getElementById('split-range-input');
    const splitAllCheckbox = document.getElementById('split-all-checkbox');
    const splitBtn = document.getElementById('btn-execute-split');

    if (!dropzone || !fileInput) return;

    let loadedPdf = null;
    let totalPages = 0;
    let currentFile = null;

    async function handleFile(file) {
      if (!file) return;
      currentFile = file;

      try {
        const arrayBuffer = await file.arrayBuffer();
        loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
        totalPages = loadedPdf.getPageCount();

        if (totalPagesEl) totalPagesEl.textContent = `Total Pages: ${totalPages}`;
        if (optionsPanel) optionsPanel.style.display = 'block';
        if (rangeInput) rangeInput.placeholder = `e.g. 1-${Math.min(3, totalPages)}, ${totalPages}`;
        if (splitBtn) splitBtn.disabled = false;
      } catch (err) {
        console.error('Failed to load PDF:', err);
        window.showToast('Could not load PDF document', 'error');
      }
    }

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    if (splitAllCheckbox) {
      splitAllCheckbox.addEventListener('change', () => {
        if (rangeInput) rangeInput.disabled = splitAllCheckbox.checked;
      });
    }

    if (splitBtn) {
      splitBtn.addEventListener('click', async () => {
        if (!loadedPdf || !currentFile) return;

        splitBtn.disabled = true;
        const originalText = splitBtn.innerHTML;
        splitBtn.innerHTML = `<div class="spinner"></div> Splitting...`;

        try {
          if (splitAllCheckbox && splitAllCheckbox.checked) {
            // Split each page into separate PDF bundled into a ZIP
            if (typeof JSZip === 'undefined') {
              throw new Error('ZIP library not loaded');
            }

            const zip = new JSZip();
            const baseName = currentFile.name.replace(/\.[^/.]+$/, '');

            for (let i = 0; i < totalPages; i++) {
              const singleDoc = await PDFLib.PDFDocument.create();
              const [copiedPage] = await singleDoc.copyPages(loadedPdf, [i]);
              singleDoc.addPage(copiedPage);
              const bytes = await singleDoc.save();
              zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            triggerDownload(zipBlob, `${baseName}_all_split_pages.zip`);
            window.showToast('All pages extracted into ZIP!', 'success');
          } else {
            // Extract custom range (e.g. "1-3, 5, 8")
            const rawRange = (rangeInput ? rangeInput.value : '').trim();
            const pageIndices = parsePageRanges(rawRange, totalPages);

            if (pageIndices.length === 0) {
              window.showToast('Please specify valid page numbers or ranges', 'error');
              return;
            }

            const newDoc = await PDFLib.PDFDocument.create();
            const copiedPages = await newDoc.copyPages(loadedPdf, pageIndices);
            copiedPages.forEach(p => newDoc.addPage(p));

            const bytes = await newDoc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
            triggerDownload(blob, `${baseName}_extracted_pages.pdf`);
            window.showToast('Pages extracted successfully!', 'success');
          }
        } catch (err) {
          console.error('Split error:', err);
          window.showToast('Error splitting PDF: ' + err.message, 'error');
        } finally {
          splitBtn.disabled = false;
          splitBtn.innerHTML = originalText;
        }
      });
    }

    // Helper: Parse string like "1-3, 5, 8-10" into 0-indexed array
    function parsePageRanges(rangeStr, maxPage) {
      if (!rangeStr) return [];
      const parts = rangeStr.split(',');
      const indices = [];

      parts.forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
              if (!indices.includes(i - 1)) indices.push(i - 1);
            }
          }
        } else {
          const num = parseInt(part, 10);
          if (!isNaN(num) && num >= 1 && num <= maxPage) {
            if (!indices.includes(num - 1)) indices.push(num - 1);
          }
        }
      });

      return indices.sort((a, b) => a - b);
    }
  }

  // =========================================================================
  // 4. PDF Page Rotator
  // =========================================================================
  function initPdfRotator() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const optionsPanel = document.getElementById('rotate-options-panel');
    const totalPagesEl = document.getElementById('rotate-total-pages');
    const angleButtons = document.querySelectorAll('.btn-rotate-angle');
    const applyToSelect = document.getElementById('rotate-apply-to');
    const rotateBtn = document.getElementById('btn-execute-pdf-rotate');

    if (!dropzone || !fileInput) return;

    let loadedPdf = null;
    let totalPages = 0;
    let currentFile = null;
    let selectedAngle = 90;

    async function handleFile(file) {
      if (!file) return;
      currentFile = file;

      try {
        const arrayBuffer = await file.arrayBuffer();
        loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
        totalPages = loadedPdf.getPageCount();

        if (totalPagesEl) totalPagesEl.textContent = `Total Pages: ${totalPages}`;
        if (optionsPanel) optionsPanel.style.display = 'block';
        if (rotateBtn) rotateBtn.disabled = false;
      } catch (err) {
        console.error('Failed to load PDF:', err);
        window.showToast('Could not load PDF document', 'error');
      }
    }

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    angleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        angleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAngle = parseInt(btn.getAttribute('data-angle'), 10);
      });
    });

    if (rotateBtn) {
      rotateBtn.addEventListener('click', async () => {
        if (!loadedPdf || !currentFile) return;

        rotateBtn.disabled = true;
        const originalText = rotateBtn.innerHTML;
        rotateBtn.innerHTML = `<div class="spinner"></div> Rotating...`;

        try {
          const pages = loadedPdf.getPages();
          const target = applyToSelect ? applyToSelect.value : 'all';

          pages.forEach((page, idx) => {
            let shouldRotate = false;
            if (target === 'all') shouldRotate = true;
            else if (target === 'first' && idx === 0) shouldRotate = true;
            else if (target === 'even' && (idx + 1) % 2 === 0) shouldRotate = true;
            else if (target === 'odd' && (idx + 1) % 2 !== 0) shouldRotate = true;

            if (shouldRotate) {
              const currentRotation = page.getRotation().angle;
              page.setRotation(PDFLib.degrees((currentRotation + selectedAngle) % 360));
            }
          });

          const bytes = await loadedPdf.save();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
          triggerDownload(blob, `${baseName}_rotated.pdf`);
          window.showToast('PDF pages rotated successfully!', 'success');
        } catch (err) {
          console.error('Rotate error:', err);
          window.showToast('Failed to rotate PDF: ' + err.message, 'error');
        } finally {
          rotateBtn.disabled = false;
          rotateBtn.innerHTML = originalText;
        }
      });
    }
  }

  // =========================================================================
  // 5. PDF to JPG Converter
  // =========================================================================
  function initPdfToJpg() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const pagesContainer = document.getElementById('pdf-pages-container');
    const downloadAllBtn = document.getElementById('btn-download-all-pages-zip');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!dropzone || !fileInput) return;

    let renderedPages = []; // { pageNum, blob, url }
    let currentFileName = '';

    async function handleFile(file) {
      if (!file) return;
      currentFileName = file.name.replace(/\.[^/.]+$/, '');
      renderedPages = [];
      if (pagesContainer) pagesContainer.innerHTML = '';
      if (progressContainer) progressContainer.style.display = 'block';

      try {
        if (typeof pdfjsLib === 'undefined') {
          throw new Error('PDF rendering library not loaded');
        }

        // Set worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        if (pagesContainer) pagesContainer.style.display = 'grid';

        for (let i = 1; i <= numPages; i++) {
          if (progressText) progressText.textContent = `Rendering page ${i} of ${numPages}...`;
          if (progressBar) progressBar.style.width = Math.round((i / numPages) * 100) + '%';

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 }); // High resolution

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
          const url = URL.createObjectURL(blob);
          renderedPages.push({ pageNum: i, blob: blob, url: url });

          // Render page card
          const card = document.createElement('div');
          card.className = 'compare-card';
          card.innerHTML = `
            <div class="compare-card-label">Page ${i}</div>
            <div class="compare-img-box">
              <img src="${url}" alt="Page ${i}">
            </div>
            <button class="btn-file-download" style="width:100%;justify-content:center;" data-page="${i}">
              Download Page ${i}
            </button>
          `;
          if (pagesContainer) pagesContainer.appendChild(card);
        }

        if (progressText) progressText.textContent = `Rendered all ${numPages} pages!`;
        if (downloadAllBtn) downloadAllBtn.style.display = 'inline-flex';

        // Download listeners
        pagesContainer.querySelectorAll('.btn-file-download').forEach(btn => {
          btn.addEventListener('click', () => {
            const pageNum = parseInt(btn.getAttribute('data-page'), 10);
            const item = renderedPages.find(p => p.pageNum === pageNum);
            if (item) {
              triggerDownload(item.blob, `${currentFileName}_page_${pageNum}.jpg`);
            }
          });
        });

        window.showToast('All pages rendered to JPG!', 'success');
      } catch (err) {
        console.error('PDF to JPG error:', err);
        window.showToast('Error converting PDF: ' + err.message, 'error');
      }
    }

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', async () => {
        if (renderedPages.length === 0) return;
        if (typeof JSZip === 'undefined') {
          window.showToast('ZIP library not loaded', 'error');
          return;
        }

        downloadAllBtn.disabled = true;
        const originalText = downloadAllBtn.innerHTML;
        downloadAllBtn.innerHTML = `<div class="spinner"></div> Archiving...`;

        try {
          const zip = new JSZip();
          renderedPages.forEach(p => {
            zip.file(`${currentFileName}_page_${p.pageNum}.jpg`, p.blob);
          });
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          triggerDownload(zipBlob, `${currentFileName}_jpg_pages.zip`);
          window.showToast('ZIP archive downloaded!', 'success');
        } catch (err) {
          window.showToast('ZIP creation failed', 'error');
        } finally {
          downloadAllBtn.disabled = false;
          downloadAllBtn.innerHTML = originalText;
        }
      });
    }
  }

  return {
    initImageToPdf,
    initPdfMerger,
    initPdfSplitter,
    initPdfRotator,
    initPdfToJpg
  };
})();
