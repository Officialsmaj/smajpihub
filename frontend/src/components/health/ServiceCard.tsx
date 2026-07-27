import type { HealthService } from "../../types/health";

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
        <strong>π {service.price.toFixed(2)}</strong>
      </footer>
    </div>
    <button type="button" onClick={onSelect}>
      Book
    </button>
  </article>
);

export default ServiceCard;
