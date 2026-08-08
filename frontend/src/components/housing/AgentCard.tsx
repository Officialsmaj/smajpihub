import type { HousingAgent } from "../../types/housing";

type AgentCardProps = {
  agent: HousingAgent;
};

const AgentCard = ({ agent }: AgentCardProps) => (
  <article className="housing-agent-card">
    <img src={agent.image} alt="" />
    <div>
      <div className="housing-agent-header">
        <h3>{agent.name}</h3>
        <span className="housing-rating">{agent.rating}</span>
      </div>
      <p className="housing-agent-meta">
        {agent.listings} listings · {agent.location}
      </p>
      <p className="housing-agent-description">{agent.description}</p>
    </div>
  </article>
);

export default AgentCard;
