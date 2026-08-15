import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigationType, useSearchParams } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AppLayout from "../layouts/AppLayout";
import EducationHeader from "./education/EducationHeader";
import { getEducationCategories, getEducationCourses, getEducationPartners } from "../lib/educationApi";
import type { EducationCourse, EducationPartner } from "../types/education";
import CategoryGrid from "../components/education/CategoryGrid";
import CourseCard from "../components/education/CourseCard";
import PartnerCard from "../components/education/PartnerCard";
import "./EducationPage.css";

const learningStats = [
  ["7", "Learning paths"],
  ["3", "Provider types"],
  ["Pi", "Native checkout"],
] as const;

const EducationPage = () => {
  const [searchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const [categories, setCategories] = useState<string[]>([]);
  const [courses, setCourses] = useState<EducationCourse[]>([]);
  const [partners, setPartners] = useState<EducationPartner[]>([]);
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [educationReady, setEducationReady] = useState(() => navigationType !== "PUSH");
  const loadStartTime = useRef(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, initialCourses, initialPartners] = await Promise.all([
          getEducationCategories(),
          getEducationCourses(),
          getEducationPartners(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setCourses(initialCourses);
          setPartners(initialPartners);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load education data. Showing saved preview.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      controller.abort();
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const elapsed = Date.now() - loadStartTime.current;
      const remaining = Math.max(0, 800 - elapsed);
      const timer = window.setTimeout(() => setEducationReady(true), remaining);
      return () => window.clearTimeout(timer);
    }
  }, [loading]);

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(course => {
      const matchesQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.provider.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [courses, query]);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      {!educationReady ? <div className="store-loading-overlay" aria-label="Opening Education" aria-live="polite"><div className="store-loading-spinner" /><span>Opening education...</span></div> : null}
      <main className="education-page">
        <EducationHeader query={query} onQueryChange={setQuery} />
        <section className="education-hero">
          <div className="education-hero-copy">
            <span className="education-kicker">SMAJ PI EDUCATION</span>
            <h1>Learn skills that move you forward.</h1>
            <p>
              Explore practical courses, trusted tutors, and certificate programs from verified education providers.
            </p>
            <div className="education-search" role="search">
              <SearchOutlinedIcon />
              <input
                type="search"
                placeholder="What do you want to learn?"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <Link
                to={`/services/education/courses${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}
              >
                Explore courses
              </Link>
            </div>
            <div className="education-hero-trust" aria-label="Learning benefits">
              <span>Verified providers</span>
              <span>Flexible learning</span>
              <span>Pay with Pi</span>
            </div>
            <nav className="education-popular-links" aria-label="Popular education categories">
              <b>Popular:</b>
              <Link to="/services/education/categories/tech-skills">Technology</Link>
              <Link to="/services/education/categories/business">Business</Link>
              <Link to="/services/education/categories/exam-prep">Exam preparation</Link>
            </nav>
            <div className="education-provider-cta">
              <span>University, tutor, or course creator?</span>
              <Link to="/onboarding">Join as a provider →</Link>
            </div>
          </div>
          <aside className="education-hero-panel" aria-label="Education payment preview">
            <div className="education-live-class">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85"
                alt=""
              />
              <span>Verified learning</span>
            </div>
            <div className="education-payment-card">
              <div>
                <strong>Course Enrollment</strong>
                <small>Web Development Foundations</small>
              </div>
              <b>12 Pi</b>
              <Link to="/dashboard">
                Pay with Pi
                <AccountBalanceWalletOutlinedIcon />
              </Link>
            </div>
          </aside>
        </section>

        <section className="education-stats" aria-label="Education overview">
          {learningStats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section id="courses" className="education-section">
          <div className="education-section-head">
            <span className="education-kicker">WHAT USERS CAN PAY FOR</span>
            <h2>Universities, courses, tutoring, and certificates.</h2>
            <p>
              Payments are enabled for SMAJ-verified schools and providers, so users only see Pi checkout where an
              education partner is approved.
            </p>
          </div>
          <CategoryGrid categories={categories} />
        </section>

        <section className="education-section">
          <div className="education-section-head compact">
            <span className="education-kicker">FEATURED COURSES</span>
            <h2>Start with practical skills.</h2>
          </div>
          {loading ? (
            <div className="education-loading">Loading courses...</div>
          ) : error ? (
            <div className="education-error">
              <p>{error}</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="education-empty">
              <p>No courses match your search.</p>
            </div>
          ) : (
            <div className="education-course-grid">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        <section id="partners" className="education-section education-partners">
          <div className="education-section-head compact">
            <span className="education-kicker">PARTNER ACCESS</span>
            <h2>Verified providers before Pi checkout.</h2>
          </div>
          {loading ? (
            <div className="education-loading">Loading partners...</div>
          ) : (
            <div className="education-partner-list">
              {partners.map(partner => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          )}
        </section>

        <section className="education-trust">
          <article>
            <CheckCircleOutlineOutlinedIcon />
            <h3>Verified Providers</h3>
            <p>Universities, tutors, and course creators go through SMAJ review before they can collect Pi.</p>
          </article>
          <article>
            <AccountBalanceWalletOutlinedIcon />
            <h3>Pi Payments</h3>
            <p>Course fees, applications, tutoring, and certificates can use Pi where the provider is approved.</p>
          </article>
          <article>
            <SchoolOutlinedIcon />
            <h3>Learning Records</h3>
            <p>
              Users can track courses, certificates, saved schools, and education payment history from their account.
            </p>
          </article>
        </section>
      </main>
    </AppLayout>
  );
};

export default EducationPage;
