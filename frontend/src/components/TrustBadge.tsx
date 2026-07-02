import type { VerificationLevel } from "../types/marketplace";
const labels: Record<VerificationLevel, string> = { basic: "Verified", verified: "Verified", trusted_seller: "Trusted Seller" };
const TrustBadge = ({ level = "verified" }: { level?: VerificationLevel }) => <span className={`trust-badge ${level}`}><span aria-hidden="true">✓</span>{labels[level]}</span>;
export default TrustBadge;
