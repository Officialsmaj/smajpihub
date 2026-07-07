const countryCodeMap: Record<string, string> = {
  algeria: "DZ",
  bahrain: "BH",
  egypt: "EG",
  india: "IN",
  indonesia: "ID",
  jordan: "JO",
  kenya: "KE",
  kuwait: "KW",
  lebanon: "LB",
  malaysia: "MY",
  morocco: "MA",
  nigeria: "NG",
  oman: "OM",
  pakistan: "PK",
  philippines: "PH",
  qatar: "QA",
  "saudi arabia": "SA",
  turkey: "TR",
  "united arab emirates": "AE",
  uae: "AE",
  "united kingdom": "GB",
  uk: "GB",
  "united states": "US",
  usa: "US",
};

export const formatPiAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0 PI";
  const formatted = value >= 1
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value >= 0.01
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
      : formatPiInputValue(value);
  return `${formatted} PI`;
};

export const formatPiInputValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value >= 1) return String(Math.trunc(value * 100) / 100);
  if (value >= 0.01) return String(Math.trunc(value * 10000) / 10000);
  return String(Math.trunc(value * 10000) / 10000);
};

export const formatUsdAmount = (value: number) =>
  Number.isFinite(value) && value > 0 ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";

export const countryFlag = (country?: string) => {
  const normalized = String(country || "").trim().toLowerCase();
  const code = countryCodeMap[normalized];
  if (!code) return "";
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};
