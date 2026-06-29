import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useEventTracking } from "../hooks/useEventTracking";

type ThreadCategory = "ecosystem" | "marketplace" | "security" | "guides" | "community";

type Thread = {
  id: string;
  title: string;
  description: string;
  category: ThreadCategory;
};

const threadCategories: Array<{ key: "all" | ThreadCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "ecosystem", label: "Ecosystem" },
  { key: "marketplace", label: "Marketplace" },
  { key: "security", label: "Security" },
  { key: "guides", label: "Guides" },
  { key: "community", label: "Community" },
];

const communityTracks = [
  ["Marketplace Education", "Help buyers and sellers understand listings, reviews, service status, and safe use.", StorefrontOutlinedIcon],
  ["Trust Awareness", "Share responsible guidance about Pi Browser, wallet safety, and platform disclaimers.", SecurityOutlinedIcon],
  ["Regional Growth", "Support local conversations, service ideas, merchant discovery, and provider interest.", GroupsOutlinedIcon],
  ["Community Campaigns", "Promote official updates, launch milestones, and real utility stories.", CampaignOutlinedIcon],
] as const;

const threads: Thread[] = [
  {
    id: "thread-1",
    title: "How SMAJ PI HUB makes multi-service access easier",
    description: "A simple explanation of identity, wallet, services, and marketplace access.",
    category: "ecosystem",
  },
  {
    id: "thread-2",
    title: "Trusted marketplace checklist for Pi buyers and sellers",
    description: "What users should check before buying, selling, or contacting a provider.",
    category: "marketplace",
  },
  {
    id: "thread-3",
    title: "Wallet safety and Pi Browser login guidance",
    description: "Why Pi login works in Pi Browser and how users should protect wallet actions.",
    category: "security",
  },
  {
    id: "thread-4",
    title: "New user guide: from first visit to first service",
    description: "A beginner-friendly path through Home, Services, Store, and Contact.",
    category: "guides",
  },
  {
    id: "thread-5",
    title: "Regional community ideas for real Pi utility",
    description: "Ways local communities can identify sellers, services, and provider opportunities.",
    category: "community",
  },
];

const CommunityPage = () => {
  const [activeCategory, setActiveCategory] = useState<"all" | ThreadCategory>("all");
  const trackEvent = useEventTracking();

  const filteredThreads = useMemo(() => {
    if (activeCategory === "all") return threads;
    return threads.filter((thread) => thread.category === activeCategory);
  }, [activeCategory]);

  return (
    <AppLayout>
      <main className="home-page program-page">
        <section className="home-hero program-hero">
          <div>
            <span className="home-kicker">COMMUNITY PROGRAM</span>
            <h1>Help the Pi community understand and use real services.</h1>
            <p>
              SMAJ PI HUB community work is focused on education, trusted onboarding, seller/provider discovery,
              local utility ideas, and responsible platform awareness.
            </p>
            <div className="home-hero-cta">
              <Link to="/contact" className="home-hero-primary-btn">Join Community Work</Link>
              <Link to="/trust" className="home-hero-secondary-btn">Trust Guidelines</Link>
            </div>
          </div>
          <aside className="program-hero-card">
            <HandshakeOutlinedIcon />
            <strong>Community with purpose</strong>
            <span>Education, onboarding, real services, and responsible Pi utility.</span>
          </aside>
        </section>

        <section className="home-section program-section">
          <div className="home-section-head">
            <span className="home-kicker">COMMUNITY TRACKS</span>
            <h2>Where community builders can help.</h2>
          </div>
          <div className="program-card-grid">
            {communityTracks.map(([title, text, Icon]) => (
              <article key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section program-section">
          <div className="home-section-head">
            <span className="home-kicker">DISCUSSION THEMES</span>
            <h2>Useful topics for public education.</h2>
          </div>
          <div className="home-hero-cta program-filter-row" role="tablist" aria-label="Thread categories">
            {threadCategories.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <button
                  key={category.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveCategory(category.key);
                    trackEvent({ event: "community_category_filter", payload: { category: category.key } });
                  }}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
          <div className="program-thread-grid">
            {filteredThreads.map((thread) => (
              <article key={thread.id}>
                <span className="home-kicker">{thread.category}</span>
                <h3>{thread.title}</h3>
                <p>{thread.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default CommunityPage;
