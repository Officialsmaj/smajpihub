type PrivateSkeletonProps = {
  variant?: "page" | "grid" | "list" | "product" | "seller" | "stats" | "profile" | "settings" | "home" | "messages" | "notifications" | "orders" | "search" | "sellerDashboard" | "wallet" | "chat" | "dashboard";
  count?: number;
};

const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <span className={`private-skeleton-line ${className}`} aria-hidden="true" />
);

const PrivateSkeleton = ({ variant = "page", count = 4 }: PrivateSkeletonProps) => {
  if (variant === "home") {
    return (
      <section className="private-skeleton-home" aria-label="Loading">
        <span className="private-skeleton-line hero" aria-hidden="true" />
        <div className="private-skeleton-grid">
          {Array.from({ length: count }).map((_, index) => (
            <article className="private-skeleton-card" key={index}>
              <span className="private-skeleton-avatar" aria-hidden="true" />
              <SkeletonLine className="short" />
              <SkeletonLine />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "wallet") {
    return (
      <section className="private-skeleton-seller-dashboard" aria-label="Loading">
        <span className="private-skeleton-line hero" aria-hidden="true" />
        <div className="private-skeleton-stats">
          {Array.from({ length: 5 }).map((_, index) => (
            <article className="private-skeleton-stat" key={index}>
              <SkeletonLine className="short" />
              <SkeletonLine className="large" />
            </article>
          ))}
        </div>
        <div className="private-skeleton-list">
          {Array.from({ length: count }).map((_, index) => (
            <article className="private-skeleton-row" key={index}>
              <span className="private-skeleton-image small" aria-hidden="true" />
              <div>
                <SkeletonLine className="medium" />
                <SkeletonLine />
                <SkeletonLine className="short" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "profile") {
    return (
      <section className="private-skeleton-profile-page" aria-label="Loading">
        <article className="private-skeleton-page">
          <div className="private-skeleton-profile">
            <span className="private-skeleton-avatar large" aria-hidden="true" />
            <div>
              <SkeletonLine className="title" />
              <SkeletonLine className="medium" />
            </div>
          </div>
        </article>
        <div className="private-skeleton-stats">
          {Array.from({ length: 3 }).map((_, index) => (
            <article className="private-skeleton-stat" key={index}>
              <SkeletonLine className="short" />
              <SkeletonLine className="large" />
            </article>
          ))}
        </div>
        <div className="private-skeleton-list">
          {Array.from({ length: count }).map((_, index) => (
            <article className="private-skeleton-row" key={index}>
              <span className="private-skeleton-avatar" aria-hidden="true" />
              <div>
                <SkeletonLine className="medium" />
                <SkeletonLine className="short" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "settings") {
    return (
      <section className="private-skeleton-settings" aria-label="Loading">
        <article className="private-skeleton-page">
          <div className="private-skeleton-profile">
            <span className="private-skeleton-avatar" aria-hidden="true" />
            <div>
              <SkeletonLine className="title" />
              <SkeletonLine className="medium" />
            </div>
          </div>
        </article>
        <div className="private-skeleton-list">
          {Array.from({ length: count }).map((_, index) => (
            <article className="private-skeleton-row" key={index}>
              <span className="private-skeleton-avatar" aria-hidden="true" />
              <div>
                <SkeletonLine className="medium" />
                <SkeletonLine className="short" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "grid") {
    return (
      <section className="private-skeleton-grid" aria-label="Loading">
        {Array.from({ length: count }).map((_, index) => (
          <article className="private-skeleton-card" key={index}>
            <span className="private-skeleton-image" aria-hidden="true" />
            <SkeletonLine className="short" />
            <SkeletonLine />
            <SkeletonLine className="medium" />
          </article>
        ))}
      </section>
    );
  }

  if (variant === "stats") {
    return (
      <section className="private-skeleton-stats" aria-label="Loading">
        {Array.from({ length: count }).map((_, index) => (
          <article className="private-skeleton-stat" key={index}>
            <SkeletonLine className="short" />
            <SkeletonLine className="large" />
          </article>
        ))}
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section className="private-skeleton-list" aria-label="Loading">
        {Array.from({ length: count }).map((_, index) => (
          <article className="private-skeleton-row" key={index}>
            <span className="private-skeleton-avatar" aria-hidden="true" />
            <div>
              <SkeletonLine className="medium" />
              <SkeletonLine />
              <SkeletonLine className="short" />
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (variant === "chat") {
    return (
      <section className="private-skeleton-chat" aria-label="Loading">
        {Array.from({ length: count }).map((_, index) => (
          <article
            className={`private-skeleton-chat-row ${index % 2 === 0 ? "mine" : ""}`}
            key={index}
          >
            <SkeletonLine className="chat-bubble" />
          </article>
        ))}
      </section>
    );
  }

  if (variant === "messages" || variant === "notifications" || variant === "orders" || variant === "search") {
    return (
      <section className={`private-skeleton-list private-skeleton-${variant}`} aria-label="Loading">
        {Array.from({ length: count }).map((_, index) => (
          <article className="private-skeleton-row" key={index}>
            {variant === "orders" || variant === "search" ? <span className="private-skeleton-image small" aria-hidden="true" /> : <span className="private-skeleton-avatar" aria-hidden="true" />}
            <div>
              <SkeletonLine className="medium" />
              <SkeletonLine />
              <SkeletonLine className="short" />
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (variant === "product") {
    return (
      <section className="private-skeleton-product" aria-label="Loading">
        <span className="private-skeleton-image tall" aria-hidden="true" />
        <div>
          <SkeletonLine className="short" />
          <SkeletonLine className="title" />
          <SkeletonLine />
          <SkeletonLine className="medium" />
          <SkeletonLine />
          <div className="private-skeleton-actions">
            <SkeletonLine />
            <SkeletonLine />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "sellerDashboard") {
    return (
      <section className="private-skeleton-seller-dashboard" aria-label="Loading">
        <div className="private-skeleton-stats">
          {Array.from({ length: count }).map((_, index) => (
            <article className="private-skeleton-stat" key={index}>
              <SkeletonLine className="short" />
              <SkeletonLine className="large" />
            </article>
          ))}
        </div>
        <div className="private-skeleton-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <article className="private-skeleton-card" key={index}>
              <SkeletonLine className="short" />
              <SkeletonLine className="title" />
              <SkeletonLine />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "seller") {
    return (
      <section className="private-skeleton-page private-skeleton-seller" aria-label="Loading">
        <div className="private-skeleton-profile">
          <span className="private-skeleton-avatar large" aria-hidden="true" />
          <div>
            <SkeletonLine className="short" />
            <SkeletonLine className="title" />
            <SkeletonLine className="medium" />
          </div>
        </div>
        <div className="private-skeleton-stats">
          <article className="private-skeleton-stat"><SkeletonLine className="short" /><SkeletonLine className="large" /></article>
          <article className="private-skeleton-stat"><SkeletonLine className="short" /><SkeletonLine className="large" /></article>
          <article className="private-skeleton-stat"><SkeletonLine className="short" /><SkeletonLine className="large" /></article>
        </div>
      </section>
    );
  }

  if (variant === "dashboard") {
    return (
      <section className="private-skeleton-dashboard" aria-label="Loading">
        <div className="private-skeleton-dashboard-hero">
          <div className="private-skeleton-dashboard-hero-copy">
            <SkeletonLine className="short" />
            <SkeletonLine className="hero" />
            <SkeletonLine />
            <div className="private-skeleton-dashboard-hero-actions">
              <SkeletonLine className="medium" />
              <SkeletonLine className="medium" />
            </div>
          </div>
          <div className="private-skeleton-dashboard-hero-icons">
            {Array.from({ length: 6 }).map((_, index) => (
              <span className="private-skeleton-dashboard-hero-icon" key={index} />
            ))}
          </div>
        </div>
        <div className="private-skeleton-dashboard-tabs">
          {Array.from({ length: 4 }).map((_, index) => (
            <span className="private-skeleton-dashboard-tab" key={index} />
          ))}
        </div>
        <div className="private-skeleton-dashboard-priority-grid">
          <div className="private-skeleton-dashboard-card">
            <SkeletonLine className="short" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <SkeletonLine className="medium" />
                <SkeletonLine className="short" />
              </div>
            ))}
          </div>
          <div className="private-skeleton-dashboard-card">
            <SkeletonLine className="short" />
            <div className="private-skeleton-dashboard-pills">
              {Array.from({ length: 5 }).map((_, index) => (
                <span className="private-skeleton-dashboard-pill" key={index} />
              ))}
            </div>
          </div>
        </div>
        <div className="private-skeleton-dashboard-section">
          <SkeletonLine className="short" />
          <div className="private-skeleton-dashboard-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <article className="private-skeleton-dashboard-card" key={index}>
                <span className="private-skeleton-image" aria-hidden="true" />
                <SkeletonLine className="short" />
                <SkeletonLine />
                <SkeletonLine className="medium" />
              </article>
            ))}
          </div>
        </div>
        <div className="private-skeleton-dashboard-priority-grid">
          <div className="private-skeleton-dashboard-card">
            <SkeletonLine className="short" />
            <div className="private-skeleton-dashboard-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <article key={index} style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="private-skeleton-avatar" aria-hidden="true" />
                    <div style={{ flex: 1 }}>
                      <SkeletonLine className="medium" />
                      <SkeletonLine className="short" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="private-skeleton-dashboard-card">
            <SkeletonLine className="short" />
            <div className="private-skeleton-dashboard-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <article key={index} style={{ display: "grid", gap: 6 }}>
                  <SkeletonLine className="short" />
                  <SkeletonLine className="large" />
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="private-skeleton-dashboard-layout">
          <div className="private-skeleton-dashboard-main">
            <div className="private-skeleton-dashboard-section">
              <SkeletonLine className="short" />
              <div className="private-skeleton-dashboard-list">
                {Array.from({ length: 3 }).map((_, index) => (
                  <article key={index} style={{ display: "flex", gap: 10, alignItems: "start" }}>
                    <span className="private-skeleton-avatar small" aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--smaj-secondary-bg)" }} />
                    <div style={{ flex: 1 }}>
                      <SkeletonLine className="medium" />
                      <SkeletonLine className="short" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="private-skeleton-dashboard-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 16 }}>
                <div>
                  <SkeletonLine className="short" />
                  <SkeletonLine />
                </div>
                <SkeletonLine className="short" />
              </div>
              <div className="private-skeleton-dashboard-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <article key={index} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="private-skeleton-avatar" aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12 }} />
                    <div>
                      <SkeletonLine className="medium" />
                      <SkeletonLine className="short" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="private-skeleton-dashboard-section">
              <SkeletonLine className="short" />
              <div className="private-skeleton-dashboard-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <article key={index} style={{ display: "grid", gap: 8 }}>
                    <span className="private-skeleton-image small" aria-hidden="true" style={{ height: 120, borderRadius: 12 }} />
                    <SkeletonLine className="medium" />
                    <SkeletonLine />
                  </article>
                ))}
              </div>
            </div>
            <div className="private-skeleton-dashboard-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 16 }}>
                <div>
                  <SkeletonLine className="short" />
                  <SkeletonLine />
                </div>
              </div>
              <div className="private-skeleton-dashboard-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <article key={index} style={{ display: "grid", gap: 8 }}>
                    <span className="private-skeleton-image" aria-hidden="true" style={{ height: 160, borderRadius: 12 }} />
                    <SkeletonLine className="short" />
                    <SkeletonLine />
                    <SkeletonLine className="medium" />
                  </article>
                ))}
              </div>
            </div>
          </div>
          <aside className="private-skeleton-dashboard-side">
            <div className="private-skeleton-dashboard-card">
              <SkeletonLine className="short" />
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} style={{ display: "flex", gap: 10, alignItems: "start", marginTop: 10 }}>
                  <span className="private-skeleton-avatar small" aria-hidden="true" style={{ width: 32, height: 32 }} />
                  <div>
                    <SkeletonLine className="medium" />
                    <SkeletonLine className="short" />
                  </div>
                </div>
              ))}
            </div>
            <div className="private-skeleton-dashboard-card">
              <SkeletonLine className="short" />
              {Array.from({ length: 3 }).map((_, index) => (
                <article key={index} style={{ display: "flex", gap: 10, alignItems: "start", marginTop: 10 }}>
                  <span className="private-skeleton-avatar small" aria-hidden="true" style={{ width: 32, height: 32 }} />
                  <div>
                    <SkeletonLine className="medium" />
                    <SkeletonLine className="short" />
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
        <div className="private-skeleton-dashboard-section">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <SkeletonLine className="short" style={{ margin: "0 auto" }} />
            <SkeletonLine className="title" style={{ margin: "8px auto 0" }} />
            <SkeletonLine style={{ margin: "8px auto 0", maxWidth: 400 }} />
          </div>
          <div className="private-skeleton-dashboard-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} style={{ display: "grid", gap: 8, textAlign: "center" }}>
                <span className="private-skeleton-avatar" aria-hidden="true" style={{ margin: "0 auto" }} />
                <SkeletonLine className="medium" style={{ margin: "0 auto" }} />
                <SkeletonLine style={{ margin: "0 auto", maxWidth: 200 }} />
              </article>
            ))}
          </div>
        </div>
        <div className="private-skeleton-dashboard-footer">
          <SkeletonLine className="short" />
          <SkeletonLine className="short" />
        </div>
      </section>
    );
  }

  return (
    <section className="private-skeleton-page" aria-label="Loading">
      <div className="private-skeleton-profile">
        <span className="private-skeleton-avatar" aria-hidden="true" />
        <div>
          <SkeletonLine className="medium" />
          <SkeletonLine className="short" />
        </div>
      </div>
      <SkeletonLine className="hero" />
      <SkeletonLine />
      <SkeletonLine className="medium" />
      <SkeletonLine />
      <span className="private-skeleton-panel" aria-hidden="true" />
    </section>
  );
};

export default PrivateSkeleton;
