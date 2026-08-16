import { Link } from "react-router-dom";
import type { Course } from "../../types/courses";
import { formatPiAmount } from "../../lib/formatters";
import "./courses.css";

const courseTypeBadge = (course: Course) => {
  if (course.course_type === "free") {
    return <span className="course-badge free">FREE</span>;
  }
  return <span className="course-badge paid">π {formatPiAmount(course.price_pi)}</span>;
};

export const OnlineCourseCard = ({ course }: { course: Course }) => {
  return (
    <article className="course-card">
      <div className="course-card-image">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} />
        ) : (
          <div className="course-card-image-placeholder">Course</div>
        )}
        {course.certificate_enabled && <span className="course-card-certificate">Certificate</span>}
      </div>
      <div className="course-card-body">
        <span className="course-card-category">{course.category}</span>
        <h3>
          <Link to={`/services/education/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        {course.subtitle && <p className="course-card-subtitle">{course.subtitle}</p>}
        <div className="course-card-meta">
          <span>{course.level}</span>
          {course.estimated_duration && <span>{course.estimated_duration}</span>}
        </div>
        <footer className="course-card-footer">
          {courseTypeBadge(course)}
          <Link to={`/services/education/courses/${course.slug}`} className="course-primary-btn">
            View Course
          </Link>
        </footer>
      </div>
    </article>
  );
};

export default OnlineCourseCard;
