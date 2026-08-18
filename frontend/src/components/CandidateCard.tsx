import { Link } from "react-router-dom";
import type { JobsCandidateSearchResult } from "../lib/jobsApi";

type CandidateCardProps = {
  candidate: JobsCandidateSearchResult;
};

const CandidateCard = ({ candidate }: CandidateCardProps) => (
  <article className="jobs-candidate-card">
    <Link to={`/services/jobs/candidates/${encodeURIComponent(candidate.userId)}`}>
      <div className="jobs-candidate-card-header">
        {candidate.avatar ? (
          <img src={candidate.avatar} alt={candidate.displayName} loading="lazy" />
        ) : (
          <span className="jobs-candidate-card-avatar">{candidate.displayName.slice(0, 2).toUpperCase()}</span>
        )}
        <div>
          <h3>{candidate.displayName}</h3>
          <p>{candidate.title || "Candidate"}</p>
        </div>
      </div>
      <div className="jobs-candidate-card-body">
        {candidate.location ? <small>{candidate.location}</small> : null}
        {candidate.availability ? <small>{candidate.availability}</small> : null}
        <div className="jobs-candidate-card-skills">
          {candidate.skills.slice(0, 6).map(skill => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
      <footer>
        <span>View CV</span>
      </footer>
    </Link>
  </article>
);

export default CandidateCard;
