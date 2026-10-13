import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists, getCandidateRoots } from './common.mjs';

const subdirs = ['electron-sandbox', 'electron-browser'];
const cssFilename = 'rightflow.css';
const jsFilename = 'rightflow.js';

export async function patchHtml(filePath) {
  if (!(await fileExists(filePath))) return false;

  const backupPath = filePath + '.bak';
  if (!(await fileExists(backupPath))) {
    try {
      await fs.copyFile(filePath, backupPath);
    } catch (e) {}
  }

  let html = await fs.readFile(filePath, 'utf-8');
  if (html.includes(cssFilename) && html.includes(jsFilename)) {
    return false;
  }
  html = html.replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi, '');
  html = html.replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi, '');

  const cssTag = `\t<!-- RightFlow -->\n\t<link rel="stylesheet" href="../../../workbench/${cssFilename}">\n</head>`;
  const jsTag = `\t<!-- RightFlow -->\n\t<script src="../../../workbench/${jsFilename}"></script>\n</html>`;

  let changed = false;
  if (!html.includes(cssFilename)) {
    html = html.replace('</head>', cssTag);
    changed = true;
  }
  if (!html.includes(jsFilename)) {
    html = html.replace('</html>', jsTag);
    changed = true;
  }

  if (changed) {
    await fs.writeFile(filePath, html, 'utf-8');
    console.log(`Patched ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

export async function patchWorkbench(appRoot) {
  if (!(await fileExists(appRoot))) return false;

  const workbenchDir = path.join(appRoot, 'out', 'vs', 'workbench');
  const productJsonPath = path.join(appRoot, 'product.json');
  let touched = false;

  await fs.mkdir(workbenchDir, { recursive: true });

  // Deploy CSS and JS
  const srcCss = path.join(import.meta.dirname, '..', 'src', 'content.ts');
  if (await fileExists(srcCss)) {
    const contentTs = await fs.readFile(srcCss, 'utf-8');
    const cssMatch = contentTs.match(/export const INJECTED_CSS = `([\s\S]*?)`;/);
    const jsMatch = contentTs.match(/export const INJECTED_JS = `([\s\S]*?)`;/);

    if (cssMatch && jsMatch) {
      const cssTarget = path.join(workbenchDir, cssFilename);
      const jsTarget = path.join(workbenchDir, jsFilename);
      let needWrite = true;
      if (await fileExists(cssTarget) && await fileExists(jsTarget)) {
        const curCss = await fs.readFile(cssTarget, 'utf-8');
        const curJs = await fs.readFile(jsTarget, 'utf-8');
        if (curCss === cssMatch[1] && curJs === jsMatch[1]) {
          needWrite = false;
        }
      }
      if (needWrite) {
        await fs.writeFile(cssTarget, cssMatch[1], 'utf-8');
        await fs.writeFile(jsTarget, jsMatch[1], 'utf-8');
        console.log('Deployed assets to ' + workbenchDir);
        touched = true;
      }
    }
  }

  // Patch HTML files in all candidate subdirectories
  for (const subdir of subdirs) {
    const wbPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench.html');
    const secPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench-jetski-agent.html');

    if (await patchHtml(wbPath)) touched = true;
    if (await patchHtml(secPath)) touched = true;

    // Update product.json checksums
    try {
      if (await fileExists(productJsonPath)) {
        const prod = JSON.parse(await fs.readFile(productJsonPath, 'utf-8'));
        if (prod.checksums) {
          let prodChanged = false;
          const k1 = `vs/code/${subdir}/workbench/workbench.html`;
          const k2 = `vs/code/${subdir}/workbench/workbench-jetski-agent.html`;
          if (prod.checksums[k1]) {
            delete prod.checksums[k1];
            prodChanged = true;
          }
          if (prod.checksums[k2]) {
            delete prod.checksums[k2];
            prodChanged = true;
          }
          if (prodChanged) {
            await fs.writeFile(productJsonPath, JSON.stringify(prod, null, '\t'), 'utf-8');
            console.log(`Updated product.json checksums for ${subdir}`);
            touched = true;
          }
        }
      }
    } catch (e) {
      console.warn('Product.json note:', e.message);
    }
  }

  return touched;
}

export async function run() {
  console.log('Applying RightFlow patch...');

  const roots = getCandidateRoots();
  let anyPatched = false;

  for (const appRoot of roots) {
    if (await fileExists(appRoot)) {
      console.log(`Found IDE installation at: ${appRoot}`);
      if (await patchWorkbench(appRoot)) {
        anyPatched = true;
      }
    }
  }

  if (anyPatched) {
    console.log('RightFlow patch applied successfully!');
  } else {
    console.log('No eligible IDE installation modified.');
  }
  return anyPatched;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename || '')) {
  run().catch(console.error);
}
