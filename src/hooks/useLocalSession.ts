import { useCallback, useState } from "react";

const SESSION_KEY = "diet-app:session";

export type LocalSession = {
  email: string;
  profileId: string;
};

function profileIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const safeEmail = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `user-${safeEmail || "local"}`;
}

function readSession(): LocalSession | undefined {
  const rawValue = localStorage.getItem(SESSION_KEY);

  if (!rawValue) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<LocalSession>;

    if (parsed.email && parsed.profileId) {
      return {
        email: parsed.email,
        profileId: parsed.profileId,
      };
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }

  return undefined;
}

export function useLocalSession() {
  const [session, setSession] = useState<LocalSession | undefined>(() =>
    readSession(),
  );

  const login = useCallback((email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new Error("이메일을 입력하세요.");
    }

    const nextSession = {
      email: normalizedEmail,
      profileId: profileIdFromEmail(normalizedEmail),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(undefined);
  }, []);

  return {
    session,
    login,
    logout,
  };
}
