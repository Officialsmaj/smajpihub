import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const labels: Record<VerificationLevel, string> = {
  basic: "Basic",
  pi_verified: "Pi Verified",
  seller_verified: "Seller Verified",
  trusted_seller: "Trusted Seller",
};

const TrustBadge = ({ level = "basic", status }: { level?: VerificationLevel | "verified"; status?: VerificationStatus }) => {
  const normalizedLevel: VerificationLevel = level === "verified" ? "pi_verified" : level;
  if (status !== "approved" || normalizedLevel === "basic") return null;
  return (
    <span className={`trust-badge ${normalizedLevel}`} aria-label={labels[normalizedLevel]} title={labels[normalizedLevel]}>
      <span aria-hidden="true">{normalizedLevel === "trusted_seller" ? "★" : "✓"}</span>
    </span>
  );
};

export default TrustBadge;
