/**
 * TrendWala Tools - QR Code Generator Module
 * 100% Client-Side: Multi-type QR, Custom Colors, Error Correction, SVG & PNG Export
 */

window.TrendWalaQrTool = (function () {
  'use strict';

  function initQrGenerator() {
    const textInput = document.getElementById('qr-input-text');
    const qrTypeSelect = document.getElementById('qr-type-select');
    const fgColorInput = document.getElementById('qr-fg-color');
    const bgColorInput = document.getElementById('qr-bg-color');
    const eclSelect = document.getElementById('qr-ecl-select');
    const sizeSlider = document.getElementById('qr-size-slider');
    const sizeVal = document.getElementById('qr-size-val');
    const canvas = document.getElementById('qr-canvas');
    const downloadPngBtn = document.getElementById('btn-download-qr-png');
    const downloadSvgBtn = document.getElementById('btn-download-qr-svg');

    // Dynamic type containers
    const wifiContainer = document.getElementById('qr-wifi-fields');
    const wifiSsid = document.getElementById('qr-wifi-ssid');
    const wifiPass = document.getElementById('qr-wifi-pass');
    const wifiEnc = document.getElementById('qr-wifi-enc');

    if (!canvas) return;

    function getFormattedText() {
      const type = qrTypeSelect ? qrTypeSelect.value : 'text';

      if (type === 'wifi') {
        const ssid = (wifiSsid ? wifiSsid.value : '').trim();
        const pass = (wifiPass ? wifiPass.value : '').trim();
        const enc = (wifiEnc ? wifiEnc.value : 'WPA');
        return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
      }

      if (type === 'email') {
        const raw = (textInput ? textInput.value : '').trim();
        return raw.startsWith('mailto:') ? raw : `mailto:${raw}`;
      }

      if (type === 'phone') {
        const raw = (textInput ? textInput.value : '').trim();
        return raw.startsWith('tel:') ? raw : `tel:${raw}`;
      }

      return (textInput ? textInput.value : '').trim() || 'https://tools.trendwala.in';
    }

    function renderQr() {
      if (typeof QRCode === 'undefined') {
        console.warn('QRCode library not ready yet');
        return;
      }

      const text = getFormattedText();
      const fg = fgColorInput ? fgColorInput.value : '#000000';
      const bg = bgColorInput ? bgColorInput.value : '#ffffff';
      const ecl = eclSelect ? eclSelect.value : 'M';
      const size = sizeSlider ? parseInt(sizeSlider.value, 10) : 320;

      if (sizeVal && sizeSlider) {
        sizeVal.textContent = size + 'px';
      }

      QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: fg,
          light: bg
        },
        errorCorrectionLevel: ecl
      }, (err) => {
        if (err) console.error('QR generation error:', err);
      });
    }

    if (textInput) textInput.addEventListener('input', renderQr);
    if (fgColorInput) fgColorInput.addEventListener('input', renderQr);
    if (bgColorInput) bgColorInput.addEventListener('input', renderQr);
    if (eclSelect) eclSelect.addEventListener('change', renderQr);
    if (sizeSlider) sizeSlider.addEventListener('input', renderQr);

    if (qrTypeSelect) {
      qrTypeSelect.addEventListener('change', () => {
        const val = qrTypeSelect.value;
        if (wifiContainer) {
          wifiContainer.style.display = val === 'wifi' ? 'flex' : 'none';
        }
        if (textInput) {
          textInput.closest('.option-group').style.display = val === 'wifi' ? 'none' : 'flex';
          if (val === 'url') textInput.placeholder = 'https://example.com';
          else if (val === 'email') textInput.placeholder = 'hello@trendwala.in';
          else if (val === 'phone') textInput.placeholder = '+1 234 567 8900';
          else textInput.placeholder = 'Enter text or message...';
        }
        renderQr();
      });
    }

    if (wifiSsid) wifiSsid.addEventListener('input', renderQr);
    if (wifiPass) wifiPass.addEventListener('input', renderQr);
    if (wifiEnc) wifiEnc.addEventListener('change', renderQr);

    if (downloadPngBtn) {
      downloadPngBtn.addEventListener('click', () => {
        canvas.toBlob((blob) => {
          if (blob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'trendwala_qr_code.png';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            window.showToast('QR Code downloaded as PNG!', 'success');
          }
        }, 'image/png');
      });
    }

    if (downloadSvgBtn) {
      downloadSvgBtn.addEventListener('click', () => {
        const text = getFormattedText();
        const fg = fgColorInput ? fgColorInput.value : '#000000';
        const bg = bgColorInput ? bgColorInput.value : '#ffffff';
        const ecl = eclSelect ? eclSelect.value : 'M';
        const size = sizeSlider ? parseInt(sizeSlider.value, 10) : 320;

        QRCode.toString(text, {
          type: 'svg',
          width: size,
          margin: 2,
          color: {
            dark: fg,
            light: bg
          },
          errorCorrectionLevel: ecl
        }, (err, svgString) => {
          if (err) {
            window.showToast('SVG generation failed', 'error');
            return;
          }
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'trendwala_qr_code.svg';
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 5000);
          window.showToast('Vector QR Code downloaded as SVG!', 'success');
        });
      });
    }

    // Initial render
    setTimeout(renderQr, 50);
  }

  return {
    initQrGenerator
  };
})();
