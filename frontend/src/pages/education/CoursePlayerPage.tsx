import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import EducationBackBar from "../../components/education/EducationBackBar";
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
  const videoRef = useRef<HTMLVideoElement>(null);

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
          else if (courseData.modules[0]?.lessons[0]) setActiveLesson({ moduleIndex: 0, lessonIndex: 0, lesson: courseData.modules[0].lessons[0] });
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


  const openVideoFullscreen = async () => {
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!video) return;
    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch {
      video.webkitEnterFullscreen?.();
    }
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
      <main className="courses-page course-player-page">
        <EducationBackBar current="Course Learning" />
        <div className="course-player">
          <aside className="course-player-sidebar">
            <div className="course-player-sidebar-header">
              <span className="course-player-eyebrow">MY LEARNING</span>
              <div className="course-player-course-heading">
                <h1>{enrollment.course_title}</h1>
                <strong>{enrollment.progress_percentage}%</strong>
              </div>
              <p>{enrollment.completed_lesson_ids.length} lessons completed</p>
              <div className="course-player-progress" aria-label={`${enrollment.progress_percentage}% complete`}>
                <div className="course-player-progress-bar" style={{ width: `${enrollment.progress_percentage}%` }} />
              </div>
            </div>
            <nav className="course-player-curriculum">
              {course.modules.map((module, mi) => (
                <div key={mi} className="course-player-module">
                  <h4><span>Module {mi + 1}</span><strong>{module.title}</strong></h4>
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
                <header className="course-player-content-header"><span>{activeLesson.lesson.type} lesson</span><h2>{activeLesson.lesson.title}</h2></header>
                {activeLesson.lesson.description && <p>{activeLesson.lesson.description}</p>}
                {activeLesson.lesson.type === "video" && activeLesson.lesson.video_url && (
                  <div className="course-player-video">
                    <video
                      ref={videoRef}
                      controls
                      playsInline
                      preload="metadata"
                      src={activeLesson.lesson.video_url}
                    />
                    <button type="button" className="course-player-fullscreen" onClick={() => void openVideoFullscreen()}>
                      <FullscreenOutlinedIcon /> Full screen
                    </button>
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
                <SchoolOutlinedIcon />
                <h3>Your learning starts here</h3>
                <p>Select a lesson from the course outline to begin.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default CoursePlayerPage;
