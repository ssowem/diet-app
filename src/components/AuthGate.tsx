import { useState } from "react";
import { ExternalLink, LogIn, UserRound } from "lucide-react";
import type { SocialProvider } from "../hooks/useAuthSession";

type AuthGateProps = {
  onSignIn: (provider: SocialProvider) => Promise<void>;
  onGuestStart: () => void;
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

function getAppHomeUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

function getChromeIntentUrl(appUrl: string): string {
  const url = new URL(appUrl);
  const browserFallback = encodeURIComponent(appUrl);

  return `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${browserFallback};end`;
}

export function AuthGate({
  onSignIn,
  onGuestStart,
  isConfigured,
  isLoading = false,
  authError,
}: AuthGateProps) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider>();
  const [localError, setLocalError] = useState("");
  const displayedError = localError || authError;
  const appHomeUrl = getAppHomeUrl();
  const chromeIntentUrl = getChromeIntentUrl(appHomeUrl);

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

        <div className="auth-divider" aria-hidden="true">
          또는
        </div>

        <button
          className="guest-login-button"
          type="button"
          onClick={onGuestStart}
        >
          <UserRound aria-hidden="true" size={18} />
          게스트로 먼저 써보기
        </button>

        <p className="helper-text">
          게스트 기록은 이 기기에만 저장됩니다. Google 로그인 흰 화면에 막혀도
          앱 기능은 바로 테스트할 수 있습니다.
        </p>

        <div className="browser-help">
          <p className="helper-text">
            Google 로그인 화면이 하얗게 멈추면 Chrome 앱에서 다시 여세요.
          </p>
          <a className="secondary-link-action" href={chromeIntentUrl}>
            <ExternalLink aria-hidden="true" size={17} />
            Chrome에서 열기
          </a>
        </div>

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
