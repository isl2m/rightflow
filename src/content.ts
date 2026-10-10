export const INJECTED_CSS_FILENAME = 'rightflow.css';
export const INJECTED_JS_FILENAME = 'rightflow.js';

export const INJECTED_CSS = `/* === RIGHTFLOW-START === */

/* ==========================================================================
   RightFlow - High Performance RTL & Arabic Engine for Antigravity IDE
   Supports: Chat, Plans (*.plan.md), Work/Tasks, Artifacts, Markdown & Monaco Editor
   ========================================================================== */

/* Typography & Direction for RTL Elements in Chat, Plans & Artifacts */
.antigravity-is-rtl,
[data-rtl="true"] {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: plaintext !important;
    font-family: 'Segoe UI', 'Cairo', 'Tajawal', 'Almarai', Tahoma, -apple-system, sans-serif !important;
    line-height: 1.75 !important;
}

/* Mixed BiDi: Inline Code inside RTL sentences MUST isolate and stay LTR */
.antigravity-is-rtl code,
[data-rtl="true"] code,
.antigravity-is-rtl .code-inline,
[data-rtl="true"] .code-inline {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    display: inline-block !important;
    font-family: var(--vscode-editor-font-family, Consolas, 'Courier New', monospace) !important;
    padding: 0.15em 0.4em !important;
    margin: 0 0.25em !important;
    vertical-align: baseline !important;
    text-align: left !important;
}

/* Code Blocks & Interactive Results MUST STAY STRICTLY LTR */
.antigravity-is-rtl pre,
.antigravity-is-rtl pre code,
.antigravity-is-rtl .interactive-result-code-block,
.antigravity-is-rtl .code-block-container,
[data-rtl="true"] pre,
[data-rtl="true"] pre code {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
    font-family: var(--vscode-editor-font-family, Consolas, monospace) !important;
    line-height: 1.5 !important;
}

/* Code Block Header, Action buttons, Copy button STAY LTR */
.antigravity-is-rtl .code-block-header,
.antigravity-is-rtl .code-block,
.antigravity-is-rtl .code-actions,
.antigravity-is-rtl .code-actions-container,
.antigravity-is-rtl button[data-tooltip-id*="copy"],
[data-rtl="true"] .code-block-header,
[data-rtl="true"] .code-block,
[data-rtl="true"] .code-actions {
    direction: ltr !important;
    text-align: left !important;
    unicode-bidi: isolate !important;
}

/* Blockquotes in RTL: Border flips to the RIGHT side */
.antigravity-is-rtl blockquote,
[data-rtl="true"] blockquote,
blockquote.antigravity-is-rtl {
    direction: rtl !important;
    text-align: right !important;
    border-left: none !important;
    border-right: 4px solid var(--vscode-textBlockQuote-border, #3b82f6) !important;
    padding-left: 0.5rem !important;
    padding-right: 1rem !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
}

/* Lists in RTL: Fix bullets and numbering alignment */
.antigravity-is-rtl ul,
.antigravity-is-rtl ol,
[data-rtl="true"] ul,
[data-rtl="true"] ol {
    direction: rtl !important;
    text-align: right !important;
    padding-right: 1.75rem !important;
    padding-left: 0 !important;
    margin-right: 0 !important;
    list-style-position: outside !important;
}

.antigravity-is-rtl li,
[data-rtl="true"] li {
    direction: rtl !important;
    text-align: right !important;
}

.antigravity-is-rtl ol li::marker,
.antigravity-is-rtl ul li::marker {
    unicode-bidi: isolate !important;
}

/* Checkbox lists / Task lists in Plan & Work */
.antigravity-is-rtl li input[type="checkbox"],
[data-rtl="true"] li input[type="checkbox"],
.antigravity-task-item input[type="checkbox"],
.antigravity-is-rtl .task-list-item-checkbox {
    margin-right: 0 !important;
    margin-left: 0.65rem !important;
    cursor: pointer !important;
    vertical-align: middle !important;
}

/* Headings in RTL */
.antigravity-is-rtl h1,
.antigravity-is-rtl h2,
.antigravity-is-rtl h3,
.antigravity-is-rtl h4,
.antigravity-is-rtl h5,
.antigravity-is-rtl h6,
[data-rtl="true"] h1,
[data-rtl="true"] h2,
[data-rtl="true"] h3,
[data-rtl="true"] h4 {
    direction: rtl !important;
    text-align: right !important;
    font-weight: 700 !important;
}

/* Tables in RTL */
.antigravity-is-rtl table,
[data-rtl="true"] table {
    direction: rtl !important;
    text-align: right !important;
    border-collapse: collapse !important;
}

.antigravity-is-rtl th,
.antigravity-is-rtl td,
[data-rtl="true"] th,
[data-rtl="true"] td {
    text-align: right !important;
}

/* Callout Alerts (GitHub / Markdown / Plan Alerts) */
.antigravity-is-rtl .alert,
.antigravity-is-rtl [data-alert],
.antigravity-is-rtl .markdown-alert {
    direction: rtl !important;
    text-align: right !important;
    border-left: none !important;
    border-right: 4px solid currentColor !important;
    padding-right: 1rem !important;
    padding-left: 0.5rem !important;
}

/* Chat Prompt Input Box - Dynamic RTL Alignment */
textarea.antigravity-input-rtl,
input.antigravity-input-rtl,
div[contenteditable="true"].antigravity-input-rtl {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: plaintext !important;
    font-family: 'Segoe UI', 'Cairo', 'Tajawal', Tahoma, sans-serif !important;
    caret-color: var(--vscode-editorCursor-foreground, currentColor) !important;
}

/* ==========================================================================
   Monaco Editor: Manual RTL Mode
   IMPORTANT: NEVER activates automatically. Activates ONLY when the user clicks
   the RTL button in the editor toolbar or presses Ctrl+Alt+R.
   ========================================================================== */

/* Full RTL Mode for Monaco Editor (Active ONLY when toggled ON) */
body.rightflow-force-editor-rtl .monaco-editor .view-lines,
body.antigravity-force-editor-rtl .monaco-editor .view-lines,
.monaco-editor.rightflow-editor-rtl .view-lines,
.monaco-editor.antigravity-editor-rtl .view-lines {
    text-align: right !important;
}

body.rightflow-force-editor-rtl .monaco-editor .view-lines .view-line,
body.antigravity-force-editor-rtl .monaco-editor .view-lines .view-line,
.monaco-editor.rightflow-editor-rtl .view-lines .view-line,
.monaco-editor.antigravity-editor-rtl .view-lines .view-line {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: plaintext !important;
    width: 100% !important;
    min-width: 100% !important;
    box-sizing: border-box !important;
    padding-right: 10px !important;
    padding-left: 10px !important;
    /* Precise system font metrics that match Monaco's line-height grid without vertical clipping */
    font-family: var(--vscode-editor-font-family, Consolas), 'Segoe UI', Tahoma, -apple-system, sans-serif !important;
}

body.rightflow-force-editor-rtl .monaco-editor .view-lines .view-line span,
body.antigravity-force-editor-rtl .monaco-editor .view-lines .view-line span,
.monaco-editor.rightflow-editor-rtl .view-lines .view-line span,
.monaco-editor.antigravity-editor-rtl .view-lines .view-line span {
    unicode-bidi: plaintext !important;
}

/* Inline code and markdown syntax inside RTL lines */
body.rightflow-force-editor-rtl .monaco-editor .view-lines .view-line span.mtk-code,
body.antigravity-force-editor-rtl .monaco-editor .view-lines .view-line span.mtk-code,
.monaco-editor.rightflow-editor-rtl .view-lines .view-line span.mtk-code,
.monaco-editor.antigravity-editor-rtl .view-lines .view-line span.mtk-code {
    direction: ltr !important;
    unicode-bidi: isolate !important;
}

/* ==========================================================================
   Header Buttons: Sleek Native Icon Buttons
   ========================================================================== */

/* Chat Header Button: Matches Antigravity (+, history, close) icons perfectly */
#rightflow-toggle-btn,
#antigravity-rtl-toggle-btn {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;
    min-height: 26px !important;
    padding: 0 !important;
    margin: 0 2px !important;
    border-radius: 6px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    user-select: none !important;
    background: transparent !important;
    color: var(--vscode-icon-foreground, #cccccc) !important;
    opacity: 0.75 !important;
    transition: all 0.15s ease !important;
    box-shadow: none !important;
    text-decoration: none !important;
}

#rightflow-toggle-btn:hover,
#antigravity-rtl-toggle-btn:hover {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

#rightflow-toggle-btn.rightflow-active,
#rightflow-toggle-btn.antigravity-rtl-active,
#antigravity-rtl-toggle-btn.antigravity-rtl-active {
    opacity: 1 !important;
    color: #38bdf8 !important; /* Sky Blue */
    background: rgba(56, 189, 248, 0.14) !important;
}

#rightflow-toggle-btn svg,
#antigravity-rtl-toggle-btn svg {
    width: 15px !important;
    height: 15px !important;
    pointer-events: none !important;
}

/* Editor Toolbar RTL Button */
.rightflow-editor-btn,
.antigravity-editor-rtl-btn {
    width: 24px !important;
    height: 24px !important;
    border-radius: 4px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    color: var(--vscode-icon-foreground, #cccccc) !important;
    opacity: 0.75 !important;
    margin-right: 4px !important;
    transition: all 0.15s ease !important;
    text-decoration: none !important;
}

.rightflow-editor-btn:hover,
.antigravity-editor-rtl-btn:hover {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

.rightflow-editor-btn.active,
.antigravity-editor-rtl-btn.active {
    color: #38bdf8 !important;
    opacity: 1 !important;
    background: rgba(56, 189, 248, 0.14) !important;
}

.rightflow-editor-btn svg,
.antigravity-editor-rtl-btn svg {
    width: 14px !important;
    height: 14px !important;
    pointer-events: none !important;
}

/* === RIGHTFLOW-END === */
`;

