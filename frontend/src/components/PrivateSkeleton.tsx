type PrivateSkeletonProps = {
  variant?: "page" | "grid" | "list" | "product" | "seller" | "stats" | "profile" | "settings" | "home" | "messages" | "notifications" | "orders" | "search" | "sellerDashboard" | "wallet" | "chat";
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
