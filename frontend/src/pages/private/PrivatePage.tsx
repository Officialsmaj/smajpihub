import { Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";

type PrivatePageProps = {
  title: string;
  description: string;
};

const quickActions = [
  { to: "/app/verification-center", label: "Verification Center" },
  { to: "/app/support-tickets", label: "Support Tickets" },
];

const PrivatePage = ({ title, description }: PrivatePageProps) => {
  const { user } = useAuthContext();

  return (
    <main className="private-page">
      <section className="private-card">
        <p className="private-kicker">PRIVATE WORKSPACE</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="private-metadata">
          <span>Signed in: {user?.username ?? "Unknown user"}</span>
          <span>Roles: {(user?.roles ?? []).join(", ") || "standard-user"}</span>
          <span>Auth: Pi wallet verified session</span>
        </div>
      </section>
      <section className="private-card">
        <h2>Quick Actions</h2>
        <div className="private-grid">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="private-link-card">
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default PrivatePage;
