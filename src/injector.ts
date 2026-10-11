import * as fs from 'fs/promises';
import * as path from 'path';
import { IdeInstallation, InjectionResult, InstallationStatus } from './types';
import {
  INJECTED_CSS,
  INJECTED_CSS_FILENAME,
  INJECTED_JS,
  INJECTED_JS_FILENAME,
  getInjectedCss,
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
    const expectedCss = getInjectedCss();
    assetsUpToDate =
      cssContent === expectedCss && jsContent === INJECTED_JS;
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
    // 2b. Modify secondary HTML (Antigravity Jetski Agent Panel) if present
    if (installation.secondaryHtmlPath) {
      const secBackup = installation.secondaryHtmlPath + '.bak';
      if (!(await fileExists(secBackup))) {
        await fs.copyFile(installation.secondaryHtmlPath, secBackup);
        messages.push(`Created backup: ${path.basename(secBackup)}`);
      }

      let secHtml = await fs.readFile(installation.secondaryHtmlPath, 'utf-8');
      secHtml = secHtml.replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
        ''
      );
      secHtml = secHtml.replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
        ''
      );

      let secChanged = false;
      if (!secHtml.includes(INJECTED_CSS_FILENAME)) {
        secHtml = secHtml.replace('</head>', cssTag);
        secChanged = true;
      }
      if (!secHtml.includes(INJECTED_JS_FILENAME)) {
        secHtml = secHtml.replace('</html>', jsTag);
        secChanged = true;
      }

      if (secChanged) {
        await fs.writeFile(installation.secondaryHtmlPath, secHtml, 'utf-8');
        messages.push(`Patched ${path.basename(installation.secondaryHtmlPath)}`);
        changed = true;
      }
    }

    // 3. Ensure workbenchDir exists and write injected CSS & JS
    await fs.mkdir(installation.workbenchDir, { recursive: true });
    const targetCssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const targetJsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );

    await fs.writeFile(targetCssPath, getInjectedCss(), 'utf-8');
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
        if (prodJson.checksums[installation.checksumKey]) {
          delete prodJson.checksums[installation.checksumKey];
          prodChanged = true;
        }
        if (
          installation.secondaryChecksumKey &&
          prodJson.checksums[installation.secondaryChecksumKey]
        ) {
          delete prodJson.checksums[installation.secondaryChecksumKey];
          prodChanged = true;
        }
        if (prodChanged) {
          await fs.writeFile(
            installation.productJsonPath,
            JSON.stringify(prodJson, null, '	'),
            'utf-8'
          );
          messages.push('Updated product.json checksums');
          changed = true;
        }
      }
    } catch {
      messages.push('Notice: Could not modify product.json checksums');
    }

    return { messages, changed, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EACCES' || err.code === 'EPERM';
    messages.push(`Error: ${err.message}`);
    return { messages, changed, permissionError: isPerm };
  }
}

export async function removeRtl(
  installation: IdeInstallation
): Promise<InjectionResult> {
  const messages: string[] = [];
  let changed = false;

  try {
    const htmlBackup = installation.workbenchHtmlPath + '.bak';
    if (await fileExists(htmlBackup)) {
      await fs.copyFile(htmlBackup, installation.workbenchHtmlPath);
      await fs.unlink(htmlBackup);
      messages.push(`Restored ${path.basename(installation.workbenchHtmlPath)}`);
      changed = true;
    }
    let html = await fs.readFile(installation.workbenchHtmlPath, 'utf-8');
    const cleanedHtml = html
      .replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
        ''
      )
      .replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
        ''
      )
      .replace(/\s*<link rel="stylesheet"[^>]*rightflow\.css[^>]*>/gi, '')
      .replace(/\s*<script[^>]*rightflow\.js[^>]*><\/script>/gi, '');
    if (cleanedHtml !== html) {
      await fs.writeFile(installation.workbenchHtmlPath, cleanedHtml, 'utf-8');
      changed = true;
    }

    if (installation.secondaryHtmlPath) {
      const secBackup = installation.secondaryHtmlPath + '.bak';
      if (await fileExists(secBackup)) {
        await fs.copyFile(secBackup, installation.secondaryHtmlPath);
        await fs.unlink(secBackup);
        messages.push(`Restored ${path.basename(installation.secondaryHtmlPath)}`);
        changed = true;
      }
      let secHtml = await fs.readFile(installation.secondaryHtmlPath, 'utf-8');
      const cleanedSec = secHtml
        .replace(
          /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
          ''
        )
        .replace(
          /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
          ''
        )
        .replace(/\s*<link rel="stylesheet"[^>]*rightflow\.css[^>]*>/gi, '')
        .replace(/\s*<script[^>]*rightflow\.js[^>]*><\/script>/gi, '');
      if (cleanedSec !== secHtml) {
        await fs.writeFile(installation.secondaryHtmlPath, cleanedSec, 'utf-8');
        changed = true;
      }
    }

    const productBackup = installation.productJsonPath + '.bak';
    if (await fileExists(productBackup)) {
      await fs.copyFile(productBackup, installation.productJsonPath);
      await fs.unlink(productBackup);
      messages.push(`Restored ${path.basename(installation.productJsonPath)}`);
      changed = true;
    }

    const targetCss = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const targetJs = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );
    if (await fileExists(targetCss)) await fs.unlink(targetCss);
    if (await fileExists(targetJs)) await fs.unlink(targetJs);
    messages.push('Cleaned injected assets');
    changed = true;

    return { messages, changed, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EACCES' || err.code === 'EPERM';
    messages.push(`Error: ${err.message}`);
    return { messages, changed, permissionError: isPerm };
  }
}

export async function reinjectAssets(
  installation: IdeInstallation
): Promise<void> {
  await fs.mkdir(installation.workbenchDir, { recursive: true });
  const targetCss = path.join(
    installation.workbenchDir,
    INJECTED_CSS_FILENAME
  );
  const targetJs = path.join(
    installation.workbenchDir,
    INJECTED_JS_FILENAME
  );
  await fs.writeFile(targetCss, getInjectedCss(), 'utf-8');
  await fs.writeFile(targetJs, INJECTED_JS, 'utf-8');
}
