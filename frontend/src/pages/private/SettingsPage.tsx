const SettingsPage = () => (
  <main className="private-page">
    <section className="private-page-head"><div><p className="private-kicker">ACCOUNT</p><h1>Settings</h1><p>Simple MVP preferences for your private workspace.</p></div></section>
    <section className="private-form settings-card">
      <label className="setting-line"><span><strong>Order updates</strong><small>Show status feedback inside the Orders page.</small></span><input type="checkbox" defaultChecked /></label>
      <label className="setting-line"><span><strong>Dark interface</strong><small>SMAJ private workspace theme.</small></span><input type="checkbox" checked readOnly /></label>
    </section>
  </main>
);

export default SettingsPage;
