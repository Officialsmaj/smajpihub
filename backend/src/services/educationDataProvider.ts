import type { UniversityData, UniversityProgramData, UniversityDataProvenance, UniversityExternalId } from "../types/education";
import { ObjectId } from "mongodb";

export interface UniversityDataProvider {
  name: string;
  searchInstitutions(query: string, countryCode?: string, limit?: number): Promise<UniversityData[]>;
  getInstitution(externalId: string): Promise<UniversityData | null>;
  getPrograms(universityId: string): Promise<UniversityProgramData[]>;
  getAdmissions(universityId: string): Promise<Partial<UniversityProgramData> | null>;
  normalizeInstitution(raw: Record<string, any>): Promise<UniversityData>;
  syncInstitution(universityId: string): Promise<UniversityData | null>;
  validateSource(): Promise<boolean>;
}

const defaultProvenance = (sourceType: UniversityDataProvenance["source_type"], sourceName: string, sourceUrl: string): UniversityDataProvenance => ({
  source_type: sourceType,
  source_name: sourceName,
  source_url: sourceUrl,
  retrieved_at: new Date().toISOString(),
  last_verified_at: new Date().toISOString(),
  verification_status: "unverified",
  confidence: sourceType === "official_website" ? 0.9 : sourceType === "whed_iau" ? 0.85 : 0.6,
  is_official_source: sourceType === "official_website" || sourceType === "national_ministry",
});

