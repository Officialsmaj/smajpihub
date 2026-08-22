import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import EducationHeader from "./EducationHeader";
import "../../pages/EducationPage.css";
import "../../components/education/courses.css";
import { getVerifiedTutors, type TutorSummary } from "../../lib/educationApi";

const TutorsPage = () => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("");
  const [verifiedTutors, setVerifiedTutors] = useState<TutorSummary[]>([]);
  useEffect(() => { void getVerifiedTutors().then(setVerifiedTutors).catch(() => setVerifiedTutors([])); }, []);

  const tutors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return verifiedTutors.filter(tutor => {
      if (!tutor.verified) return false;
      if (subject && !tutor.subjects.includes(subject)) return false;
      if (language && !tutor.languages.includes(language)) return false;
      return (
        !normalizedQuery ||
        tutor.name.toLowerCase().includes(normalizedQuery) ||
        tutor.headline.toLowerCase().includes(normalizedQuery) ||
        tutor.subjects.some(value => value.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [language, query, subject]);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page">
        <EducationHeader query={query} onQueryChange={setQuery} searchPath="/services/education/tutors" />
        <section className="courses-hero">
          <span className="courses-kicker">VERIFIED TUTORS</span>
          <h1>Find the right tutor for your goals</h1>
          <p>Search approved tutors by subject and language. Review their profile before requesting a lesson.</p>
        </section>

        <section className="tutors-toolbar" aria-label="Tutor filters">
          <label className="courses-filter-search">
            <SearchOutlinedIcon />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Tutor, subject, or skill"
            />
          </label>
          <select value={subject} onChange={event => setSubject(event.target.value)} aria-label="Subject">
            <option value="">All subjects</option>
            <option value="English">English</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Exam Prep">Exam Prep</option>
          </select>
          <select value={language} onChange={event => setLanguage(event.target.value)} aria-label="Teaching language">
            <option value="">All languages</option>
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
            <option value="French">French</option>
          </select>
        </section>

        {tutors.length > 0 ? (
          <section className="tutors-grid">
            {tutors.map(tutor => (
              <article className="tutor-card" key={tutor.id}>
                <VerifiedOutlinedIcon className="tutor-verified-icon" />
                <h2>{tutor.name}</h2>
                <p>{tutor.headline}</p>
                <span>{tutor.subjects.join(" · ")}</span>
                <span>
                  {tutor.languages.join(", ")} · {tutor.location}
                </span>
                <strong>{tutor.ratePi} Pi / lesson</strong>
                <Link className="course-primary-btn" to={`/services/education/tutors/${tutor.id}`}>
                  View Profile
                </Link>
              </article>
            ))}
          </section>
        ) : (
          <section className="tutors-empty">
            <SchoolOutlinedIcon />
            <h2>No verified tutors available yet</h2>
            <p>
              We only publish tutors after identity, qualification, pricing, and service checks. No demo profiles are
              shown as real providers.
            </p>
            <div className="tutors-empty-actions">
              <Link className="course-primary-btn" to="/services/education/courses?category=Exam%20Prep">
                Browse Exam Prep Courses
              </Link>
              <Link className="course-secondary-btn" to="/services/education/teach">
                Become a Tutor
              </Link>
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default TutorsPage;
