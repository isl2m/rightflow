# Contributing to RightFlow

Thank you for your interest in contributing to **RightFlow**! We welcome bug reports, feature suggestions, and pull requests to make Arabic and RTL development seamless across all AI coding environments.

---

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/isl2m/rightflow.git
   cd rightflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Watch mode (for live development):**
   ```bash
   npm run watch
   ```

5. **Run the Automated Test Suite:**
   ```bash
   npm test
   ```
   RightFlow uses Node.js native test runner (`node --test`) to test BiDi linguistic heuristics, cross-platform path candidate resolution (Windows, macOS, Linux), and mock workbench lifecycle patching without external test runner bloat.

---

## Project Structure

```text
rightflow/
├── src/
│   ├── extension.ts      # Extension entrypoint and command registrations
│   ├── injector.ts       # Workbench asset injection and backup management
│   ├── finder.ts         # IDE installation directory detection
│   ├── content.ts        # Injected CSS and JavaScript engine
│   ├── statusBar.ts      # Status bar UI and Control Center menu
│   ├── editorRtl.ts      # Monaco editor RTL toggle logic
│   ├── settings.ts       # Recommended Arabic typography settings
│   └── types.ts          # TypeScript interfaces
├── test/
│   ├── bidi.test.mjs             # Unit tests for mixed BiDi sentence heuristics
│   ├── cross-platform.test.mjs   # Path candidate validation across OSes
│   └── patch-lifecycle.test.mjs  # Mock workbench patch/unpatch lifecycle
├── media/                # Markdown preview stylesheets, scripts, and showcases
├── scripts/              # Standalone Node.js patching and lifecycle scripts
└── icon.png              # Extension icon
```

---

## Guidelines for Pull Requests

1. **Keep Monaco Fast:** Avoid expensive DOM queries inside frequent scroll or line-recycling loops. Use cached selectors and MutationObserver throttling where appropriate.
2. **Preserve Code Isolation:** Never allow code blocks (`<pre>`, `<code>`, backticks) to flip to RTL. Inline identifiers within Arabic text must preserve their LTR directionality.
3. **Run All Tests Before Submitting:**
   Ensure `npm test` passes cleanly. Every PR will trigger the multi-OS CI workflow across Ubuntu, Windows, and macOS.
4. **Follow Semantic Versioning:** All user-facing changes should be documented in `CHANGELOG.md`.

---

## Reporting Issues

If you find a bug or have an idea for improvement, please open an issue on GitHub:
👉 https://github.com/isl2m/rightflow/issues
