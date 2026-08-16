import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import { getUniversity, createUniversityClaim } from "../../lib/educationApi";
import type { University } from "../../types/education";
import "../../components/education/education.css";

const UniversityClaimPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    university_name: "",
    representative_full_name: "",
    job_title: "",
    institutional_email: "",
    department: "",
    phone: "",
    university_website: "",
    proof_of_authority: "",
    supporting_documents: "",
    message: "",
  });

  useState(() => {
    let cancelled = false;
    if (!slug) return;
    setLoading(true);
    getUniversity(slug).then((data) => {
      if (!cancelled) {
        setUniversity(data.university);
        setForm(f => ({ ...f, university_name: data.university?.official_name || "" }));
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  });

  const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const claim = await createUniversityClaim({
        university_id: university?.id || slug || "",
        university_slug: slug || "",
        university_name: form.university_name,
        representative_full_name: form.representative_full_name,
        job_title: form.job_title,
        institutional_email: form.institutional_email,
        department: form.department,
        phone: form.phone,
        university_website: form.university_website,
        proof_of_authority: form.proof_of_authority,
        supporting_documents: form.supporting_documents ? form.supporting_documents.split(",").map(s => s.trim()).filter(Boolean) : [],
        message: form.message,
      });
      setMessage(`Claim submitted successfully. Reference: ${claim.id}`);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppLayout showHeader={false} showFooter={false}><main className="universities-page"><p>Loading...</p></main></AppLayout>;
  if (!university) return <AppLayout showHeader={false} showFooter={false}><main className="universities-page"><h2>University not found</h2><Link to="/services/education/universities">Back</Link></main></AppLayout>;

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="universities-page">
        <section className="universities-hero">
          <span className="universities-kicker">PROFILE CLAIM</span>
          <h1>Represent {university.official_name}?</h1>
          <p>Request ownership of this institutional profile. Our team will verify your authority before approving.</p>
        </section>

        <section className="university-claim-section">
          {message && <div className={`university-alert ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>}
          <form onSubmit={handleSubmit} className="university-claim-form">
            <div className="form-group">
              <label>University Name</label>
              <input type="text" value={form.university_name} onChange={(e) => updateForm("university_name", e.target.value)} required readOnly />
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={form.representative_full_name} onChange={(e) => updateForm("representative_full_name", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Job Title *</label>
              <input type="text" value={form.job_title} onChange={(e) => updateForm("job_title", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Institutional Email *</label>
              <input type="email" value={form.institutional_email} onChange={(e) => updateForm("institutional_email", e.target.value)} required />
              <small>Use an official university email address for faster verification.</small>
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" value={form.department} onChange={(e) => updateForm("department", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label>University Website</label>
              <input type="url" value={form.university_website} onChange={(e) => updateForm("university_website", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Proof of Authority *</label>
              <textarea value={form.proof_of_authority} onChange={(e) => updateForm("proof_of_authority", e.target.value)} rows={3} required placeholder="Describe your role and authority at this institution." />
            </div>
            <div className="form-group">
              <label>Supporting Documents (optional, comma-separated URLs)</label>
              <input type="text" value={form.supporting_documents} onChange={(e) => updateForm("supporting_documents", e.target.value)} placeholder="https://..., https://..." />
            </div>
            <div className="form-group">
              <label>Message (optional)</label>
              <textarea value={form.message} onChange={(e) => updateForm("message", e.target.value)} rows={3} />
            </div>
            <button type="submit" disabled={submitting} className="university-primary-btn">
              {submitting ? "Submitting..." : "Submit Claim Request"}
            </button>
          </form>
        </section>
      </main>
    </AppLayout>
  );
};

export default UniversityClaimPage;
