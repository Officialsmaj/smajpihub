import AppLayout from "../layouts/AppLayout";
import Section from "../components/Section";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";

const teamSocialLinks = [
  {
    label: "Email Umar Alhaji Mala",
    href: "mailto:umaralhajimala3@gmail.com",
    icon: EmailOutlinedIcon,
  },
  {
    label: "Umar Alhaji Mala on Facebook",
    href: "https://www.facebook.com/profile.php?id=100085495805073",
    icon: FacebookIcon,
  },
  {
    label: "Umar Alhaji Mala on Instagram",
    href: "https://www.instagram.com/umaralhajimala3?igsh=eGI4YXVwNmt0eTZx",
    icon: InstagramIcon,
  },
  {
    label: "Umar Alhaji Mala on Telegram",
    href: "https://t.me/Ralm89",
    icon: TelegramIcon,
  },
  {
    label: "Umar Alhaji Mala on TikTok",
    href: "https://tiktok.com/@u.a.m.special",
    icon: MusicNoteOutlinedIcon,
  },
  {
    label: "Umar Alhaji Mala on YouTube",
    href: "https://youtube.com/@umaralhajimala2022?si=I7ACNZUrvaRpRdSi",
    icon: YouTubeIcon,
  },
] as const;

const umarFocusAreas = [
  "Social media management",
  "AI content creation",
  "Digital marketing support",
  "Community growth",
  "Reels, shorts, captions, and graphics",
  "Canva, CapCut, ChatGPT, AI tools",
];

const AboutPage = () => {
  return (
    <AppLayout>
      <main className="home-page">
        <Section variant="hero" className="home-hero about-hero">
          <div className="content-hero-grid">
            <div>
              <span className="home-kicker">ABOUT SMAJ PI HUB</span>
              <h1>One Ecosystem. Real Pi Utility. Global Opportunity.</h1>
              <p>
                SMAJ PI HUB is a Pi-powered ecosystem where users connect once and access essential services including
                jobs, education, health, transport, housing, and charity.
              </p>
            </div>
            <aside className="content-panel">
              <h3>What We Stand For</h3>
              <ul>
                <li>Utility-first digital economy</li>
                <li>Global access for skills and services</li>
                <li>Secure and transparent platform flow</li>
                <li>Long-term ecosystem expansion</li>
              </ul>
            </aside>
          </div>
        </Section>

        <Section className="home-section">
          <div className="home-service-grid">
            <article className="home-service-card">
              <h3>Mission</h3>
              <p>
                Create real economic utility for Pi by building a trusted platform where users and providers transact
                and grow together.
              </p>
            </article>
            <article className="home-service-card">
              <h3>Vision</h3>
              <p>
                Empower a borderless ecosystem where anyone can use their skills and services to generate sustainable
                opportunity.
              </p>
            </article>
            <article className="home-service-card">
              <h3>Trust</h3>
              <p>Ensure secure transactions, transparent process, and reliable standards across every service flow.</p>
            </article>
          </div>
        </Section>

        <Section className="home-section about-team-section">
          <div className="home-section-head">
            <span className="home-kicker">FOUNDER / LEADERSHIP</span>
            <h2>Leadership and Growing Team</h2>
            <p>
              SMAJ Ecosystem is led by its founder while expanding with creative, operational, and digital support
              talent across the community.
            </p>
          </div>

          <div className="about-team-grid">
            <article className="about-founder-card">
              <div className="about-member-placeholder" aria-hidden="true">
                SM
              </div>
              <div>
                <span className="about-team-label">Founder / Leadership</span>
                <h3>Saleh Mala Ajimi</h3>
                <p className="about-member-role">Founder &amp; CEO</p>
                <p>
                  Saleh Mala Ajimi leads SMAJ Ecosystem&apos;s long-term vision, platform direction, and mission to create
                  real digital utility through trusted services and community-centered growth.
                </p>
              </div>
            </article>

            <article className="about-member-card">
              <div className="about-member-placeholder about-member-placeholder-accent" aria-hidden="true">
                UM
              </div>
              <div className="about-member-content">
                <span className="about-team-label">Growing Team</span>
                <h3>Umar Alhaji Mala</h3>
                <p className="about-member-role">
                  Social Media Manager | AI Content Creator | Digital Marketing Assistant
                </p>
                <p>
                  Umar Alhaji Mala is a creative Social Media Manager and AI-powered Content Creator supporting SMAJ
                  Ecosystem&apos;s online presence, community growth, and digital branding. He creates social media
                  content, captions, reels, short videos, graphics, and campaign ideas across platforms including
                  Facebook, Instagram, TikTok, YouTube, Telegram, and WhatsApp Business. He also uses AI tools, AI
                  assistants, and AI agents to generate content ideas, improve marketing strategy, and support audience
                  engagement.
                </p>
                <ul className="about-focus-list" aria-label="Umar Alhaji Mala skills and focus areas">
                  {umarFocusAreas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="about-social-links" aria-label="Umar Alhaji Mala social links">
                  {teamSocialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                    >
                      <Icon fontSize="small" />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </Section>
      </main>
    </AppLayout>
  );
};

export default AboutPage;
