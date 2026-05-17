'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Tests for app.json configuration.
// Covers all fields that were modified or added in this PR.

const appJsonPath = path.resolve(__dirname, '..', 'app.json');

function loadAppJson() {
  const raw = fs.readFileSync(appJsonPath, 'utf8');
  return JSON.parse(raw);
}

describe('app.json - file validity', () => {
  it('file exists', () => {
    assert.ok(fs.existsSync(appJsonPath), 'app.json should exist at the project root');
  });

  it('is valid JSON', () => {
    const raw = fs.readFileSync(appJsonPath, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'app.json must be valid JSON');
  });

  it('has a top-level "expo" key', () => {
    const config = loadAppJson();
    assert.ok('expo' in config, 'app.json should have a top-level "expo" key');
  });
});

describe('app.json - icon configuration (PR change)', () => {
  it('root icon uses ios-icon-default.png (changed from icon.png)', () => {
    const { expo } = loadAppJson();
    assert.equal(
      expo.icon,
      './assets/images/ios-icon-default.png',
      'expo.icon should point to ios-icon-default.png after the PR change'
    );
  });

  it('root icon does NOT use the old icon.png path', () => {
    const { expo } = loadAppJson();
    assert.notEqual(
      expo.icon,
      './assets/images/icon.png',
      'expo.icon should no longer reference the old icon.png'
    );
  });
});

describe('app.json - web configuration (PR change)', () => {
  it('web favicon uses ios-icon-default.png (changed from favicon.png)', () => {
    const { expo } = loadAppJson();
    assert.equal(
      expo.web.favicon,
      './assets/images/ios-icon-default.png',
      'web.favicon should point to ios-icon-default.png after the PR change'
    );
  });

  it('web favicon does NOT use the old favicon.png path', () => {
    const { expo } = loadAppJson();
    assert.notEqual(
      expo.web.favicon,
      './assets/images/favicon.png',
      'web.favicon should no longer reference the old favicon.png'
    );
  });

  it('web output is static', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.web.output, 'static', 'web.output should be "static"');
  });
});

describe('app.json - android configuration (PR changes)', () => {
  it('android adaptiveIcon backgroundColor is #FFFFFF (changed from #E6F4FE)', () => {
    const { expo } = loadAppJson();
    assert.equal(
      expo.android.adaptiveIcon.backgroundColor,
      '#FFFFFF',
      'android adaptiveIcon backgroundColor should be #FFFFFF after the PR change'
    );
  });

  it('android adaptiveIcon backgroundColor is NOT the old value #E6F4FE', () => {
    const { expo } = loadAppJson();
    assert.notEqual(
      expo.android.adaptiveIcon.backgroundColor,
      '#E6F4FE',
      'android adaptiveIcon backgroundColor should no longer be #E6F4FE'
    );
  });

  it('android package is com.ad2612.Ord (newly added)', () => {
    const { expo } = loadAppJson();
    assert.equal(
      expo.android.package,
      'com.ad2612.Ord',
      'android.package should be set to com.ad2612.Ord'
    );
  });

  it('android package is defined (was missing before PR)', () => {
    const { expo } = loadAppJson();
    assert.ok(
      expo.android.package !== undefined && expo.android.package !== null,
      'android.package should be defined'
    );
  });

  it('predictiveBackGestureEnabled is false', () => {
    const { expo } = loadAppJson();
    assert.equal(
      expo.android.predictiveBackGestureEnabled,
      false,
      'android.predictiveBackGestureEnabled should remain false'
    );
  });

  it('android adaptiveIcon still has required image paths', () => {
    const { expo } = loadAppJson();
    const { adaptiveIcon } = expo.android;
    assert.ok(adaptiveIcon.foregroundImage, 'android adaptiveIcon should have a foregroundImage');
    assert.ok(adaptiveIcon.backgroundImage, 'android adaptiveIcon should have a backgroundImage');
    assert.ok(adaptiveIcon.monochromeImage, 'android adaptiveIcon should have a monochromeImage');
  });
});

describe('app.json - plugins configuration (PR changes)', () => {
  it('plugins array exists', () => {
    const { expo } = loadAppJson();
    assert.ok(Array.isArray(expo.plugins), 'expo.plugins should be an array');
  });

  it('expo-secure-store plugin is included (newly added)', () => {
    const { expo } = loadAppJson();
    const hasSecureStore = expo.plugins.some(
      (plugin) => plugin === 'expo-secure-store' || (Array.isArray(plugin) && plugin[0] === 'expo-secure-store')
    );
    assert.ok(hasSecureStore, 'expo-secure-store should be listed in plugins');
  });

  it('expo-web-browser plugin is included (newly added)', () => {
    const { expo } = loadAppJson();
    const webBrowserEntry = expo.plugins.find(
      (plugin) =>
        plugin === 'expo-web-browser' ||
        (Array.isArray(plugin) && plugin[0] === 'expo-web-browser')
    );
    assert.ok(webBrowserEntry, 'expo-web-browser should be listed in plugins');
  });

  it('expo-web-browser has experimentalLauncherActivity set to false', () => {
    const { expo } = loadAppJson();
    const webBrowserEntry = expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-web-browser'
    );
    assert.ok(webBrowserEntry, 'expo-web-browser should be configured as an array entry');
    assert.equal(
      webBrowserEntry[1].experimentalLauncherActivity,
      false,
      'expo-web-browser experimentalLauncherActivity should be false'
    );
  });

  it('expo-router plugin is still present', () => {
    const { expo } = loadAppJson();
    const hasRouter = expo.plugins.some(
      (plugin) => plugin === 'expo-router' || (Array.isArray(plugin) && plugin[0] === 'expo-router')
    );
    assert.ok(hasRouter, 'expo-router should remain in plugins');
  });

  it('expo-splash-screen imageWidth is 200 (changed from 76)', () => {
    const { expo } = loadAppJson();
    const splashEntry = expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
    );
    assert.ok(splashEntry, 'expo-splash-screen should be configured as an array entry');
    assert.equal(
      splashEntry[1].android.imageWidth,
      200,
      'expo-splash-screen android imageWidth should be 200 after the PR change'
    );
  });

  it('expo-splash-screen imageWidth is NOT the old value 76', () => {
    const { expo } = loadAppJson();
    const splashEntry = expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
    );
    assert.ok(splashEntry, 'expo-splash-screen should be configured as an array entry');
    assert.notEqual(
      splashEntry[1].android.imageWidth,
      76,
      'expo-splash-screen android imageWidth should no longer be 76'
    );
  });

  it('expo-splash-screen backgroundColor is #FFFFFF', () => {
    const { expo } = loadAppJson();
    const splashEntry = expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
    );
    assert.ok(splashEntry, 'expo-splash-screen should be configured as an array entry');
    assert.equal(
      splashEntry[1].backgroundColor,
      '#FFFFFF',
      'expo-splash-screen backgroundColor should be #FFFFFF'
    );
  });
});

describe('app.json - general project configuration', () => {
  it('app name is Ord', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.name, 'Ord');
  });

  it('scheme is ord (used for deep links and OAuth redirects)', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.scheme, 'ord', 'scheme should be "ord" for custom URL scheme handling');
  });

  it('orientation is portrait', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.orientation, 'portrait');
  });

  it('userInterfaceStyle is automatic (supports system theme)', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.userInterfaceStyle, 'automatic');
  });

  it('experiments.typedRoutes is enabled', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.experiments.typedRoutes, true);
  });

  it('experiments.reactCompiler is enabled', () => {
    const { expo } = loadAppJson();
    assert.equal(expo.experiments.reactCompiler, true);
  });
});