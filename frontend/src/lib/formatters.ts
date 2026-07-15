const countryCodeMap: Record<string, string> = {
  algeria: "DZ",
  bahrain: "BH",
  germany: "DE",
  egypt: "EG",
  india: "IN",
  indonesia: "ID",
  italy: "IT",
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

const countryNameByCode = Object.fromEntries(
  Object.entries(countryCodeMap).map(([name, code]) => [code, name])
) as Record<string, string>;

const titleCaseCountry = (country: string) =>
  country.replace(/\b[a-z]/g, (char) => char.toUpperCase());

let countryCodesByName: Record<string, string> | null = null;

const getCountryCodesByName = () => {
  if (countryCodesByName) return countryCodesByName;

  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  const entries: [string, string][] = [];

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = displayNames.of(code);
      if (name && name !== code) entries.push([name.toLowerCase(), code]);
    }
  }

  countryCodesByName = { ...Object.fromEntries(entries), ...countryCodeMap };
  return countryCodesByName;
};

export const countryCode = (country?: string) => {
  const normalized = String(country || "").trim().toLowerCase();
  const leadingCode = normalized.match(/^([a-z]{2})(?:\s+|$)/)?.[1]?.toUpperCase();
  return leadingCode || getCountryCodesByName()[normalized] || "";
};

export const formatPiAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "π 0";
  const formatted = value >= 1
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value >= 0.01
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
      : formatPiInputValue(value);
  return `π ${formatted}`;
};

export const formatPiInputValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value >= 1) return String(Math.trunc(value * 100) / 100);
  if (value >= 0.01) return String(Math.trunc(value * 10000) / 10000);
  if (value >= 0.0001) return String(Math.trunc(value * 10000) / 10000);
  return String(Math.trunc(value * 100000000) / 100000000);
};

export const formatUsdAmount = (value: number) =>
  Number.isFinite(value) && value > 0 ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";

export const countryFlag = (country?: string) => {
  const code = countryCode(country);
  if (!code) return "";
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

export const countryDisplayName = (country?: string) => {
  const raw = String(country || "").trim();
  if (!raw) return "";
  const leadingCode = raw.match(/^([A-Za-z]{2})(?:\s+(.+))?$/);
  if (leadingCode?.[2]) return leadingCode[2].trim();
  if (leadingCode?.[1]) return titleCaseCountry(countryNameByCode[leadingCode[1].toUpperCase()] || raw);
  return raw;
};
