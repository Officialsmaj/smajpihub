import { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import { getMyLearning, getAdminCourses, getAdminCourseStats, updateAdminCourse } from "../../lib/coursesApi";
import type { Course, Enrollment } from "../../types/courses";
import "../../pages/EducationPage.css";
import "../../components/education/courses.css";

const InstructorDashboardPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [myCourses, myEnrollments, adminStats] = await Promise.all([
        getAdminCourses().catch(() => [] as Course[]),
        getMyLearning().catch(() => [] as Enrollment[]),
        getAdminCourseStats().catch(() => null as Record<string, number> | null),
      ]);
      setCourses(myCourses);
      setEnrollments(myEnrollments);
      setStats(adminStats);
    } catch {
      setMessage("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateCourse = async (id: string, body: Record<string, unknown>) => {
    await updateAdminCourse(id, body);
    setMessage("Course updated.");
    await load();
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page">
        <section className="courses-hero">
          <span className="courses-kicker">INSTRUCTOR DASHBOARD</span>
          <h1>My Courses</h1>
          <p>Manage your courses, review enrollments, and track performance.</p>
        </section>
        {message && <div className="course-alert success" style={{ maxWidth: 900, margin: "1rem auto" }}>{message}</div>}
        {stats && (
          <section className="stats-grid admin-stats admin-summary-stats" style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>
            <div><span>Total Courses</span><strong>{stats.totalCourses}</strong></div>
            <div><span>Published</span><strong>{stats.publishedCourses}</strong></div>
            <div><span>Drafts</span><strong>{stats.draftCourses}</strong></div>
            <div><span>Pending Review</span><strong>{stats.pendingReview}</strong></div>
            <div><span>Enrollments</span><strong>{stats.totalEnrollments}</strong></div>
            <div><span>Certificates</span><strong>{stats.totalCertificates}</strong></div>
          </section>
        )}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
          <h2>Your Courses</h2>
          {loading ? <div className="courses-loading">Loading...</div> : courses.length === 0 ? (
            <div className="courses-empty"><h3>No courses yet</h3><p>Create your first course to get started.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Course</th><th>Status</th><th>Enrollments</th><th>Actions</th></tr></thead>
                <tbody>{courses.map((course) => (
                  <tr key={course.id}>
                    <td><strong>{course.title}</strong><small>{course.category}</small></td>
                    <td>{course.status}</td>
                    <td>{course.enrollment_count}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => updateCourse(course.id, { status: course.status === "published" ? "archived" : "published" })}>
                          {course.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem 2rem" }}>
          <h2>My Learning</h2>
          {enrollments.length === 0 ? <div className="courses-empty"><h3>No enrollments</h3></div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Course</th><th>Progress</th><th>Status</th></tr></thead>
                <tbody>{enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td><strong>{enrollment.course_title}</strong></td>
                    <td>{enrollment.progress_percentage}%</td>
                    <td>{enrollment.status}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
};

export default InstructorDashboardPage;
