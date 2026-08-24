import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AppLayout from "../../layouts/AppLayout";
import EducationHeader from "./EducationHeader";
import EducationBackBar from "../../components/education/EducationBackBar";
import { getMyLearning } from "../../lib/coursesApi";
import type { Enrollment } from "../../types/courses";
import "../../pages/EducationPage.css";
import "../../components/education/courses.css";

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void getMyLearning()
      .then(items => setEnrollments(items.filter(item => item.status !== "cancelled")))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const active = enrollments.filter(item => item.status !== "completed");
  const completed = enrollments.filter(item => item.status === "completed");

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page my-courses-page">
        <EducationHeader query="" onQueryChange={() => undefined} searchPath="/services/education/courses" />
        <EducationBackBar current="My Courses" />
        <section className="courses-hero my-courses-hero">
          <span className="courses-kicker">MY LEARNING</span>
          <h1>Continue where you left off.</h1>
          <p>Your active lessons, progress, and completed courses are together in one place.</p>
        </section>
        {loading ? <div className="courses-loading">Loading your courses...</div> : failed ? (
          <div className="courses-error"><h2>We could not load your courses</h2><p>Please try again shortly.</p></div>
        ) : enrollments.length === 0 ? (
          <section className="my-courses-empty"><SchoolRoundedIcon /><h2>Start your first course</h2><p>Courses you enroll in will appear here with your lesson progress.</p><Link className="course-primary-btn" to="/services/education/courses">Explore Courses</Link></section>
        ) : (
          <div className="my-courses-content">
            <section>
              <div className="my-courses-section-title"><div><span>ACTIVE LEARNING</span><h2>In progress</h2></div><b>{active.length}</b></div>
              {active.length ? <div className="my-courses-grid">{active.map(item => (
                <article className="my-course-card" key={item.enrollment_id}>
                  <div className="my-course-card-icon"><SchoolRoundedIcon /></div>
                  <div className="my-course-card-copy"><span>{item.enrollment_type === "paid" ? "PAID COURSE" : "FREE COURSE"}</span><h3>{item.course_title}</h3><p>{item.completed_lesson_ids.length} lessons completed</p></div>
                  <div className="my-course-progress"><div><span>Progress</span><strong>{item.progress_percentage}%</strong></div><div className="course-player-progress"><i style={{ width: `${item.progress_percentage}%` }} /></div></div>
                  <Link to={`/services/education/courses/learn/${item.enrollment_id}`}><PlayArrowRoundedIcon /> Continue Learning</Link>
                </article>
              ))}</div> : <p className="my-courses-muted">No active courses right now.</p>}
            </section>
            {completed.length > 0 && <section>
              <div className="my-courses-section-title"><div><span>ACHIEVEMENTS</span><h2>Completed</h2></div><b>{completed.length}</b></div>
              <div className="my-courses-grid">{completed.map(item => (
                <article className="my-course-card completed" key={item.enrollment_id}>
                  <div className="my-course-card-icon"><WorkspacePremiumOutlinedIcon /></div>
                  <div className="my-course-card-copy"><span>COMPLETED</span><h3>{item.course_title}</h3><p>All lessons completed</p></div>
                  <Link to="/services/education/certificates">View Certificate</Link>
                </article>
              ))}</div>
            </section>}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default MyCoursesPage;