import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  useAuthSession,
  type AuthClientLike,
  type SupabaseAuthSession,
} from "./useAuthSession";

function createAuthClient(session: SupabaseAuthSession | null): AuthClientLike {
  return {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session },
        error: null,
      })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signInWithOAuth: vi.fn(async () => ({
        data: { provider: "", url: null },
        error: null,
      })),
      signOut: vi.fn(async () => ({
        error: null,
      })),
    },
  };
}

describe("useAuthSession", () => {
  test("reports unconfigured auth without creating a session", () => {
    const { result } = renderHook(() =>
      useAuthSession({
        client: undefined,
        isConfigured: false,
      }),
    );

    expect(result.current.isConfigured).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.session).toBeUndefined();
  });

  test("maps a Supabase session to an app session", async () => {
    const client = createAuthClient({
      user: {
        id: "user-1",
        email: "tester@example.com",
      },
    });

    const { result } = renderHook(() =>
      useAuthSession({
        client,
        isConfigured: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.session).toEqual({
        email: "tester@example.com",
        profileId: "supabase-user-1",
      });
    });
  });

  test("starts Naver login with the configured custom provider id", async () => {
    const client = createAuthClient(null);

    const { result } = renderHook(() =>
      useAuthSession({
        client,
        isConfigured: true,
        redirectTo: "https://ssowem.github.io/diet-app/",
      }),
    );

    await act(async () => {
      await result.current.signInWithProvider("naver");
    });

    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "custom:naver",
      options: {
        redirectTo: "https://ssowem.github.io/diet-app/",
      },
    });
  });
});
