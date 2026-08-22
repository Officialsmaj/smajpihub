const DashboardWelcomeLoader = () => (
  <main className="dashboard-welcome-loader" role="status" aria-live="polite" aria-label="Loading SMAJ PI HUB dashboard">
    <div className="dashboard-welcome-loader-content">
      <img src="/logo.png" alt="SMAJ PI HUB" />
      <h1>Welcome to <strong>SMAJ PI HUB</strong></h1>
      <p>Powered by Pi</p>
      <small>Part of the SMAJ Ecosystem</small>
    </div>
  </main>
);

export default DashboardWelcomeLoader;