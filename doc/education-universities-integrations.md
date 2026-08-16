# Education / Universities — External Integrations & Licensing Requirements

This document records what external data sources, credentials, licenses, or agreements are still required before real institutional data can be loaded into the SMAJ PI HUB Universities platform.

---

## 1. World Higher Education Database (WHED / IAU)

**Status:** Not integrated.

**What is needed:**
- Formal license or API access agreement with the International Association of Universities (IAU) / UNESCO.
- API credentials or data-export authorization.
- Legal review of redistribution rights: WHED data may be licensed for display only, with restrictions on bulk storage or transformation.

**What it would provide:**
- Authoritative institutional identity.
- Official institution names, country codes, and recognition status.
- WHED IDs for deduplication and verification.

**Current behavior:**
- The platform uses a demo data provider (`createDemoProvider`) that returns three fake universities.
- No real WHED/IAU data is imported.

---

## 2. Official University Websites / APIs

**Status:** Not integrated.

**What is needed:**
- Direct agreements with individual universities or their admissions offices.
- API access tokens where universities expose official APIs.
- Scraping permissions where no API exists (many university websites prohibit automated scraping in their Terms of Service).

**What it would provide:**
- Programs, admissions deadlines, tuition, application fees, intake periods.
- Contact details and official program URLs.

**Current behavior:**
- Admins can manually enter university and program data via the admin panel.
- No automated import from official sources.

---

## 3. National Ministry of Education / Accreditation Authorities

**Status:** Not integrated.

**What is needed:**
- Country-specific data-sharing agreements or open-data API access.
- Example sources:
  - U.S. Department of Education / NCES IPEDS
  - UK Office for Students
  - Nigerian NUC
  - Kenyan CUE
  - South African CHE
  - Australian TEQSA

**What it would provide:**
- Accreditation status, recognition authority, institution type.
- Country-specific institutional metadata.

**Current behavior:**
- Recognition status is manually set by admins.

---

## 4. OpenAlex

**Status:** Not integrated.

**What is needed:**
- OpenAlex provides a free, open API for institutional metadata.
- No license fee is required, but usage must comply with OpenAlex terms and attribution requirements.
- Rate limits and acceptable-use policies apply.

**What it would provide:**
- Supplementary institutional/research metadata.
- Country, city, and language information.
- Works counts, subject areas, and researcher affiliations.

**Current behavior:**
- No OpenAlex integration exists.
- A provider interface (`UniversityDataProvider`) is designed so OpenAlex can be added as a read-only supplementary source once implementation begins.

---

## 5. University Partnership Agreements

**Status:** None. Intentionally disabled until real agreements exist.

**What is needed:**
- Signed agreements between SMAJ PI HUB and each university.
- Explicit authorization for:
  - Receiving applications through SMAJ.
  - Collecting application fees, registration fees, tuition deposits, or tuition in Pi.
  - Displaying official program and admissions data.

**Current behavior:**
- All new universities are created with `partnership_status: "directory"` and `pi_payments_enabled: false`.
- The UI shows: **"Not yet a SMAJ Verified Partner"** with the required disclaimer text.
- Admins must manually change `partnership_status` to `smaj_verified_partner` and enable specific services.
- The backend enforces server-side checks: payments and applications are rejected unless the university is a verified partner with the specific service enabled.

---

## 6. Pi Network Payment Configuration

**Status:** Architecture ready. Payments disabled for education until universities are verified partners.

**What is needed:**
- Pi Platform API key (`PI_API_KEY`) — already configured for other services.
- Per-university authorization: `university.partnership_status === "smaj_verified_partner"` AND `university.pi_payments_enabled === true`.
- Per-payment-category authorization stored in `authorization.payment_categories`.

**Current behavior:**
- The backend creates `UniversityPayment` records and can call the Pi Platform `/v2/payments/{id}/complete` endpoint.
- Payment approval is blocked at the server level for non-partners.
- No Pi payments can be initiated for demo universities.

---

## 7. Data Freshness & Verification

**Status:** Metadata fields exist. No automated freshness checks.

**What is needed:**
- Scheduled sync jobs for each active data provider.
- Staleness detection logic: warn users when `data_last_verified_at` is older than a configurable threshold.
- Admin notifications for universities that need re-verification.

**Current behavior:**
- `last_verified_at` and `data_last_verified_at` are stored on programs and universities.
- Admins can view and update verification dates manually.
- No automated alerts or sync scheduling.

---

## 8. Deduplication

**Status:** Manual merge capability not yet built.

**What is needed:**
- Matching rules using external IDs, official domains, normalized names, country, and city.
- Admin UI for merging duplicate university records.

**Current behavior:**
- `slug` is unique in the database.
- `external_ids` array supports storing multiple provider IDs.
- Duplicates from different providers would need to be merged manually by an admin.

---

## Summary Table

| Integration | Type | License/Credential Required | Status |
|-------------|------|----------------------------|--------|
| WHED / IAU | Institutional identity | License + API agreement | Not started |
| Official university APIs/websites | Programs & admissions | Per-university agreements | Not started |
| National MoE databases | Accreditation | Country-specific agreements | Not started |
| OpenAlex | Supplementary metadata | Free API, attribution required | Not started |
| University partnerships | Applications & Pi payments | Signed SMAJ-university agreements | None (intentionally) |
| Pi Network payments | Pi transactions | PI_API_KEY (exists) | Ready, gated by partnership |

---

## Recommended Next Steps

1. **Apply for WHED/IAU access** or identify a country-specific open-data source for initial institutional recognition data.
2. **Select 2–3 pilot universities** willing to sign partnership agreements with SMAJ PI HUB.
3. **Implement OpenAlex provider** as a free supplementary source while formal agreements are pursued.
4. **Build automated sync scheduling** for approved providers.
5. **Add deduplication admin UI** once multiple providers return data.
