# Contributing to RightFlow

Thank you for your interest in contributing to **RightFlow**! We welcome bug reports, feature suggestions, and pull requests to make Arabic and RTL development smoother for everyone.

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

---

## Project Structure

```
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
├── media/                # Markdown preview stylesheets and scripts
├── scripts/              # Helper patching scripts
└── icon.png              # Official 512x512 extension icon
```

---

## Guidelines for Pull Requests

1. **Keep Monaco Fast:** Avoid expensive DOM queries inside frequent scroll or line-recycling loops.
2. **Preserve Code Isolation:** Never allow code blocks (`<pre>`, `<code>`, backticks) to flip to RTL.
3. **Respect Auto-Detect:** Text direction should strictly follow natural language detection.

---

## Reporting Issues

If you find a bug or have an idea for improvement, please open an issue on GitHub:
👉 https://github.com/isl2m/rightflow/issues
