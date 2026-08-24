import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AppLayout from "../../layouts/AppLayout";
import { useAuthContext } from "../../contexts/AuthContext";
import { getMyTeacherApplication, type TeacherApplication } from "../../lib/educationApi";
import EducationHeader from "./EducationHeader";
import EducationBackBar from "../../components/education/EducationBackBar";
import "./EducationProfilePage.css";

const PHOTO_KEY = "smaj_education_confirmed_avatar";
const EducationProfilePage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherApplication | null>(null);
  const [photoChoice, setPhotoChoice] = useState<"pending" | "confirmed" | "without">("pending");
  const avatar = user?.avatar || "";
  const displayName = user?.displayName || user?.piUsername || user?.username || "Learner";
  const initials = displayName.split(" ").map(value => value[0]).join("").slice(0, 2).toUpperCase();
  useEffect(() => { setPhotoChoice(window.localStorage.getItem(PHOTO_KEY) === avatar && avatar ? "confirmed" : "pending"); void getMyTeacherApplication().then(setTeacher).catch(() => setTeacher(null)); }, [avatar]);
  const completion = useMemo(() => [displayName, user?.country, avatar, user?.bio, user?.language].filter(Boolean).length * 20, [avatar, displayName, user]);
  const confirm = () => { if (avatar) window.localStorage.setItem(PHOTO_KEY, avatar); setPhotoChoice("confirmed"); };
  const shownAvatar = photoChoice === "confirmed" ? avatar : "";
  return <AppLayout showHeader={false} showFooter={false}><main className="edu-profile-page"><EducationHeader query="" onQueryChange={() => undefined} searchPath="/services/education/courses" />
    <EducationBackBar current="My Profile" />
    <section className="edu-profile-hero"><span>MY EDUCATION</span><h1>Your learning profile</h1><p>Keep your courses, certificates, tutor activity, and education identity together.</p></section>
    <section className="edu-profile-card"><div className="edu-profile-avatar">{shownAvatar ? <img src={shownAvatar} alt={`${displayName} profile`} /> : initials}</div><div><span className="edu-profile-label">SMAJ PI EDUCATION PROFILE</span><h2>{displayName}</h2><p><LocationOnOutlinedIcon /> {user?.country || "Add your country in SMAJ profile"}</p><p><VerifiedOutlinedIcon /> @{user?.piUsername || user?.username || "Pi user"}</p></div><Link to="/profile">Edit SMAJ profile</Link></section>
    <section className="edu-profile-progress"><div><span>Profile completed</span><strong>{completion}%</strong></div><progress value={completion} max="100" /><p>Education uses your confirmed SMAJ identity while keeping learning activity separate.</p></section>
    <section className="edu-profile-grid"><Link to="/services/education/my-courses"><SchoolOutlinedIcon /><span><b>My learning</b><small>Courses, lessons, and progress</small></span></Link><Link to="/services/education/certificates"><WorkspacePremiumOutlinedIcon /><span><b>Certificates</b><small>View and verify achievements</small></span></Link><Link to={teacher?.status === "approved" ? "/app/services/education/courses" : "/services/education/teach"}><VerifiedOutlinedIcon /><span><b>{teacher?.status === "approved" ? "Instructor dashboard" : "Teach on SMAJ"}</b><small>{teacher ? `Application: ${teacher.status.replace(/_/g, " ")}` : "Apply to become a verified tutor"}</small></span></Link></section>
    {photoChoice === "pending" && <div className="edu-photo-layer" role="dialog" aria-modal="true" aria-label="Confirm Education profile photo"><button className="edu-photo-overlay" onClick={() => setPhotoChoice("without")} aria-label="Continue without photo" /><section className="edu-photo-sheet"><button className="edu-photo-close" onClick={() => setPhotoChoice("without")} aria-label="Close"><CloseRoundedIcon /></button><div className="edu-photo-preview">{avatar ? <img src={avatar} alt="" /> : initials}</div><h2>Is this your current profile photo?</h2><p>Education can use the same photo as your SMAJ PI HUB account.</p><div><button onClick={confirm} disabled={!avatar}>Yes</button><button onClick={() => navigate("/profile")}>Edit</button></div>{!avatar && <small>No SMAJ profile photo is saved yet. Close this panel to continue without one, or choose Edit.</small>}</section></div>}
  </main></AppLayout>;
};
export default EducationProfilePage;