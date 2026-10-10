import * as vscode from 'vscode';
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
  if (process.platform === 'win32') {
    vscode.window.showErrorMessage(
      'RightFlow: Permission denied. Please restart Antigravity IDE as Administrator to apply the patch.'
    );
  } else if (process.platform === 'darwin') {
    const appMatch = workbenchPath.match(/\/[^/]+\.app\//);
    const appDir = appMatch
      ? workbenchPath.substring(0, appMatch.index! + appMatch[0].length - 1)
      : '/Applications/Antigravity IDE.app';
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
  } else {
    vscode.window.showErrorMessage(
      'RightFlow: Permission denied. Please check permissions for the IDE installation directory.'
    );
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const channel = getOutputChannel();
  const currentVersion = context.extension.packageJSON.version || '1.0.5';

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
      channel.appendLine('Activating RightFlow Engine...');
      channel.appendLine('Supports: Chat, Plans (*.plan.md), Work/Tasks, Artifacts, and Previews.\n');

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
    showRtlControlMenu
  );

  // Command: Setup Arabic Fonts
  const fontsCmd = vscode.commands.registerCommand(
    'rightflow.setupFonts',
    setupRecommendedArabicFonts
  );

  // Command: Status & Diagnostics
  const statusCmd = vscode.commands.registerCommand(
    'rightflow.status',
    async () => {
      const installations = await findIdeInstallations();
      channel.clear();
      channel.appendLine('=== RightFlow Diagnostics ===');
      channel.appendLine(`Extension Version: ${currentVersion}`);
      channel.appendLine(`Saved Mode: ${context.globalState.get(STORAGE_MODE_KEY, 'inactive')}\n`);

      if (installations.length === 0) {
        channel.appendLine('No IDE installation found.');
      } else {
        for (const inst of installations) {
          const s = await checkStatus(inst);
          channel.appendLine(`Installation: ${inst.ideName}`);
          channel.appendLine(`  RTL Patch Injected: ${s.isInstalled ? 'YES' : 'NO'}`);
          channel.appendLine(`  Assets Up to Date:  ${s.assetsUpToDate ? 'YES' : 'NO'}`);
          channel.appendLine(`  HTML Backup Exists: ${s.htmlBackupExists ? 'YES' : 'NO'}`);
          channel.appendLine(`  Workbench Path:     ${inst.workbenchHtmlPath}`);
          channel.appendLine(`  Workbench Dir:      ${inst.workbenchDir}`);
          channel.appendLine(`  Product.json:       ${inst.productJsonPath}\n`);
        }
      }

      channel.show(true);
      await updateStatusBarText();
    }
  );

  // Command: Restart/Re-inject
  const restartCmd = vscode.commands.registerCommand(
    'rightflow.restart',
    async () => {
      const installations = await findIdeInstallations();
      if (installations.length === 0) return;
      channel.clear();
      channel.appendLine('Re-injecting RightFlow assets...');
      let changed = false;
      for (const inst of installations) {
        const res = await reinjectAssets(inst);
        res.messages.forEach((m) => channel.appendLine(`  ${m}`));
        if (res.changed) changed = true;
      }
      channel.show(true);
      await promptRestart(changed);
    }
  );

  // Command: Toggle Chat RTL Mode
  const toggleChatCmd = vscode.commands.registerCommand(
    'rightflow.toggleChatRtl',
    () => {
      vscode.window.showInformationMessage(
        'RightFlow: Chat RTL applies automatically to Arabic text. You can also toggle it instantly using the RTL icon in the Chat header.'
      );
    }
  );

  context.subscriptions.push(
    activateCmd,
    deactivateCmd,
    menuCmd,
    toggleChatCmd,
    fontsCmd,
    statusCmd,
    restartCmd
  );

  // Auto-reactivate / update assets if needed
  checkAutoReactivate(context, currentVersion).catch((err) => {
    channel.appendLine(`Auto-check error: ${err}`);
  });

  // Initial status bar update
  updateStatusBarText().catch((err) => {
    channel.appendLine(`Status bar error: ${err}`);
  });
}

async function checkAutoReactivate(
  context: vscode.ExtensionContext,
  currentVersion: string
) {
  const savedVersion = context.globalState.get<string>(STORAGE_VERSION_KEY);
  const savedMode = context.globalState.get<RtlMode>(STORAGE_MODE_KEY);

  // If new extension version, update assets
  if (savedVersion !== currentVersion) {
    await context.globalState.update(STORAGE_VERSION_KEY, currentVersion);
    const installations = await findIdeInstallations();
    for (const inst of installations) {
      if (await isAlreadyInjected(inst)) {
        await reinjectAssets(inst);
      }
    }
  }

  // If mode is active, ensure injection is intact (e.g. after IDE upgrade)
  if (savedMode === 'active') {
    const installations = await findIdeInstallations();
    for (const inst of installations) {
      const injected = await isAlreadyInjected(inst);
      if (!injected) {
        const res = await injectRtl(inst);
        if (res.changed) {
          await promptRestart(true);
        }
      }
    }
  }
}

export function deactivate() {
  disposeStatusBar();
  outputChannel?.dispose();
}
