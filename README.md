<div align="center">

  <img src="./icon.png" width="128" height="128" alt="RightFlow Logo" style="border-radius: 28px;" />

  # RightFlow
  
  **Native BiDi & RTL Engine for Antigravity IDE**  
  *High-performance right-to-left alignment for Agent Chat, Markdown, Plans, and Monaco Editor.*

  [![Version](https://img.shields.io/badge/version-1.0.4-blue.svg?style=flat-square)](https://github.com/isl2m/rightflow)
  [![Open VSX](https://img.shields.io/badge/Open%20VSX-v1.0.4-purple.svg?style=flat-square)](https://open-vsx.org/extension/islam-fathy/rightflow)
  [![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/isl2m/rightflow/blob/main/LICENSE)
  [![Antigravity IDE](https://img.shields.io/badge/Antigravity%20IDE-v1.90+-indigo.svg?style=flat-square)](https://antigravity.google)
  [![BiDi](https://img.shields.io/badge/BiDi-Arabic%20%7C%20Hebrew%20%7C%20Persian-cyan.svg?style=flat-square)](#overview)

</div>

---

## Overview

When working with Arabic, Hebrew, or Persian in AI-assisted development environments, standard LTR interfaces frequently break: punctuation flips to the opposite side, mixed code phrases scramble sentence flow, and AI planning documents become tedious to read.

**RightFlow** is a lightweight, non-destructive BiDi (Bidirectional) engine built specifically for **Antigravity IDE**. It introduces seamless paragraph-level RTL detection across agent conversations, prompt inputs, planning artifacts (`*.plan.md`), markdown files, and the code editor — all while preserving strict LTR alignment for code blocks and maintaining 60fps editor scrolling.

---

## Comparison: Why RightFlow?

| Feature | Default IDE / Legacy Tools | **RightFlow** |
| :--- | :--- | :--- |
| **Agent Chat & Thoughts** | LTR only or broken inline code | **Native BiDi** — Arabic flows RTL, English/code stays LTR |
| **Prompt Input Textarea** | Punctuation floats on the left | **Dynamic auto-direction** as you type |
| **Plan Files (`*.plan.md`)** | Unformatted LTR reading | **First-class RTL** in both preview and editor |
| **Markdown Previews (`.md`)** | Left-aligned by default | **Auto-detected blocks** with interactive toolbar |
| **Code Editor (Monaco)** | Uncontrolled flipping or lags | **Strict manual toggle only** (`Ctrl+Alt+R`) |
| **Editor Scrolling Performance** | Line jumping & DOM thrashing | **Zero latency** — pure CSS-scoped rules (60fps) |
| **Mixed Code Strings** | Scrambled syntax (`function()`) | Isolated via `unicode-bidi: isolate` |
| **Typography** | Default browser fallback | Tailored Arabic font stack (`Segoe UI`, `Tahoma`) |

---

## Key Features

### 1. Smart Agent Chat & Thought Trace BiDi
- Automatically analyzes paragraphs in agent messages, user prompts, thinking blocks, and tool executions.
- Arabic sentences align neatly to the right with correct punctuation, while English responses and technical terms remain LTR.

### 2. Live Prompt Input Alignment
- Typing your first Arabic character dynamically aligns the chat prompt input to RTL.
- Switch back to English, and the textarea gracefully returns to LTR without manual intervention.

### 3. Native Support for Plan Artifacts (`*.plan.md`)
- Antigravity's architectural plans, tasks lists (`- [ ]`), and progress checklists render with proper right-aligned layout and reversed bullet hierarchies.

### 4. Zero-Lag Monaco Code Editor Toggle
- **Never auto-activates unexpectedly on source code.** Code files remain standard LTR.
- When working on Arabic documentation, translation strings, or markdown notes, toggle RTL instantly using the editor title button or keyboard shortcut.
- Virtualized lines recycle without layout shift, horizontal jitter, or scroll stutter.

### 5. Strict Code & Syntax Isolation
- Inline code tags (`` `const value = 42;` ``), paths, and shell commands embedded inside Arabic sentences are strictly isolated via `unicode-bidi: isolate`.
- Code blocks (` ```js `) always stay left-to-right with intact syntax indentation.

---

## Keyboard Shortcuts

| Command | Windows / Linux | macOS | Description |
| :--- | :--- | :--- | :--- |
| **Toggle Editor RTL** | `Ctrl + Alt + R` *(or `Alt + R`)* | `Cmd + Alt + R` *(or `Option + R`)* | Toggles text direction for the active file |
| **Open Control Center** | `Ctrl + Alt + Shift + R` | `Cmd + Alt + Shift + R` | Opens quick access diagnostics and settings menu |

> **Note:** The editor shortcut works seamlessly on both English (`KeyR`) and Arabic keyboard layouts (`ق`).

---

## Quick Start

1. **Install:** Ensure the extension is enabled in your Antigravity IDE extensions list.
2. **Reload:** Press `Ctrl+Shift+P` (or `F1`), run **`Developer: Reload Window`**.
3. **Usage:**
   - **Chat & Plans:** RTL applies automatically to Arabic text.
   - **Code Editor:** Click the **RTL** icon in the editor toolbar (top right) or press **`Ctrl + Alt + R`** whenever you wish to view/edit a file in RTL mode.

---

## Extension Settings

Customize RightFlow via `settings.json`:

```json
{
  "rightflow.autoDetect": true,
  "rightflow.supportPromptInput": true,
  "rightflow.enhanceFonts": true,
  "rightflow.lineHeightRatio": 1.75,
  "rightflow.editorRtlMode": false
}
```

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rightflow.autoDetect` | `boolean` | `true` | Automatically detect Arabic paragraphs in Chat & Plans. |
| `rightflow.supportPromptInput` | `boolean` | `true` | Align chat input textarea based on the typed language. |
| `rightflow.enhanceFonts` | `boolean` | `true` | Apply high-readability Arabic typography stack. |
| `rightflow.lineHeightRatio` | `number` | `1.75` | Proportional line-height to avoid diacritic clipping. |
| `rightflow.editorRtlMode` | `boolean` | `false` | Manual toggle state for editor RTL mode. |

---

## دليل الاستخدام السريع (باللغة العربية)

صُممت إضافة **RightFlow** خصيصاً للمطورين الناطقين باللغة العربية داخل **Antigravity IDE**، لتوفر تجربة قراءة وكتابة طبيعية بدون التأثير على بنية الأكواد أو سرعة المحرر:

### أهم المميزات:
- **شات الذكاء الاصطناعي:** تفعيل تلقائي لاتجاه اليمين للفقرات العربية مع الحفاظ التام على عزل الأكواد الإنجليزية وعلامات الترقيم.
- **حقل الإدخال الذكي:** يتجه حقل كتابة البرومبت لليمين فور كتابة أول حرف عربي، ويعود لليسار عند الكتابة بالإنجليزية.
- **ملفات الخطط (`*.plan.md`) والماركداون:** دعم متكامل لخطط العمل ولوحات المهام وقوائم الاختيار (`- [ ]`).
- **محرر الأكواد (Monaco Editor):**
  - **تحكم يدوي نقي:** لا يتم تفعيل RTL تلقائياً على الملفات البرمجية حتى لا يسبب ارتباكاً أثناء كتابة الكود.
  - **التفعيل الفوري:** يمكنك تحويل المحرر لوضع RTL بضغطة زر واحدة من الشريط العلوي أو باختصار **`Ctrl + Alt + R`** (يدعم لوحة المفاتيح العربية والإنجليزية).
  - **سلاسة التمرير (60fps):** تم التخلص نهائياً من أي وميض أو تداخل للأسطر أثناء الصعود والنزول في الملفات الطويلة.

---

## Troubleshooting & FAQ

<details>
<summary><strong>لماذا لا يتم تفعيل اتجاه RTL تلقائياً داخل محرر الأكواد؟</strong></summary>

ملفات الكود البرمجي (مثل JavaScript و Python و C++) تتطلب اتجاهاً يسارياً صارماً (LTR) حتى لو احتوت على تعليقات أو نصوص عربية. لذلك تم ضبط المحرر ليعمل **يدوياً فقط** عند رغبة المطور (مثل كتابة ملفات التوثيق أو ترجمة النصوص)، عبر زر شريط الأدوات أو الاختصار `Ctrl+Alt+R`.
</details>

<details>
<summary><strong>هل تعدل الإضافة على ملفات المشروع الأصلية؟</strong></summary>

كلا، الإضافة تعدل فقط طريقة عرض النصوص داخل واجهة المستخدم (Rendering Layer) ولا تغير محتوى ملفاتك أو تنسيقها البرمجي على القرص.
</details>

<details>
<summary><strong>كيف أعيد تشغيل الإضافة بعد تحديث المحرر؟</strong></summary>

اضغط `Ctrl + Alt + Shift + R` لفتح قائمة التحكم، ثم اختر **Activate RTL Suite**، وأعد تشغيل النافذة (`Developer: Reload Window`).
</details>

---

## Author & Credits

- **Developer:** Islam Fathy ([@isl2m](https://github.com/isl2m))
- **Publisher ID:** `islam-fathy`
- **License:** [MIT License](LICENSE)
