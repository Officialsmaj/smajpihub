import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const badgeMeta: Record<VerificationLevel, { label: string; icon: string }> = {
  basic: { label: "Basic", icon: "✓" },
  pi_verified: { label: "Pi Verified", icon: "π" },
  seller_verified: { label: "Seller Verified", icon: "✓" },
  trusted_seller: { label: "Trusted Seller", icon: "★" },
};

const TrustBadge = ({ level = "basic", status }: { level?: VerificationLevel | "verified"; status?: VerificationStatus }) => {
  const normalizedLevel: VerificationLevel = level === "verified" ? "pi_verified" : level;
  const meta = badgeMeta[normalizedLevel];
  return (
    <span className={`trust-badge ${normalizedLevel} ${status !== "approved" ? "not-approved" : ""}`} aria-label={meta.label} title={meta.label}>
      <span aria-hidden="true">{meta.icon}</span>
      <b>{meta.label}</b>
    </span>
  );
};

export default TrustBadge;
