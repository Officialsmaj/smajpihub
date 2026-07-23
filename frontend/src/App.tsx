import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import AuthToast from "./components/AuthToast";
import GlobalFeedbackCenter from "./components/GlobalFeedbackCenter";
import useSliceReveal from "./hooks/useSliceReveal";

function App() {
  useSliceReveal();

  return (
    <>
      <RouterProvider router={router} />
      <AuthToast />
      <GlobalFeedbackCenter />
    </>
  );
}

export default App;
