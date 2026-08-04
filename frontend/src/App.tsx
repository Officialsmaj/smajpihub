import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import AuthToast from "./components/AuthToast";
import GlobalFeedbackCenter from "./components/GlobalFeedbackCenter";
import useSliceReveal from "./hooks/useSliceReveal";
import { FoodCartProvider } from "./contexts/FoodCartContext";
import { HealthBookingProvider } from "./contexts/HealthBookingContext";
import AutomaticPageTranslator from "./components/AutomaticPageTranslator";

function App() {
  useSliceReveal();

  return (
    <>
      <main className="desktop-access-block" aria-labelledby="desktop-access-title">
        <div>
          <span aria-hidden="true">SMAJ Pi Hub</span>
          <h1 id="desktop-access-title">Mobile and tablet only</h1>
          <p>Please open SMAJ Pi Hub on a mobile phone or tablet to continue.</p>
        </div>
      </main>
      <div className="mobile-tablet-app">
        <FoodCartProvider>
          <HealthBookingProvider>
            <RouterProvider router={router} />
          </HealthBookingProvider>
        </FoodCartProvider>
        <AuthToast />
        <GlobalFeedbackCenter />
        <AutomaticPageTranslator />
      </div>
    </>
  );
}

export default App;
