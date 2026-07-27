import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import AuthToast from "./components/AuthToast";
import GlobalFeedbackCenter from "./components/GlobalFeedbackCenter";
import useSliceReveal from "./hooks/useSliceReveal";
import { FoodCartProvider } from "./contexts/FoodCartContext";

function App() {
  useSliceReveal();

  return (
    <>
      <FoodCartProvider>
        <RouterProvider router={router} />
      </FoodCartProvider>
      <AuthToast />
      <GlobalFeedbackCenter />
    </>
  );
}

export default App;
