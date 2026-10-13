/**
 * Antigravity Markdown Preview BiDi & RTL Controller
 * Automatically optimizes Markdown Previews (.md, *.plan.md, *.task.md)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'antigravity-preview-rtl-mode'; // 'auto' | 'rtl' | 'ltr'
  var RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  var LTR_REGEX = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/;

  var currentMode = localStorage.getItem(STORAGE_KEY) || 'auto';

  /**
   * Smart First Strong Directional Character Detection
   */
  function isRtl(text) {
    if (!text) return false;
    var str = text.trim();
    if (!str) return false;

    // Strip markdown prefixes: lists (- , * , 1. ), task boxes (- [x], - [ ]), headers (### ), quotes (> )
    str = str.replace(/^(\s*[-*+]\s+\[[ xX]\]\s*|\s*#{1,6}\s+|\s*>\s*|\s*\d+[\.\)]\s*|\s*[-*+]\s+)/, '');
    // Strip leading bracketed tags: [TAG], [DONE], [INFO], etc.
    str = str.replace(/^\s*\[[^\]]+\]\s*/, '');
    // Strip leading inline code: `file.ext`
    str = str.replace(/^\s*\x60[^\x60]+\x60\s*/, '');
    // Strip leading bold markers: **Note:** or **??????:**
    str = str.replace(/^\s*\*\*[^*]+\*\*\s*[:\-]?\s*/, '');
    str = str.trim();
    if (!str) return false;

    // Scan characters for first strong directional letter
    var firstIsRtl = null;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      if (RTL_REGEX.test(ch)) { firstIsRtl = true; break; }
      if (LTR_REGEX.test(ch)) { firstIsRtl = false; break; }
    }

    if (firstIsRtl === true) {
      return true;
    }

    // Support mixed technical sentences starting with English words
    var rtlMatches = str.match(new RegExp(RTL_REGEX.source, 'g'));
    var rtlCount = rtlMatches ? rtlMatches.length : 0;
    if (rtlCount === 0) return false;

    var ltrMatches = str.match(new RegExp(LTR_REGEX.source, 'g'));
    var ltrCount = ltrMatches ? ltrMatches.length : 0;
    return (rtlCount >= 5 && (rtlCount >= ltrCount * 0.3 || rtlCount >= 8));
  }

  function applyRtlToBlocks() {
    var selectors = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, table, th, td, .markdown-alert';
    var blocks = document.querySelectorAll(selectors);

    blocks.forEach(function (el) {
      if (el.tagName === 'PRE' || el.tagName === 'CODE' || el.closest('pre')) {
        return;
      }

      if (currentMode === 'rtl') {
        el.classList.add('rtl-block');
        el.setAttribute('dir', 'rtl');
      } else if (currentMode === 'ltr') {
        el.classList.remove('rtl-block');
        el.setAttribute('dir', 'ltr');
      } else {
        // Auto BiDi detection per block
        if (isRtl(el.textContent)) {
          el.classList.add('rtl-block');
          el.setAttribute('dir', 'rtl');
        } else {
          el.classList.remove('rtl-block');
          el.setAttribute('dir', 'ltr');
        }
      }
    });

    updateToolbarLabel();
  }

  function updateToolbarLabel() {
    var toolbar = document.getElementById('markdown-rtl-floating-toolbar');
    if (!toolbar) return;

    var label = toolbar.querySelector('.label');
    if (!label) return;

    if (currentMode === 'auto') {
      label.textContent = 'BiDi (Auto)';
      toolbar.className = 'active';
    } else if (currentMode === 'rtl') {
      label.textContent = 'RTL (Forced)';
      toolbar.className = 'active';
    } else {
      label.textContent = 'LTR';
      toolbar.className = '';
    }
  }

  function createFloatingToolbar() {
    if (document.getElementById('markdown-rtl-floating-toolbar')) return;

    var bar = document.createElement('div');
    bar.id = 'markdown-rtl-floating-toolbar';
    bar.title = 'RightFlow: Click to switch mode (Auto BiDi / Force RTL / LTR)';

    var dot = document.createElement('span');
    dot.className = 'indicator';
    var label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'BiDi (Auto)';
    bar.appendChild(dot);
    bar.appendChild(label);

    bar.addEventListener('click', function () {
      if (currentMode === 'auto') {
        currentMode = 'rtl';
      } else if (currentMode === 'rtl') {
        currentMode = 'ltr';
      } else {
        currentMode = 'auto';
      }
      localStorage.setItem(STORAGE_KEY, currentMode);
      applyRtlToBlocks();
    });

    document.body.appendChild(bar);
    updateToolbarLabel();
  }

  var debounceTimer;
  function scheduleProcess() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      applyRtlToBlocks();
    }, 60);
  }

  // Observe markdown live preview updates
  try {
    var observer = new MutationObserver(function () {
      scheduleProcess();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  } catch(e) {}

  if (document.readyState !== 'loading') {
    createFloatingToolbar();
    applyRtlToBlocks();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      createFloatingToolbar();
      applyRtlToBlocks();
    });
  }
})();
