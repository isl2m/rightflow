import * as vscode from 'vscode';
import * as path from 'path';
import { findIdeInstallations } from './finder';
import {
  injectRtl,
  removeRtl,
  checkStatus,
  reinjectAssets,
  isAlreadyInjected,
} from './injector';
import {
  createStatusBarItem,
  updateStatusBarText,
  showRtlControlMenu,
  disposeStatusBar,
} from './statusBar';
import { registerEditorRtlCommands } from './editorRtl';
import { setupRecommendedArabicFonts } from './settings';
import { RtlMode } from './types';

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('RightFlow');
  }
  return outputChannel;
}

const STORAGE_MODE_KEY = 'rightflow.mode';
const STORAGE_VERSION_KEY = 'rightflow.version';

async function promptRestart(changed: boolean) {
  if (!changed) return;
  await updateStatusBarText();
  const choice = await vscode.window.showInformationMessage(
    'RightFlow: Changes successfully applied! Please reload the IDE window to activate RTL in all panels.',
    'Reload Window Now',
    'Later'
  );
  if (choice === 'Reload Window Now') {
    await vscode.commands.executeCommand('workbench.action.reloadWindow');
  }
}

async function handlePermissionError(workbenchPath: string) {
  const ideName = vscode.env.appName || 'the IDE';
  if (process.platform === 'win32') {
    vscode.window.showErrorMessage(
      `RightFlow: Permission denied. Please restart ${ideName} as Administrator to apply the patch.`
    );
  } else if (process.platform === 'darwin') {
    const appMatch = workbenchPath.match(/\/[^/]+\.app\//);
    const appDir = appMatch
      ? workbenchPath.substring(0, appMatch.index! + appMatch[0].length - 1)
      : `/Applications/${ideName}.app`;
    const fixCmd = `sudo chown -R $(whoami) "${appDir}"`;

    const choice = await vscode.window.showErrorMessage(
      'RightFlow: Permission denied. Run fix command in Terminal.',
      'Copy Fix Command'
    );
    if (choice === 'Copy Fix Command') {
      await vscode.env.clipboard.writeText(fixCmd);
      vscode.window.showInformationMessage(
        'Command copied! Paste it in Terminal, then re-activate.'
      );
    }
  } else if (process.platform === 'linux') {
    const appDir = vscode.env.appRoot || path.dirname(workbenchPath);
    const fixCmd = `sudo chown -R $(whoami) "${appDir}"`;

    const choice = await vscode.window.showErrorMessage(
      `RightFlow: Permission denied to patch ${ideName}. Run fix command in Terminal:`,
      'Copy Fix Command'
    );
    if (choice === 'Copy Fix Command') {
      await vscode.env.clipboard.writeText(fixCmd);
      vscode.window.showInformationMessage(
        'Command copied! Paste it in Terminal, then re-activate RightFlow.'
      );
    }
  } else {
    vscode.window.showErrorMessage(
      'RightFlow: Permission denied. Please check permissions for the IDE installation directory.'
    );
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const channel = getOutputChannel();
  const currentVersion = context.extension.packageJSON.version || '1.0.20';

  // Create status bar item
  const statusBar = createStatusBarItem();
  context.subscriptions.push(statusBar);

  // Register editor RTL commands
  registerEditorRtlCommands(context);

  // Command: Activate RTL Suite
  const activateCmd = vscode.commands.registerCommand(
    'rightflow.activate',
    async () => {
      const installations = await findIdeInstallations();
      if (installations.length === 0) {
        vscode.window.showWarningMessage(
          'RightFlow: Could not locate IDE installation directory.'
        );
        return;
      }

      channel.clear();
      channel.appendLine('Activating RightFlow Universal RTL Engine...');
      channel.appendLine('Supports: Antigravity IDE, Cursor, GitHub Copilot, Windsurf, Plans, Work, & Editor.\n');

      let anyChanged = false;
      let hasPermissionError = false;

      for (const inst of installations) {
        channel.appendLine(`[Target: ${inst.ideName}]`);
        const result = await injectRtl(inst);
        result.messages.forEach((msg) => channel.appendLine(`  ${msg}`));
        if (result.changed) anyChanged = true;
        if (result.permissionError) hasPermissionError = true;
      }

      channel.show(true);
      await context.globalState.update(STORAGE_MODE_KEY, 'active' as RtlMode);

      if (hasPermissionError) {
        await handlePermissionError(installations[0].workbenchHtmlPath);
      } else {
        await promptRestart(anyChanged);
        if (!anyChanged) {
          vscode.window.showInformationMessage(
            'RightFlow is already active and up to date.'
          );
        }
      }
    }
  );

  // Command: Deactivate RTL Suite
  const deactivateCmd = vscode.commands.registerCommand(
    'rightflow.deactivate',
    async () => {
      const installations = await findIdeInstallations();
      if (installations.length === 0) {
        vscode.window.showWarningMessage(
          'RightFlow: Could not locate IDE installation directory.'
        );
        return;
      }

      channel.clear();
      channel.appendLine('Deactivating RightFlow and restoring backups...\n');

      let anyChanged = false;
      for (const inst of installations) {
        channel.appendLine(`[Target: ${inst.ideName}]`);
        const result = await removeRtl(inst);
        result.messages.forEach((msg) => channel.appendLine(`  ${msg}`));
        if (result.changed) anyChanged = true;
      }

      channel.show(true);
      await context.globalState.update(STORAGE_MODE_KEY, 'inactive' as RtlMode);
      await promptRestart(anyChanged);
      if (!anyChanged) {
        vscode.window.showInformationMessage(
          'RightFlow is already inactive.'
        );
      }
    }
  );

  // Command: Control Menu
  const menuCmd = vscode.commands.registerCommand(
    'rightflow.toggleMenu',
    async () => {
      await showRtlControlMenu();
    }
  );

  // Command: Status & Diagnostics
  const statusCmd = vscode.commands.registerCommand(
    'rightflow.status',
    async () => {
      const installations = await findIdeInstallations();
      if (installations.length === 0) {
        vscode.window.showErrorMessage(
          'RightFlow: No IDE installation directory found.'
        );
        return;
      }

      channel.clear();
      channel.appendLine('=== RightFlow Diagnostics ===');
      channel.appendLine(`Version: ${currentVersion}`);
      channel.appendLine(`Platform: ${process.platform}`);
      channel.appendLine(`IDE: ${vscode.env.appName || 'Unknown'}`);
      channel.appendLine(`App Root: ${vscode.env.appRoot}\n`);

      for (const inst of installations) {
        channel.appendLine(`Target: ${inst.ideName}`);
        channel.appendLine(`  workbench.html: ${inst.workbenchHtmlPath}`);
        channel.appendLine(`  workbenchDir: ${inst.workbenchDir}`);
        channel.appendLine(`  product.json: ${inst.productJsonPath}`);

        const status = await checkStatus(inst);
        channel.appendLine(`  Installed: ${status.isInstalled}`);
        channel.appendLine(`  HTML Backup: ${status.htmlBackupExists}`);
        channel.appendLine(`  Product Backup: ${status.productBackupExists}`);
        channel.appendLine(`  Assets Up-to-Date: ${status.assetsUpToDate}`);
        if (inst.secondaryHtmlPath) {
          channel.appendLine(`  Secondary HTML: ${inst.secondaryHtmlPath}`);
        }
        channel.appendLine('');
      }

      channel.show(true);
    }
  );

  // Command: Restart / Re-inject
  const restartCmd = vscode.commands.registerCommand(
    'rightflow.restart',
    async () => {
      const installations = await findIdeInstallations();
      for (const inst of installations) {
        await reinjectAssets(inst);
      }
      vscode.window.showInformationMessage('RightFlow: Re-injected assets.');
      await promptRestart(true);
    }
  );

  // Command: Setup Arabic Typography in Editor
  const fontsCmd = vscode.commands.registerCommand(
    'rightflow.setupFonts',
    async () => {
      await setupRecommendedArabicFonts();
    }
  );

  // Command: Toggle Chat RTL Mode
  const toggleChatCmd = vscode.commands.registerCommand(
    'rightflow.toggleChatRtl',
    async () => {
      const installations = await findIdeInstallations();
      if (installations.length === 0) {
        vscode.window.showWarningMessage(
          'RightFlow: Could not locate IDE installation directory.'
        );
        return;
      }

      const status = await checkStatus(installations[0]);
      if (status.isInstalled) {
        const choice = await vscode.window.showQuickPick(
          [
            {
              label: '$(sync) Deactivate RTL Suite',
              description: 'Restore original workbench.html and remove patches',
              action: 'deactivate',
            },
            {
              label: '$(refresh) Re-inject & Update Assets',
              description: 'Refresh rightflow.css and rightflow.js in workbench',
              action: 'restart',
            },
            {
              label: '$(gear) Configure Arabic Typography',
              description: 'Setup fonts for Markdown, Plans, and Editor',
              action: 'fonts',
            },
            {
              label: '$(menu) Open Control Menu',
              description: 'View full RightFlow diagnostic and control options',
              action: 'menu',
            },
          ],
          {
            placeHolder: 'RightFlow Chat RTL Suite is currently active. Select an action:',
          }
        );

        if (choice?.action === 'deactivate') {
          await vscode.commands.executeCommand('rightflow.deactivate');
        } else if (choice?.action === 'restart') {
          await vscode.commands.executeCommand('rightflow.restart');
        } else if (choice?.action === 'fonts') {
          await vscode.commands.executeCommand('rightflow.setupFonts');
        } else if (choice?.action === 'menu') {
          await vscode.commands.executeCommand('rightflow.toggleMenu');
        }
      } else {
        await vscode.commands.executeCommand('rightflow.activate');
      }
    }
  );

  // Auto-sync configuration updates to injected CSS
  const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration('rightflow')) {
      const installations = await findIdeInstallations();
      for (const inst of installations) {
        const isInst = await isAlreadyInjected(inst);
        if (isInst) {
          await reinjectAssets(inst);
        }
      }
      await updateStatusBarText();
    }
  });

  // Auto-update assets across extension upgrades
  const prevVersion = context.globalState.get<string>(STORAGE_VERSION_KEY);
  if (prevVersion && prevVersion !== currentVersion) {
    const installations = await findIdeInstallations();
    for (const inst of installations) {
      const isInst = await isAlreadyInjected(inst);
      if (isInst) {
        await reinjectAssets(inst);
      }
    }
  }
  await context.globalState.update(STORAGE_VERSION_KEY, currentVersion);

  context.subscriptions.push(
    activateCmd,
    deactivateCmd,
    menuCmd,
    statusCmd,
    restartCmd,
    fontsCmd,
    toggleChatCmd,
    configWatcher
  );

  await updateStatusBarText();
}

export function deactivate() {
  disposeStatusBar();
}
