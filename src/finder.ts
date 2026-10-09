import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { IdeInstallation } from './types';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const CANDIDATE_SUBDIRS = ['electron-browser', 'electron-sandbox'];

export async function findIdeInstallations(): Promise<IdeInstallation[]> {
  const appRoot = vscode.env.appRoot;
  const productJsonPath = path.join(appRoot, 'product.json');
  if (!(await fileExists(productJsonPath))) {
    return [];
  }

  const workbenchDir = path.join(appRoot, 'out', 'vs', 'workbench');
  if (!(await fileExists(workbenchDir))) {
    return [];
  }

  const results: IdeInstallation[] = [];

  for (const subdir of CANDIDATE_SUBDIRS) {
    const workbenchHtmlPath = path.join(
      appRoot,
      'out',
      'vs',
      'code',
      subdir,
      'workbench',
      'workbench.html'
    );

    if (await fileExists(workbenchHtmlPath)) {
      const secondaryHtmlPath = path.join(
        appRoot,
        'out',
        'vs',
        'code',
        subdir,
        'workbench',
        'workbench-jetski-agent.html'
      );

      const hasSecondary = await fileExists(secondaryHtmlPath);

      results.push({
        ideName: vscode.env.appName || 'Antigravity IDE',
        workbenchHtmlPath,
        workbenchDir,
        productJsonPath,
        checksumKey: `vs/code/${subdir}/workbench/workbench.html`,
        secondaryHtmlPath: hasSecondary ? secondaryHtmlPath : undefined,
        secondaryChecksumKey: hasSecondary
          ? `vs/code/${subdir}/workbench/workbench-jetski-agent.html`
          : undefined,
      });

      return results;
    }
  }

  return results;
}