export const createDemoProvider = (): UniversityDataProvider => ({
  name: "Demo University Data Provider",
  async searchInstitutions(query: string, _countryCode?: string, limit = 20): Promise<UniversityData[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const demoUniversities: UniversityData[] = [
      {
        _id: new ObjectId(),
        slug: "global-institute-of-technology",
        official_name: "Global Institute of Technology",
        short_name: "GIT",
        description: "A demo institution for platform development and UI verification.",
        institution_type: "research",
        country: "United States",
        country_code: "US",
        city: "San Francisco",
        state_region: "California",
        official_website: "https://example.edu",
        contact_email: "info@example.edu",
        languages: ["English"],
        recognition_status: "directory",
        recognition_authority: "Demo Authority",
        external_ids: [{ provider: "demo", id: "git-001" }],
        partnership_status: "directory",
        pi_payments_enabled: false,
        applications_enabled: false,
        profile_claimed: false,
        data_last_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_demo: true,
      },
      {
        _id: new ObjectId(),
        slug: "pioneer-academy-of-sciences",
        official_name: "Pioneer Academy of Sciences",
        short_name: "PAS",
        description: "Another demo institution for UI development.",
        institution_type: "public",
        country: "United Kingdom",
        country_code: "GB",
        city: "London",
        official_website: "https://example.ac.uk",
        contact_email: "info@example.ac.uk",
        languages: ["English"],
        recognition_status: "recognition_verified",
        recognition_authority: "Demo UK Authority",
        external_ids: [{ provider: "demo", id: "pas-002" }],
        partnership_status: "directory",
        pi_payments_enabled: false,
        applications_enabled: false,
        profile_claimed: false,
        data_last_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_demo: true,
      },
      {
        _id: new ObjectId(),
        slug: "african-leadership-university",
        official_name: "African Leadership University",
        short_name: "ALU",
        description: "Demo African university for development testing.",
        institution_type: "private",
        country: "Rwanda",
        country_code: "RW",
        city: "Kigali",
        official_website: "https://example.aluedu.org",
        contact_email: "info@example.aluedu.org",
        languages: ["English", "French"],
        recognition_status: "recognition_verified",
        recognition_authority: "Demo Rwanda Authority",
        external_ids: [{ provider: "demo", id: "alu-003" }],
        partnership_status: "partnership_pending",
        partner_since: new Date().toISOString(),
        pi_payments_enabled: false,
        applications_enabled: false,
        profile_claimed: true,
        claimed_by_user_id: "demo-user",
        data_last_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_demo: true,
      },
    ];

    if (!normalizedQuery) return demoUniversities.slice(0, limit);
    return demoUniversities.filter((uni) => {
      const searchText = `${uni.official_name} ${uni.short_name || ""} ${uni.city || ""} ${uni.country || ""}`.toLowerCase();
      return searchText.includes(normalizedQuery);
    }).slice(0, limit);
  },
  async getInstitution(_externalId: string): Promise<UniversityData | null> {
    const [first] = await this.searchInstitutions("");
    return first || null;
  },
  async getPrograms(_universityId: string): Promise<UniversityProgramData[]> {
    return [
      {
        _id: new ObjectId(),
        university_id: _universityId,
        university_slug: "global-institute-of-technology",
        name: "Bachelor of Science in Computer Science",
        degree_level: "bachelor",
        field: "Computer Science",
        description: "A comprehensive undergraduate program in computer science.",
        duration: "4 years",
        study_mode: "on_campus",
        teaching_language: "English",
        tuition: 25000,
        tuition_currency: "USD",
        application_fee: 50,
        application_fee_currency: "USD",
        admission_requirements: "High school diploma, SAT/ACT scores, letters of recommendation.",
        intake: ["Fall", "Spring"],
        application_opening_date: "2025-09-01",
        application_deadline: "2026-01-15",
        official_program_url: "https://example.edu/programs/cs",
        provenance: defaultProvenance("official_website", "Example University", "https://example.edu/programs/cs"),
        last_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_demo: true,
      },
    ];
  },
  async getAdmissions(_universityId: string): Promise<Partial<UniversityProgramData> | null> {
    return {
      application_fee: 50,
      application_fee_currency: "USD",
      application_opening_date: "2025-09-01",
      application_deadline: "2026-01-15",
      intake: ["Fall", "Spring"],
    };
  },
  async normalizeInstitution(raw: Record<string, any>): Promise<UniversityData> {
    return {
      _id: raw._id || new (require("mongodb").ObjectId)(),
      slug: String(raw.slug || raw.official_name || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      official_name: String(raw.official_name || raw.name || "Unknown Institution"),
      short_name: raw.short_name,
      local_name: raw.local_name,
      logo_url: raw.logo_url,
      cover_image_url: raw.cover_image_url,
      description: raw.description,
      institution_type: ["public", "private", "research", "polytechnic", "college", "institute", "academy", "other"].includes(raw.institution_type) ? raw.institution_type : "other",
      founded_year: raw.founded_year ? Number(raw.founded_year) : undefined,
      country: String(raw.country || ""),
      country_code: String(raw.country_code || "").toUpperCase().slice(0, 2),
      state_region: raw.state_region,
      city: raw.city,
      address: raw.address,
      postal_code: raw.postal_code,
      latitude: raw.latitude ? Number(raw.latitude) : undefined,
      longitude: raw.longitude ? Number(raw.longitude) : undefined,
      official_website: raw.official_website,
      admissions_website: raw.admissions_website,
      contact_email: raw.contact_email,
      contact_phone: raw.contact_phone,
      languages: Array.isArray(raw.languages) ? raw.languages.filter(Boolean) : [],
      recognition_status: ["directory", "recognition_verified", "partnership_pending", "smaj_verified_partner", "partnership_suspended"].includes(raw.recognition_status) ? raw.recognition_status : "directory",
      recognition_authority: raw.recognition_authority,
      external_ids: Array.isArray(raw.external_ids) ? raw.external_ids : [],
      whed_id: raw.whed_id,
      partnership_status: ["directory", "recognition_verified", "partnership_pending", "smaj_verified_partner", "partnership_suspended"].includes(raw.partnership_status) ? raw.partnership_status : "directory",
      partner_since: raw.partner_since,
      pi_payments_enabled: Boolean(raw.pi_payments_enabled),
      applications_enabled: Boolean(raw.applications_enabled),
      profile_claimed: Boolean(raw.profile_claimed),
      claimed_by_user_id: raw.claimed_by_user_id,
      data_last_verified_at: raw.data_last_verified_at,
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: Boolean(raw.is_demo),
    };
  },
  async syncInstitution(_universityId: string): Promise<UniversityData | null> {
    return this.getInstitution(_universityId);
  },
  async validateSource(): Promise<boolean> {
    return true;
  },
});
