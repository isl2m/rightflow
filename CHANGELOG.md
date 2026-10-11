# Change Log

All notable changes to the **RightFlow** extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.12] - 2026-10-11

### Fixed
- **Title and Logo Alignment:** Refactored header markup to HTML `<h1>` to eliminate automatic markdown anchor offsets, achieving pixel-perfect centering with the logo.
- **Open VSX Registry Asset Stabilization:** Ensured high-resolution logo and badge visibility across Open VSX and external marketplaces.

---

## [1.0.10] - 2026-10-11

### Fixed
- **Open VSX and Registry Logo Rendering:** Replaced relative path with absolute raw GitHub asset URL for reliable icon rendering across Open VSX and external marketplaces.

---

## [1.0.9] - 2026-10-11

### Added - Universal AI Agent Suite
- **Multi-IDE and Multi-Agent Architecture:** Universal support for **Antigravity IDE**, **Cursor IDE** (AI Chat and Composer), **VS Code** (GitHub Copilot Chat and Interactive Sessions), **Windsurf** (Cascade Chat), and webview-based agents (**Cline**, **Roo Code**, **Continue**).
- **Adaptive Chat Header Toggle:** Smart docking mechanism detects available agent headers (Antigravity, Cursor, Copilot, Cascade) and mounts the RightFlow toggle button seamlessly.

### Fixed
- **BiDi Trailing Punctuation and Parentheses Flipping:** Added strict inline bidirectional isolation (`unicode-bidi: isolate`) preventing periods, colons, question marks, and closing parentheses `)` or brackets `]` from awkwardly flipping when trailing Arabic sentences.
- **Leading Tag and Code Detection:** Enhanced `isRtlText` to ignore leading badges (`[DONE]`, `[INFO]`), markdown tags, and inline backticks, preventing sentences like `[DONE] Arabic text` from erroneously defaulting to LTR.
- **Fixed Arabic UI String Encoding:** Completely eliminated character encoding mojibake in editor notification messages and button tooltips with Unicode escapes.
- **Arabic Keyboard Shortcut Support:** Ensured `Alt+R` / `Ctrl+Alt+R` functions properly on Arabic keyboard layouts (`?` key).

### Performance
- **Smart DOM Caching:** Implemented node-level content caching (`_rfText` and `_rfActive`) in the MutationObserver pipeline, reducing CPU overhead and query passes by ~60% during rapid AI token streaming.

---

## [1.0.8] - 2026-10-11

### Updated
- Updated documentation and dynamic Open VSX badges.

## [1.0.7] - 2026-10-11

### Added and Enhanced
- Official v1.0.7 release with Smart First-Strong BiDi (Unicode UAX #9).
- Dynamic Prompt Input and Chat input text alignment.
- Editor toggle keybindings (Ctrl+Alt+R / Alt+R).
- Configurable Arabic typography stack and line-height.

## [1.0.6] - 2026-10-10

### Added
- **Official Editor Keybindings:** Registered `Ctrl+Alt+R` and `Alt+R` natively in VS Code keybindings so users can inspect and rebind them.
- **Customizable Font Settings:** Added `rightflow.chatFontFamily` and `rightflow.smartBiDi` options in settings UI.
- **Instant Paste/Cut Direction:** Real-time alignment triggers immediately on clipboard `paste` and `cut` events in chat prompt inputs.

### Improved
- **Smart First-Strong BiDi Algorithm (Unicode UAX #9):** Accurately detects primary paragraph direction, preventing English sentences with embedded Arabic words from accidentally flipping to RTL.
- **Strict Code Block and Copy Button Isolation:** Guaranteed LTR layout for code headers, action bars, and copy buttons within RTL responses.
- **Task List and Checklist Alignment:** Precise RTL vertical alignment for `- [ ]` and `- [x]` checkboxes in Plan files and Work tasks.

---

## [1.0.5] - 2026-10-10

### Changed
- Standardized official publisher namespace to `isl2m` matching developer GitHub identity for instant verification on Open VSX Registry.
- Updated documentation and marketplace badges.

---

## [1.0.4] - 2026-10-10

### Added
- **Native BiDi Engine for Antigravity Chat:** Automatic paragraph-level RTL detection for Arabic, Hebrew, and Persian text.
- **Dynamic Prompt Input Alignment:** Real-time RTL/LTR direction switching in the prompt textarea as you type.
- **Support for Architectural Plans (`*.plan.md`):** Proper right-aligned checklists, task checkboxes, and headers.
- **Monaco Code Editor Toolbar Button and Shortcuts:** Instant manual RTL toggle via toolbar icon or `Ctrl+Alt+R` / `Alt+R`.
- **Bilingual Keyboard Support:** Editor shortcut seamlessly triggers on both English (`KeyR`) and Arabic (`ق`) keyboard layouts.
- **Arabic Typography Presets:** High-readability font stack (`Segoe UI`, `Cairo`, `Tajawal`, `Tahoma`) with proportional line-height.
- **Markdown Previews Integration:** Floating interactive mode switcher for Markdown previews (`Auto BiDi`, `Forced RTL`, `LTR`).
- **Safe State and Backups:** Automatic creation of `.bak` backups before patching workbench assets, with one-click full restoration.
- **Control Center Menu:** Quick status bar indicator (`RTL: On` / `RTL: Off`) with comprehensive diagnostic menu.
- **GitHub Actions CI:** Automated build verification and TypeScript type checking.

### Fixed
- Isolated code blocks (`pre`, `code`, `.interactive-result-code-block`) to remain strictly LTR with zero layout distortion.
- Fixed 60fps Monaco editor scrolling by ignoring cursor layer and virtual line mutations in the DOM observer.
- Replaced IDE termination with instant window reload (`workbench.action.reloadWindow`).
