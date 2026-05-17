'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Tests for .gitignore changes introduced in this PR.
// PR added a standalone `.env` line to prevent accidental commits of environment files.

const gitignorePath = path.resolve(__dirname, '..', '.gitignore');

function loadGitignoreLines() {
  const content = fs.readFileSync(gitignorePath, 'utf8');
  return content.split('\n').map((line) => line.trimEnd());
}

describe('.gitignore - file validity', () => {
  it('file exists', () => {
    assert.ok(fs.existsSync(gitignorePath), '.gitignore should exist at the project root');
  });

  it('file is not empty', () => {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert.ok(content.trim().length > 0, '.gitignore should not be empty');
  });
});

describe('.gitignore - .env entry (PR addition)', () => {
  it('contains an exact .env line (the PR addition)', () => {
    const lines = loadGitignoreLines();
    assert.ok(
      lines.includes('.env'),
      '.gitignore should include an exact ".env" line to prevent committing the root .env file'
    );
  });

  it('.env line appears before .env*.local', () => {
    const lines = loadGitignoreLines();
    const envIndex = lines.indexOf('.env');
    const envLocalIndex = lines.indexOf('.env*.local');
    assert.ok(envIndex !== -1, '.env line should exist');
    assert.ok(envLocalIndex !== -1, '.env*.local line should exist');
    assert.ok(
      envIndex < envLocalIndex,
      '.env should appear before .env*.local in the file (matches the PR diff order)'
    );
  });

  it('the .env entry is not a comment', () => {
    const lines = loadGitignoreLines();
    const envLine = lines.find((line) => line === '.env');
    assert.ok(envLine !== undefined, '.env should be present as a non-comment line');
    assert.ok(!envLine.startsWith('#'), '.env entry should not be commented out');
  });

  it('.env entry is an exact match (not .env.something)', () => {
    const lines = loadGitignoreLines();
    // Ensure there is a line that is exactly ".env" with no suffix.
    const exactMatch = lines.some((line) => line === '.env');
    assert.ok(exactMatch, 'There should be a line exactly matching ".env" with no suffix or prefix');
  });
});

describe('.gitignore - existing env patterns are preserved', () => {
  it('still contains .env*.local', () => {
    const lines = loadGitignoreLines();
    assert.ok(
      lines.includes('.env*.local'),
      '.gitignore should still contain .env*.local for local environment overrides'
    );
  });

  it('both .env and .env*.local are in the local env files section', () => {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    // The section comment should appear before both entries.
    const sectionComment = '# local env files';
    const sectionIndex = content.indexOf(sectionComment);
    assert.ok(sectionIndex !== -1, 'Should have a "# local env files" section comment');

    const envIndex = content.indexOf('\n.env\n', sectionIndex);
    const envLocalIndex = content.indexOf('\n.env*.local\n', sectionIndex);

    assert.ok(
      envIndex !== -1,
      '.env should appear after the "# local env files" section comment'
    );
    assert.ok(
      envLocalIndex !== -1,
      '.env*.local should appear after the "# local env files" section comment'
    );
  });
});

describe('.gitignore - other critical patterns still present', () => {
  it('ignores node_modules/', () => {
    const lines = loadGitignoreLines();
    assert.ok(
      lines.includes('node_modules/'),
      '.gitignore should still ignore node_modules/'
    );
  });

  it('ignores .expo/', () => {
    const lines = loadGitignoreLines();
    assert.ok(lines.includes('.expo/'), '.gitignore should still ignore the .expo/ directory');
  });

  it('ignores dist/', () => {
    const lines = loadGitignoreLines();
    assert.ok(lines.includes('dist/'), '.gitignore should still ignore the dist/ directory');
  });

  it('ignores .DS_Store', () => {
    const lines = loadGitignoreLines();
    assert.ok(lines.includes('.DS_Store'), '.gitignore should still ignore macOS .DS_Store files');
  });

  it('ignores *.pem key files', () => {
    const lines = loadGitignoreLines();
    assert.ok(lines.includes('*.pem'), '.gitignore should still ignore .pem certificate/key files');
  });
});
