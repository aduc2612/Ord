import { supabase } from "@/lib/supabase";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import { SignInWithIdTokenCredentials } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function GoogleSignInButton() {
  const [nonce] = useState(() => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "");
  });
  const [sha256Nonce, setSha256Nonce] = useState("");

  async function onGoogleButtonSuccess(
    authRequestResponse: CredentialResponse,
  ) {
    if (authRequestResponse.clientId && authRequestResponse.credential) {
      const credentials: SignInWithIdTokenCredentials = {
        provider: "google",
        token: authRequestResponse.credential,
        nonce: nonce,
      };

      const { error } = await supabase.auth.signInWithIdToken(credentials);

      if (error) {
        console.error("Error signing in with Google:", error);
      }
    }
  }

  function onGoogleButtonFailure() {
    console.error("Error signing in with Google");
  }

  useEffect(() => {
    async function generateSha256Nonce(n: string): Promise<string> {
      const buffer = await window.crypto.subtle.digest(
        "sha-256",
        new TextEncoder().encode(n),
      );
      const arr = Array.from(new Uint8Array(buffer));
      return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    generateSha256Nonce(nonce).then((sha256) => {
      setSha256Nonce(sha256);
    });
  }, [nonce]);

  if (!sha256Nonce) return null;

  return (
    <GoogleOAuthProvider
      clientId={process.env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID ?? ""}
      nonce={sha256Nonce}
    >
      <GoogleLogin
        nonce={sha256Nonce}
        onSuccess={onGoogleButtonSuccess}
        onError={onGoogleButtonFailure}
        useOneTap={true}
        auto_select={true}
      />
    </GoogleOAuthProvider>
  );
}
