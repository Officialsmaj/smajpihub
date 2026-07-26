import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import type { EducationPartner } from "../../types/education";

type PartnerCardProps = {
  partner: EducationPartner;
};

const PartnerCard = ({ partner }: PartnerCardProps) => (
  <article className="education-partner-card">
    <div>
      <VerifiedUserOutlinedIcon />
      <div>
        <h3>{partner.name}</h3>
        <p>{partner.programs}</p>
      </div>
    </div>
    <span>{partner.type}</span>
    <span>{partner.location}</span>
    <b>{partner.status}</b>
  </article>
);

export default PartnerCard;
