import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import "./EducationBackBar.css";

const EducationBackBar = ({ current }: { current: string }) => (
  <nav className="education-back-bar" aria-label="Education breadcrumb">
    <Link to="/services/education" aria-label="Back to Education home">
      <span className="education-back-icon"><ArrowBackRoundedIcon /></span>
      <span><small>Back to</small><b>Education</b></span>
    </Link>
    <span className="education-back-current"><HomeRoundedIcon /><b>{current}</b></span>
  </nav>
);
export default EducationBackBar;