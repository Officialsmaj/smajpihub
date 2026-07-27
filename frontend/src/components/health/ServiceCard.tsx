import type { HealthService } from "../../types/health";
import { formatServicePrice } from "../../lib/piPricing";

type ServiceCardProps = {
  service: HealthService;
  onSelect: () => void;
};

const ServiceCard = ({ service, onSelect }: ServiceCardProps) => (
  <article className="health-service-card">
    <div>
      <span className="health-service-category">{service.category}</span>
      <h4>{service.name}</h4>
      <p>{service.description}</p>
      <footer>
        <span>{service.duration}</span>
        <strong>{formatServicePrice(service.price)}</strong>
      </footer>
    </div>
    <button type="button" onClick={onSelect}>
      Book
    </button>
  </article>
);

export default ServiceCard;
