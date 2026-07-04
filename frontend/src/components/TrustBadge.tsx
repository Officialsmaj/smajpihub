import type { VerificationLevel } from "../types/marketplace";

const labels: Record<VerificationLevel, string> = {
  basic: "Verified",
  verified: "Verified",
  trusted_seller: "Trusted",
};

const TrustBadge = ({ level = "verified" }: { level?: VerificationLevel }) => (
  <span className={`trust-badge ${level}`} aria-label={labels[level]} title={labels[level]}>
    <span aria-hidden="true">✓</span>
  </span>
);

export default TrustBadge;
