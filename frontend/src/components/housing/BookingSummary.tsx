import type { HousingProperty } from "../../types/housing";

type BookingSummaryProps = {
  property: HousingProperty;
  agentName: string;
  onBook: () => void;
};

const BookingSummary = ({ property, agentName, onBook }: BookingSummaryProps) => (
  <div className="housing-booking-summary">
    <div className="housing-booking-summary-inner">
      <div>
        <strong>{property.title}</strong>
        <span>{agentName} · {property.location}</span>
      </div>
      <div>
        <strong>π {property.price.toLocaleString()}/mo</strong>
        <button type="button" onClick={onBook}>Book viewing</button>
      </div>
    </div>
  </div>
);

export default BookingSummary;
