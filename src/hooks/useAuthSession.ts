import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "../auth/supabaseClient";

export type SocialProvider = "google" | "kakao" | "naver";

export type SupabaseAuthSession = {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

export type AuthClientLike = {
  auth: {
    getSession: () => Promise<{
      data: { session: SupabaseAuthSession | null };
      error: Error | null;
    }>;
    onAuthStateChange: (
      callback: (event: string, session: SupabaseAuthSession | null) => void,
    ) => {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    };
    signInWithOAuth: (credentials: {
      provider: string;
      options: {
        redirectTo: string;
      };
    }) => Promise<{
      data?: unknown;
      error: Error | null;
    }>;
    signOut: () => Promise<{
      error: Error | null;
    }>;
  };
};

export type AppAuthSession = {
  email: string;
  profileId: string;
};

type UseAuthSessionOptions = {
  client?: AuthClientLike;
  isConfigured?: boolean;
  redirectTo?: string;
};

const providerIds: Record<SocialProvider, string> = {
  google: "google",
  kakao: "kakao",
  naver: "custom:naver",
};

function getDefaultRedirectTo(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

function readEmailFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | undefined {
  const email = metadata?.email;

  return typeof email === "string" && email.trim() ? email : undefined;
}

function toAppSession(
  session: SupabaseAuthSession | null,
): AppAuthSession | undefined {
  if (!session?.user.id) {
    return undefined;
  }

  return {
    email:
      session.user.email ??
      readEmailFromMetadata(session.user.user_metadata) ??
      "소셜 계정",
    profileId: `supabase-${session.user.id}`,
  };
}

export function useAuthSession(options: UseAuthSessionOptions = {}) {
  const client =
    options.client ?? (getSupabaseClient() as unknown as AuthClientLike);
  const isConfigured = options.isConfigured ?? Boolean(client);
  const redirectTo = options.redirectTo ?? getDefaultRedirectTo();
  const [session, setSession] = useState<AppAuthSession | undefined>();
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!client || !isConfigured) {
      setSession(undefined);
      setLoading(false);
      setError(undefined);
      return;
    }

    let isActive = true;
    setLoading(true);

    client.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isActive) {
          return;
        }

        if (sessionError) {
          setError(sessionError.message);
          setSession(undefined);
          return;
        }

        setSession(toAppSession(data.session));
        setError(undefined);
      })
      .catch((caughtError: unknown) => {
        if (!isActive) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "로그인 상태를 확인하지 못했습니다.",
        );
        setSession(undefined);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(toAppSession(nextSession));
      setError(undefined);
      setLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [client, isConfigured]);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider) => {
      if (!client || !isConfigured) {
        throw new Error("소셜 로그인 설정이 필요합니다.");
      }

      const { error: signInError } = await client.auth.signInWithOAuth({
        provider: providerIds[provider],
        options: {
          redirectTo,
        },
      });

      if (signInError) {
        throw signInError;
      }
    },
    [client, isConfigured, redirectTo],
  );

  const logout = useCallback(async () => {
    if (client && isConfigured) {
      const { error: logoutError } = await client.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }
    }

    setSession(undefined);
  }, [client, isConfigured]);

  return {
    session,
    loading,
    error,
    isConfigured,
    signInWithProvider,
    logout,
  };
}
