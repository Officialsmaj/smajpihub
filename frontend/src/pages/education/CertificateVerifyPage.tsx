import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { CertificateArtwork } from "./CertificatesPage";
import AppLayout from "../../layouts/AppLayout";
import { verifyCertificate } from "../../lib/coursesApi";
import type { Certificate } from "../../types/courses";
import "../../pages/EducationPage.css";
import "../../components/education/courses.css";

const CertificateVerifyPage = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!certificateId) return;
    verifyCertificate(certificateId)
      .then(data => {
        if (!cancelled) setCertificate(data.certificate as Certificate);
      })
      .catch(() => {
        if (!cancelled) setError("Certificate not found.");
      });
    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  if (error || !certificate) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="courses-page">
          <div className="courses-error">
            <h2>Certificate Not Found</h2>
            <p>{error || "This certificate could not be verified."}</p>
            <Link to="/services/education/courses" className="courses-primary-btn">
              Browse Courses
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page">
        <div className="certificate-verify-result">
          <div className="certificate-valid-banner">
            <CheckCircleOutlineOutlinedIcon />
            <div><strong>Verified and authentic</strong><span>This credential matches the official SMAJ PI Education record.</span></div>
          </div>
          <CertificateArtwork certificate={certificate} />
          <div className="certificate-verify-summary">
            <span>Certificate ID <strong>{certificate.certificate_id}</strong></span>
            <span>Status <strong>{certificate.status.toUpperCase()}</strong></span>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default CertificateVerifyPage;
