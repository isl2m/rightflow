import * as vscode from 'vscode';

let isEditorRtlActive = false;

export function registerEditorRtlCommands(context: vscode.ExtensionContext) {
  // Command: Toggle RTL mode for the active Monaco editor
  const toggleCmd = vscode.commands.registerCommand(
    'rightflow.toggleEditorRtl',
    async () => {
      isEditorRtlActive = !isEditorRtlActive;
      const status = isEditorRtlActive ? 'RTL (اليمين)' : 'LTR (اليسار)';
      
      vscode.window.setStatusBarMessage(`RightFlow: ${status}`, 3000);
      vscode.window.showInformationMessage(
        `RightFlow: تم تبديل اتجاه المحرر إلى ${status}. (يمكنك التبديل مباشرة بالنقر على زر RTL في شريط أدوات المحرر أعلى اليمين أو استخدام اختصار Ctrl+Alt+R)`
      );
    }
  );

  context.subscriptions.push(toggleCmd);
}
