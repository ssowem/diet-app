import { useState } from "react";
import { LogIn } from "lucide-react";
import type { SocialProvider } from "../hooks/useAuthSession";

type AuthGateProps = {
  onSignIn: (provider: SocialProvider) => Promise<void>;
  isConfigured: boolean;
  isLoading?: boolean;
  authError?: string;
};

const providers: Array<{
  id: SocialProvider;
  label: string;
  mark: string;
}> = [
  { id: "google", label: "Google로 계속하기", mark: "G" },
  { id: "kakao", label: "카카오로 계속하기", mark: "K" },
  { id: "naver", label: "네이버로 계속하기", mark: "N" },
];

export function AuthGate({
  onSignIn,
  isConfigured,
  isLoading = false,
  authError,
}: AuthGateProps) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider>();
  const [localError, setLocalError] = useState("");
  const displayedError = localError || authError;

  async function handleSignIn(provider: SocialProvider) {
    setLocalError("");
    setPendingProvider(provider);

    try {
      await onSignIn(provider);
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : "소셜 로그인을 시작하지 못했습니다.",
      );
    } finally {
      setPendingProvider(undefined);
    }
  }

  return (
    <section className="auth-panel" aria-label="로그인">
      <div className="auth-form">
        <div>
          <p className="section-label">개인 기록</p>
          <h2>로그인</h2>
        </div>

        <div className="social-login-list">
          {providers.map((provider) => {
            const isPending = pendingProvider === provider.id;

            return (
              <button
                key={provider.id}
                className={`social-login-button ${provider.id}`}
                type="button"
                disabled={!isConfigured || isLoading || Boolean(pendingProvider)}
                onClick={() => void handleSignIn(provider.id)}
              >
                <span className="social-mark" aria-hidden="true">
                  {provider.mark}
                </span>
                {isPending ? "로그인 이동 중..." : provider.label}
              </button>
            );
          })}
        </div>

        {!isConfigured ? (
          <p className="error-text">
            소셜 로그인 설정이 필요합니다. Supabase 환경 변수를 추가하세요.
          </p>
        ) : null}

        {displayedError ? <p className="error-text">{displayedError}</p> : null}

        <p className="helper-text social-helper">
          회원가입 폼 없이 선택한 계정으로 바로 로그인합니다.
        </p>

        {isLoading ? (
          <p className="helper-text auth-loading">
            <LogIn aria-hidden="true" size={16} />
            로그인 상태 확인 중...
          </p>
        ) : null}
      </div>
    </section>
  );
}
