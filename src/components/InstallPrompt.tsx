import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneMode(): boolean {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    navigatorWithStandalone.standalone === true
  );
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setStatusText("");
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      setStatusText("홈 화면에 설치되었습니다.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      setStatusText("브라우저 메뉴에서 홈 화면에 추가를 선택하세요.");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    setInstallPrompt(null);
    setStatusText(
      choice.outcome === "accepted"
        ? "설치가 시작되었습니다."
        : "설치를 취소했습니다.",
    );
  }

  return (
    <section className="install-panel" aria-label="앱 설치">
      <div>
        <p className="section-label">PWA</p>
        <h2>앱 설치</h2>
      </div>
      <p className="helper-text">
        휴대폰 홈 화면에 추가하면 브라우저 주소창 없이 바로 기록할 수 있습니다.
      </p>
      <button
        className="secondary-action install-action"
        type="button"
        onClick={handleInstall}
        disabled={isInstalled}
      >
        <Download aria-hidden="true" size={18} />
        {isInstalled ? "설치됨" : "앱 설치"}
      </button>
      <p className="helper-text">
        iPhone은 Safari 공유 버튼에서 홈 화면에 추가를 선택하세요.
      </p>
      {statusText ? (
        <p className={isInstalled ? "success-text" : "helper-text"}>
          {statusText}
        </p>
      ) : null}
    </section>
  );
}
