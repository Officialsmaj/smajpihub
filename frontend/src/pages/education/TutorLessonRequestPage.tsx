import { type FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AppLayout from "../../layouts/AppLayout";
import EducationHeader from "./EducationHeader";
import EducationBackBar from "../../components/education/EducationBackBar";
import { getVerifiedTutor, requestTutorLesson, type TutorSummary } from "../../lib/educationApi";
import "../../components/education/courses.css";

const TutorLessonRequestPage = () => {
  const { id = "" } = useParams();
  const [tutor, setTutor] = useState<TutorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  useEffect(() => { void getVerifiedTutor(id).then(setTutor).catch(() => setTutor(null)).finally(() => setLoading(false)); }, [id]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      const result = await requestTutorLesson(id, { subject: String(data.get("subject") || ""), preferred_date: String(data.get("date") || ""), preferred_time: String(data.get("time") || ""), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", delivery_mode: String(data.get("mode") || "video") as "video", duration_minutes: Number(data.get("duration") || 60), message: String(data.get("message") || "") });
      setReference(result.request.id); setMessage(result.message);
    } catch (error) { setMessage((error as { response?: { data?: { message?: string; error?: string } } }).response?.data?.message || (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not send this lesson request."); }
    finally { setBusy(false); }
  };
  return <AppLayout showHeader={false} showFooter={false}><main className="courses-page"><EducationHeader query="" onQueryChange={() => undefined} searchPath="/services/education/tutors" /><EducationBackBar current="Request a lesson" />{loading ? <section className="teach-status">Loading tutor…</section> : !tutor ? <section className="teach-status"><h1>Tutor not found</h1><Link to="/services/education/tutors">Back to tutors</Link></section> : reference ? <section className="lesson-request-success"><CheckCircleOutlineOutlinedIcon /><h1>Request sent</h1><p>{message}</p><small>Reference: {reference}</small><Link to={`/services/education/tutors/${id}`}>Back to tutor profile</Link></section> : <><section className="lesson-request-hero"><span>LESSON REQUEST</span><h1>Learn with {tutor.name}</h1><p>Choose what you want to learn and suggest a suitable time. The tutor will confirm before any payment or lesson begins.</p></section><section className="lesson-request-layout"><aside><div className="tutor-card-avatar">{tutor.avatar_url ? <img src={tutor.avatar_url} alt="" /> : <span>{tutor.name.slice(0,1)}</span>}</div><h2>{tutor.name}</h2><p>{tutor.headline}</p><strong>{tutor.ratePi === 0 ? "Free introduction" : `${tutor.ratePi} Pi / lesson`}</strong></aside><form className="lesson-request-form" onSubmit={submit}><h2><CalendarMonthOutlinedIcon /> Lesson details</h2><label>Subject<select name="subject" required defaultValue=""><option value="" disabled>Choose a subject</option>{tutor.subjects.map(subject => <option key={subject}>{subject}</option>)}</select></label><div><label>Preferred date<input type="date" name="date" min={new Date().toISOString().slice(0,10)} required /></label><label>Preferred time<input type="time" name="time" required /></label></div><div><label>Lesson format<select name="mode"><option value="video">Video lesson</option><option value="audio">Audio lesson</option><option value="chat">Chat lesson</option><option value="in_person">In person</option></select></label><label>Duration<select name="duration"><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option></select></label></div><label>What would you like help with?<textarea name="message" rows={4} placeholder="Share your level, goals, or questions…" /></label>{message && <p className="course-alert error">{message}</p>}<button type="submit" disabled={busy}>{busy ? "Sending request…" : "Send lesson request"}</button><small>No payment is taken now. The tutor must accept and confirm the final schedule first.</small></form></section></>}</main></AppLayout>;
};
export default TutorLessonRequestPage;