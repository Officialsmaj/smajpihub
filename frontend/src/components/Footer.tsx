import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Tooltip from "@mui/material/Tooltip"; // Import Tooltip
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TelegramIcon from "@mui/icons-material/Telegram";

import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import styles from "./Footer.module.css";

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
          <Link to="/home"><HomeOutlinedIcon fontSize="small" />Home</Link>
          <Link to="/about"><InfoOutlinedIcon fontSize="small" />About</Link>
          <Link to="/services"><DesignServicesOutlinedIcon fontSize="small" />Services</Link>
          <Link to="/white-paper"><DescriptionOutlinedIcon fontSize="small" />White Paper</Link>
          <Link to="/pricing"><SellOutlinedIcon fontSize="small" />Pricing</Link>
          <Link to="/faq"><HelpOutlineOutlinedIcon fontSize="small" />FAQ</Link>
          <Link to="/contact"><MailOutlineOutlinedIcon fontSize="small" />Contact</Link>
        </div>
        <div>
          <h4>Programs</h4>
          <Link to="/affiliate"><GroupAddOutlinedIcon fontSize="small" />Affiliate Program</Link>
          <Link to="/collaborate"><Diversity3OutlinedIcon fontSize="small" />Collaborate With Us</Link>
          <Link to="/partners"><HandshakeOutlinedIcon fontSize="small" />Partners</Link>
          <Link to="/community"><ForumOutlinedIcon fontSize="small" />Community</Link>
          <Link to="/developers"><CodeOutlinedIcon fontSize="small" />Developers</Link>
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
          <div className={styles.socialRow} aria-label="Social links">
            <a className={styles.socialIcon} href="/" aria-label="Facebook">
              <FacebookIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="/" aria-label="Instagram">
              <InstagramIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="/" aria-label="X">
              <XIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="/" aria-label="YouTube">
              <YouTubeIcon fontSize="small" />
            </a>
            <a className={styles.socialIcon} href="/" aria-label="Telegram">
              <TelegramIcon fontSize="small" />
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
            <span style={{ fontWeight: "bold", fontSize: "1rem" }}></span>
            <span>Part of the SMAJ Ecosystem • Powered by SMAJ</span>
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
