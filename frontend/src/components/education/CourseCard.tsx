import { Link } from "react-router-dom";
import type { EducationCourse } from "../../types/education";

type CourseCardProps = {
  course: EducationCourse;
};

const CourseCard = ({ course }: CourseCardProps) => (
  <article className="education-course-card">
    <img src={course.image} alt="" />
    <div>
      <span>{course.category}</span>
      <h3>
        <Link to={`/services/education/courses/${course.id}`}>{course.title}</Link>
      </h3>
      <p>{course.provider}</p>
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
        <strong>{course.pricePi} Pi</strong>
        <Link to={`/services/education/courses/${course.id}`}>Enroll</Link>
      </footer>
    </div>
  </article>
);

export default CourseCard;
