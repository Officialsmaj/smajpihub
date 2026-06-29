import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import AuthToast from "./components/AuthToast";
import useSliceReveal from "./hooks/useSliceReveal";
import logoImage from "/logo.png";

const AppLoadingScreen = () => (
  <div className="smaj-app-loader" role="status" aria-live="polite" aria-label="Loading SMAJ PI HUB">
    <div className="smaj-loader-orbit" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <div className="smaj-loader-card">
      <img src={logoImage} alt="SMAJ PI HUB" />
      <strong>SMAJ PI HUB</strong>
      <p>Preparing your Pi-powered hub...</p>
      <div className="smaj-loader-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  </div>
);

function App() {
  const [isBooting, setIsBooting] = useState(true);
  useSliceReveal();

  useEffect(() => {
    const finishBoot = () => {
      window.setTimeout(() => setIsBooting(false), 650);
    };

    if (document.readyState === "complete") {
      finishBoot();
      return;
    }

    window.addEventListener("load", finishBoot, { once: true });
    return () => window.removeEventListener("load", finishBoot);
  }, []);

  return (
    <>
      {isBooting ? <AppLoadingScreen /> : null}
      <RouterProvider router={router} />
      <AuthToast />
    </>
  );
}

export default App;
