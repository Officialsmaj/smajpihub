import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import AuthToast from "./components/AuthToast";
import useSliceReveal from "./hooks/useSliceReveal";

function App() {
  useSliceReveal();

  return <><RouterProvider router={router} /><AuthToast /></>;
}

export default App;
