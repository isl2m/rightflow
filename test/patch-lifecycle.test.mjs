import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { patchWorkbench } from '../scripts/patch.mjs';
import { unpatchWorkbench } from '../scripts/unpatch.mjs';
import { patchCspTrustedTypes, unpatchCspTrustedTypes } from '../scripts/common.mjs';

test('Patch Lifecycle: Full Mock Workbench Patch & Unpatch', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rightflow-test-'));
  const appRoot = path.join(tempDir, 'resources', 'app');
  const subdir = 'electron-sandbox';
  const wbDir = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench');
  const productJsonPath = path.join(appRoot, 'product.json');

  await fs.mkdir(wbDir, { recursive: true });

  const originalHtml = '<!DOCTYPE html>\n<html>\n<head>\n\t<title>VS Code</title>\n</head>\n<body>\n\t<div id="workbench"></div>\n</body>\n</html>';
  const wbHtmlPath = path.join(wbDir, 'workbench.html');
  await fs.writeFile(wbHtmlPath, originalHtml, 'utf-8');

  const initialProduct = {
    checksums: {
      [`vs/code/${subdir}/workbench/workbench.html`]: 'ORIGINAL_CHECKSUM_HASH'
    }
  };
  await fs.writeFile(productJsonPath, JSON.stringify(initialProduct, null, '\t'), 'utf-8');

  // STEP 1: Apply Patch
  const patched = await patchWorkbench(appRoot);
  assert.equal(patched, true, 'patchWorkbench should return true when applying patch');

  // Verify backup exists
  const backupExists = await fs.access(wbHtmlPath + '.bak').then(() => true).catch(() => false);
  assert.equal(backupExists, true, 'Backup file workbench.html.bak must be created');

  // Verify patched HTML contains RightFlow tags
  const patchedContent = await fs.readFile(wbHtmlPath, 'utf-8');
  assert.ok(patchedContent.includes('rightflow.css'), 'Patched HTML must include rightflow.css');
  assert.ok(patchedContent.includes('rightflow.js'), 'Patched HTML must include rightflow.js');

  // Verify product.json checksum was stripped
  const updatedProduct = JSON.parse(await fs.readFile(productJsonPath, 'utf-8'));
  assert.equal(updatedProduct.checksums[`vs/code/${subdir}/workbench/workbench.html`], undefined, 'Checksum must be stripped to prevent corrupt installation notice');

  // STEP 2: Idempotency (running patch again should not duplicate tags)
  const patchedAgain = await patchWorkbench(appRoot);
  assert.equal(patchedAgain, false, 'patchWorkbench should return false if already patched');
  const patchedTwiceContent = await fs.readFile(wbHtmlPath, 'utf-8');
  const cssMatches = patchedTwiceContent.match(/rightflow\.css/g) || [];
  assert.equal(cssMatches.length, 1, 'rightflow.css must only be linked once');

  // STEP 3: Unpatch
  const unpatched = await unpatchWorkbench(appRoot);
  assert.equal(unpatched, true, 'unpatchWorkbench should return true when restoring');

  // Verify workbench.html restored to original content
  const restoredContent = await fs.readFile(wbHtmlPath, 'utf-8');
  assert.ok(!restoredContent.includes('rightflow.css'), 'Restored HTML must not contain rightflow.css');
  assert.ok(!restoredContent.includes('rightflow.js'), 'Restored HTML must not contain rightflow.js');
  assert.equal(restoredContent.trim(), originalHtml.trim(), 'Restored HTML must match original HTML');

  // Verify backup file was deleted
  const backupStillExists = await fs.access(wbHtmlPath + '.bak').then(() => true).catch(() => false);
  assert.equal(backupStillExists, false, 'Backup file should be cleaned up after successful unpatch');

  // Clean up test directory
  await fs.rm(tempDir, { recursive: true, force: true });
});

test('Patch Lifecycle: Content Security Policy & Trusted Types support', async (t) => {
  const sampleCsp = '<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; require-trusted-types-for \'script\'; trusted-types amdLoader cellRenderer google#safe;"></head><body></body></html>';

  // 1. Test patchCspTrustedTypes
  const patchRes = patchCspTrustedTypes(sampleCsp);
  assert.equal(patchRes.changed, true, 'patchCspTrustedTypes should report changed: true');
  assert.ok(patchRes.html.includes('rightflow'), 'CSP must include rightflow');
  assert.ok(patchRes.html.includes("'allow-duplicates'"), "CSP must include 'allow-duplicates'");

  // 2. Test idempotency
  const patchAgain = patchCspTrustedTypes(patchRes.html);
  assert.equal(patchAgain.changed, false, 'patchCspTrustedTypes must be idempotent');

  // 3. Test unpatchCspTrustedTypes
  const unpatchRes = unpatchCspTrustedTypes(patchRes.html);
  assert.equal(unpatchRes.changed, true, 'unpatchCspTrustedTypes should report changed: true');
  assert.ok(!unpatchRes.html.includes('rightflow'), 'Unpatched CSP must not contain rightflow');
  assert.ok(!unpatchRes.html.includes("'allow-duplicates'"), "Unpatched CSP must not contain 'allow-duplicates'");
  assert.ok(unpatchRes.html.includes('google#safe'), 'Unpatched CSP must retain original policies');
});

test('Patch Lifecycle: Antigravity agy extension cleanup and restore', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rightflow-agy-test-'));
  const appRoot = path.join(tempDir, 'resources', 'app');
  const agyDir = path.join(appRoot, 'extensions', 'agy', 'vscode');
  await fs.mkdir(agyDir, { recursive: true });

  const originalContent = 'console.log("clean original agy");';
  const modifiedContent = 'console.log("corrupted agy with proxy");';
  const agyJsPath = path.join(agyDir, 'extension.js');
  const agyBakPath = path.join(agyDir, 'extension.js.bak');

  await fs.writeFile(agyJsPath, modifiedContent, 'utf-8');
  await fs.writeFile(agyBakPath, originalContent, 'utf-8');

  // Running unpatchWorkbench must restore clean original and remove backup
  const unpatched = await unpatchWorkbench(appRoot);
  assert.equal(unpatched, true, 'unpatchWorkbench should report true when restoring agy extension');

  const restored = await fs.readFile(agyJsPath, 'utf-8');
  assert.equal(restored, originalContent, 'extension.js must be restored to original clean code');

  const bakStillExists = await fs.access(agyBakPath).then(() => true).catch(() => false);
  assert.equal(bakStillExists, false, 'extension.js.bak must be removed after restoration');

  await fs.rm(tempDir, { recursive: true, force: true });
});
