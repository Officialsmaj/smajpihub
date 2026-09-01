import type { ReactNode } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { isCapacitorNative } from "../lib/capacitorPiAuth";
import "./NativeWelcomeGate.css";

const NativeWelcomeGate = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, loginWithPi, authFeedback } = useAuthContext();

  if (!isCapacitorNative() || isAuthenticated) return <>{children}</>;

  return (
    <main className="native-welcome" aria-labelledby="native-welcome-title">
      <div className="native-welcome__glow native-welcome__glow--top" aria-hidden="true" />
      <div className="native-welcome__glow native-welcome__glow--bottom" aria-hidden="true" />
      <section className="native-welcome__content">
        <div className="native-welcome__brand">
          <img src="/logo.png" alt="SMAJ PI HUB" className="native-welcome__logo" />
          <span className="native-welcome__beta">BETA</span>
        </div>

        <div className="native-welcome__copy">
          <p className="native-welcome__eyebrow">ONE PI IDENTITY. EVERY SMAJ SERVICE.</p>
          <h1 id="native-welcome-title">Welcome to<br />SMAJ PI HUB</h1>
          <p>Commerce, work, learning and daily services—all connected to your existing SMAJ account.</p>
        </div>

        <div className="native-welcome__card">
          <div className="native-welcome__pi" aria-hidden="true">π</div>
          <div>
            <strong>Continue with Pi</strong>
            <span>Secure sign-in with your Pi identity</span>
          </div>
          <button
            type="button"
            className="native-welcome__button"
            onClick={() => void loginWithPi()}
            disabled={isLoading}
          >
            {isLoading ? <span className="native-welcome__spinner" aria-hidden="true" /> : null}
            {isLoading ? "Checking your session…" : "Continue with Pi"}
          </button>
          {authFeedback?.type === "error" ? (
            <p className="native-welcome__error" role="alert">{authFeedback.message}</p>
          ) : null}
        </div>

        <div className="native-welcome__trust">
          <span>Powered by Pi</span><i aria-hidden="true" /><span>Part of the SMAJ ecosystem</span>
        </div>
      </section>
    </main>
  );
};

export default NativeWelcomeGate;
