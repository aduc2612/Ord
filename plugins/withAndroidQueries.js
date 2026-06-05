const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Declares `mailto` intent queries for Android 11+ package visibility.
 * Required so `Linking.openURL("mailto:...")` resolves to a mail app.
 */
const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest.queries = [
      ...(config.modResults.manifest.queries || []),
      {
        intent: [
          {
            action: [{ $: { "android:name": "android.intent.action.SENDTO" } }],
            data: [{ $: { "android:scheme": "mailto" } }],
          },
        ],
      },
    ];
    return config;
  });
};

module.exports = withAndroidQueries;
