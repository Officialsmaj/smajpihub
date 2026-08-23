import { useEffect, useState, type CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import EducationBackBar from "../../components/education/EducationBackBar";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import { getUniversity, createUniversityApplication } from "../../lib/educationApi";
import type { University, UniversityProgram } from "../../types/education";
import ProgramCard from "../../components/education/ProgramCard";
import "../../components/education/education.css";

const UniversityProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<UniversityProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoFailed, setLogoFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "programs" | "admissions" | "apply">("overview");

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    getUniversity(slug)
      .then(data => {
        if (!cancelled) {
          setUniversity(data.university);
          setPrograms(data.programs);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading)
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="universities-page">
          <p>Loading university...</p>
        </main>
      </AppLayout>
    );
  if (!university)
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="universities-page">
          <h2>University not found</h2>
          <Link to="/services/education/universities">Back to universities</Link>
        </main>
      </AppLayout>
    );

  const isPartner = university.partnership_status === "smaj_verified_partner";
  const isApplicationsEnabled = isPartner && university.applications_enabled;
  const brandColor = /^#[0-9a-f]{6}$/i.test(university.brand_primary_color || "")
    ? university.brand_primary_color
    : "#1D6EA5";
  const universityTheme = { "--university-brand": brandColor } as CSSProperties;

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="universities-page university-branded-page" style={universityTheme}>
        <EducationBackBar current="University Profile" />
        <div className={`university-profile-header${university.cover_image_url ? " has-cover" : " no-cover"}`}>
          {university.cover_image_url ? (
            <img src={university.cover_image_url} alt="" className="university-profile-cover" />
          ) : (
            <div className="university-profile-cover university-profile-cover-fallback" />
          )}
          <div className="university-profile-header-content">
            {university.logo_url && !logoFailed ? (
              <img
                src={university.logo_url}
                onError={() => setLogoFailed(true)}
                alt={`${university.short_name || university.official_name} logo`}
                className="university-profile-logo"
              />
            ) : (
              <div className="university-profile-logo-placeholder">
                {(university.short_name || university.official_name).slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="university-profile-identity">
              <div className="university-profile-badges">
                <span className={isPartner ? "partner" : "directory"}>
                  {isPartner ? <VerifiedOutlinedIcon /> : <SchoolOutlinedIcon />}
                  {isPartner ? "SMAJ Verified Partner" : "Global Directory Listing"}
                </span>
              </div>
              <h1>{university.official_name}</h1>
              {university.short_name && university.short_name !== university.official_name && (
                <p className="university-profile-short-name">{university.short_name}</p>
              )}
              <p className="university-profile-location">
                <LocationOnOutlinedIcon />{" "}
                {[university.city, university.state_region, university.country].filter(Boolean).join(", ") ||
                  "Location unavailable"}
              </p>
              <div className="university-profile-quick-actions">
                {university.official_website && (
                  <a href={university.official_website} target="_blank" rel="noopener noreferrer">
                    <LanguageOutlinedIcon /> Official Website
                  </a>
                )}
                {(university.admissions_website || university.official_website) && (
                  <a
                    href={university.admissions_website || university.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Admissions <OpenInNewOutlinedIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="university-profile-tabs">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            Overview
          </button>
          <button className={activeTab === "programs" ? "active" : ""} onClick={() => setActiveTab("programs")}>
            Programs
          </button>
          <button className={activeTab === "admissions" ? "active" : ""} onClick={() => setActiveTab("admissions")}>
            Admissions
          </button>
          {isApplicationsEnabled && (
            <button className={activeTab === "apply" ? "active" : ""} onClick={() => setActiveTab("apply")}>
              Apply
            </button>
          )}
        </div>

        {activeTab === "overview" && (
          <section className="university-profile-section">
            <div className="university-partnership-banner">
              {isPartner ? (
                <div className="university-partner-notice partner">
                  <strong>SMAJ Verified Partner</strong>
                  <p>This institution is authorized to receive applications and Pi payments through SMAJ PI HUB.</p>
                </div>
              ) : (
                <div className="university-partner-notice non-partner">
                  <strong>Not yet a SMAJ Verified Partner</strong>
                  <p>
                    This institution is currently listed for informational purposes. Applications and Pi payments
                    through SMAJ PI HUB are not yet available.
                  </p>
                </div>
              )}
            </div>

            {university.description && <p>{university.description}</p>}

            <div className="university-profile-details">
              {university.institution_type && (
                <div>
                  <strong>Institution type</strong>
                  <span>{university.institution_type}</span>
                </div>
              )}
              {university.founded_year && (
                <div>
                  <strong>Founded</strong>
                  <span>{university.founded_year}</span>
                </div>
              )}
              {university.address && (
                <div>
                  <strong>Address</strong>
                  <span>{university.address}</span>
                </div>
              )}
              {university.contact_email && (
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${university.contact_email}`}>{university.contact_email}</a>
                </div>
              )}
              {university.contact_phone && (
                <div>
                  <strong>Phone</strong>
                  <a href={`tel:${university.contact_phone}`}>{university.contact_phone}</a>
                </div>
              )}
              {university.official_website && (
                <div>
                  <strong>Official Website</strong>
                  <a href={university.official_website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </div>
              )}
              {university.admissions_website && (
                <div>
                  <strong>Admissions Website</strong>
                  <a href={university.admissions_website} target="_blank" rel="noopener noreferrer">
                    Visit Admissions
                  </a>
                </div>
              )}
              {university.languages && university.languages.length > 0 && (
                <div>
                  <strong>Languages</strong>
                  <span>{university.languages.join(", ")}</span>
                </div>
              )}
              {university.recognition_status && (
                <div>
                  <strong>Recognition Status</strong>
                  <span>{university.recognition_status.replace(/_/g, " ")}</span>
                </div>
              )}
              {university.recognition_authority && (
                <div>
                  <strong>Recognition Authority</strong>
                  <span>{university.recognition_authority}</span>
                </div>
              )}
              {university.data_last_verified_at && (
                <div>
                  <strong>Information last checked</strong>
                  <span>{new Date(university.data_last_verified_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {!university.profile_claimed && (
              <div className="university-claim-cta">
                <h3>Represent this university?</h3>
                <p>If you are an official representative, you can request ownership of this profile.</p>
                <Link
                  to={`/services/education/universities/${university.slug}/claim`}
                  className="university-primary-btn"
                >
                  Request to Claim
                </Link>
              </div>
            )}
          </section>
        )}

        {activeTab === "programs" && (
          <section className="university-profile-section">
            <h2>Programs</h2>
            {programs.length === 0 ? (
              <div className="university-data-empty">
                <SchoolOutlinedIcon />
                <h3>Programs are not imported yet</h3>
                <p>
                  SMAJ does not invent degree information. Use the official university website for the latest faculties,
                  degrees, tuition, and study options.
                </p>
                {university.official_website && (
                  <a
                    href={university.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="university-primary-btn"
                  >
                    Explore Official Programs <OpenInNewOutlinedIcon />
                  </a>
                )}
              </div>
            ) : (
              <div className="programs-list">
                {programs.map(program => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "admissions" && (
          <section className="university-profile-section">
            <h2>Admissions</h2>
            {programs.length === 0 ? (
              <div className="university-data-empty">
                <VerifiedOutlinedIcon />
                <h3>Check current admission information</h3>
                <p>
                  Requirements, deadlines, fees, and intakes can change. Continue to the official university source for
                  accurate information.
                </p>
                {(university.admissions_website || university.official_website) && (
                  <a
                    href={university.admissions_website || university.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="university-primary-btn"
                  >
                    Visit Official Admissions <OpenInNewOutlinedIcon />
                  </a>
                )}
              </div>
            ) : (
              <div className="programs-list">
                {programs.map(program => (
                  <div key={program.id} className="admission-card">
                    <h3>{program.name}</h3>
                    {program.admission_requirements && (
                      <p>
                        <strong>Requirements:</strong> {program.admission_requirements}
                      </p>
                    )}
                    {program.intake && program.intake.length > 0 && (
                      <p>
                        <strong>Intake:</strong> {program.intake.join(", ")}
                      </p>
                    )}
                    {program.application_opening_date && (
                      <p>
                        <strong>Opening:</strong> {program.application_opening_date}
                      </p>
                    )}
                    {program.application_deadline && (
                      <p>
                        <strong>Deadline:</strong> {program.application_deadline}
                      </p>
                    )}
                    {program.application_fee && (
                      <p>
                        <strong>Application Fee:</strong> {program.application_fee}{" "}
                        {program.application_fee_currency || ""}
                      </p>
                    )}
                    {program.official_program_url && (
                      <a
                        href={program.official_program_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="university-secondary-btn"
                      >
                        Visit Official Program Page
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!isPartner && university.admissions_website && (
              <div className="university-official-admissions">
                <a
                  href={university.admissions_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="university-primary-btn"
                >
                  Visit Official Admissions Website
                </a>
              </div>
            )}
          </section>
        )}

        {activeTab === "apply" && isApplicationsEnabled && (
          <section className="university-profile-section">
            <h2>Apply</h2>
            {!isPartner ? (
              <p>Applications are only available for SMAJ Verified Partners.</p>
            ) : (
              <ApplyForm university={university} programs={programs} onApplied={() => {}} />
            )}
          </section>
        )}
      </main>
    </AppLayout>
  );
};

const ApplyForm = ({
  university,
  programs,
  onApplied,
}: {
  university: University;
  programs: UniversityProgram[];
  onApplied: () => void;
}) => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      await createUniversityApplication(university.id, {
        program_id: selectedProgram || undefined,
        program_name: programs.find(p => p.id === selectedProgram)?.name || "",
        personal_information: {
          full_name: formData.get("full_name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
        },
        education_history: [],
        required_documents: [],
        statement_essay: (formData.get("statement") as string) || undefined,
      });
      setMessage("Application submitted successfully!");
      onApplied();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="university-apply-form">
      {message && <div className="university-alert">{message}</div>}
      <label>
        Program
        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} required>
          <option value="">Select a program</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Full Name
        <input type="text" name="full_name" required />
      </label>
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Phone
        <input type="tel" name="phone" />
      </label>
      <label>
        Personal Statement (optional)
        <textarea name="statement" rows={4} />
      </label>
      <button type="submit" disabled={submitting} className="university-primary-btn">
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
};

export default UniversityProfilePage;
