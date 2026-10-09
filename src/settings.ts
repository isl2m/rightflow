import * as vscode from 'vscode';

export async function setupRecommendedArabicFonts() {
  const config = vscode.workspace.getConfiguration();

  const choice = await vscode.window.showQuickPick(
    [
      {
        label: 'Apply to Markdown & Plan Files Only ([markdown])',
        description: 'Recommended: Enhances readability in .md & .plan.md without altering code files',
        target: 'markdown',
      },
      {
        label: 'Apply Globally to All Files',
        description: 'Applies Arabic font stack to all editor files',
        target: 'global',
      },
    ],
    {
      placeHolder: 'Select where to apply high-readability Arabic typography',
    }
  );

  if (!choice) return;

  const arabicFontStack = "'Segoe UI', 'Cairo', 'Tajawal', Consolas, 'Courier New', monospace";

  try {
    if (choice.target === 'markdown') {
      const currentMd = config.get<any>('[markdown]') || {};
      await config.update(
        '[markdown]',
        {
          ...currentMd,
          'editor.fontFamily': arabicFontStack,
          'editor.lineHeight': 26,
        },
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        'RightFlow: High-readability Arabic fonts configured for Markdown & Plan files!'
      );
    } else {
      await config.update(
        'editor.fontFamily',
        arabicFontStack,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        'RightFlow: Arabic fonts configured globally for the editor!'
      );
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`Failed to update settings: ${err.message}`);
  }
}
