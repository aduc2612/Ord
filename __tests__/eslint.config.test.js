'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const configPath = path.resolve(__dirname, '..', 'eslint.config.js');

// Check whether the ESLint dependencies are available (requires npm install).
function areDepsAvailable() {
  try {
    require.resolve('eslint/config');
    require.resolve('eslint-config-expo/flat');
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Source-level tests: do not require installed dependencies.
// These always run and verify the static structure of eslint.config.js.
// ---------------------------------------------------------------------------

describe('eslint.config.js source file', () => {
  it('file exists at project root', () => {
    assert.ok(fs.existsSync(configPath), 'eslint.config.js should exist at the project root');
  });

  it('uses defineConfig from eslint/config', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      source.includes("require('eslint/config')") || source.includes('require("eslint/config")'),
      'Should import defineConfig from eslint/config'
    );
    assert.ok(source.includes('defineConfig'), 'Should call defineConfig to wrap the config array');
  });

  it('requires eslint-config-expo/flat for Expo linting rules', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      source.includes('eslint-config-expo/flat'),
      'Should require eslint-config-expo/flat for Expo-specific linting rules'
    );
  });

  it('ignores the dist/* build output directory', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      source.includes('dist/*'),
      'Config source should reference "dist/*" to ignore the build output directory'
    );
  });

  it('is valid CommonJS (uses module.exports, not ESM export)', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      source.includes('module.exports'),
      'eslint.config.js should export via module.exports (CommonJS)'
    );
  });

  it('assigns defineConfig result to module.exports', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    assert.match(
      source,
      /module\.exports\s*=\s*defineConfig\s*\(/,
      'Should assign defineConfig(...) result to module.exports'
    );
  });

  it('expoConfig is the first argument to defineConfig', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    // expoConfig must appear inside the defineConfig array before the ignores object.
    const defineConfigIdx = source.indexOf('defineConfig(');
    const expoConfigIdx = source.indexOf('expoConfig', defineConfigIdx);
    const ignoresIdx = source.indexOf('ignores', defineConfigIdx);
    assert.ok(defineConfigIdx !== -1, 'defineConfig should be called');
    assert.ok(expoConfigIdx !== -1, 'expoConfig should be referenced inside defineConfig call');
    assert.ok(
      expoConfigIdx < ignoresIdx,
      'expoConfig should appear before the ignores entry in defineConfig'
    );
  });

  it('ignores entry is an object literal with only an ignores key', () => {
    const source = fs.readFileSync(configPath, 'utf8');
    // The ignores entry should look like: { ignores: ["dist/*"] }
    assert.match(
      source,
      /\{\s*ignores:\s*\[["']dist\/\*["']\],?\s*\}/,
      'The ignores entry should be { ignores: ["dist/*"] } with no other properties'
    );
  });
});

// ---------------------------------------------------------------------------
// Runtime tests: verify the loaded config structure.
// These are skipped when npm dependencies have not been installed yet.
// ---------------------------------------------------------------------------

describe('eslint.config.js runtime (requires npm install)', () => {
  it('can be required without errors', (t) => {
    if (!areDepsAvailable()) {
      t.skip('Skipping: eslint/config and eslint-config-expo not installed');
      return;
    }
    assert.doesNotThrow(() => require(configPath), 'eslint.config.js should require without throwing');
  });

  it('exports an array (flat config format)', (t) => {
    if (!areDepsAvailable()) {
      t.skip('Skipping: eslint/config and eslint-config-expo not installed');
      return;
    }
    const config = require(configPath);
    assert.ok(Array.isArray(config), 'Config should export an array for ESLint flat config format');
  });

  it('exports a non-empty config array', (t) => {
    if (!areDepsAvailable()) {
      t.skip('Skipping: eslint/config and eslint-config-expo not installed');
      return;
    }
    const config = require(configPath);
    assert.ok(config.length > 0, 'Config array should not be empty');
  });

  it('config array contains an entry with ignores: ["dist/*"]', (t) => {
    if (!areDepsAvailable()) {
      t.skip('Skipping: eslint/config and eslint-config-expo not installed');
      return;
    }
    const config = require(configPath);
    const ignoresEntry = config.find(
      (entry) => entry && typeof entry === 'object' && Array.isArray(entry.ignores)
    );
    assert.ok(ignoresEntry, 'Config should contain an entry with an ignores array');
    assert.ok(
      ignoresEntry.ignores.includes('dist/*'),
      'ignores should include "dist/*" to exclude build output'
    );
  });

  it('ignores entry contains exactly ["dist/*"]', (t) => {
    if (!areDepsAvailable()) {
      t.skip('Skipping: eslint/config and eslint-config-expo not installed');
      return;
    }
    const config = require(configPath);
    // Find the entry that ONLY has an ignores key (the custom dist/* entry).
    const pureIgnoresEntry = config.find(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        Array.isArray(entry.ignores) &&
        Object.keys(entry).length === 1
    );
    assert.ok(
      pureIgnoresEntry,
      'There should be an entry with only an ignores array and no other properties'
    );
    assert.deepEqual(pureIgnoresEntry.ignores, ['dist/*']);
  });

  it('config has more than one entry (expo rules + custom ignores)', (t) => {
    if (!areDepsAvailable()) {
      t.skip('Skipping: eslint/config and eslint-config-expo not installed');
      return;
    }
    const config = require(configPath);
    assert.ok(
      config.length >= 2,
      'Config should have at least the expo config entries plus the ignores entry'
    );
  });
});