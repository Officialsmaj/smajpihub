import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const badgeMeta: Record<VerificationLevel, { label: string; color: string }> = {
  basic: { label: "Basic", color: "#64748b" },
  pi_verified: { label: "Pi Verified", color: "#7c3aed" },
  seller_verified: { label: "Seller Verified", color: "#2563eb" },
  trusted_seller: { label: "Trusted Seller", color: "#d97706" },
};

const VerifiedIcon = () => (
  <svg className="trust-icon" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M20.396 11c0-.86-.703-1.562-1.562-1.562-.383 0-.74.14-1.016.394-.562-.66-1.394-1.082-2.32-1.082-.317 0-.62.05-.906.14-.364-.92-1.25-1.573-2.305-1.573-1.055 0-1.94.653-2.305 1.573-.286-.09-.59-.14-.906-.14-.926 0-1.758.421-2.32 1.082-.276-.253-.633-.394-1.016-.394-.86 0-1.562.703-1.562 1.562 0 .384.14.742.394 1.016-.66.562-1.082 1.395-1.082 2.32 0 .317.05.62.14.907.92.363 1.573 1.25 1.573 2.304 0 1.055-.653 1.94-1.573 2.304.09.287.14.59.14.907 0 .926-.422 1.758-1.082 2.32-.254.276-.394.633-.394 1.017 0 .86.703 1.562 1.562 1.562.383 0 .742-.14 1.016-.394.562.66 1.395 1.082 2.32 1.082.317 0 .62-.05.907-.14.363.92 1.25 1.573 2.305 1.573 1.054 0 1.94-.653 2.304-1.573.287.09.59.14.907.14.925 0 1.758-.421 2.32-1.082.276.253.633.394 1.016.394.86 0 1.562-.703 1.562-1.562 0-.384-.14-.742-.394-1.017.66-.561 1.082-1.394 1.082-2.32 0-.316-.05-.62-.14-.906.92-.364 1.573-1.25 1.573-2.305 0-1.054-.653-1.94-1.573-2.304.09-.287.14-.59.14-.907 0-.925-.421-1.758-1.082-2.32.254-.276.394-.633.394-1.016zM9.23 17.727l-4.16-4.173 1.42-1.42 2.735 2.73 6.35-6.35 1.406 1.42-7.75 7.793z"
    />
  </svg>
);

const TrustBadge = ({ level = "basic", status }: { level?: VerificationLevel | "verified"; status?: VerificationStatus }) => {
  const normalizedLevel: VerificationLevel = level === "verified" ? "pi_verified" : level;
  const approved = status === "approved";
  const shownLevel = approved ? normalizedLevel : "basic";
  const meta = badgeMeta[shownLevel];

  return (
    <span
      className={`trust-badge ${normalizedLevel} ${approved ? "" : "not-approved"}`}
      role="img"
      aria-label={meta.label}
      title={meta.label}
    >
      <VerifiedIcon />
    </span>
  );
};

export default TrustBadge;
