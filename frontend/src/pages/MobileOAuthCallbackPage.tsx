import { useEffect, useState } from "react";

export default function MobileOAuthCallbackPage() {
  const [hadOAuthResponse] = useState(() => Boolean(window.location.hash));

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  return <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#f6f7fb" }}>
    <section style={{ width: "min(100%, 440px)", padding: 28, border: "1px solid #e1e7e4", borderRadius: 22, background: "#fff", textAlign: "center" }}>
      <p style={{ margin: 0, color: "#6c3fe6", fontWeight: 800, letterSpacing: 1 }}>SMAJ PI HUB</p>
      <h1 style={{ margin: "12px 0", color: "#17231f" }}>{hadOAuthResponse ? "Open the Android app to finish" : "Android sign-in callback"}</h1>
      <p style={{ margin: 0, color: "#66756f", lineHeight: 1.6 }}>For your security, this browser page did not store your Pi sign-in response. Install or reopen SMAJ PI HUB, then tap Continue with Pi again.</p>
    </section>
  </main>;
}