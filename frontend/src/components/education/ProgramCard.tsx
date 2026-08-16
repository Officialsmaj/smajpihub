import type { UniversityProgram } from "../../types/education";
import "./education.css";

export const ProgramCard = ({ program }: { program: UniversityProgram }) => {
  return (
    <article className="program-card">
      <div className="program-card-header">
        <h3>{program.name}</h3>
        <span className="program-degree">{program.degree_level}</span>
      </div>
      <div className="program-card-body">
        {program.field && <p><strong>Field:</strong> {program.field}</p>}
        {program.duration && <p><strong>Duration:</strong> {program.duration}</p>}
        {program.study_mode && <p><strong>Mode:</strong> {program.study_mode.replace(/_/g, " ")}</p>}
        {program.tuition && <p><strong>Tuition:</strong> {program.tuition} {program.tuition_currency || ""}</p>}
        {program.application_fee && <p><strong>Application Fee:</strong> {program.application_fee} {program.application_fee_currency || ""}</p>}
        {program.intake && program.intake.length > 0 && <p><strong>Intake:</strong> {program.intake.join(", ")}</p>}
        {program.application_deadline && <p><strong>Deadline:</strong> {program.application_deadline}</p>}
      </div>
      {program.provenance && (
        <div className="program-card-source">
          <small>Source: {program.provenance.source_name}</small>
          {program.provenance.last_verified_at && <small>Last checked: {new Date(program.provenance.last_verified_at).toLocaleDateString()}</small>}
        </div>
      )}
    </article>
  );
};

export default ProgramCard;
