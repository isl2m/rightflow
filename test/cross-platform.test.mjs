import test from 'node:test';
import assert from 'node:assert/strict';
import { getCandidateRoots } from '../scripts/common.mjs';

test('Cross-platform: Windows candidate roots resolution', () => {
  const winRoots = getCandidateRoots('win32');
  assert.ok(Array.isArray(winRoots));
  assert.ok(winRoots.length > 0);
  const hasApp = winRoots.some(r => r.includes('Antigravity') || r.includes('cursor') || r.includes('Microsoft VS Code') || r.includes('Windsurf'));
  assert.ok(hasApp, 'Should include Windows IDE installation paths');
});

test('Cross-platform: macOS candidate roots resolution', () => {
  const macRoots = getCandidateRoots('darwin');
  assert.ok(Array.isArray(macRoots));
  assert.ok(macRoots.length > 0);
  const hasApp = macRoots.some(r => r.startsWith('/Applications/') || r.includes('.app'));
  assert.ok(hasApp, 'Should include macOS /Applications paths');
});

test('Cross-platform: Linux candidate roots resolution', () => {
  const linuxRoots = getCandidateRoots('linux');
  assert.ok(Array.isArray(linuxRoots));
  assert.ok(linuxRoots.length > 0);
  const hasLinuxDirs = linuxRoots.some(r => r.startsWith('/usr/') || r.startsWith('/opt/') || r.includes('.local'));
  assert.ok(hasLinuxDirs, 'Should include Linux /usr, /opt, or .local paths');
});

test('Cross-platform: roots list is deduplicated', () => {
  const roots = getCandidateRoots();
  const set = new Set(roots);
  assert.equal(roots.length, set.size, 'Candidate roots must not have duplicate entries');
});
