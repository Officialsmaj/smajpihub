import { RouterProvider } from "react-router-dom";
import router from "./Router.tsx";
import AuthToast from "./components/AuthToast";

function App() {
  return <><RouterProvider router={router} /><AuthToast /></>;
}

export default App;
