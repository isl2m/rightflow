# Change Log

All notable changes to the **RightFlow** extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.7] - 2026-10-11

### Added & Enhanced
- Official v1.0.7 release with Smart First-Strong BiDi (Unicode UAX #9).
- Dynamic Prompt Input & Chat input text alignment.
- Editor toggle keybindings (Ctrl+Alt+R / Alt+R).
- Configurable Arabic typography stack and line-height.

## [1.0.6] - 2026-10-10

### Added
- **Official Editor Keybindings:** Registered `Ctrl+Alt+R` and `Alt+R` natively in VS Code keybindings so users can inspect and rebind them.
- **Customizable Font Settings:** Added `rightflow.chatFontFamily` and `rightflow.smartBiDi` options in settings UI.
- **Instant Paste/Cut Direction:** Real-time alignment triggers immediately on clipboard `paste` and `cut` events in chat prompt inputs.

### Improved
- **Smart First-Strong BiDi Algorithm (Unicode UAX #9):** Accurately detects primary paragraph direction, preventing English sentences with embedded Arabic words from accidentally flipping to RTL.
- **Strict Code Block & Copy Button Isolation:** Guaranteed LTR layout for code headers, action bars, and copy buttons within RTL responses.
- **Task List & Checklist Alignment:** Precise RTL vertical alignment for `- [ ]` and `- [x]` checkboxes in Plan files and Work tasks.

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
- **Monaco Code Editor Toolbar Button & Shortcuts:** Instant manual RTL toggle via toolbar icon or `Ctrl+Alt+R` / `Alt+R`.
- **Bilingual Keyboard Support:** Editor shortcut seamlessly triggers on both English (`KeyR`) and Arabic (`ق`) keyboard layouts.
- **Arabic Typography Presets:** High-readability font stack (`Segoe UI`, `Cairo`, `Tajawal`, `Tahoma`) with proportional line-height.
- **Markdown Previews Integration:** Floating interactive mode switcher for Markdown previews (`Auto BiDi`, `Forced RTL`, `LTR`).
- **Safe State & Backups:** Automatic creation of `.bak` backups before patching workbench assets, with one-click full restoration.
- **Control Center Menu:** Quick status bar indicator (`RTL: On` / `RTL: Off`) with comprehensive diagnostic menu.
- **GitHub Actions CI:** Automated build verification and TypeScript type checking.

### Fixed
- Isolated code blocks (`pre`, `code`, `.interactive-result-code-block`) to remain strictly LTR with zero layout distortion.
- Fixed 60fps Monaco editor scrolling by ignoring cursor layer and virtual line mutations in the DOM observer.
- Replaced IDE termination with instant window reload (`workbench.action.reloadWindow`).
