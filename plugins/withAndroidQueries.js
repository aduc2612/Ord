const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Declares `mailto` intent queries for Android 11+ package visibility.
 * Required so `Linking.openURL("mailto:...")` resolves to a mail app.
 */
const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    const queries = config.modResults.manifest.queries || [];

    const hasMailto = queries.some((q) =>
      q.intent?.some(
        (i) =>
          i.action?.some(
            (a) => a.$?.["android:name"] === "android.intent.action.SENDTO",
          ) && i.data?.some((d) => d.$?.["android:scheme"] === "mailto"),
      ),
    );

    if (!hasMailto) {
      queries.push({
        intent: [
          {
            action: [{ $: { "android:name": "android.intent.action.SENDTO" } }],
            data: [{ $: { "android:scheme": "mailto" } }],
          },
        ],
      });
    }

    config.modResults.manifest.queries = queries;
    return config;
  });
};

module.exports = withAndroidQueries;
