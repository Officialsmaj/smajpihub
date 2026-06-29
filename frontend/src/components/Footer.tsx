import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip"; // Import Tooltip
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TelegramIcon from "@mui/icons-material/Telegram";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import styles from "./Footer.module.css";

const companyEmail = "contact@smaj.org";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div>
          <h4>SMAJ PI HUB</h4>
          <p>Built for Pi wallet access, with SMAJ Token utility expanding across the ecosystem.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <Link to="/home">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/white-paper">White Paper</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Programs</h4>
          <Link to="/affiliate">Affiliate Program</Link>
          <Link to="/collaborate">Collaborate With Us</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/community">Community</Link>
          <Link to="/developers">Developers</Link>
        </div>
        <div>
          <h4>Key Services</h4>
          <Link to="/services/store">STORE</Link>
          <Link to="/services/jobs">JOBS</Link>
          <Link to="/services/health">HEALTH</Link>
          <Link to="/services/education">EDUCATION</Link>
          <Link to="/services/sports">SPORTS</Link>
          <Link to="/services/stream">STREAM</Link>
          <Link to="/services">View All Services</Link>
        </div>
        <div>
          <h4>Social</h4>
          <a href={`mailto:${companyEmail}`}><MailOutlineOutlinedIcon fontSize="small" />{companyEmail}</a>
          <div className={styles.socialRow} aria-label="Social links">
            <a className={styles.socialIcon} href="https://x.com/smajecosystem" aria-label="X" target="_blank" rel="noreferrer">
              <XIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="https://t.me/smajecosystem" aria-label="Telegram" target="_blank" rel="noreferrer">
              <TelegramIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="https://instagram.com/smajecosystem" aria-label="Instagram" target="_blank" rel="noreferrer">
              <InstagramIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="https://youtube.com/@smajecosystem" aria-label="YouTube" target="_blank" rel="noreferrer">
              <YouTubeIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="https://www.tiktok.com/@smajecosystem" aria-label="TikTok" target="_blank" rel="noreferrer">
              <MusicNoteOutlinedIcon fontSize="small" />
            </a>
          </div>
        </div>



      </div>

      <div className={styles.footerBottomBar}>
        <div className={styles.poweredBy}>
          <a href="https://smaj.org" className={styles.logoLink} aria-label="SMAJ Ecosystem">
            <img src="/smaj_ecosystem_logo.png" alt="SMAJ Ecosystem Logo" className={styles.logoImg} />
          </a>
          <p className={styles.poweredText}>
            <span>Powered By SMAJ Ecosystem</span>
          </p>
        </div>

        <div className={styles.legalLinksRow}>
          <Link to="/privacy">Privacy Policy</Link>
          <span className={styles.legalSeparator}>|</span>
          <Link to="/terms">Terms & Conditions</Link>
          <span className={styles.legalSeparator}>|</span>
          <Link to="/cookies">Cookie Policy</Link>
          <span className={styles.legalSeparator}>|</span>
          <Link to="/report-abuse">Report Abuse</Link>
        </div>


        <p className={styles.copyright}>&copy; 2026 SMAJ PI HUB. All rights reserved.</p>

      </div>


      <Tooltip title="Scroll to top" placement="left">
        <button
          type="button"
          onClick={scrollToTop}
          className={`${styles.scrollToTop} ${isVisible ? styles.visible : ""}`}
          aria-label="Scroll to top"
        >
          <ArrowUpwardOutlinedIcon />
        </button>
      </Tooltip>
    </footer>
  );
};

export default Footer;

