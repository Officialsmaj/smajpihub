import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const labels: Record<VerificationLevel, string> = {
  basic: "Verified",
  verified: "Verified",
  trusted_seller: "Trusted",
};

const TrustBadge = ({ level = "basic", status }: { level?: VerificationLevel; status?: VerificationStatus }) => {
  if (status !== "approved" || level === "basic") return null;
  return (
    <span className={`trust-badge ${level}`} aria-label={labels[level]} title={labels[level]}>
      <span aria-hidden="true">✓</span>
    </span>
  );
};

export default TrustBadge;
