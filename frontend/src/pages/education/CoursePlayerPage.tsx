import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import AppLayout from "../../layouts/AppLayout";
import { getEnrollment, completeLesson, getCourse } from "../../lib/coursesApi";
import type { Enrollment, Course, Lesson } from "../../types/courses";
import "../../pages/EducationPage.css";
import "../../components/education/courses.css";

const lessonIcon = (type: string) => {
  switch (type) {
    case "video": return <PlayArrowOutlinedIcon />;
    case "text": return <ArticleOutlinedIcon />;
    case "pdf": return <PictureAsPdfOutlinedIcon />;
    case "quiz": return <QuizOutlinedIcon />;
    default: return <ArticleOutlinedIcon />;
  }
};

const findLessonById = (modules: Course["modules"], lessonId: string) => {
  for (let mi = 0; mi < modules.length; mi++) {
    for (let li = 0; li < modules[mi].lessons.length; li++) {
      const id = `${modules[mi].order}-${modules[mi].lessons[li].order}`;
      if (id === lessonId) return { moduleIndex: mi, lessonIndex: li, lesson: modules[mi].lessons[li] };
    }
  }
  return null;
};

const CoursePlayerPage = () => {
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<{ moduleIndex: number; lessonIndex: number; lesson: Lesson } | null>(null);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!enrollmentId) return;
    setLoading(true);
    getEnrollment(enrollmentId).then(async (data) => {
      if (cancelled || !data) return;
      setEnrollment(data);
      if (data.course_id) {
        const courseData = await getCourse(data.course_id);
        if (!cancelled && courseData) {
          setCourse(courseData);
          const first = findLessonById(courseData.modules, data.current_lesson_id || "");
          if (first) setActiveLesson(first);
        }
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [enrollmentId]);

  const handleLessonClick = (moduleIndex: number, lessonIndex: number, lesson: Lesson) => {
    setActiveLesson({ moduleIndex, lessonIndex, lesson });
  };

  const handleCompleteLesson = async () => {
    if (!enrollmentId || !activeLesson || !course) return;
    const module = course.modules[activeLesson.moduleIndex];
    const lessonId = `${module.order}-${activeLesson.lesson.order}`;
    setCompleting(true);
    setMessage("");
    try {
      const result = await completeLesson(enrollmentId, lessonId);
      setEnrollment(result.enrollment);
      setMessage("Lesson completed!");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to complete lesson");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="courses-page">
          <div className="courses-loading">Loading course...</div>
        </main>
      </AppLayout>
    );
  }

  if (!enrollment || !course) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <main className="courses-page">
          <div className="courses-error">
            <p>Enrollment not found.</p>
            <Link to="/services/education/courses" className="courses-primary-btn">Browse Courses</Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page">
        <div className="course-player">
          <aside className="course-player-sidebar">
            <div className="course-player-sidebar-header">
              <h3>{enrollment.course_title}</h3>
              <p>{enrollment.progress_percentage}% Complete</p>
              <div className="course-player-progress">
                <div className="course-player-progress-bar" style={{ width: `${enrollment.progress_percentage}%` }} />
              </div>
            </div>
            <nav className="course-player-curriculum">
              {course.modules.map((module, mi) => (
                <div key={mi} className="course-player-module">
                  <h4>{module.title}</h4>
                  {module.lessons.map((lesson, li) => {
                    const lessonId = `${module.order}-${lesson.order}`;
                    const isActive = activeLesson?.moduleIndex === mi && activeLesson?.lessonIndex === li;
                    const isCompleted = enrollment.completed_lesson_ids.includes(lessonId);
                    return (
                      <button
                        key={li}
                        className={`course-player-lesson${isActive ? " active" : ""}${isCompleted ? " completed" : ""}`}
                        onClick={() => handleLessonClick(mi, li, lesson)}
                      >
                        <span className="course-player-lesson-icon">{isCompleted ? <CheckCircleOutlineOutlinedIcon /> : lessonIcon(lesson.type)}</span>
                        <span>{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
          <div className="course-player-main">
            {activeLesson ? (
              <div className="course-player-content">
                <h2>{activeLesson.lesson.title}</h2>
                {activeLesson.lesson.description && <p>{activeLesson.lesson.description}</p>}
                {activeLesson.lesson.type === "video" && activeLesson.lesson.video_url && (
                  <div className="course-player-video">
                    <video controls src={activeLesson.lesson.video_url} style={{ width: "100%", borderRadius: "0.5rem" }} />
                  </div>
                )}
                {activeLesson.lesson.type === "text" && activeLesson.lesson.content && (
                  <div className="course-player-text" dangerouslySetInnerHTML={{ __html: activeLesson.lesson.content }} />
                )}
                {activeLesson.lesson.type === "pdf" && activeLesson.lesson.document_url && (
                  <div className="course-player-document">
                    <a href={activeLesson.lesson.document_url} target="_blank" rel="noopener noreferrer" className="course-primary-btn">
                      <PictureAsPdfOutlinedIcon />
                      Download PDF
                    </a>
                  </div>
                )}
                {activeLesson.lesson.type === "quiz" && (
                  <div className="course-player-quiz">
                    <p>Quiz content would be rendered here.</p>
                  </div>
                )}
                <div className="course-player-actions">
                  {message && <span className={`course-alert ${message.includes("completed") ? "success" : "error"}`}>{message}</span>}
                  {!enrollment.completed_lesson_ids.includes(`${course.modules[activeLesson.moduleIndex]?.order}-${activeLesson.lesson.order}`) && (
                    <button className="course-primary-btn" onClick={handleCompleteLesson} disabled={completing}>
                      {completing ? "Saving..." : "Mark Complete"}
                      <CheckCircleOutlineOutlinedIcon />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="course-player-empty">
                <h3>Select a lesson to begin</h3>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default CoursePlayerPage;
