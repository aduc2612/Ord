import { supabase } from "@/lib/supabase";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import { SignInWithIdTokenCredentials } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import "react-native-get-random-values";

export default function GoogleSignInButton() {
  const [nonce, setNonce] = useState("");
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
    function generateNonce(): string {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0].toString();
    }

    async function generateSha256Nonce(n: string): Promise<string> {
      const buffer = await window.crypto.subtle.digest(
        "sha-256",
        new TextEncoder().encode(n),
      );
      const arr = Array.from(new Uint8Array(buffer));
      return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    const n = generateNonce();
    setNonce(n);

    generateSha256Nonce(n).then((sha256) => {
      setSha256Nonce(sha256);
    });
  }, []);

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
