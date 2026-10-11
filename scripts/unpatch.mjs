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
const programFiles = process.env.ProgramFiles || 'C:\\Program Files';

const candidateRoots = [
  process.env.ANTIGRAVITY_APP_ROOT,
  process.env.VSCODE_APP_ROOT,
  path.join(localAppData, 'Programs', 'Antigravity IDE', 'resources', 'app'),
  path.join(localAppData, 'Programs', 'cursor', 'resources', 'app'),
  path.join(localAppData, 'Programs', 'Microsoft VS Code', 'resources', 'app'),
  path.join(programFiles, 'Microsoft VS Code', 'resources', 'app'),
  path.join(localAppData, 'Programs', 'Windsurf', 'resources', 'app'),
].filter(Boolean);

const subdirs = ['electron-browser', 'electron-sandbox'];
const cssFilenames = ['rightflow.css', 'antigravity-rtl-pro.css'];
const jsFilenames = ['rightflow.js', 'antigravity-rtl-pro.js'];

async function cleanHtmlFile(filePath) {
  if (!(await fileExists(filePath))) return;

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
  const cleaned = html
    .replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi, '')
    .replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi, '')
    .replace(/\s*<link rel="stylesheet"[^>]*rightflow\.css[^>]*>/gi, '')
    .replace(/\s*<script[^>]*rightflow\.js[^>]*><\/script>/gi, '');

  if (cleaned !== html) {
    await fs.writeFile(filePath, cleaned, 'utf-8');
    console.log(`Cleaned all residual RTL tags from ${path.basename(filePath)}.`);
  }
}

async function run() {
  console.log('Restoring IDE workbench to original state...');

  for (const appRoot of candidateRoots) {
    if (!(await fileExists(appRoot))) continue;

    const workbenchDir = path.join(appRoot, 'out', 'vs', 'workbench');
    const productJsonPath = path.join(appRoot, 'product.json');

    // Clean HTML files
    for (const subdir of subdirs) {
      const wbPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench.html');
      const secPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench-jetski-agent.html');

      await cleanHtmlFile(wbPath);
      await cleanHtmlFile(secPath);
    }

    // Remove injected JS and CSS files
    for (const c of cssFilenames) {
      try {
        await fs.unlink(path.join(workbenchDir, c));
        console.log(`Deleted ${c} from ${workbenchDir}`);
      } catch (e) {}
    }
    for (const j of jsFilenames) {
      try {
        await fs.unlink(path.join(workbenchDir, j));
        console.log(`Deleted ${j} from ${workbenchDir}`);
      } catch (e) {}
    }

    // Restore product.json if backup exists
    const prodBackup = productJsonPath + '.bak';
    if (await fileExists(prodBackup)) {
      try {
        await fs.copyFile(prodBackup, productJsonPath);
        await fs.unlink(prodBackup);
        console.log('Restored product.json from backup.');
      } catch (e) {}
    }
  }

  console.log('IDE workbench restore completed successfully.');
}

run().catch((err) => {
  console.error('Error during unpatch:', err);
});
