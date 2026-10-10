import * as vscode from 'vscode';
import { findIdeInstallations } from './finder';
import { checkStatus } from './injector';

let statusBarItem: vscode.StatusBarItem | undefined;

export function createStatusBarItem(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    98
  );
  statusBarItem.command = 'rightflow.toggleMenu';
  statusBarItem.show();
  return statusBarItem;
}

export async function updateStatusBarText() {
  if (!statusBarItem) return;

  const installations = await findIdeInstallations();
  if (installations.length === 0) {
    statusBarItem.text = '$(globe) RTL: N/A';
    statusBarItem.tooltip = 'RightFlow: IDE installation not detected';
    return;
  }

  const statuses = await Promise.all(
    installations.map((inst) => checkStatus(inst))
  );

  const isInstalled = statuses.some((s) => s.isInstalled);

  if (isInstalled) {
    statusBarItem.text = '$(globe) RTL: On';
    statusBarItem.tooltip =
      'RightFlow is Active (Chat, Plans, Work & Previews). Click for controls.';
  } else {
    statusBarItem.text = '$(globe) RTL: Off';
    statusBarItem.tooltip =
      'RightFlow is Inactive. Click to activate or configure.';
  }
}

export async function showRtlControlMenu() {
  const ideName = vscode.env.appName || 'IDE';
  const installations = await findIdeInstallations();
  const isInstalled =
    installations.length > 0 &&
    (await Promise.all(installations.map((inst) => checkStatus(inst)))).some(
      (s) => s.isInstalled
    );

  const items: vscode.QuickPickItem[] = [
    {
      label: isInstalled ? '$(check) RTL Suite: Active' : '$(play) Activate RTL Suite',
      description: isInstalled
        ? 'Workbench, Chat, Plans & Artifacts are patched'
        : `Patch ${ideName} workbench for Chat, Plans & Work`,
      detail: isInstalled ? 'Click to re-inject/update assets' : 'Requires IDE reload after first patch',
    },
    {
      label: '$(edit) Toggle Editor RTL Direction',
      description: 'Shortcut: Ctrl+Alt+R',
      detail: 'Toggles text direction for the currently open file (like .md or .plan.md)',
    },
    {
      label: '$(type-hierarchy) Setup Arabic Typography in Editor',
      description: 'Configure Segoe UI / Cairo fonts for Markdown & Plan files',
      detail: 'Improves Arabic rendering and line spacing in the code editor',
    },
    {
      label: '$(info) Check RTL Status & Diagnostics',
      detail: 'View installation status and backup info',
    },
  ];

  if (isInstalled) {
    items.push({
      label: '$(trash) Deactivate RTL Suite',
      description: 'Restore original workbench.html and remove patches',
    });
  }

  items.push({
    label: `$(sync) Reload ${ideName} Window`,
    description: 'Instantly reloads window to apply changes',
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'RightFlow - Universal RTL Control Center',
  });

  if (!selected) return;

  if (selected.label.includes('Activate') || selected.label.includes('Active')) {
    await vscode.commands.executeCommand('rightflow.activate');
  } else if (selected.label.includes('Toggle Editor RTL')) {
    await vscode.commands.executeCommand('rightflow.toggleEditorRtl');
  } else if (selected.label.includes('Setup Arabic Typography')) {
    await vscode.commands.executeCommand('rightflow.setupFonts');
  } else if (selected.label.includes('Check RTL Status')) {
    await vscode.commands.executeCommand('rightflow.status');
  } else if (selected.label.includes('Deactivate')) {
    await vscode.commands.executeCommand('rightflow.deactivate');
  } else if (selected.label.includes('Reload')) {
    await vscode.commands.executeCommand('workbench.action.reloadWindow');
  }
}

export function disposeStatusBar() {
  statusBarItem?.dispose();
}
