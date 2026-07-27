import { Link } from "react-router-dom";
import type { HealthProvider } from "../../types/health";

type ProviderCardProps = {
  provider: HealthProvider;
};

const ProviderCard = ({ provider }: ProviderCardProps) => (
  <article className="health-provider-card">
    <Link to={`/services/health/providers/${provider.id}`}>
      <img src={provider.image} alt="" />
      <div>
        <div className="health-provider-header">
          <h3>{provider.name}</h3>
          <span className="health-rating">{provider.rating}</span>
        </div>
        <p className="health-provider-specialty">{provider.specialty}</p>
        <p className="health-provider-meta">
          {provider.location} · {provider.nextSlot}
        </p>
        {provider.availableToday ? <span className="health-available-badge">Available today</span> : null}
      </div>
    </Link>
  </article>
);

export default ProviderCard;
