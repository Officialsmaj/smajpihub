import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
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
    verifyCertificate(certificateId).then((data) => {
      if (!cancelled) setCertificate(data.certificate as Certificate);
    }).catch(() => {
      if (!cancelled) setError("Certificate not found.");
    });
    return () => { cancelled = true; };
  }, [certificateId]);

  if (error || !certificate) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="courses-page">
          <div className="courses-error">
            <h2>Certificate Not Found</h2>
            <p>{error || "This certificate could not be verified."}</p>
            <Link to="/services/education/courses" className="courses-primary-btn">Browse Courses</Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page">
        <div className="certificate-verify">
          <div className="certificate-verify-badge">
            <CheckCircleOutlineOutlinedIcon />
            <h1>Verified Certificate</h1>
          </div>
          <div className="certificate-verify-details">
            <div><strong>Learner</strong><span>{certificate.learner_name}</span></div>
            <div><strong>Course</strong><span>{certificate.course_title}</span></div>
            {certificate.instructor_name && <div><strong>Instructor</strong><span>{certificate.instructor_name}</span></div>}
            {certificate.provider_name && <div><strong>Provider</strong><span>{certificate.provider_name}</span></div>}
            <div><strong>Completion Date</strong><span>{new Date(certificate.completion_date).toLocaleDateString()}</span></div>
            <div><strong>Issue Date</strong><span>{new Date(certificate.issue_date).toLocaleDateString()}</span></div>
            {certificate.final_score !== undefined && <div><strong>Final Score</strong><span>{certificate.final_score}%</span></div>}
            <div><strong>Certificate ID</strong><span>{certificate.certificate_id}</span></div>
            <div><strong>Status</strong><span className={`certificate-status ${certificate.status}`}>{certificate.status}</span></div>
          </div>
          <p className="certificate-verify-footer">
            Verified through SMAJ PI HUB. This certificate record is authentic and was issued by the authorized instructor/provider.
          </p>
        </div>
      </main>
    </AppLayout>
  );
};

export default CertificateVerifyPage;
