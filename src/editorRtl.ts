import * as vscode from 'vscode';

let isEditorRtlActive = false;

export function registerEditorRtlCommands(context: vscode.ExtensionContext) {
  // Command: Toggle RTL mode for the active Monaco editor
  const toggleCmd = vscode.commands.registerCommand(
    'rightflow.toggleEditorRtl',
    async () => {
      isEditorRtlActive = !isEditorRtlActive;
      const status = isEditorRtlActive
        ? 'RTL (\u0645\u0646 \u0627\u0644\u064a\u0645\u064a\u0646 \u0644\u0644\u064a\u0633\u0627\u0631)'
        : 'LTR (\u0645\u0646 \u0627\u0644\u064a\u0633\u0627\u0631 \u0644\u0644\u064a\u0645\u064a\u0646)';

      vscode.window.setStatusBarMessage(`RightFlow: ${status}`, 3000);
      vscode.window.showInformationMessage(
        `RightFlow: \u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0645\u062d\u0631\u0631 \u0625\u0644\u0649 ${status}. (\u064a\u0645\u0643\u0646\u0643 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0632\u0631 \u0641\u064a \u0634\u0631\u064a\u0637 \u0627\u0644\u0623\u062f\u0648\u0627\u062a \u0623\u0648 \u0627\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 Ctrl+Alt+R)`
      );
    }
  );

  context.subscriptions.push(toggleCmd);
}
