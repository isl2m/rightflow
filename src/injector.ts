import * as fs from 'fs/promises';
import * as path from 'path';
import { IdeInstallation, InjectionResult, InstallationStatus } from './types';
import {
  INJECTED_CSS,
  INJECTED_CSS_FILENAME,
  INJECTED_JS,
  INJECTED_JS_FILENAME,
} from './content';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function isAlreadyInjected(
  installation: IdeInstallation
): Promise<boolean> {
  try {
    const htmlContent = await fs.readFile(
      installation.workbenchHtmlPath,
      'utf-8'
    );
    return (
      htmlContent.includes(INJECTED_CSS_FILENAME) &&
      htmlContent.includes(INJECTED_JS_FILENAME)
    );
  } catch {
    return false;
  }
}

export async function checkStatus(
  installation: IdeInstallation
): Promise<InstallationStatus> {
  const isInstalled = await isAlreadyInjected(installation);
  const htmlBackupExists = await fileExists(
    installation.workbenchHtmlPath + '.bak'
  );
  const productBackupExists = await fileExists(
    installation.productJsonPath + '.bak'
  );

  let assetsUpToDate = false;
  try {
    const cssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const jsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    const jsContent = await fs.readFile(jsPath, 'utf-8');
    assetsUpToDate =
      cssContent === INJECTED_CSS && jsContent === INJECTED_JS;
  } catch {
    assetsUpToDate = false;
  }

  return {
    installation,
    isInstalled,
    htmlBackupExists,
    productBackupExists,
    assetsUpToDate,
  };
}

export async function injectRtl(
  installation: IdeInstallation
): Promise<InjectionResult> {
  const messages: string[] = [];
  let changed = false;

  try {
    // 1. Create backups if not exist
    const htmlBackup = installation.workbenchHtmlPath + '.bak';
    if (!(await fileExists(htmlBackup))) {
      await fs.copyFile(installation.workbenchHtmlPath, htmlBackup);
      messages.push(`Created backup: ${path.basename(htmlBackup)}`);
    }

    const productBackup = installation.productJsonPath + '.bak';
    if (!(await fileExists(productBackup))) {
      await fs.copyFile(installation.productJsonPath, productBackup);
      messages.push(`Created backup: ${path.basename(productBackup)}`);
    }

    // 2. Modify workbench.html
    let html = await fs.readFile(installation.workbenchHtmlPath, 'utf-8');

    // Clean up any legacy injection from previous versions or other extensions
    html = html.replace(
      /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
      ''
    );
    html = html.replace(
      /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
      ''
    );

    const cssTag = `\t<!-- RightFlow -->\n\t<link rel="stylesheet" href="../../../workbench/${INJECTED_CSS_FILENAME}">\n</head>`;
    const jsTag = `\t<!-- RightFlow -->\n\t<script src="../../../workbench/${INJECTED_JS_FILENAME}"></script>\n</html>`;

    let htmlChanged = false;
    if (!html.includes(INJECTED_CSS_FILENAME)) {
      html = html.replace('</head>', cssTag);
      htmlChanged = true;
    }
    if (!html.includes(INJECTED_JS_FILENAME)) {
      html = html.replace('</html>', jsTag);
      htmlChanged = true;
    }

    if (htmlChanged) {
      await fs.writeFile(installation.workbenchHtmlPath, html, 'utf-8');
      messages.push(`Patched ${path.basename(installation.workbenchHtmlPath)}`);
      changed = true;
    }

    // 3. Write injected CSS & JS to out/vs/workbench
    const targetCssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const targetJsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );

    await fs.writeFile(targetCssPath, INJECTED_CSS, 'utf-8');
    await fs.writeFile(targetJsPath, INJECTED_JS, 'utf-8');
    messages.push(`Assets deployed to ${installation.workbenchDir}`);
    changed = true;

    // 4. Update product.json checksums to avoid [Unsupported] warning
    try {
      const prodJsonStr = await fs.readFile(
        installation.productJsonPath,
        'utf-8'
      );
      const prodJson = JSON.parse(prodJsonStr);
      if (prodJson.checksums) {
        let prodChanged = false;
        if (installation.checksumKey in prodJson.checksums) {
          delete prodJson.checksums[installation.checksumKey];
          prodChanged = true;
        }
        if (
          installation.secondaryChecksumKey &&
          installation.secondaryChecksumKey in prodJson.checksums
        ) {
          delete prodJson.checksums[installation.secondaryChecksumKey];
          prodChanged = true;
        }
        if (prodChanged) {
          await fs.writeFile(
            installation.productJsonPath,
            JSON.stringify(prodJson, null, '\t'),
            'utf-8'
          );
          messages.push('Updated product.json checksums');
          changed = true;
        }
      }
    } catch (err: any) {
      messages.push(`Warning updating product.json: ${err.message}`);
    }

    return { messages, changed, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EPERM' || err.code === 'EACCES';
    messages.push(`Injection error: ${err.message}`);
    return { messages, changed: false, permissionError: isPerm };
  }
}

export async function removeRtl(
  installation: IdeInstallation
): Promise<InjectionResult> {
  const messages: string[] = [];
  let changed = false;

  try {
    // 1. Restore workbench.html from backup if available
    const htmlBackup = installation.workbenchHtmlPath + '.bak';
    if (await fileExists(htmlBackup)) {
      await fs.copyFile(htmlBackup, installation.workbenchHtmlPath);
      messages.push(
        `Restored ${path.basename(installation.workbenchHtmlPath)} from backup`
      );
      changed = true;
    } else {
      // Clean tags manually
      let html = await fs.readFile(installation.workbenchHtmlPath, 'utf-8');
      html = html.replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)\s*-->\s*<link rel="stylesheet"[^>]+>/gi,
        ''
      );
      html = html.replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)\s*-->\s*<script[^>]+><\/script>/gi,
        ''
      );
      await fs.writeFile(installation.workbenchHtmlPath, html, 'utf-8');
      messages.push(
        `Cleaned tags from ${path.basename(installation.workbenchHtmlPath)}`
      );
      changed = true;
    }

    // 2. Remove injected files
    const targetCssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const targetJsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );

    if (await fileExists(targetCssPath)) {
      await fs.unlink(targetCssPath);
      messages.push(`Removed ${INJECTED_CSS_FILENAME}`);
    }
    if (await fileExists(targetJsPath)) {
      await fs.unlink(targetJsPath);
      messages.push(`Removed ${INJECTED_JS_FILENAME}`);
    }

    // 3. Restore product.json if backup exists
    const productBackup = installation.productJsonPath + '.bak';
    if (await fileExists(productBackup)) {
      await fs.copyFile(productBackup, installation.productJsonPath);
      messages.push('Restored product.json from backup');
      changed = true;
    }

    return { messages, changed, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EPERM' || err.code === 'EACCES';
    messages.push(`Removal error: ${err.message}`);
    return { messages, changed: false, permissionError: isPerm };
  }
}

export async function reinjectAssets(
  installation: IdeInstallation
): Promise<InjectionResult> {
  const messages: string[] = [];
  try {
    const cssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const jsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );

    await fs.writeFile(cssPath, INJECTED_CSS, 'utf-8');
    await fs.writeFile(jsPath, INJECTED_JS, 'utf-8');
    messages.push('Updated injected CSS & JS assets to latest version');
    return { messages, changed: true, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EPERM' || err.code === 'EACCES';
    messages.push(`Asset refresh error: ${err.message}`);
    return { messages, changed: false, permissionError: isPerm };
  }
}
