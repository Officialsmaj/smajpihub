import AppLayout from "../layouts/AppLayout";
import { useAuthContext } from "../contexts/AuthContext";
import LoginWithPiButton from "../components/LoginWithPiButton";

const EngagementTasksPage = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <AppLayout>
      <main className="home-page">
        <section className="home-section">
          <div className="home-section-head">
            <h1>Engagement Tasks</h1>
            {isAuthenticated ? (
              <p>Task dashboard is now account-aware. Dynamic task feeds and rewards API integration are next.</p>
            ) : (
              <p>Please sign in with Pi to access your engagement task dashboard.</p>
            )}
          </div>
          {!isAuthenticated ? <LoginWithPiButton>Login with Pi</LoginWithPiButton> : null}
        </section>
      </main>
    </AppLayout>
  );
};

export default EngagementTasksPage;
