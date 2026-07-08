import type { VerificationLevel, VerificationStatus } from "../types/marketplace";

const UserCheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M16 11l2 2 4-4" />
  </svg>
);

const PiIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <text x="12" y="17.5" textAnchor="middle" fontSize="17" fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif" fill="currentColor">π</text>
  </svg>
);

const ShopCheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M2 7h20" />
    <path d="M12 20v-8" />
    <path d="M16.5 12.5l1.5 1.5 3-3" />
  </svg>
);

const StarCheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

type BadgeMeta = { label: string; bg: string; fg: string; Icon: () => JSX.Element };

const badgeMeta: Record<VerificationLevel, BadgeMeta> = {
  basic: { label: "Basic", bg: "#f1f5f9", fg: "#64748b", Icon: UserCheckIcon },
  pi_verified: { label: "Pi Verified", bg: "#f3e8ff", fg: "#7c3aed", Icon: PiIcon },
  seller_verified: { label: "Seller Verified", bg: "#dbeafe", fg: "#2563eb", Icon: ShopCheckIcon },
  trusted_seller: { label: "Trusted Seller", bg: "#fef3c7", fg: "#d97706", Icon: StarCheckIcon },
};

const TrustBadge = ({ level = "basic", status }: { level?: VerificationLevel | "verified"; status?: VerificationStatus }) => {
  const normalizedLevel: VerificationLevel = level === "verified" ? "pi_verified" : level;
  const approved = status === "approved";
  const meta = badgeMeta[normalizedLevel];
  const { Icon } = meta;

  return (
    <span
      className={`trust-badge ${normalizedLevel} ${approved ? "" : "not-approved"}`}
      title={meta.label}
    >
      <Icon />
      <span className="trust-badge-label">{meta.label}</span>
    </span>
  );
};

export default TrustBadge;
