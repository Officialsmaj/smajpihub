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
      <FoodCartProvider>
        <HealthBookingProvider>
          <RouterProvider router={router} />
        </HealthBookingProvider>
      </FoodCartProvider>
      <AuthToast />
      <GlobalFeedbackCenter />
      <AutomaticPageTranslator />
    </>
  );
}

export default App;
