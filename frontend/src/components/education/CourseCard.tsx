import { Link } from "react-router-dom";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import type { EducationCourse } from "../../types/education";
import { formatServicePrice } from "../../lib/piPricing";

type CourseCardProps = {
  course: EducationCourse;
};

const compactCount = (count: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count);

const CourseCard = ({ course }: CourseCardProps) => (
  <article className="education-course-card">
    <img src={course.image} alt="" />
    <div>
      <span>{course.category}</span>
      <h3>
        <Link to={`/services/education/courses/${course.id}`}>{course.title}</Link>
      </h3>
      <p>{course.provider}</p>
      <div className="education-course-popularity"><strong><StarRoundedIcon /> {course.rating}</strong>{typeof course.enrollmentCount === "number" && <><span aria-hidden="true">&bull;</span><span>{compactCount(course.enrollmentCount)} students</span></>}</div>
      <dl>
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
          <dd>{course.rating}</dd>
        </div>
      </dl>
      <footer>
        <strong>{formatServicePrice(course.priceUsdt)}</strong>
        <Link to={`/services/education/courses/${course.id}`}>Enroll</Link>
      </footer>
    </div>
  </article>
);

export default CourseCard;
