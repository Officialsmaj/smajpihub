import { useAuthContext } from "../contexts/AuthContext";

const AuthToast = () => { const { authFeedback } = useAuthContext(); return authFeedback ? <div className={`smaj-toast ${authFeedback.type}`} role="status">{authFeedback.message}</div> : null; };
export default AuthToast;
