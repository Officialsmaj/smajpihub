import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import AppLayout from "../../layouts/AppLayout";
import EducationHeader from "./EducationHeader";
import EducationBackBar from "../../components/education/EducationBackBar";
import { getMyCertificates } from "../../lib/coursesApi";
import type { Certificate } from "../../types/courses";
import "../../pages/EducationPage.css";
import "../../components/education/courses.css";

const sampleCertificate: Certificate = {
  id: "sample",
  certificate_id: "SAMPLE-NOT-VALID",
  enrollment_id: "sample",
  user_id: "sample",
  course_id: "sample",
  course_slug: "sample-course",
  course_title: "Digital Skills Foundations",
  instructor_name: "Sample Instructor",
  provider_name: "SMAJ PI Education",
  learner_name: "Sample Learner",
  certificate_type: "completion",
  enrollment_date: "2026-01-01T00:00:00.000Z",
  completion_date: "2026-03-01T00:00:00.000Z",
  issue_date: "2026-03-01T00:00:00.000Z",
  verification_url: "/services/education/certificates?sample=1",
  status: "valid",
  created_at: "2026-03-01T00:00:00.000Z",
  updated_at: "2026-03-01T00:00:00.000Z",
};

const CertificateArtwork = ({ certificate, sample = false }: { certificate: Certificate; sample?: boolean }) => {
  const [qrCode, setQrCode] = useState("");
  const verificationUrl = useMemo(() => {
    const path = sample
      ? "/services/education/certificates?sample=1"
      : `/verify/certificate/${encodeURIComponent(certificate.certificate_id)}`;
    return new URL(path, window.location.origin).toString();
  }, [certificate.certificate_id, sample]);

  useEffect(() => {
    void QRCode.toDataURL(verificationUrl, { width: 220, margin: 1, errorCorrectionLevel: "H" }).then(setQrCode);
  }, [verificationUrl]);

  const title =
    certificate.certificate_type === "enrollment" ? "Certificate of Enrollment" : "Certificate of Completion";
  const credentialDate =
    certificate.certificate_type === "enrollment" ? certificate.enrollment_date : certificate.completion_date;

  return (
    <article className="credential-sheet">
      {sample && <div className="credential-watermark">SAMPLE · NOT VALID</div>}
      <header className="credential-brand">
        <img src="/smaj_ecosystem_logo.png" alt="SMAJ PI HUB" />
        <div>
          <strong>SMAJ PI EDUCATION</strong>
          <span>Verified Learning Credentials</span>
        </div>
      </header>
      <div className="credential-body">
        <span className="credential-kicker">THIS CERTIFIES THAT</span>
        <h1>{certificate.learner_name}</h1>
        <p>has been officially awarded this</p>
        <h2>{title}</h2>
        <p>
          for <strong>{certificate.course_title}</strong>
        </p>
        {certificate.provider_name && <p>Issued by {certificate.provider_name}</p>}
      </div>
      <footer className="credential-footer">
        <div>
          <span>Date</span>
          <strong>
            {credentialDate
              ? new Date(credentialDate).toLocaleDateString()
              : new Date(certificate.issue_date).toLocaleDateString()}
          </strong>
        </div>
        <div className="credential-seal">
          <CheckCircleOutlineOutlinedIcon />
          <span>VERIFIED</span>
        </div>
        <div className="credential-qr">
          {qrCode && <img src={qrCode} alt="Scan to verify certificate" />}
          <span>Scan to verify</span>
        </div>
      </footer>
      <div className="credential-id">
        Certificate ID: {certificate.certificate_id} · {verificationUrl}
      </div>
    </article>
  );
};

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    getMyCertificates()
      .then(items => {
        setCertificates(items);
        if (items[0]) setSelectedId(items[0].certificate_id);
      })
      .catch(() => setSignedIn(false))
      .finally(() => setLoading(false));
  }, []);

  const selected = certificates.find(item => item.certificate_id === selectedId) || certificates[0];
  const shareCertificate = async () => {
    if (!selected) return;
    const url = new URL(
      `/verify/certificate/${encodeURIComponent(selected.certificate_id)}`,
      window.location.origin
    ).toString();
    if (navigator.share)
      await navigator.share({
        title: `${selected.course_title} certificate`,
        text: `Verify my ${selected.certificate_type} certificate`,
        url,
      });
    else await navigator.clipboard.writeText(url);
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page certificates-center">
        <EducationHeader query="" onQueryChange={() => undefined} searchPath="/services/education/certificates" />
        <EducationBackBar current="Certificates" />
        <section className="courses-hero certificates-center-hero">
          <span className="courses-kicker">VERIFIED CREDENTIALS</span>
          <h1>My Certificates</h1>
          <p>
            View enrollment and completion credentials, print a PDF, share them, or scan their QR code to verify the
            official record.
          </p>
        </section>

        {loading ? (
          <div className="courses-loading">Loading certificates...</div>
        ) : selected ? (
          <>
            <div className="certificate-picker" aria-label="Choose a certificate">
              {certificates.map(certificate => (
                <button
                  key={certificate.certificate_id}
                  className={certificate.certificate_id === selected.certificate_id ? "active" : ""}
                  onClick={() => setSelectedId(certificate.certificate_id)}
                >
                  <strong>{certificate.course_title}</strong>
                  <span>{certificate.certificate_type === "enrollment" ? "Enrollment" : "Completion"}</span>
                </button>
              ))}
            </div>
            <CertificateArtwork certificate={selected} />
            <div className="certificate-actions">
              <Link className="course-primary-btn" to={`/verify/certificate/${selected.certificate_id}`}>
                Verify Certificate
              </Link>
              <button className="course-secondary-btn" onClick={() => window.print()}>
                <DownloadOutlinedIcon /> Print / Save PDF
              </button>
              <button className="course-secondary-btn" onClick={() => void shareCertificate()}>
                <ShareOutlinedIcon /> Share
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="certificate-empty-copy">
              <h2>{signedIn ? "Your first certificate will appear here" : "Sign in to view your certificates"}</h2>
              <p>
                This preview uses a fictional learner and cannot be verified. Real certificates use the full name stored
                in the issued credential and a unique server-backed QR code.
              </p>
            </div>
            <CertificateArtwork certificate={sampleCertificate} sample />
            <div className="certificate-actions">
              <Link className="course-primary-btn" to="/services/education/courses">
                Browse Courses
              </Link>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
};

export default CertificatesPage;
