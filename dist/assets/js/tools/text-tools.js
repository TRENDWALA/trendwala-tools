/**
 * TrendWala Tools - Text Tools Module
 * 100% Client-Side: Word Counter, Character Counter, Case Converter, Duplicate Remover, Text Sorter, Text Cleaner
 */

window.TrendWalaTextTools = (function () {
  'use strict';

  // =========================================================================
  // 1. Word Counter
  // =========================================================================
  function initWordCounter() {
    const inputArea = document.getElementById('text-input-area');
    const wordsEl = document.getElementById('stat-words');
    const charsEl = document.getElementById('stat-chars');
    const charsNoSpaceEl = document.getElementById('stat-chars-nospace');
    const sentencesEl = document.getElementById('stat-sentences');
    const paragraphsEl = document.getElementById('stat-paragraphs');
    const readingTimeEl = document.getElementById('stat-reading-time');
    const speakingTimeEl = document.getElementById('stat-speaking-time');
    const clearBtn = document.getElementById('btn-clear-text');
    const sampleBtn = document.getElementById('btn-sample-text');
    const copyBtn = document.getElementById('btn-copy-text');

    if (!inputArea) return;

    function analyze() {
      const text = inputArea.value || '';

      // Characters
      const totalChars = text.length;
      const noSpaceChars = text.replace(/\s/g, '').length;

      // Words
      const trimmed = text.trim();
      const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

      // Sentences: split on period, exclamation, question followed by whitespace or EOF
      const sentences = trimmed ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0) : 0;

      // Paragraphs: split on 2 or more newlines or non-empty lines
      const paragraphs = trimmed ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;

      // Reading time: avg 200 words per minute
      const readMinutes = Math.ceil(words / 200);
      const readTime = words === 0 ? '0 sec' : (readMinutes < 1 ? '< 1 min' : `${readMinutes} min`);

      // Speaking time: avg 130 words per minute
      const speakMinutes = Math.ceil(words / 130);
      const speakTime = words === 0 ? '0 sec' : (speakMinutes < 1 ? '< 1 min' : `${speakMinutes} min`);

      if (wordsEl) wordsEl.textContent = words.toLocaleString();
      if (charsEl) charsEl.textContent = totalChars.toLocaleString();
      if (charsNoSpaceEl) charsNoSpaceEl.textContent = noSpaceChars.toLocaleString();
      if (sentencesEl) sentencesEl.textContent = sentences.toLocaleString();
      if (paragraphsEl) paragraphsEl.textContent = paragraphs.toLocaleString();
      if (readingTimeEl) readingTimeEl.textContent = readTime;
      if (speakingTimeEl) speakingTimeEl.textContent = speakTime;
    }

    inputArea.addEventListener('input', analyze);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        analyze();
      });
    }

    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        inputArea.value = `TrendWala Tools provides free, fast, and completely private online tools that operate directly inside your browser. No files or text are ever uploaded to a remote server. 

Whether you need to convert Apple HEIC photos to JPG, merge contracts into a single PDF, or format complex JSON payloads, everything runs on your local machine using modern WebAssembly and HTML5 standards. Enjoy uninterrupted workflow with total peace of mind!`;
        analyze();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(inputArea.value, 'Text copied to clipboard!');
      });
    }

    analyze();
  }

  // =========================================================================
  // 2. Character Counter (with Social Progress Limits)
  // =========================================================================
  function initCharacterCounter() {
    const inputArea = document.getElementById('text-input-area');
    const charsEl = document.getElementById('stat-chars');
    const charsNoSpaceEl = document.getElementById('stat-chars-nospace');
    const wordsEl = document.getElementById('stat-words');
    const linesEl = document.getElementById('stat-lines');
    const lettersEl = document.getElementById('stat-letters');
    const digitsEl = document.getElementById('stat-digits');
    const twitterBar = document.getElementById('twitter-bar');
    const twitterVal = document.getElementById('twitter-val');
    const smsBar = document.getElementById('sms-bar');
    const smsVal = document.getElementById('sms-val');
    const instaBar = document.getElementById('insta-bar');
    const instaVal = document.getElementById('insta-val');

    if (!inputArea) return;

    function analyze() {
      const text = inputArea.value || '';
      const totalChars = text.length;
      const noSpace = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      const lines = text.length > 0 ? text.split('\n').length : 0;
      const letters = (text.match(/[a-zA-Z]/g) || []).length;
      const digits = (text.match(/[0-9]/g) || []).length;

      if (charsEl) charsEl.textContent = totalChars.toLocaleString();
      if (charsNoSpaceEl) charsNoSpaceEl.textContent = noSpace.toLocaleString();
      if (wordsEl) wordsEl.textContent = words.toLocaleString();
      if (linesEl) linesEl.textContent = lines.toLocaleString();
      if (lettersEl) lettersEl.textContent = letters.toLocaleString();
      if (digitsEl) digitsEl.textContent = digits.toLocaleString();

      // Twitter / X limit: 280
      const twLimit = 280;
      const twPercent = Math.min((totalChars / twLimit) * 100, 100);
      if (twitterBar) {
        twitterBar.style.width = twPercent + '%';
        twitterBar.className = 'social-progress-bar' + (totalChars > twLimit ? ' limit-exceeded' : (totalChars >= 260 ? ' limit-warning' : ''));
      }
      if (twitterVal) twitterVal.textContent = `${totalChars} / ${twLimit}`;

      // SMS limit: 160
      const smsLimit = 160;
      const smsPercent = Math.min((totalChars / smsLimit) * 100, 100);
      if (smsBar) {
        smsBar.style.width = smsPercent + '%';
        smsBar.className = 'social-progress-bar' + (totalChars > smsLimit ? ' limit-exceeded' : (totalChars >= 140 ? ' limit-warning' : ''));
      }
      if (smsVal) smsVal.textContent = `${totalChars} / ${smsLimit}`;

      // Instagram Caption limit: 2,200
      const igLimit = 2200;
      const igPercent = Math.min((totalChars / igLimit) * 100, 100);
      if (instaBar) {
        instaBar.style.width = igPercent + '%';
        instaBar.className = 'social-progress-bar' + (totalChars > igLimit ? ' limit-exceeded' : '');
      }
      if (instaVal) instaVal.textContent = `${totalChars} / ${igLimit}`;
    }

    inputArea.addEventListener('input', analyze);
    analyze();
  }

  // =========================================================================
  // 3. Case Converter
  // =========================================================================
  function initCaseConverter() {
    const inputArea = document.getElementById('text-input-area');
    const buttons = document.querySelectorAll('.btn-convert-case');
    const copyBtn = document.getElementById('btn-copy-case');
    const clearBtn = document.getElementById('btn-clear-case');

    if (!inputArea) return;

    function toTitleCase(str) {
      return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    function toSentenceCase(str) {
      return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    }

    function toCamelCase(str) {
      return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    }

    function toSnakeCase(str) {
      return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map(x => x.toLowerCase())
        .join('_') || '';
    }

    function toKebabCase(str) {
      return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map(x => x.toLowerCase())
        .join('-') || '';
    }

    function toPascalCase(str) {
      return str.match(/[a-z0-9]+/gi)
        ?.map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        .join('') || '';
    }

    function toAlternatingCase(str) {
      return str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    }

    function toInvertCase(str) {
      return str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.getAttribute('data-case');
        const current = inputArea.value || '';
        if (!current) return;

        switch (style) {
          case 'upper': inputArea.value = current.toUpperCase(); break;
          case 'lower': inputArea.value = current.toLowerCase(); break;
          case 'title': inputArea.value = toTitleCase(current); break;
          case 'sentence': inputArea.value = toSentenceCase(current); break;
          case 'camel': inputArea.value = toCamelCase(current); break;
          case 'snake': inputArea.value = toSnakeCase(current); break;
          case 'kebab': inputArea.value = toKebabCase(current); break;
          case 'pascal': inputArea.value = toPascalCase(current); break;
          case 'alternating': inputArea.value = toAlternatingCase(current); break;
          case 'invert': inputArea.value = toInvertCase(current); break;
        }

        window.showToast(`Converted to ${btn.textContent.trim()}!`, 'success');
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(inputArea.value, 'Converted text copied!');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputArea.value = '';
      });
    }
  }

  // =========================================================================
  // 4. Remove Duplicate Lines
  // =========================================================================
  function initDuplicateRemover() {
    const inputArea = document.getElementById('text-input-area');
    const caseSensitiveCheckbox = document.getElementById('opt-case-sensitive');
    const trimCheckbox = document.getElementById('opt-trim-lines');
    const removeEmptyCheckbox = document.getElementById('opt-remove-empty');
    const processBtn = document.getElementById('btn-dedupe-lines');
    const origCountEl = document.getElementById('stat-original-lines');
    const uniqueCountEl = document.getElementById('stat-unique-lines');
    const removedCountEl = document.getElementById('stat-removed-lines');
    const copyBtn = document.getElementById('btn-copy-dedupe');

    if (!inputArea) return;

    if (processBtn) {
      processBtn.addEventListener('click', () => {
        const text = inputArea.value || '';
        if (!text) return;

        let lines = text.split('\n');
        const totalOriginal = lines.length;

        const isCaseSensitive = caseSensitiveCheckbox ? caseSensitiveCheckbox.checked : false;
        const shouldTrim = trimCheckbox ? trimCheckbox.checked : true;
        const removeEmpty = removeEmptyCheckbox ? removeEmptyCheckbox.checked : true;

        const seen = new Set();
        const result = [];

        lines.forEach(line => {
          let processed = shouldTrim ? line.trim() : line;
          if (removeEmpty && processed === '') return;

          const key = isCaseSensitive ? processed : processed.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            result.push(processed);
          }
        });

        inputArea.value = result.join('\n');

        const uniqueCount = result.length;
        const removedCount = totalOriginal - uniqueCount;

        if (origCountEl) origCountEl.textContent = totalOriginal;
        if (uniqueCountEl) uniqueCountEl.textContent = uniqueCount;
        if (removedCountEl) removedCountEl.textContent = removedCount;

        window.showToast(`Removed ${removedCount} duplicate lines!`, 'success');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(inputArea.value, 'Unique lines copied!');
      });
    }
  }

  // =========================================================================
  // 5. Text Sorter
  // =========================================================================
  function initTextSorter() {
    const inputArea = document.getElementById('text-input-area');
    const sortButtons = document.querySelectorAll('.btn-sort-mode');
    const caseSensitiveCheckbox = document.getElementById('opt-sort-case');
    const copyBtn = document.getElementById('btn-copy-sorted');

    if (!inputArea) return;

    sortButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        const text = inputArea.value || '';
        if (!text) return;

        let lines = text.split('\n');
        const isCaseSensitive = caseSensitiveCheckbox ? caseSensitiveCheckbox.checked : false;

        switch (mode) {
          case 'az':
            lines.sort((a, b) => isCaseSensitive ? a.localeCompare(b) : a.localeCompare(b, undefined, { sensitivity: 'base' }));
            break;
          case 'za':
            lines.sort((a, b) => isCaseSensitive ? b.localeCompare(a) : b.localeCompare(a, undefined, { sensitivity: 'base' }));
            break;
          case 'natural':
            lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            break;
          case 'reverse':
            lines.reverse();
            break;
          case 'length-asc':
            lines.sort((a, b) => a.length - b.length);
            break;
          case 'length-desc':
            lines.sort((a, b) => b.length - a.length);
            break;
        }

        inputArea.value = lines.join('\n');
        window.showToast(`Lines sorted: ${btn.textContent.trim()}!`, 'success');
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(inputArea.value, 'Sorted lines copied!');
      });
    }
  }

  // =========================================================================
  // 6. Text Cleaner
  // =========================================================================
  function initTextCleaner() {
    const inputArea = document.getElementById('text-input-area');
    const stripHtmlCb = document.getElementById('opt-clean-html');
    const extraSpacesCb = document.getElementById('opt-clean-spaces');
    const lineBreaksCb = document.getElementById('opt-clean-breaks');
    const emojisCb = document.getElementById('opt-clean-emojis');
    const cleanBtn = document.getElementById('btn-execute-clean');
    const copyBtn = document.getElementById('btn-copy-clean');

    if (!inputArea) return;

    if (cleanBtn) {
      cleanBtn.addEventListener('click', () => {
        let text = inputArea.value || '';
        if (!text) return;

        // Strip HTML Tags
        if (stripHtmlCb && stripHtmlCb.checked) {
          text = text.replace(/<[^>]*>?/gm, '');
        }

        // Remove extra consecutive spaces
        if (extraSpacesCb && extraSpacesCb.checked) {
          text = text.replace(/[ \t]+/g, ' ');
        }

        // Remove Line Breaks (merge paragraphs)
        if (lineBreaksCb && lineBreaksCb.checked) {
          text = text.replace(/(\r\n|\n|\r)+/gm, ' ');
        }

        // Remove Emojis
        if (emojisCb && emojisCb.checked) {
          text = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
        }

        inputArea.value = text.trim();
        window.showToast('Text cleaned successfully!', 'success');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        window.copyToClipboard(inputArea.value, 'Cleaned text copied!');
      });
    }
  }

  return {
    initWordCounter,
    initCharacterCounter,
    initCaseConverter,
    initDuplicateRemover,
    initTextSorter,
    initTextCleaner
  };
})();