export const INJECTED_JS = `/* === RIGHTFLOW-JS-START === */
(function() {
    'use strict';

    var BTN_ID = 'rightflow-toggle-btn';
    var EDITOR_BTN_CLASS = 'rightflow-editor-btn';
    var BODY_CLASS = 'rightflow-enabled';
    var FORCE_EDITOR_CLASS = 'rightflow-force-editor-rtl';
    var STORAGE_KEY = 'rightflow-active';
    var EDITOR_STORAGE_KEY = 'rightflow-editor-active';
    
    // Comprehensive Arabic, Hebrew, Persian & Syriac regex
    var RTL_REGEX = /[\\u0590-\\u05FF\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/;
    var LTR_REGEX = /[A-Za-z\\u00C0-\\u024F\\u0370-\\u03FF\\u0400-\\u04FF]/;

    /**
     * Smart First Strong Directional Character Detection (Unicode UAX #9)
     * Strips leading markdown markers, task checkboxes (- [x]), numbers, quotes, emojis,
     * and checks the first strong linguistic letter.
     */
    function isRtlText(text) {
        if (!text) return false;
        var str = text.trim();
        if (!str) return false;

        // Strip markdown prefixes: lists (- , * , 1. ), task boxes (- [x], - [ ]), headers (### ), quotes (> )
        str = str.replace(/^(\\s*[-*+]\\s+\\[[ xX]\\]\\s*|\\s*#{1,6}\\s+|\\s*>\\s*|\\s*\\d+[\\.\\)]\\s*|\\s*[-*+]\\s+)/, '');
        str = str.trim();
        if (!str) return false;

        // Scan characters for first strong directional letter
        for (var i = 0; i < str.length; i++) {
            var ch = str.charAt(i);
            if (RTL_REGEX.test(ch)) return true;
            if (LTR_REGEX.test(ch)) return false;
        }

        // Fallback: character count ratio if mixed without clear first strong
        var rtlMatches = str.match(new RegExp(RTL_REGEX.source, 'g'));
        var ltrMatches = str.match(new RegExp(LTR_REGEX.source, 'g'));
        var rtlCount = rtlMatches ? rtlMatches.length : 0;
        var ltrCount = ltrMatches ? ltrMatches.length : 0;
        return rtlCount > ltrCount;
    }

    // Immediately restore saved chat state on startup
    var savedState = localStorage.getItem(STORAGE_KEY);
    var isGloballyActive = (savedState === null || savedState === 'true');
    if (isGloballyActive) {
        document.body.classList.add(BODY_CLASS);
    }

    // IMPORTANT: Code editor starts strictly in default LTR mode (NO automatic activation).
    // It only activates when the user clicks the RTL button in the editor toolbar or presses Ctrl+Alt+R.
    document.body.classList.remove(FORCE_EDITOR_CLASS);
    localStorage.setItem(EDITOR_STORAGE_KEY, 'false');

    /**
     * 1. Update Monaco Editor Containers
     * STRICTLY MANUAL: Only applies RTL when FORCE_EDITOR_CLASS is active.
     * NEVER auto-activates based on file content.
     */
    function updateEditorContainers() {
        try {
            var isForced = document.body.classList.contains(FORCE_EDITOR_CLASS);
            var editors = document.querySelectorAll('.monaco-editor');
            if (!editors || editors.length === 0) return;

            editors.forEach(function(editor) {
                if (isForced) {
                    editor.classList.add('rightflow-editor-rtl');
                    editor.classList.add('antigravity-editor-rtl');
                } else {
                    editor.classList.remove('rightflow-editor-rtl');
                    editor.classList.remove('antigravity-editor-rtl');
                }
            });
        } catch(e) {}
    }

    /**
     * 2. Update elements across Chat, Plans, Work, and Artifacts
     */
    function updateRtlElements() {
        var isActive = document.body.classList.contains(BODY_CLASS);

        var candidateSelectors = [
            // Chat & Agent Panel
            '.antigravity-agent-side-panel .whitespace-pre-wrap',
            '.antigravity-agent-side-panel .leading-relaxed.select-text',
            '.antigravity-agent-side-panel .select-text > p',
            '.antigravity-agent-side-panel .select-text > ul',
            '.antigravity-agent-side-panel .select-text > ol',
            '.antigravity-agent-side-panel .select-text li',
            '.antigravity-agent-side-panel .select-text > h1',
            '.antigravity-agent-side-panel .select-text > h2',
            '.antigravity-agent-side-panel .select-text > h3',
            '.antigravity-agent-side-panel .select-text > h4',
            '.antigravity-agent-side-panel .select-text > blockquote',
            '.antigravity-agent-side-panel .select-text table',

            // Antigravity Plans, Work, Artifacts, and Editor Previews
            '.editor-container .rendered-markdown p',
            '.editor-container .rendered-markdown li',
            '.editor-container .rendered-markdown h1, .editor-container .rendered-markdown h2, .editor-container .rendered-markdown h3',
            '.editor-container .rendered-markdown blockquote',
            '.editor-container .rendered-markdown table',
            '[data-testid*="artifact"] .select-text p',
            '[data-testid*="artifact"] .select-text li',
            '[data-testid*="plan"] .select-text p',
            '[data-testid*="plan"] .select-text li',
            '.artifact-viewer p',
            '.artifact-viewer li',
            '.artifact-content p',
            '.artifact-content li',
            '.artifact-content h1, .artifact-content h2, .artifact-content h3',
            '.artifact-content blockquote',

            // General Prose in workbench
            '.prose p',
            '.prose li',
            '.prose h1, .prose h2, .prose h3'
        ].join(', ');

        try {
            var elements = document.querySelectorAll(candidateSelectors);
            elements.forEach(function(el) {
                if (el.tagName === 'PRE' || el.tagName === 'CODE' || el.closest('pre') || el.closest('.interactive-result-code-block')) {
                    return;
                }

                if (isActive && isRtlText(el.textContent)) {
                    el.classList.add('antigravity-is-rtl');
                    el.setAttribute('dir', 'rtl');
                } else {
                    el.classList.remove('antigravity-is-rtl');
                    el.removeAttribute('dir');
                }
            });
        } catch(e) {}

        updateInputBoxes();
        updateEditorContainers();
    }

    /**
     * 3. Real-time dynamic input alignment (Prompt Input)
     */
    function updateInputBoxes() {
        try {
            var inputs = document.querySelectorAll('textarea, input[type="text"], div[contenteditable="true"]');
            inputs.forEach(function(input) {
                if (input._hasRtlListener) return;
                input._hasRtlListener = true;

                function checkInputDirection() {
                    var val = input.value || input.innerText || '';
                    if (isRtlText(val)) {
                        input.classList.add('antigravity-input-rtl');
                        input.setAttribute('dir', 'rtl');
                    } else {
                        input.classList.remove('antigravity-input-rtl');
                        input.setAttribute('dir', 'ltr');
                    }
                }

                input.addEventListener('input', checkInputDirection);
                input.addEventListener('keyup', checkInputDirection);
                input.addEventListener('paste', function() {
                    setTimeout(checkInputDirection, 10);
                });
                input.addEventListener('cut', function() {
                    setTimeout(checkInputDirection, 10);
                });
                input.addEventListener('change', checkInputDirection);
                checkInputDirection();
            });
        } catch(e) {}
    }

    var debounceTimer;
    function scheduleUpdate() {
        if (debounceTimer) return;
        debounceTimer = setTimeout(function() {
            debounceTimer = null;
            updateRtlElements();
        }, 60);
    }

    /**
     * Helper to create SVG element safely (Trusted Types safe)
     */
    function createRtlIconSvg() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('width', '15');
        svg.setAttribute('height', '15');
        svg.setAttribute('fill', 'currentColor');

        // Path 1: 3 horizontal text lines
        var path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M2 3.5h12a.5.5 0 0 0 0-1H2a.5.5 0 0 0 0 1zm4 4h8a.5.5 0 0 0 0-1H6a.5.5 0 0 0 0 1zm-4 4h12a.5.5 0 0 0 0-1H2a.5.5 0 0 0 0 1z');
        
        // Path 2: RTL arrow pointing right
        var path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M4.354 5.646a.5.5 0 0 0-.708.708L4.793 7.5H1.5a.5.5 0 0 0 0 1h3.293l-1.147 1.146a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2z');

        svg.appendChild(path1);
        svg.appendChild(path2);
        return svg;
    }

    /**
     * 4. Insert sleek icon button in Antigravity Chat header
     */
    function tryInsertChatButton() {
        if (document.getElementById(BTN_ID)) return;

        var newChatBtn = document.querySelector('a[data-tooltip-id="new-conversation-tooltip"]') ||
                         document.querySelector('[data-testid="new-conversation-button"]');

        if (!newChatBtn) return;
        var container = newChatBtn.parentElement;
        if (!container) return;

        var btn = document.createElement('a');
        btn.id = BTN_ID;
        btn.href = '#';
        btn.title = 'RightFlow: تبديل اتجاه الشات والرسائل';
        btn.appendChild(createRtlIconSvg());

        var saved = localStorage.getItem(STORAGE_KEY);
        var isCurrentlyActive = (saved === null || saved === 'true');

        if (isCurrentlyActive) {
            document.body.classList.add(BODY_CLASS);
            btn.classList.add('rightflow-active');
            btn.classList.add('antigravity-rtl-active');
        } else {
            document.body.classList.remove(BODY_CLASS);
            btn.classList.remove('rightflow-active');
            btn.classList.remove('antigravity-rtl-active');
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var active = document.body.classList.toggle(BODY_CLASS);
            btn.classList.toggle('rightflow-active', active);
            btn.classList.toggle('antigravity-rtl-active', active);
            localStorage.setItem(STORAGE_KEY, active ? 'true' : 'false');
            scheduleUpdate();
        });

        if (newChatBtn.nextSibling) {
            container.insertBefore(btn, newChatBtn.nextSibling);
        } else {
            container.appendChild(btn);
        }

        scheduleUpdate();
    }

    /**
     * 5. Insert Editor RTL toggle button in Editor Tab Toolbars
     * Injects into all active editor action toolbars (.editor-actions)
     */
    function tryInsertEditorButtons() {
        var actionContainers = document.querySelectorAll('.editor-actions .actions-container, .title-actions .actions-container');
        if (!actionContainers || actionContainers.length === 0) return;

        var isForced = document.body.classList.contains(FORCE_EDITOR_CLASS);

        actionContainers.forEach(function(actions) {
            var existingBtn = actions.querySelector('.' + EDITOR_BTN_CLASS);
            if (existingBtn) {
                existingBtn.classList.toggle('active', isForced);
                existingBtn.title = isForced
                    ? 'RightFlow: اتجاه المحرر RTL مفعل (اضغط للتعطيل | Ctrl+Alt+R)'
                    : 'RightFlow: تفعيل اتجاه RTL في المحرر (اضغط للتفعيل | Ctrl+Alt+R)';
                return;
            }

            var item = document.createElement('li');
            item.className = 'action-item';

            var btn = document.createElement('a');
            btn.className = 'action-label ' + EDITOR_BTN_CLASS;
            btn.title = isForced
                ? 'RightFlow: اتجاه المحرر RTL مفعل (اضغط للتعطيل | Ctrl+Alt+R)'
                : 'RightFlow: تفعيل اتجاه RTL في المحرر (اضغط للتفعيل | Ctrl+Alt+R)';
            btn.appendChild(createRtlIconSvg());

            if (isForced) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleEditorRtl();
            });

            item.appendChild(btn);
            actions.insertBefore(item, actions.firstChild);
        });
    }

    function toggleEditorRtl() {
        var isForced = !document.body.classList.contains(FORCE_EDITOR_CLASS);
        document.body.classList.toggle(FORCE_EDITOR_CLASS, isForced);
        localStorage.setItem(EDITOR_STORAGE_KEY, isForced ? 'true' : 'false');

        // Update all editor buttons in all toolbars
        var buttons = document.querySelectorAll('.' + EDITOR_BTN_CLASS);
        buttons.forEach(function(btn) {
            btn.classList.toggle('active', isForced);
            btn.title = isForced 
                ? 'RightFlow: اتجاه المحرر RTL مفعل (اضغط للتعطيل | Ctrl+Alt+R)'
                : 'RightFlow: تفعيل اتجاه RTL في المحرر (اضغط للتفعيل | Ctrl+Alt+R)';
        });

        // Update all editor containers
        updateEditorContainers();
    }

    /**
     * 6. Global Keyboard Shortcut Handler: Ctrl+Alt+R & Alt+R
     * Directly toggles Editor RTL inside the DOM with 0 latency.
     * Supports both English ('r') and Arabic ('ق' / KeyR) keyboard layouts.
     */
    window.addEventListener('keydown', function(e) {
        var isRKey = (e.code === 'KeyR' || e.key === 'r' || e.key === 'R' || e.key === 'ق');
        var isAltR = e.altKey && !e.ctrlKey && isRKey && !e.shiftKey;
        var isCtrlAltR = e.altKey && e.ctrlKey && isRKey && !e.shiftKey;

        if (isAltR || isCtrlAltR) {
            e.preventDefault();
            e.stopPropagation();
            toggleEditorRtl();
        }
    }, true);

    /**
     * 7. Intelligent DOM Observer
     * Filters out internal Monaco line recycling and cursor blinking,
     * completely eliminating scrolling lag and CPU thrashing!
     */
    try {
        var observer = new MutationObserver(function(mutations) {
            var shouldUpdate = false;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                var t = m.target;
                if (t && t.closest && (t.closest('.view-lines') || t.closest('.cursors-layer') || t.closest('.scrollbar'))) {
                    continue;
                }
                shouldUpdate = true;
                break;
            }

            if (shouldUpdate) {
                tryInsertChatButton();
                tryInsertEditorButtons();
                scheduleUpdate();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } catch(e) {}

    // Initialize on ready
    if (document.readyState !== 'loading') {
        tryInsertChatButton();
        tryInsertEditorButtons();
        scheduleUpdate();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            tryInsertChatButton();
            tryInsertEditorButtons();
            scheduleUpdate();
        });
    }

    // Periodic check for tab switches and newly opened editors (lightweight, 1s interval)
    setInterval(function() {
        tryInsertEditorButtons();
        updateEditorContainers();
    }, 1000);

    window.__rightflow = {
        toggleChat: function(forceState) {
            var active = typeof forceState === 'boolean' 
                ? forceState 
                : !document.body.classList.contains(BODY_CLASS);
            if (active) document.body.classList.add(BODY_CLASS);
            else document.body.classList.remove(BODY_CLASS);
            var btn = document.getElementById(BTN_ID);
            if (btn) {
                btn.classList.toggle('rightflow-active', active);
                btn.classList.toggle('antigravity-rtl-active', active);
            }
            localStorage.setItem(STORAGE_KEY, active ? 'true' : 'false');
            scheduleUpdate();
            return active;
        },
        toggleEditor: toggleEditorRtl,
        refresh: scheduleUpdate
    };
    window.__antigravityRtlPro = window.__rightflow;
})();
/* === RIGHTFLOW-JS-END === */
`;
