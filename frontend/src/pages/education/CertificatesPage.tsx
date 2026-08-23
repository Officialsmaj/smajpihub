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
  provider_name: "SMAJ",
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

const safeFileName = (value: string) => value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

const downloadCertificate = async (certificate: Certificate, signatureUrl?: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1800; canvas.height = 1273;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const verifyUrl = new URL(`/verify/certificate/${encodeURIComponent(certificate.certificate_id)}`, window.location.origin).toString();
  const qr = new Image();
  qr.src = await QRCode.toDataURL(verifyUrl, { width: 360, margin: 1, errorCorrectionLevel: "H" });
  await qr.decode();
  const logo = new Image();
  logo.src = "/logo.png";
  await logo.decode();
  const signature = signatureUrl ? new Image() : null;
  if (signature && signatureUrl) { signature.src = signatureUrl; await signature.decode(); }
  const navy = "#10245f", gold = "#d9ac3d", ink = "#182033";
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 1800, 1273);
  ctx.strokeStyle = navy; ctx.lineWidth = 18; ctx.strokeRect(32, 32, 1736, 1209);
  ctx.lineWidth = 3; ctx.strokeRect(55, 55, 1690, 1163);
  ctx.fillStyle = navy; ctx.fillRect(1430, 32, 225, 1209);
  ctx.drawImage(logo, 120, 92, 70, 70);
  ctx.fillStyle = navy; ctx.font = "700 34px Arial"; ctx.fillText("SMAJ", 210, 135);
  ctx.fillStyle = "#657087"; ctx.font = "24px Arial"; ctx.fillText("Verified learning credentials", 130, 180);
  const title = certificate.certificate_type === "enrollment" ? "Enrollment Certificate" : "Completion Certificate";
  ctx.fillStyle = ink; ctx.font = "56px Arial"; ctx.fillText(title, 130, 315);
  ctx.fillStyle = "#616b7d"; ctx.font = "25px Arial"; ctx.fillText("This verified certificate is presented to", 130, 405);
  ctx.fillStyle = ink; ctx.font = "76px Georgia"; ctx.fillText(certificate.learner_name, 130, 500, 1200);
  ctx.strokeStyle = gold; ctx.beginPath(); ctx.moveTo(130, 530); ctx.lineTo(1330, 530); ctx.stroke();
  ctx.fillStyle = "#616b7d"; ctx.font = "25px Arial"; ctx.fillText(certificate.certificate_type === "enrollment" ? "For official enrollment in" : "For successfully completing", 130, 615);
  ctx.fillStyle = ink; ctx.font = "700 38px Arial"; ctx.fillText(certificate.course_title, 130, 675, 1180);
  const issuer = certificate.provider_name || certificate.instructor_name || "SMAJ";
  const dateValue = certificate.certificate_type === "enrollment" ? certificate.enrollment_date : certificate.completion_date;
  const date = new Date(dateValue || certificate.issue_date).toLocaleDateString();
  if (signature) ctx.drawImage(signature, 130, 775, 380, 110);
  ctx.strokeStyle = "#51596a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(130, 900); ctx.lineTo(510, 900); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(690, 900); ctx.lineTo(1110, 900); ctx.stroke();
  ctx.fillStyle = ink; ctx.font = "700 25px Arial"; ctx.fillText(certificate.learner_name, 130, 940, 380); ctx.fillText(certificate.instructor_name || issuer, 690, 940, 420);
  ctx.fillStyle = "#697489"; ctx.font = "20px Arial"; ctx.fillText("LEARNER SIGNATURE", 130, 972); ctx.fillText("AUTHORIZED ISSUER", 690, 972);
  ctx.fillStyle = ink; ctx.font = "22px Arial"; ctx.fillText(`Awarded: ${date}`, 130, 1060); ctx.fillText(`Certificate ID: ${certificate.certificate_id}`, 130, 1095); ctx.fillText(`Issued by: ${issuer}`, 690, 1095, 620);
  ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(1542, 230, 82, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#f7e8a2"; ctx.lineWidth = 7; ctx.stroke();
  ctx.fillStyle = navy; ctx.textAlign = "center"; ctx.font = "700 24px Arial"; ctx.fillText("VERIFIED", 1542, 225); ctx.font = "18px Arial"; ctx.fillText(certificate.certificate_type.toUpperCase(), 1542, 258);
  ctx.fillStyle = "#fff"; ctx.fillRect(1460, 850, 164, 164); ctx.drawImage(qr, 1468, 858, 148, 148); ctx.font = "700 17px Arial"; ctx.fillText("SCAN TO VERIFY", 1542, 1055);
  const link = document.createElement("a");
  link.download = `${safeFileName(certificate.course_title)}-${safeFileName(certificate.learner_name)}-certificate.png`;
  link.href = canvas.toDataURL("image/png", 1);
  link.click();
};
export const CertificateArtwork = ({ certificate, sample = false, signatureUrl }: { certificate: Certificate; sample?: boolean; signatureUrl?: string }) => {
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

  const issuedDate = new Date(credentialDate || certificate.issue_date).toLocaleDateString();
  const issuer = certificate.provider_name || certificate.instructor_name || "SMAJ";
  return (
    <div className="credential-preview-shell">
      <article className={`credential-sheet credential-${certificate.certificate_type}`}>
        {sample && <div className="credential-watermark">SAMPLE · NOT VALID</div>}
        <div className="credential-main">
          <header className="credential-brand">
            <img src="/logo.png" alt="SMAJ PI HUB" />
            <div><strong>SMAJ</strong><span>Verified learning credentials</span></div>
          </header>
          <div className="credential-body">
            <span className="credential-kicker">{title.toUpperCase()}</span>
            <p>is proudly presented to</p>
            <h1>{certificate.learner_name}</h1>
            <p className="credential-award-copy">for {certificate.certificate_type === "enrollment" ? "official enrollment in" : "successfully completing"}</p>
            <h2>{certificate.course_title}</h2>
            <p className="credential-provider">Issued by <strong>{issuer}</strong></p>
          </div>
          <footer className="credential-signatures">
            <div>{signatureUrl && <img className="credential-signature-image" src={signatureUrl} alt="" />}<strong>{certificate.learner_name}</strong><span>Learner signature</span></div>
            <div><strong>{certificate.instructor_name || issuer}</strong><span>Authorized issuer</span></div>
          </footer>
          <div className="credential-meta"><span>Awarded: <strong>{issuedDate}</strong></span><span>Certificate ID: <strong>{certificate.certificate_id}</strong></span><span>Verify at {new URL(verificationUrl).host}</span></div>
        </div>
        <aside className="credential-verify-rail">
          <div className="credential-seal"><CheckCircleOutlineOutlinedIcon /><strong>VERIFIED</strong><span>{certificate.certificate_type === "enrollment" ? "ENROLLMENT" : "COMPLETION"}</span></div>
          <div className="credential-qr">{qrCode && <img src={qrCode} alt="Scan to verify certificate" />}<strong>SCAN TO VERIFY</strong><span>Authentic SMAJ record</span></div>
        </aside>
      </article>
    </div>
  );
};

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

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

  const changeSignature = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setSignatureUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
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
            View enrollment and completion credentials, download them, share them, or scan their QR code to verify the
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
            <CertificateArtwork certificate={selected} signatureUrl={signatureUrl} />
            <div className="certificate-signature-control">
              <div>
                <strong>Learner signature</strong>
                <span>Optional and private. Add it only to your downloaded copy.</span>
              </div>
              <label className="course-secondary-btn">
                Add signature
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => changeSignature(event.target.files?.[0])} />
              </label>
              {signatureUrl && <button type="button" className="course-secondary-btn" onClick={() => setSignatureUrl("")}>Remove</button>}
            </div>
            <div className="certificate-actions">
              <Link className="course-primary-btn" to={`/verify/certificate/${selected.certificate_id}`}>
                Verify
              </Link>
              <button className="course-secondary-btn" aria-label="Download certificate" onClick={() => void downloadCertificate(selected, signatureUrl)}>
                <DownloadOutlinedIcon /> Download
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
