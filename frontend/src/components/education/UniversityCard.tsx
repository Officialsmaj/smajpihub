import { Link } from "react-router-dom";
import type { University } from "../../types/education";
import "./education.css";

const partnershipBadge = (university: University) => {
  if (university.partnership_status === "smaj_verified_partner") {
    return <span className="university-badge partner">SMAJ Verified Partner</span>;
  }
  if (university.partnership_status === "partnership_suspended") {
    return <span className="university-badge suspended">Partnership Suspended</span>;
  }
  if (university.partnership_status === "partnership_pending") {
    return <span className="university-badge pending">Partnership Pending</span>;
  }
  return <span className="university-badge directory">Not yet a SMAJ Partner</span>;
};

const recognitionBadge = (university: University) => {
  if (university.recognition_status === "recognition_verified") {
    return <span className="university-badge recognized">Recognition Verified</span>;
  }
  return null;
};

export const UniversityCard = ({ university }: { university: University }) => {
  return (
    <article className="university-card">
      <div className="university-card-header">
        {university.logo_url ? (
          <img src={university.logo_url} alt={`${university.short_name || university.official_name} logo`} className="university-card-logo" />
        ) : (
          <div className="university-card-logo-placeholder">
            {(university.short_name || university.official_name).slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="university-card-header-text">
          <h3>{university.short_name || university.official_name}</h3>
          <p>{university.city}{university.city && university.country ? ", " : ""}{university.country}</p>
        </div>
      </div>
      <div className="university-card-badges">
        {partnershipBadge(university)}
        {recognitionBadge(university)}
      </div>
      <p className="university-card-type">{university.institution_type}</p>
      {university.description && <p className="university-card-description">{university.description.slice(0, 120)}{university.description.length > 120 ? "..." : ""}</p>}
      <div className="university-card-actions">
        <Link to={`/services/education/universities/${university.slug}`} className="university-primary-btn">
          View University
        </Link>
      </div>
    </article>
  );
};

export default UniversityCard;
