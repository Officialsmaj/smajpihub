import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import AppLayout from "../layouts/AppLayout";
import { educationCategories, educationPartners, featuredEducationCourses } from "../content/education";

const learningStats = [
  ["7", "Learning paths"],
  ["3", "Provider types"],
  ["Pi", "Native checkout"],
] as const;

const EducationPage = () => (
  <AppLayout>
    <main className="education-page">
      <section className="education-hero">
        <div className="education-hero-copy">
          <span className="education-kicker">SMAJ PI EDUCATION</span>
          <h1>Learn, apply, and pay with Pi.</h1>
          <p>
            SMAJ Education brings online courses, verified tutors, certificates, and partner university access into one
            Pi-powered learning marketplace.
          </p>
          <div className="education-search" role="search">
            <SearchOutlinedIcon />
            <input type="search" placeholder="Search universities, courses, tutors, certificates..." />
            <Link to="/dashboard">Explore</Link>
          </div>
          <div className="education-hero-actions">
            <Link to="/dashboard" className="education-primary-btn">
              Start Learning
              <ArrowForwardOutlinedIcon />
            </Link>
            <Link to="/onboarding" className="education-secondary-btn">
              Become a Provider
            </Link>
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

      <section className="education-section">
        <div className="education-section-head">
          <span className="education-kicker">WHAT USERS CAN PAY FOR</span>
          <h2>Universities, courses, tutoring, and certificates.</h2>
          <p>
            Payments are enabled for SMAJ-verified schools and providers, so users only see Pi checkout where an
            education partner is approved.
          </p>
        </div>
        <div className="education-category-grid">
          {educationCategories.map((category) => (
            <Link to="/dashboard" key={category}>
              <SchoolOutlinedIcon />
              <span>{category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="education-section">
        <div className="education-section-head compact">
          <span className="education-kicker">FEATURED COURSES</span>
          <h2>Start with practical skills.</h2>
        </div>
        <div className="education-course-grid">
          {featuredEducationCourses.map((course) => (
            <article className="education-course-card" key={course.id}>
              <img src={course.image} alt="" />
              <div>
                <span>{course.category}</span>
                <h3>{course.title}</h3>
                <p>{course.provider}</p>
                <dl>
                  <div><dt>Level</dt><dd>{course.level}</dd></div>
                  <div><dt>Duration</dt><dd>{course.duration}</dd></div>
                  <div><dt>Rating</dt><dd>{course.rating}</dd></div>
                </dl>
                <footer>
                  <strong>{course.pricePi} Pi</strong>
                  <Link to="/dashboard">Enroll</Link>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="education-section education-partners">
        <div className="education-section-head compact">
          <span className="education-kicker">PARTNER ACCESS</span>
          <h2>Verified providers before Pi checkout.</h2>
        </div>
        <div className="education-partner-list">
          {educationPartners.map((partner) => (
            <article key={partner.name}>
              <div>
                <VerifiedUserOutlinedIcon />
                <div>
                  <h3>{partner.name}</h3>
                  <p>{partner.programs}</p>
                </div>
              </div>
              <span>{partner.type}</span>
              <span>{partner.location}</span>
              <b>{partner.status}</b>
            </article>
          ))}
        </div>
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
          <p>Users can track courses, certificates, saved schools, and education payment history from their account.</p>
        </article>
      </section>
    </main>
  </AppLayout>
);

export default EducationPage;
