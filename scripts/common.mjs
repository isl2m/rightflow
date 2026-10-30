import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export function patchCspTrustedTypes(html) {
  const ttRegex = /(?<!require-)(trusted-types\s+)([^;]+?)(;)/i;
  const match = html.match(ttRegex);
  if (!match) {
    return { html, changed: false };
  }

  const existingPolicies = match[2];
  if (/\b\*\b/.test(existingPolicies) || /\brightflow\b/.test(existingPolicies)) {
    return { html, changed: false };
  }

  const needsAllowDuplicates = !existingPolicies.includes("'allow-duplicates'");
  const addition = ` rightflow${needsAllowDuplicates ? " 'allow-duplicates'" : ''}`;

  const trailingWhitespaceMatch = existingPolicies.match(/\s+$/);
  let updatedPolicies = '';
  if (trailingWhitespaceMatch) {
    const trailingWs = trailingWhitespaceMatch[0];
    const base = existingPolicies.slice(0, -trailingWs.length);
    updatedPolicies = `${base}${addition}${trailingWs}`;
  } else {
    updatedPolicies = `${existingPolicies}${addition}`;
  }

  const updatedHtml = html.replace(ttRegex, `$1${updatedPolicies}$3`);
  return { html: updatedHtml, changed: true };
}

export function unpatchCspTrustedTypes(html) {
  const ttRegex = /(?<!require-)(trusted-types\s+)([^;]+?)(;)/i;
  const match = html.match(ttRegex);
  if (!match) {
    return { html, changed: false };
  }

  const existingPolicies = match[2];
  if (!/\brightflow\b/.test(existingPolicies)) {
    return { html, changed: false };
  }

  let cleanedPolicies = existingPolicies
    .replace(/\s*rightflow\b/g, '')
    .replace(/\s*'allow-duplicates'/g, '');

  const updatedHtml = html.replace(ttRegex, `$1${cleanedPolicies}$3`);
  return { html: updatedHtml, changed: true };
}

export function getCandidateRoots(overridePlatform) {
  const home = os.homedir();
  const roots = [];
  const currentPlatform = overridePlatform || process.platform;

  // Environment overrides & CLI arguments
  if (process.argv[2]) roots.push(path.resolve(process.argv[2]));
  if (process.env.ANTIGRAVITY_APP_ROOT) roots.push(process.env.ANTIGRAVITY_APP_ROOT);
  if (process.env.VSCODE_APP_ROOT) roots.push(process.env.VSCODE_APP_ROOT);
  if (process.env.CURSOR_APP_ROOT) roots.push(process.env.CURSOR_APP_ROOT);
  if (process.env.WINDSURF_APP_ROOT) roots.push(process.env.WINDSURF_APP_ROOT);

  if (currentPlatform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

    roots.push(
      path.join(localAppData, 'Programs', 'Antigravity IDE', 'resources', 'app'),
      path.join(localAppData, 'Programs', 'cursor', 'resources', 'app'),
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'resources', 'app'),
      path.join(programFiles, 'Microsoft VS Code', 'resources', 'app'),
      path.join(programFilesX86, 'Microsoft VS Code', 'resources', 'app'),
      path.join(localAppData, 'Programs', 'Windsurf', 'resources', 'app'),
      path.join(programFiles, 'Windsurf', 'resources', 'app')
    );
  } else if (currentPlatform === 'darwin') {
    roots.push(
      '/Applications/Antigravity IDE.app/Contents/Resources/app',
      '/Applications/Visual Studio Code.app/Contents/Resources/app',
      '/Applications/Cursor.app/Contents/Resources/app',
      '/Applications/Windsurf.app/Contents/Resources/app',
      path.join(home, 'Applications', 'Antigravity IDE.app', 'Contents', 'Resources', 'app'),
      path.join(home, 'Applications', 'Visual Studio Code.app', 'Contents', 'Resources', 'app'),
      path.join(home, 'Applications', 'Cursor.app', 'Contents', 'Resources', 'app'),
      path.join(home, 'Applications', 'Windsurf.app', 'Contents', 'Resources', 'app')
    );
  } else {
    // Linux locations
    roots.push(
      '/usr/share/code/resources/app',
      '/usr/lib/code/resources/app',
      '/opt/visual-studio-code/resources/app',
      '/opt/cursor/resources/app',
      '/opt/Windsurf/resources/app',
      '/usr/share/windsurf/resources/app',
      '/usr/share/antigravity/resources/app',
      '/opt/antigravity/resources/app',
      path.join(home, '.local', 'share', 'programs', 'cursor', 'resources', 'app'),
      path.join(home, '.local', 'share', 'programs', 'windsurf', 'resources', 'app')
    );
  }

  return [...new Set(roots.filter(Boolean))];
}
