import * as fs from 'fs/promises';
import * as path from 'path';

const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
const appRoot = process.env.ANTIGRAVITY_APP_ROOT || path.join(localAppData, 'Programs', 'Antigravity IDE', 'resources', 'app');
const workbenchHtmlPath = path.join(appRoot, "out", "vs", "code", "electron-browser", "workbench", "workbench.html");
const workbenchDir = path.join(appRoot, "out", "vs", "workbench");
const productJsonPath = path.join(appRoot, "product.json");

const cssFilenames = ["rightflow.css", "antigravity-rtl-pro.css"];
const jsFilenames = ["rightflow.js", "antigravity-rtl-pro.js"];

async function run() {
  console.log("Restoring Antigravity workbench to original state...");

  // 1. Restore workbench.html
  try {
    await fs.copyFile(workbenchHtmlPath + ".bak", workbenchHtmlPath);
    console.log("Restored workbench.html from backup");
  } catch (e) {
    console.warn("Could not copy from .bak, cleaning manually...");
    let html = await fs.readFile(workbenchHtmlPath, "utf-8");
    html = html.replace(/\s*<!--\s*(?:Antigravity RTL Pro|RightFlow)\s*-->\s*<link rel="stylesheet"[^>]+>/gi, '');
    html = html.replace(/\s*<!--\s*(?:Antigravity RTL Pro|RightFlow)\s*-->\s*<script[^>]+><\/script>/gi, '');
    await fs.writeFile(workbenchHtmlPath, html, "utf-8");
  }

  // 2. Remove files
  for (const c of cssFilenames) {
    try { await fs.unlink(path.join(workbenchDir, c)); } catch (e) {}
  }
  for (const j of jsFilenames) {
    try { await fs.unlink(path.join(workbenchDir, j)); } catch (e) {}
  }
  console.log("Deleted injected assets");

  // 3. Restore product.json
  try {
    await fs.copyFile(productJsonPath + ".bak", productJsonPath);
    console.log("Restored product.json from backup");
  } catch (e) {}

  console.log("Workbench successfully restored.");
}

run().catch(console.error);
