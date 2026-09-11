/**
 * TrendWala Tools - Developer Tools Module
 * 100% Client-Side: JSON Formatter, JSON Validator, Base64 Encoder/Decoder, URL Encoder/Decoder
 */

window.TrendWalaDevTools = (function () {
  'use strict';

  function triggerDownload(blobOrText, filename, mime = 'application/json') {
    const blob = typeof blobOrText === 'string' ? new Blob([blobOrText], { type: mime }) : blobOrText;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  // UTF-8 safe Base64 encoding
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binString = '';
    bytes.forEach(b => binString += String.fromCharCode(b));
    return btoa(binString);
  }

  // UTF-8 safe Base64 decoding
  function base64ToUtf8(str) {
    // Strip possible data url prefix if present
    const cleanStr = str.replace(/^data:[^;]+;base64,/, '').trim();
    const binString = atob(cleanStr);
    const bytes = Uint8Array.from(binString, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // =========================================================================
  // 1. JSON Formatter
  // =========================================================================
  function initJsonFormatter() {
    const inputArea = document.getElementById('json-input');
    const indentSelect = document.getElementById('json-indent');
    const formatBtn = document.getElementById('btn-format-json');
    const minifyBtn = document.getElementById('btn-minify-json');
    const copyBtn = document.getElementById('btn-copy-json');
    const downloadBtn = document.getElementById('btn-download-json');
    const clearBtn = document.getElementById('btn-clear-json');
    const sampleBtn = document.getElementById('btn-sample-json');
    const errorBox = document.getElementById('json-error-alert');

    if (!inputArea) return;

    function formatJson(minify = false) {
      const raw = (inputArea.value || '').trim();
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        let space = 2;
        if (indentSelect) {
          const val = indentSelect.value;
          if (val === '4') space = 4;
          else if (val === 'tab') space = '\t';
          else space = 2;
        }

        const formatted = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, space);
        inputArea.value = formatted;

        if (errorBox) {
          errorBox.style.display = 'none';
          errorBox.textContent = '';
        }
        window.showToast(minify ? 'JSON minified!' : 'JSON formatted cleanly!', 'success');
      } catch (err) {
        if (errorBox) {
          errorBox.style.display = 'block';
          errorBox.textContent = 'Syntax Error: ' + err.message;
        }
        window.showToast('Invalid JSON syntax', 'error');
      }
    }

    if (formatBtn) formatBtn.addEventListener('click', () => formatJson(false));
    if (minifyBtn) minifyBtn.addEventListener('click', () => formatJson(true));

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(inputArea.value, 'JSON copied to clipboard!');
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!inputArea.value) return;
        triggerDownload(inputArea.value, 'trendwala_formatted.json');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        if (errorBox) errorBox.style.display = 'none';
      });
    }

    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        inputArea.value = JSON.stringify({
          project: 'TrendWala Tools',
          version: '1.0.0',
          privacy: '100% Client-Side',
          tools: ['HEIC to JPG', 'PDF Merger', 'Word Counter', 'JSON Formatter', 'QR Code Generator'],
          settings: {
            theme: 'auto',
            analyticsEnabled: false,
            serverUploads: false
          }
        }, null, 2);
        if (errorBox) errorBox.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // 2. JSON Validator
  // =========================================================================
  function initJsonValidator() {
    const inputArea = document.getElementById('json-input');
    const validateBtn = document.getElementById('btn-validate-json');
    const statusBox = document.getElementById('validation-status-box');
    const clearBtn = document.getElementById('btn-clear-json');

    if (!inputArea) return;

    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        const raw = (inputArea.value || '').trim();
        if (!raw) return;

        if (!statusBox) return;

        try {
          const parsed = JSON.parse(raw);
          const isArray = Array.isArray(parsed);
          const typeName = isArray ? 'Array' : (typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed);
          const count = isArray ? parsed.length : (typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1);

          statusBox.style.display = 'block';
          statusBox.className = 'privacy-callout';
          statusBox.style.borderColor = 'var(--accent-emerald)';
          statusBox.style.background = 'rgba(16, 185, 129, 0.08)';

          statusBox.innerHTML = `
            <div class="privacy-callout-icon" style="background:var(--accent-emerald);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="privacy-callout-body">
              <h3 style="color:var(--accent-emerald);">Valid JSON (RFC 8259 Compliant)</h3>
              <p>Root Type: <strong>${typeName}</strong> | Total ${isArray ? 'Items' : 'Keys'}: <strong>${count}</strong> | Size: <strong>${(raw.length).toLocaleString()} chars</strong></p>
            </div>
          `;
          window.showToast('JSON is 100% valid!', 'success');
        } catch (err) {
          statusBox.style.display = 'block';
          statusBox.className = 'privacy-callout';
          statusBox.style.borderColor = 'var(--accent-rose)';
          statusBox.style.background = 'rgba(244, 63, 94, 0.08)';

          statusBox.innerHTML = `
            <div class="privacy-callout-icon" style="background:var(--accent-rose);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div class="privacy-callout-body">
              <h3 style="color:var(--accent-rose);">Invalid JSON Syntax</h3>
              <p style="font-family:var(--font-mono);font-size:0.9rem;">${err.message}</p>
            </div>
          `;
          window.showToast('Invalid JSON syntax', 'error');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        if (statusBox) statusBox.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // 3. Base64 Encoder & Decoder
  // =========================================================================
  function initBase64Tool() {
    const textInput = document.getElementById('base64-text-input');
    const resultOutput = document.getElementById('base64-result-output');
    const encodeBtn = document.getElementById('btn-encode-base64');
    const decodeBtn = document.getElementById('btn-decode-base64');
    const copyBtn = document.getElementById('btn-copy-base64');
    const clearBtn = document.getElementById('btn-clear-base64');
    const fileInput = document.getElementById('base64-file-input');
    const previewContainer = document.getElementById('base64-image-preview');
    const previewImg = document.getElementById('base64-preview-img');
    const downloadFileBtn = document.getElementById('btn-download-base64-file');

    if (!textInput || !resultOutput) return;

    if (encodeBtn) {
      encodeBtn.addEventListener('click', () => {
        const val = textInput.value || '';
        if (!val) return;
        try {
          const encoded = utf8ToBase64(val);
          resultOutput.value = encoded;
          if (previewContainer) previewContainer.style.display = 'none';
          window.showToast('Encoded to Base64!', 'success');
        } catch (err) {
          window.showToast('Encoding error: ' + err.message, 'error');
        }
      });
    }

    if (decodeBtn) {
      decodeBtn.addEventListener('click', () => {
        const val = (textInput.value || '').trim();
        if (!val) return;

        // Check if it looks like a data URL or image
        if (val.startsWith('data:image/') || (val.length > 50 && isBase64Image(val))) {
          if (previewContainer) {
            previewContainer.style.display = 'block';
            const src = val.startsWith('data:') ? val : 'data:image/png;base64,' + val;
            if (previewImg) previewImg.src = src;
          }
        }

        try {
          const decoded = base64ToUtf8(val);
          resultOutput.value = decoded;
          window.showToast('Decoded from Base64!', 'success');
        } catch (err) {
          // If binary file decoding fails text display, at least report
          if (previewContainer && previewContainer.style.display === 'block') {
            resultOutput.value = '[Binary Image Data - Preview Available Above]';
            window.showToast('Decoded Base64 image!', 'success');
          } else {
            window.showToast('Invalid Base64 string', 'error');
          }
        }
      });
    }

    function isBase64Image(str) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str.substring(0, 100));
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          resultOutput.value = ev.target.result;
          if (file.type.startsWith('image/') && previewContainer && previewImg) {
            previewContainer.style.display = 'block';
            previewImg.src = ev.target.result;
          }
          window.showToast(`File encoded to Data URL (${file.name})!`, 'success');
        };
        reader.readAsDataURL(file);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(resultOutput.value, 'Result copied to clipboard!');
      });
    }

    if (downloadFileBtn) {
      downloadFileBtn.addEventListener('click', () => {
        const data = (resultOutput.value || textInput.value || '').trim();
        if (!data) return;

        if (data.startsWith('data:')) {
          const a = document.createElement('a');
          a.href = data;
          a.download = 'decoded_file';
          a.click();
        } else {
          triggerDownload(data, 'decoded_data.txt', 'text/plain');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        textInput.value = '';
        resultOutput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // 4. URL Encoder / Decoder
  // =========================================================================
  function initUrlTool() {
    const inputArea = document.getElementById('url-input');
    const outputArea = document.getElementById('url-output');
    const encodeComponentBtn = document.getElementById('btn-encode-component');
    const encodeFullBtn = document.getElementById('btn-encode-full');
    const decodeBtn = document.getElementById('btn-decode-url');
    const copyBtn = document.getElementById('btn-copy-url');
    const paramsTable = document.getElementById('url-params-table');
    const paramsTbody = document.getElementById('url-params-tbody');

    if (!inputArea || !outputArea) return;

    function parseParams(urlStr) {
      if (!paramsTable || !paramsTbody) return;
      try {
        const parsed = new URL(urlStr.startsWith('http') ? urlStr : 'https://dummy.org/' + urlStr);
        const params = Array.from(parsed.searchParams.entries());

        if (params.length > 0) {
          paramsTable.style.display = 'table';
          paramsTbody.innerHTML = '';
          params.forEach(([k, v]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td style="padding:8px;font-family:var(--font-mono);font-weight:700;">${escapeHtml(k)}</td><td style="padding:8px;font-family:var(--font-mono);">${escapeHtml(v)}</td>`;
            paramsTbody.appendChild(tr);
          });
        } else {
          paramsTable.style.display = 'none';
        }
      } catch (e) {
        paramsTable.style.display = 'none';
      }
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (encodeComponentBtn) {
      encodeComponentBtn.addEventListener('click', () => {
        const val = inputArea.value || '';
        outputArea.value = encodeURIComponent(val);
        parseParams(val);
        window.showToast('URL component encoded!', 'success');
      });
    }

    if (encodeFullBtn) {
      encodeFullBtn.addEventListener('click', () => {
        const val = inputArea.value || '';
        outputArea.value = encodeURI(val);
        parseParams(val);
        window.showToast('Full URL encoded!', 'success');
      });
    }

    if (decodeBtn) {
      decodeBtn.addEventListener('click', () => {
        const val = inputArea.value || '';
        try {
          const decoded = decodeURIComponent(val);
          outputArea.value = decoded;
          parseParams(decoded);
          window.showToast('URL decoded successfully!', 'success');
        } catch (err) {
          window.showToast('Failed to decode: malformed URI', 'error');
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(outputArea.value, 'Output copied!');
      });
    }
  }

  return {
    initJsonFormatter,
    initJsonValidator,
    initBase64Tool,
    initUrlTool
  };
})();
