import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AppLayout from "../../layouts/AppLayout";
import EducationHeader from "./EducationHeader";
import EducationBackBar from "../../components/education/EducationBackBar";
import { getMyLearning, getAdminCourses, getAdminCourseStats, updateAdminCourse } from "../../lib/coursesApi";
import type { Course, Enrollment } from "../../types/courses";
import "../../components/education/courses.css";

const InstructorDashboardPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = async () => { setLoading(true); try { const [myCourses, myEnrollments, adminStats] = await Promise.all([getAdminCourses().catch(() => [] as Course[]), getMyLearning().catch(() => [] as Enrollment[]), getAdminCourseStats().catch(() => null)]); setCourses(myCourses); setEnrollments(myEnrollments); setStats(adminStats); } catch { setMessage("Failed to load dashboard data."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const updateCourse = async (id: string, body: Record<string, unknown>) => { await updateAdminCourse(id, body); setMessage("Course updated successfully."); await load(); };
  const statCards = [
    ["Total courses", stats?.totalCourses || 0, <AutoStoriesRoundedIcon />], ["Published", stats?.publishedCourses || 0, <SchoolRoundedIcon />], ["Drafts", stats?.draftCourses || 0, <EditRoundedIcon />], ["Pending review", stats?.pendingReview || 0, <BarChartRoundedIcon />], ["Enrollments", stats?.totalEnrollments || 0, <GroupsRoundedIcon />], ["Certificates", stats?.totalCertificates || 0, <WorkspacePremiumRoundedIcon />],
  ] as const;
  return <AppLayout showHeader={false} showFooter={false}><main className="courses-page instructor-dashboard-page">
    <EducationHeader query="" onQueryChange={() => undefined} searchPath="/services/education/courses" /><EducationBackBar current="Instructor Dashboard" />
    <section className="instructor-dashboard-hero"><div><span>INSTRUCTOR STUDIO</span><h1>Build courses that move learners forward</h1><p>Create lessons, manage publishing, and see your learner progress in one place.</p></div><Link to="/app/services/education/courses/new"><AddRoundedIcon /> Create a course</Link></section>
    <div className="instructor-dashboard-body">{message && <div className="course-alert success">{message}</div>}
      <section className="instructor-stats" aria-label="Instructor performance">{statCards.map(([label,value,icon]) => <article key={label}><i>{icon}</i><div><strong>{value}</strong><span>{label}</span></div></article>)}</section>
      <section className="instructor-panel"><header><div><span>COURSE MANAGEMENT</span><h2>Your courses</h2></div><Link to="/app/services/education/courses/new"><AddRoundedIcon /> New course</Link></header>{loading ? <div className="courses-loading">Loading your studio…</div> : courses.length === 0 ? <div className="courses-empty"><h3>Your first course starts here</h3><p>Create a draft, add lessons, then submit it for SMAJ review.</p><Link className="course-primary-btn" to="/app/services/education/courses/new">Create course</Link></div> : <div className="instructor-course-list">{courses.map(course => <article key={course.id}><div className="instructor-course-thumb">{course.thumbnail_url ? <img src={course.thumbnail_url} alt="" /> : <AutoStoriesRoundedIcon />}</div><div className="instructor-course-copy"><span>{course.category}</span><h3>{course.title}</h3><p>{course.enrollment_count} enrollments · {course.certificate_enabled ? "Certificate enabled" : "No certificate"}</p></div><span className={`instructor-status ${course.status}`}>{course.status.replace(/_/g," ")}</span><div className="instructor-course-actions"><Link to={`/app/services/education/courses/${course.id}/edit`}><EditRoundedIcon /> Edit</Link><button onClick={() => void updateCourse(course.id,{status:course.status === "published" ? "archived" : "published"})}>{course.status === "published" ? "Unpublish" : "Publish"}</button></div></article>)}</div>}</section>
      <section className="instructor-panel"><header><div><span>LEARNER VIEW</span><h2>My learning</h2></div><Link to="/services/education/courses">Browse courses</Link></header>{enrollments.length === 0 ? <div className="courses-empty"><h3>No active learning yet</h3><p>Your personal course enrollments will appear here.</p></div> : <div className="instructor-learning-list">{enrollments.map(item => <article key={item.id}><div><strong>{item.course_title}</strong><span>{item.status}</span></div><div className="instructor-progress"><span style={{width:`${item.progress_percentage}%`}} /></div><b>{item.progress_percentage}%</b></article>)}</div>}</section>
    </div>
  </main></AppLayout>;
};
export default InstructorDashboardPage;