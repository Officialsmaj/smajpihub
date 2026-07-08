import type { ReactElement } from "react";
import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const VerifiedIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.16-.44.24-.9.24-1.4 0-2.21-1.71-4-3.82-4-.47 0-.92.08-1.33.25C14.82 2.42 13.51 1.5 12 1.5s-2.82.92-3.44 2.25c-.41-.17-.86-.25-1.33-.25-2.11 0-3.82 1.79-3.82 4 0 .5.08.96.24 1.4-1.27.65-2.15 2.02-2.15 3.6 0 1.5.78 2.8 1.94 3.49-.02.17-.03.34-.03.51 0 2.21 1.71 4 3.82 4 .47 0 .92-.09 1.33-.25.62 1.33 1.93 2.25 3.44 2.25s2.82-.92 3.44-2.25c.41.16.86.25 1.33.25 2.11 0 3.82-1.79 3.82-4 0-.17-.01-.34-.03-.51 1.16-.69 1.94-1.99 1.94-3.49Zm-6.62-3.33-4.33 6.5a.75.75 0 0 1-1.16.11l-2.41-2.42a.75.75 0 1 1 1.06-1.06l1.77 1.77 3.82-5.74a.75.75 0 1 1 1.25.84Z" />
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
