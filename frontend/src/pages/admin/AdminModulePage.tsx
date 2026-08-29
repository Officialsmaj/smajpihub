import { Link, useLocation } from "react-router-dom";
import { adminNavigation } from "../../content/adminNavigation";

const AdminModulePage = () => {
  const location = useLocation();
  const group = adminNavigation.find((entry) => entry.items.some((item) => item.to === location.pathname));
  const item = group?.items.find((entry) => entry.to === location.pathname);

  if (!group || !item) {
    return <main className="private-page"><section className="private-state"><h2>Admin module not found</h2><Link className="private-primary-button" to="/admin">Back to dashboard</Link></section></main>;
  }

  return (
    <main className="private-page admin-module-page">
      <header className="private-page-head">
        <p className="private-kicker">{String(group.number).padStart(2, "0")} · {group.label}</p>
        <h1>{item.label}</h1>
        <p>Manage {item.label.toLowerCase()} across SMAJ PI HUB from this central admin workspace.</p>
      </header>
      <section className="admin-module-overview" aria-label={item.label + " administration"}>
        <article><span>Workspace</span><strong>Ready</strong><small>Admin route enabled</small></article>
        <article><span>Access</span><strong>Admin</strong><small>Protected account access</small></article>
        <article><span>Service</span><strong>{group.label}</strong><small>Centralized management</small></article>
      </section>
      <section className="dashboard-card admin-module-directory">
        <div><p className="private-kicker">SECTION DIRECTORY</p><h2>{group.label}</h2><p>Open another management area in this section.</p></div>
        <div>
          {group.items.map((entry) => <Link className={entry.to === location.pathname ? "active" : ""} to={entry.to!} key={entry.label}>{entry.label}</Link>)}
        </div>
      </section>
    </main>
  );
};

export default AdminModulePage;
