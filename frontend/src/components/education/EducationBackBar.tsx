import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import "./EducationBackBar.css";

const EducationBackBar = ({ current }: { current: string }) => {
  const navigate = useNavigate();
  return (
    <nav className="education-back-bar" aria-label="Education navigation">
      <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
        <span className="education-back-icon"><ArrowBackRoundedIcon /></span>
        <b>Back</b>
      </button>
      <span className="education-back-current"><HomeRoundedIcon /><b>{current}</b></span>
    </nav>
  );
};
export default EducationBackBar;