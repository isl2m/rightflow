import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists, getCandidateRoots, unpatchCspTrustedTypes } from './common.mjs';

const candidateRoots = getCandidateRoots();

const subdirs = ['electron-browser', 'electron-sandbox'];
const cssFilenames = ['rightflow.css', 'antigravity-rtl-pro.css'];
const jsFilenames = ['rightflow.js', 'antigravity-rtl-pro.js'];

export async function cleanHtmlFile(filePath) {
  if (!(await fileExists(filePath))) return false;

  const backupPath = filePath + '.bak';
  if (await fileExists(backupPath)) {
    try {
      await fs.copyFile(backupPath, filePath);
      await fs.unlink(backupPath);
      console.log(`Restored ${path.basename(filePath)} from backup.`);
    } catch (e) {
      console.warn(`Could not restore backup for ${path.basename(filePath)}:`, e.message);
    }
  }

  // Ensure ALL RightFlow / RTL tags are stripped, even if the backup file already contained them
  let html = await fs.readFile(filePath, 'utf-8');
  let cleaned = html
    .replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi, '')
    .replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi, '')
    .replace(/\s*<link rel="stylesheet"[^>]*rightflow\.css[^>]*>/gi, '')
    .replace(/\s*<script[^>]*rightflow\.js[^>]*><\/script>/gi, '');

  const unpatchCsp = unpatchCspTrustedTypes(cleaned);
  if (unpatchCsp.changed) {
    cleaned = unpatchCsp.html;
  }

  if (cleaned !== html) {
    await fs.writeFile(filePath, cleaned, 'utf-8');
    console.log(`Cleaned all residual RTL tags from ${path.basename(filePath)}.`);
    return true;
  }
  return false;
}

export async function unpatchWorkbench(appRoot) {
  if (!(await fileExists(appRoot))) return false;

  const workbenchDir = path.join(appRoot, 'out', 'vs', 'workbench');
  const productJsonPath = path.join(appRoot, 'product.json');
  let touched = false;

  // Clean HTML files
  for (const subdir of subdirs) {
    const wbPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench.html');
    const secPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench-jetski-agent.html');

    if (await cleanHtmlFile(wbPath)) touched = true;
    if (await cleanHtmlFile(secPath)) touched = true;
  }

  // Remove injected JS and CSS files
  for (const c of cssFilenames) {
    try {
      await fs.unlink(path.join(workbenchDir, c));
      console.log(`Deleted ${c} from ${workbenchDir}`);
      touched = true;
    } catch (e) {}
  }
  for (const j of jsFilenames) {
    try {
      await fs.unlink(path.join(workbenchDir, j));
      console.log(`Deleted ${j} from ${workbenchDir}`);
      touched = true;
    } catch (e) {}
  }

  // Restore product.json if backup exists
  const prodBackup = productJsonPath + '.bak';
  if (await fileExists(prodBackup)) {
    try {
      await fs.copyFile(prodBackup, productJsonPath);
      await fs.unlink(prodBackup);
      console.log('Restored product.json from backup.');
      touched = true;
    } catch (e) {}
  }

  // Restore Antigravity agy extension if backup exists
  const agyPath = path.join(appRoot, 'extensions', 'agy', 'vscode', 'extension.js');
  const agyBak = agyPath + '.bak';
  if (await fileExists(agyBak)) {
    try {
      await fs.copyFile(agyBak, agyPath);
      await fs.unlink(agyBak);
      console.log('Restored original Antigravity agy extension from backup.');
      touched = true;
    } catch (e) {
      console.warn('Could not restore agy extension backup:', e.message);
    }
  }

  return touched;
}

export async function run() {
  console.log('Restoring IDE workbench to original state...');

  let anyRestored = false;
  for (const appRoot of candidateRoots) {
    if (await unpatchWorkbench(appRoot)) {
      anyRestored = true;
    }
  }

  console.log('IDE workbench restore completed successfully.');
  return anyRestored;
}

// Only auto-run if executed directly as a script
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename || '')) {
  run().catch((err) => {
    console.error('Error during unpatch:', err);
  });
}
