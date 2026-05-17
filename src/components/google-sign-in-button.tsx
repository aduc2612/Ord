import { images } from "@/constants/images";
import { borderRadius, shadows, spacing, typography } from "@/constants/theme";
import type { Theme } from "@/hooks/use-theme";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "ord",
  path: "(tabs)",
});

function extractParamsFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const hash = parsedUrl.hash.substring(1);
  const params = new URLSearchParams(hash);

  return {
    access_token: params.get("access_token"),
    expires_in: parseInt(params.get("expires_in") || "0"),
    refresh_token: params.get("refresh_token"),
    token_type: params.get("token_type"),
    provider_token: params.get("provider_token"),
    code: params.get("code"),
  };
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      justifyContent: "center",
      ...shadows.md,
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: spacing.md,
    },
    text: {
      ...typography.bodyLarge,
      fontWeight: "500",
      color: theme.colors.onSurfaceVariant,
    },
  });
}

export default function GoogleSignInButton() {
  const theme = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  async function onSignInButtonPress() {
    const res = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        queryParams: { prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    const { data, error } = res;

    if (error) {
      console.error("OAuth sign-in error:", error);
      return;
    }

    const googleOAuthUrl = data?.url;

    if (!googleOAuthUrl) {
      console.error("No OAuth URL found");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      googleOAuthUrl,
      redirectUri,
      { showInRecents: true },
    ).catch((err) => {
      console.error("openAuthSessionAsync error:", err);
    });

    if (result && result.type === "success") {
      const params = extractParamsFromUrl(result.url);

      if (params.access_token && params.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (error) {
          console.error("setSession error:", error);
        }
      } else {
        console.error("Missing tokens in callback URL");
      }
    }
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onSignInButtonPress}
      activeOpacity={0.8}
    >
      <Image source={images.googleLogo} style={styles.icon} />
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
}
