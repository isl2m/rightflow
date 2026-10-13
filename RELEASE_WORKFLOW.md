# دليل أتمتة وتحديث ونشر إضافة RightFlow 🚀
**RightFlow Extension Maintenance & Release Playbook**

هذا الدليل مخصص للذكاء الاصطناعي (وللمطور) لتوثيق دورة الحياة الكاملة لأي تعديل أو تحديث يطلبه المستخدم، خطوة بخطوة من كتابة الكود وحتى وصول التحديث تلقائياً للمستخدمين على **GitHub** و **Eclipse Open VSX** و **Microsoft VS Code Marketplace**.

---

## 📌 الفهرس العام لدورة التحديث
1. [استلام الطلب والتحليل البرمجي](#1-استلام-الطلب-والتحليل-البرمجي)
2. [التعديل والتطوير البرمجي](#2-التعديل-والتطوير-البرمجي)
3. [الفحص والبناء المحلي (Local Build & Validation)](#3-الفحص-والبناء-المحلي)
4. [ترقية رقم الإصدار (Version Bump)](#4-ترقية-رقم-الإصدار)
5. [توثيق سجل التغييرات (CHANGELOG.md)](#5-توثيق-سجل-التغييرات)
6. [اختبار التغليف (VSIX Verification)](#6-اختبار-التغليف)
7. [الرفع والحفظ على Git & GitHub](#7-الرفع-والحفظ-على-git--github)
8. [إنشاء الـ GitHub Release وتفعيل النشر التلقائي](#8-إنشاء-الـ-release-والنشر-التلقائي)
9. [التحقق النهائي بعد النشر (Post-Release Verification)](#9-التحقق-النهائي-بعد-النشر)

---

## 1. استلام الطلب والتحليل البرمجي
عند طلب أي ميزة أو إصلاح:
* **تحديد الملفات المعنية بالتعديل:**
  * منطق الامتداد وتفعيل الـ RTL: `src/extension.ts`
  * استايلات الـ RTL والـ BiDi: `media/markdown-rtl.css`
  * سكريبتات الحقن داخل الـ Webviews: `media/markdown-rtl.js`
  * سكريبتات الباتش والتثبيت/الإزالة: `scripts/patch.mjs` و `scripts/unpatch.mjs`
  * تكوين الحزمة والمعرّفات: `package.json`
* **مراعاة القواعد الصارمة لـ RightFlow:**
  * عدم عكس اتجاه كتل الأكواد البرمجية (`pre`, `code`, محررات Monaco).
  * الحفاظ على استثناءات مدخلات الأوامر والأيقونات وأزرار التحكم.
  * ضمان التوافق مع كافة البيئات: Antigravity IDE, Cursor, VS Code Copilot, Windsurf.

---

## 2. التعديل والتطوير البرمجي
* كتابة الكود بأسلوب نظيف، معياري، ودقيق.
* الحفاظ على خفة الحجم وسرعة الأداء.
* التأكد من شمولية المعالجة لحالات التثبيت والإزالة النظيفة (Lifecycle Hooks).

---

## 3. الفحص والبناء المحلي
قبل أي خطوة نحو النشر، يجب التأكد التام من خلو المشروع من أخطاء الـ TypeScript والـ Build:

```bash
# 1. فحص الأنواع البرمجية
npx tsc --noEmit

# 2. بناء الكود الإنتاجي (Production Build)
npm run build
```

> **شرط إلزامي:** يجب أن يكتمل أمر البناء بنجاح ويُنتج ملف `dist/extension.js` دون أي أخطاء.

---

## 4. ترقية رقم الإصدار
* الالتزام بمعيار **Semantic Versioning (SemVer)**:
  * إصلاح أخطاء أو تحسينات طفيفة ➜ **Patch** (مثال: `1.0.17` ➜ `1.0.18`).
  * ميزات جديدة متوافقة مع السابق ➜ **Minor** (مثال: `1.0.17` ➜ `1.1.0`).
  * تغييرات جذرية كبرى ➜ **Major** (مثال: `1.0.17` ➜ `2.0.0`).
* تعديل حقل `version` في ملف `package.json`.

---

## 5. توثيق سجل التغييرات (`CHANGELOG.md`)
إضافة القسم الخاص بالإصدار الجديد في أعلى ملف `CHANGELOG.md` بصيغة واضحة ومحددة:

```markdown
## [1.0.18] - YYYY-MM-DD

### Added
- ميزة جديدة تم إضافتها...

### Fixed
- مشكلة تم إصلاحها...

### Improved
- تحسين للأداء أو التوافقية...
```

---

## 6. اختبار التغليف
فحص إمكانية حزم الإضافة وفق معايير متاجر VS Code الرسمية دون أي ملفات زائدة:

```bash
npx --yes @vscode/vsce package --no-dependencies
```

* التأكد من ظهور رسالة النجاح: `DONE Packaged: rightflow-X.X.X.vsix`.
* حذف ملف `.vsix` المؤقت من المجلد محلياً بعد الفحص للحفاظ على نظافة المستودع.

---

## 7. الرفع والحفظ على Git & GitHub
تنفيذ عمليات الحفظ والدفع للفرع الرئيسي `main`:

```bash
# 1. فحص حالة الملفات
git status

# 2. إضافة كافة التعديلات
git add .

# 3. عمل Commit وصفي
git commit -m "feat/fix: وصف دقيق لما تم عمله (vX.X.X)"

# 4. الدفع إلى المستودع
git push origin main
```

---

## 8. إنشاء الـ Release والنشر التلقائي
النشر التلقائي مبرمج بالكامل عبر GitHub Actions (`.github/workflows/publish-open-vsx.yml`).
بمجرد نشر **GitHub Release**:

1. إنشاء **Release جديد** على مستودع GitHub:
   * **Tag version:** `vX.X.X` (مثل `v1.0.18`).
   * **Release title:** `RightFlow vX.X.X - عنوان موجز للتحديث`.
   * **Description:** تفاصيل ما تم إنجازه مأخوذة من الـ CHANGELOG.
2. تفعيل سير عمل GitHub Action تلقائياً، والذي يقوم بـ:
   * تجميع الكود واختباره.
   * تغليف الإضافة لملف `.vsix`.
   * **النشر على Eclipse Open VSX** باستخدام Secret: `${{ secrets.OVSX_PAT }}`
   * **النشر على Microsoft VS Code Marketplace** باستخدام Secret: `${{ secrets.VSCE_PAT }}`

> 💡 **في حال النشر اليدوي المباشر في حالات الطوارئ (اختياري):**
> * Open VSX: `npx -y ovsx publish *.vsix -p <OVSX_PAT> --skip-duplicate`
> * Microsoft Marketplace: `npx -y @vscode/vsce publish --packagePath *.vsix -p <VSCE_PAT>`

---

## 9. التحقق النهائي بعد النشر
بعد انتهاء الأتمتة (خلال 3 - 5 دقائق من الـ Release):
1. **GitHub Actions:** التأكد من اكتمال مهمة `Publish Extension` بنجاح (Green Checkmark ✅).
2. **Open VSX API:** التحقق من ظهور الإصدار الجديد:
   `https://open-vsx.org/api/isl2m/rightflow`
3. **Microsoft Marketplace API:** التحقق من إتاحة الإصدار الجديد:
   `https://marketplace.visualstudio.com/items?itemName=isl2m.rightflow`
4. **فحص الشارات التلقائية (Badges):**
   * التأكد من قراءة شارات `README.md` لرقم الإصدار الجديد تلقائياً.
   * التأكد من استمرار عمل عدادات التحميل والتقييمات المباشرة.
5. **إعلام المستخدم:** تقديم ملخص نهائي موجز وواضح بروابط الإصدار الجديد.

---

## 🔐 مفاتيح النشر المسجلة (Stored in GitHub Secrets)
* **`OVSX_PAT`**: مفتاح الوصول المعتمد لمتجر Eclipse Open VSX (Verified Publisher: `isl2m`).
* **`VSCE_PAT`**: مفتاح الوصول المعتمد لمتجر Microsoft Visual Studio Marketplace (Publisher: `isl2m`).
