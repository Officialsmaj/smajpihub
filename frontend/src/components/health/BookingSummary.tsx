import type { HealthService } from "../../types/health";
import { formatServicePrice } from "../../lib/piPricing";

type BookingSummaryProps = {
  providerName: string;
  service: HealthService;
  onCheckout: () => void;
};

const BookingSummary = ({ providerName, service, onCheckout }: BookingSummaryProps) => (
  <div className="health-booking-summary">
    <div className="health-booking-summary-inner">
      <div>
        <strong>{providerName}</strong>
        <span>
          {service.name} · {service.duration}
        </span>
      </div>
      <div>
        <strong>{formatServicePrice(service.price)}</strong>
        <button type="button" onClick={onCheckout}>
          Book now
        </button>
      </div>
    </div>
  </div>
);

export default BookingSummary;
