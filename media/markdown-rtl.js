/**
 * Antigravity Markdown Preview BiDi & RTL Controller
 * Automatically optimizes Markdown Previews (.md, *.plan.md, *.task.md)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'antigravity-preview-rtl-mode'; // 'auto' | 'rtl' | 'ltr'
  var RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  var currentMode = localStorage.getItem(STORAGE_KEY) || 'auto';

  function isRtl(text) {
    if (!text) return false;
    return RTL_REGEX.test(text);
  }

  function applyRtlToBlocks() {
    var selectors = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, th, td, .markdown-alert';
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
