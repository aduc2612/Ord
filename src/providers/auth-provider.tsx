import { AuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { PropsWithChildren, useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [claims, setClaims] = useState<
    Record<string, unknown> | null | undefined
  >();
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      }
      if (session?.user) {
        setClaims({ sub: session.user.id });
      } else {
        setClaims(null);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setClaims({ sub: session.user.id });
        } else {
          setClaims(null);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      if (!claims?.sub) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", claims.sub)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          if (isActive) setProfile(null);
        } else if (isActive) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Profile fetch exception:", err);
        if (isActive) setProfile(null);
      }

      if (isActive) setIsLoading(false);
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [claims?.sub]);

  return (
    <AuthContext.Provider
      value={{
        claims,
        isLoading,
        profile,
        isLoggedIn: claims != null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
