import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import "./EducationBackBar.css";

const EducationBackBar = ({ current, to }: { current: string; to?: string }) => {
  const navigate = useNavigate();
  const goBack = () => {
    if (to) navigate(to);
    else navigate(-1);
  };
  return (
    <nav className="education-back-bar" aria-label="Education navigation">
      <button type="button" onClick={goBack} aria-label="Go back">
        <span className="education-back-icon"><ArrowBackRoundedIcon /></span>
        <b>Back</b>
      </button>
      <span className="education-back-current"><HomeRoundedIcon /><b>{current}</b></span>
    </nav>
  );
};
export default EducationBackBar;