import { Link } from "react-router-dom";
import type { HousingProperty } from "../../types/housing";

type PropertyCardProps = {
  property: HousingProperty;
};

const PropertyCard = ({ property }: PropertyCardProps) => (
  <article className="housing-property-card">
    <Link to={`/services/housing/properties/${property.id}`}>
      <img src={property.image} alt="" />
      <div>
        <div className="housing-property-header">
          <h3>{property.title}</h3>
          <span className="housing-price">π {property.price.toLocaleString()}/mo</span>
        </div>
        <p className="housing-property-meta">
          {property.bedrooms} bed · {property.bathrooms} bath · {property.area}
        </p>
        <p className="housing-property-location">{property.location}</p>
        <span className="housing-type-badge">{property.propertyType}</span>
      </div>
    </Link>
  </article>
);

export default PropertyCard;
