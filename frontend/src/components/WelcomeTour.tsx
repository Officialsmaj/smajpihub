import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthContext } from "../contexts/AuthContext";

const WELCOME_STORAGE_KEY = "smaj_welcome_seen";
const WELCOME_REPLAY_EVENT = "smaj:welcome-tour-open";

const tourSteps = [
  {
    title: "Dashboard",
    description: "Check your account, seller status, recent activity, and quick actions from one private home.",
    to: "/dashboard",
    icon: <DashboardOutlinedIcon />,
  },
  {
    title: "Services",
    description: "Move through SMAJ PI HUB services like jobs, health, food, learning, lifestyle, and more.",
    to: "/app/services",
    icon: <AppsOutlinedIcon />,
  },
  {
    title: "SMAJ Store",
    description: "Browse live products, manage saved items, and open seller tools when you are ready to sell.",
    to: "/store",
    icon: <StorefrontOutlinedIcon />,
  },
  {
    title: "Messages",
    description: "Keep buyer, seller, and support conversations in one private inbox.",
    to: "/messages",
    icon: <ChatOutlinedIcon />,
  },
  {
    title: "Notifications",
    description: "Watch alerts for login, logout, orders, seller activity, profile updates, and messages.",
    to: "/notifications",
    icon: <NotificationsNoneOutlinedIcon />,
  },
  {
    title: "Profile & Settings",
    description: "Update your profile picture, display name, trust badge, privacy, and account settings.",
    to: "/settings",
    icon: <PersonOutlineIcon />,
  },
];

const WelcomeTour = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const userWelcomeStorageKey = useMemo(() => {
    const userKey = user?.uid || user?.piUsername || user?.username;
    return userKey ? `${WELCOME_STORAGE_KEY}:${userKey}` : WELCOME_STORAGE_KEY;
  }, [user?.piUsername, user?.uid, user?.username]);
  const displayName = user?.displayName || user?.piUsername || user?.username || "Pi user";
  const currentStep = tourSteps[stepIndex];
  const initials = useMemo(() => displayName.trim().slice(0, 1).toUpperCase() || "S", [displayName]);

  const closeTour = useCallback(() => {
    window.localStorage.setItem(userWelcomeStorageKey, "true");
    setOpen(false);
    setStarted(false);
    setStepIndex(0);
  }, [userWelcomeStorageKey]);

  useEffect(() => {
    const openTour = () => {
      setStepIndex(0);
      setStarted(false);
      setOpen(true);
    };
    window.addEventListener(WELCOME_REPLAY_EVENT, openTour);
    return () => window.removeEventListener(WELCOME_REPLAY_EVENT, openTour);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTour();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeTour, open]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user || window.localStorage.getItem(userWelcomeStorageKey) === "true") return;
    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isLoading, user, userWelcomeStorageKey]);

  const goNext = () => {
    if (stepIndex === tourSteps.length - 1) {
      closeTour();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  if (!open) return null;

  return (
    <div className="welcome-tour-backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-tour-title">
      <section className={`welcome-tour ${started ? "tour-active" : "welcome-active"}`}>
        <button className="welcome-tour-close" type="button" aria-label="Close welcome tour" onClick={closeTour}>
          <CloseIcon />
        </button>

        {!started ? (
          <>
            <div className="welcome-tour-profile">
              <span className="welcome-tour-avatar">
                {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
              </span>
              <div>
                <p className="welcome-tour-kicker">Welcome back</p>
                <h2 id="welcome-tour-title">{displayName}</h2>
              </div>
            </div>
            <p className="welcome-tour-copy">Here is a quick private tour so you know where dashboard, store, messages, notifications, profile, and settings live.</p>
            <div className="welcome-tour-preview" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="welcome-tour-actions">
              <button className="welcome-tour-secondary" type="button" onClick={closeTour}>Skip</button>
              <button className="welcome-tour-primary" type="button" onClick={() => setStarted(true)}>Start tour</button>
            </div>
          </>
        ) : (
          <>
            <div className="welcome-tour-step-icon">{currentStep.icon}</div>
            <p className="welcome-tour-kicker">Step {stepIndex + 1} of {tourSteps.length}</p>
            <h2 id="welcome-tour-title">{currentStep.title}</h2>
            <p className="welcome-tour-copy">{currentStep.description}</p>
            <Link className="welcome-tour-link" to={currentStep.to} aria-current={location.pathname === currentStep.to ? "page" : undefined}>
              Open {currentStep.title}
            </Link>
            <div className="welcome-tour-dots" aria-label="Tour progress">
              {tourSteps.map((step) => (
                <span key={step.title} className={step.title === currentStep.title ? "active" : ""} />
              ))}
            </div>
            <div className="welcome-tour-actions">
              <button className="welcome-tour-secondary" type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>Back</button>
              <button className="welcome-tour-primary" type="button" onClick={goNext}>{stepIndex === tourSteps.length - 1 ? "Done" : "Next"}</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export { WELCOME_REPLAY_EVENT };
export default WelcomeTour;
