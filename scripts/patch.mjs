import * as fs from 'fs/promises';
import * as path from 'path';

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
const appRoot = process.env.ANTIGRAVITY_APP_ROOT || path.join(localAppData, 'Programs', 'Antigravity IDE', 'resources', 'app');
const workbenchHtmlPath = path.join(appRoot, "out", "vs", "code", "electron-browser", "workbench", "workbench.html");
const secondaryHtmlPath = path.join(appRoot, "out", "vs", "code", "electron-browser", "workbench", "workbench-jetski-agent.html");
const workbenchDir = path.join(appRoot, "out", "vs", "workbench");
const productJsonPath = path.join(appRoot, "product.json");

const cssFilename = "rightflow.css";
const jsFilename = "rightflow.js";

async function patchHtml(filePath) {
  if (!(await fileExists(filePath))) return;

  const backupPath = filePath + ".bak";
  if (!(await fileExists(backupPath))) {
    try {
      await fs.copyFile(filePath, backupPath);
    } catch (e) {}
  }

  let html = await fs.readFile(filePath, "utf-8");
  html = html.replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi, '');
  html = html.replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi, '');

  const cssTag = `\t<!-- RightFlow -->\n\t<link rel="stylesheet" href="../../../workbench/${cssFilename}">\n</head>`;
  const jsTag = `\t<!-- RightFlow -->\n\t<script src="../../../workbench/${jsFilename}"></script>\n</html>`;

  html = html.replace("</head>", cssTag);
  html = html.replace("</html>", jsTag);

  await fs.writeFile(filePath, html, "utf-8");
  console.log(`Patched ${path.basename(filePath)}`);
}

async function run() {
  console.log("Applying RightFlow patch...");

  // 1. Backups & Patch
  await fs.mkdir(workbenchDir, { recursive: true });

  // 2. Deploy CSS and JS
  const srcCss = path.join(import.meta.dirname, "..", "src", "content.ts");
  const contentTs = await fs.readFile(srcCss, "utf-8");
  const cssMatch = contentTs.match(/export const INJECTED_CSS = `([\s\S]*?)`;/);
  const jsMatch = contentTs.match(/export const INJECTED_JS = `([\s\S]*?)`;/);

  if (cssMatch && jsMatch) {
    await fs.writeFile(path.join(workbenchDir, cssFilename), cssMatch[1], "utf-8");
    await fs.writeFile(path.join(workbenchDir, jsFilename), jsMatch[1], "utf-8");
    console.log("Deployed assets to " + workbenchDir);
  }

  // 3. Patch both HTML files
  await patchHtml(workbenchHtmlPath);
  await patchHtml(secondaryHtmlPath);

  // 4. Update product.json checksums
  try {
    if (await fileExists(productJsonPath)) {
      const prod = JSON.parse(await fs.readFile(productJsonPath, "utf-8"));
      if (prod.checksums) {
        delete prod.checksums["vs/code/electron-browser/workbench/workbench.html"];
        delete prod.checksums["vs/code/electron-browser/workbench/workbench-jetski-agent.html"];
        await fs.writeFile(productJsonPath, JSON.stringify(prod, null, "\t"), "utf-8");
        console.log("Updated product.json checksums");
      }
    }
  } catch (e) {
    console.warn("Product.json note:", e.message);
  }

  console.log("RightFlow patch applied successfully!");
}

run().catch(console.error);
