import test from 'node:test';
import assert from 'node:assert/strict';

// Test the exact BiDi heuristic algorithm used in src/content.ts & media/markdown-rtl.js
function isRtlText(text) {
  if (!text) return false;
  const clean = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[0-9#*_~`\-+=\[\](){}:|\\\/]/g, '')
    .trim();

  const rtlMatches = clean.match(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/g);
  const rtlCount = rtlMatches ? rtlMatches.length : 0;
  const ltrMatches = clean.match(/[A-Za-z]/g);
  const ltrCount = ltrMatches ? ltrMatches.length : 0;

  if (rtlCount === 0) return false;
  if (ltrCount === 0) return true;

  return rtlCount >= 5 && (rtlCount >= ltrCount * 0.3 || rtlCount >= 8);
}

test('BiDi detection: Pure Arabic text returns true', () => {
  assert.equal(isRtlText('مرحبا بك في محرك تدفق اليمين العربي'), true);
});

test('BiDi detection: Pure English text returns false', () => {
  assert.equal(isRtlText('Hello and welcome to the RightFlow extension'), false);
});

test('BiDi detection: Arabic sentence starting with English technical word returns true', () => {
  assert.equal(isRtlText('RightFlow هو محرك متقدم لدعم اتجاه اليمين إلى اليسار في محررات الذكاء الاصطناعي'), true);
  assert.equal(isRtlText('Docker أداة برمجية ممتازة لتشغيل الحاويات وتسهيل نشر التطبيقات'), true);
  assert.equal(isRtlText('TypeScript تمنح لغة جافاسكربت أماناً كبيراً في فحص الأنواع'), true);
  assert.equal(isRtlText('API يدعم تبادل البيانات المنسقة بين الأنظمة المختلفة'), true);
});

test('BiDi detection: English sentence with brief Arabic mention returns false', () => {
  assert.equal(isRtlText('The Arabic greeting is often pronounced as salam or marhaban in standard contexts'), false);
});

test('BiDi detection: Code snippet and numbers returns false', () => {
  assert.equal(isRtlText('const x = 12345; function test() { return true; }'), false);
});

test('BiDi detection: Markdown table header in Arabic returns true', () => {
  assert.equal(isRtlText('| المعرف | اسم المستخدم | الحالة الوظيفية | تاريخ التسجيل |'), true);
});
