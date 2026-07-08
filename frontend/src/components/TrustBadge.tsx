import type { ReactElement } from "react";
import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const VerifiedIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
    <path d="m23 12-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.82.34 3.68L1 12l2.44 2.78-.34 3.68 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12Zm-12.91 4.72-3.8-3.81 1.41-1.41 2.39 2.4 5.95-5.96 1.41 1.41-7.36 7.37Z" />
  </svg>
);

const badgeMeta: Record<Exclude<VerificationLevel, "basic">, { label: string }> = {
  pi_verified: { label: "Pi Verified" },
  seller_verified: { label: "Seller Verified" },
  trusted_seller: { label: "Trusted Seller" },
};

const TrustBadge = ({ level = "basic", status }: { level?: VerificationLevel | "verified"; status?: VerificationStatus }): ReactElement | null => {
  const normalizedLevel: VerificationLevel = level === "verified" ? "pi_verified" : level;
  if (status !== "approved" || normalizedLevel === "basic") return null;
  const meta = badgeMeta[normalizedLevel];

  return (
    <span
      className={`trust-badge ${normalizedLevel}`}
      role="img"
      aria-label={meta.label}
      title={meta.label}
    >
      <VerifiedIcon />
    </span>
  );
};

export default TrustBadge;
