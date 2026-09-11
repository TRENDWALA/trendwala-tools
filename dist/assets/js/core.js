/**
 * TrendWala Tools - Core Client-Side Logic
 * Theme Switcher, Fast Search, Mobile Menu, Toast Notifications, FAQ Accordions
 */

(function () {
  'use strict';

  // --- 1. Theme Management (Dark / Light) ---
  const THEME_KEY = 'trendwala_theme';
  const htmlEl = document.documentElement;

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // --- 2. Global Toast Notification Utility ---
  window.showToast = function (message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // --- 3. Copy to Clipboard Helper ---
  window.copyToClipboard = function (text, message = 'Copied to clipboard!') {
    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        window.showToast(message, 'success');
      } catch (err) {
        window.showToast('Failed to copy', 'error');
      }
      document.body.removeChild(textarea);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      window.showToast(message, 'success');
    }).catch(() => {
      window.showToast('Failed to copy', 'error');
    });
  };

  // --- 4. Instant Client-Side Tool Search ---
  function initToolSearch() {
    const searchInput = document.getElementById('home-search-input');
    const clearBtn = document.getElementById('home-search-clear');
    const toolCards = document.querySelectorAll('.tool-card[data-keywords]');
    const categoryChips = document.querySelectorAll('.filter-chip[data-category]');
    const emptyNotice = document.getElementById('search-empty-state');

    if (!searchInput) return;

    let activeCategory = 'all';

    function filterTools() {
      const query = (searchInput.value || '').trim().toLowerCase();
      if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
      }

      let matchCount = 0;

      toolCards.forEach(card => {
        const keywords = card.getAttribute('data-keywords') || '';
        const name = (card.querySelector('.tool-card-title')?.textContent || '').toLowerCase();
        const category = card.getAttribute('data-category') || '';

        const matchesQuery = query === '' || name.includes(query) || keywords.includes(query);
        const matchesCategory = activeCategory === 'all' || category === activeCategory;

        if (matchesQuery && matchesCategory) {
          card.style.display = 'flex';
          matchCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (emptyNotice) {
        emptyNotice.style.display = matchCount === 0 ? 'block' : 'none';
      }
    }

    searchInput.addEventListener('input', filterTools);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        filterTools();
      });
    }

    categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.getAttribute('data-category') || 'all';
        filterTools();
      });
    });

    // Keyboard shortcut Ctrl+K / Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // --- 5. FAQ Accordion Handling ---
  function initFaqAccordions() {
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close other items in the same container
        const parentList = item.closest('.faq-list');
        if (parentList) {
          parentList.querySelectorAll('.faq-item.open').forEach(openItem => {
            if (openItem !== item) openItem.classList.remove('open');
          });
        }

        item.classList.toggle('open', !isOpen);
      });
    });
  }

  // --- 6. Mobile Drawer Menu Toggle ---
  function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-drawer-menu');
    if (!mobileBtn || !mobileMenu) return;

    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // --- Initialize Everything on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initToolSearch();
    initFaqAccordions();
    initMobileMenu();

    const themeToggle = document.getElementById('theme-toggle-btn');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  });
})();
