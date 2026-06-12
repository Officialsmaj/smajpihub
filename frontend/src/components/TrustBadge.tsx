import type { VerificationLevel } from "../types/marketplace";
const labels: Record<VerificationLevel, string> = { basic: "Basic", verified: "Verified", trusted_seller: "Trusted Seller" };
const TrustBadge = ({ level = "basic" }: { level?: VerificationLevel }) => <span className={`trust-badge ${level}`}>{labels[level]}</span>;
export default TrustBadge;
