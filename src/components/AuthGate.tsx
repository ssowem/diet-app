import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";

type AuthGateProps = {
  onLogin: (email: string) => void;
};

export function AuthGate({ onLogin }: AuthGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      onLogin(email);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "로그인하지 못했습니다.",
      );
    }
  }

  return (
    <section className="auth-panel" aria-label="로그인">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <p className="section-label">개인 기록</p>
          <h2>로그인</h2>
        </div>

        <label className="field-label" htmlFor="login-email">
          이메일
        </label>
        <input
          id="login-email"
          className="text-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-action" type="submit">
          <LogIn aria-hidden="true" size={18} />
          로그인
        </button>
      </form>
    </section>
  );
}
