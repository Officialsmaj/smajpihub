import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import AppLayout from "../../layouts/AppLayout";
import { getEducationCourse } from "../../lib/educationApi";
import type { EducationCourse } from "../../types/education";
import "../../pages/EducationPage.css";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<EducationCourse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getEducationCourse(courseId);
        if (!cancelled) {
          setCourse(data);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load course details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <AppLayout>
        <main className="education-page">
          <div className="education-loading">Loading course...</div>
        </main>
      </AppLayout>
    );
  }

  if (error || !course) {
    return (
      <AppLayout>
        <main className="education-page">
          <div className="education-error">
            <p>{error || "Course not found."}</p>
            <Link to="/services/education" className="education-primary-btn">
              <ArrowBackOutlinedIcon />
              Back to Education
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="education-page">
        <div className="education-course-detail">
          <Link to="/services/education" className="education-back-link">
            <ArrowBackOutlinedIcon />
            Back to Education
          </Link>
          <div className="education-course-detail-hero">
            <img src={course.image} alt="" />
            <div>
              <span className="education-kicker">{course.category}</span>
              <h1>{course.title}</h1>
              <p className="education-provider">{course.provider}</p>
              <dl className="education-meta">
                <div>
                  <dt>Level</dt>
                  <dd>{course.level}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{course.duration}</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>
                    <StarOutlinedIcon />
                    {course.rating}
                  </dd>
                </div>
              </dl>
              <footer className="education-course-actions">
                <strong>{course.pricePi} Pi</strong>
                <Link to="/dashboard" className="education-primary-btn">
                  Enroll Now
                  <AccountBalanceWalletOutlinedIcon />
                </Link>
              </footer>
            </div>
          </div>
          <section className="education-section">
            <div className="education-section-head compact">
              <span className="education-kicker">ABOUT THIS COURSE</span>
              <h2>What you will learn</h2>
            </div>
            <p className="education-course-description">
              {course.description || "This course is designed to help you master the subject with practical, hands-on experience and expert guidance."}
            </p>
            <div className="education-course-features">
              <article>
                <SchoolOutlinedIcon />
                <h3>Verified Curriculum</h3>
                <p>Curriculum reviewed by SMAJ-verified education partners.</p>
              </article>
              <article>
                <AccountBalanceWalletOutlinedIcon />
                <h3>Pi Payments</h3>
                <p>Pay securely with Pi where the provider is approved.</p>
              </article>
              <article>
                <StarOutlinedIcon />
                <h3>Certificate</h3>
                <p>Earn a verified certificate on course completion.</p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
};

export default CourseDetailPage;
