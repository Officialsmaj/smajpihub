import type { ReactNode } from "react";
import AppLayout from "../layouts/AppLayout";
import { whitePaperText } from "../content/whitePaperSource";

type WhitePaperSection = {
  id: string;
  title: string;
  level: 2 | 3;
  lines: string[];
};

const platformRowPriority = ["SMAJ STORE", "SMAJ PI STREAM", "SMAJ PI SPORTS"];

const platformRows = [
  ["SMAJ STORE", "Commerce", "A Pi-powered e-commerce marketplace featuring vendor verification, payment confirmation, dispute support, and seamless Pi cryptocurrency payments. It aims to provide a secure and transparent environment for buying and selling goods."],
  ["SMAJ FOOD DELIVERY", "Daily Life", "A direct-to-customer food delivery service connecting users with verified restaurants. Features include real-time tracking, loyalty rewards, and efficient logistics powered by Pi payments."],
  ["SMAJ PI JOBS", "Economy", "A comprehensive freelance and job platform offering secure payments, verified professional profiles, and smart contract support for agreements. It connects talent with opportunities within the Pi ecosystem."],
  ["SMAJ PI HEALTH", "Health", "A telemedicine platform providing access to verified healthcare providers, secure management of health records, and virtual consultations. It aims to make healthcare more accessible and efficient."],
  ["SMAJ PI EDU", "Education", "A decentralized learning platform offering verified courses, certifications, and AI-guided learning paths. It empowers individuals with accessible and quality education."],
  ["SMAJ PI TRANSPORT", "Mobility", "A coordinated transport and delivery service featuring route optimization, verified drivers, and crypto payments. This includes ride-sharing, car rentals, and potentially flight booking integrations."],
  ["SMAJ PI AGRO", "Agriculture", "A marketplace designed to connect farmers directly with buyers and suppliers, ensuring transparent pricing and efficient transactions. It aims to modernize agricultural trade."],
  ["SMAJ PI ENERGY", "Utilities", "A unified utility payment flow for essential services like electricity, water, and gas, complete with usage tracking and simplified billing."],
  ["SMAJ PI CHARITY", "Social Good", "A transparent and traceable donation infrastructure for verified non-governmental organizations (NGOs), providing clear impact reporting and fostering trust in charitable giving."],
  ["SMAJ PI HOUSING", "Real Estate", "A verified housing and property marketplace offering anti-fraud protections, provider checks, and dispute-support direction for rentals and sales. It aims to simplify real estate transactions."],
  ["SMAJ PI EVENTS", "Leisure", "A platform for event discovery, secure ticketing, and organizer verification. It explores NFT-based ticket potential to combat fraud and enhance event experiences."],
  ["SMAJ PI SWAP", "Circular Economy", "A second-hand and peer-to-peer exchange platform supporting sustainable consumption and circular economy behaviors within the community."],
  ["SMAJ PI STREAM", "Entertainment", "A premium content streaming service, offering movies, series, and documentaries. It provides a seamless entertainment experience integrated within the SMAJ PI HUB."],
  ["SMAJ PI SPORTS", "Sports", "A dedicated platform for live sports broadcasting, real-time scores, news, and community engagement. It aims to be the go-to hub for sports enthusiasts within the Pi Network."],
  ["SMAJ TOKEN", "Governance & Utility", "The native utility asset powering rewards, governance voting rights, staking opportunities, loyalty/cashback programs, and service fee discounts."],
].sort((left, right) => {
  const leftIndex = platformRowPriority.indexOf(left[0]);
  const rightIndex = platformRowPriority.indexOf(right[0]);
  return (leftIndex === -1 ? platformRowPriority.length : leftIndex) - (rightIndex === -1 ? platformRowPriority.length : rightIndex);
});

const roadmapRows = [
  ["Phase 1", "Q1-Q2 2026", "Core Launch (MVP)", "SMAJ STORE launch with Pi login integration, user and seller profiles, product listings, buyer/seller chat, Pi payment flow, payment confirmation, reviews, ratings, dispute support, and initial AI assistant deployment. SMAJ PI STREAM and SMAJ PI SPORTS are in progress."],
  ["Phase 2", "Q3 2026", "Marketplace & Employment", "Expansion of SMAJ STORE features and vendor onboarding. Launch of SMAJ PI JOBS for freelancers and employers within the Pi ecosystem."],
  ["Phase 3", "Q4 2026", "Essential Services", "Launch of SMAJ FOOD DELIVERY and SMAJ PI HEALTH, providing critical daily services to the community."],
  ["Phase 4", "Q1 2027", "Mobility & Social Impact", "Introduction of SMAJ PI TRANSPORT and SMAJ PI CHARITY, expanding the hub's utility into mobility and social good."],
  ["Phase 5", "Q2 2027", "Entertainment & Circular Economy", "SMAJ PI SWAP expansion, enriching the ecosystem with sustainable exchange options. SMAJ PI STREAM and SMAJ PI SPORTS remain marked In Progress until their launch readiness is confirmed."],
  ["Phase 6", "Q3-Q4 2027", "Token Utility & Global Scaling", "Full SMAJ TOKEN utility integration, global scaling, localization, developer ecosystem expansion, and launch of SMAJ PI EDU, SMAJ PI AGRO, SMAJ PI ENERGY, SMAJ PI HOUSING, and SMAJ PI EVENTS."],
];

const headingPattern = /^(?:#{2,3}\s*)?\d+(?:\.\d+)*\.?\s+.+$/;

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/^#+\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

const cleanHeading = (line: string) => line.replace(/^#{2,3}\s*/, "").trim();

const getHeadingLevel = (title: string): 2 | 3 => {
  const numbering = title.match(/^(\d+(?:\.\d+)*)\.?\s+/)?.[1] ?? "";
  return numbering.includes(".") ? 3 : 2;
};

const buildSections = (source: string): WhitePaperSection[] => {
  const lines = source.split(/\r?\n/).map((line) => line.trimEnd());
  const openingLines = lines.slice(0, 3).filter(Boolean);
  const sections: WhitePaperSection[] = [
    {
      id: "opening",
      title: "Opening Statement",
      level: 2,
      lines: openingLines,
    },
  ];
  let current = sections[0];
  const usedIds = new Map<string, number>();

  lines.slice(3).forEach((line) => {
    const normalized = cleanHeading(line);
    if (headingPattern.test(normalized)) {
      const baseId = createSlug(normalized) || `section-${sections.length + 1}`;
      const seenCount = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, seenCount + 1);
      const id = seenCount ? `${baseId}-${seenCount + 1}` : baseId;

      current = {
        id,
        title: normalized,
        level: getHeadingLevel(normalized),
        lines: [],
      };
      sections.push(current);
      return;
    }

    current.lines.push(line);
  });

  return sections.filter((section) => section.lines.some(Boolean) || section.id !== "opening");
};

const renderInlineText = (line: string): ReactNode[] => {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
};

const renderLine = (line: string, sectionId: string, index: number) => {
  if (!line.trim()) {
    return <span key={`${sectionId}-space-${index}`} className="whitepaper-line-space" aria-hidden="true" />;
  }

  if (line.trim().startsWith(">")) {
    return (
      <blockquote key={`${sectionId}-quote-${index}`} className="whitepaper-quote">
        {renderInlineText(line.replace(/^>\s*/, ""))}
      </blockquote>
    );
  }

  if (line.trim().startsWith("- ")) {
    return (
      <p key={`${sectionId}-bullet-${index}`} className="whitepaper-bullet-line">
        <span aria-hidden="true">-</span>
        {renderInlineText(line.trim().slice(2))}
      </p>
    );
  }

  if (line.trim().startsWith("|")) {
    return (
      <pre key={`${sectionId}-table-${index}`} className="whitepaper-table-line">
        {line}
      </pre>
    );
  }

  return <p key={`${sectionId}-line-${index}`}>{renderInlineText(line)}</p>;
};

const renderPlatformTable = () => (
  <div className="whitepaper-data-table-wrap">
    <table className="whitepaper-data-table">
      <thead>
        <tr>
          <th scope="col">Platform Name</th>
          <th scope="col">Category</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        {platformRows.map(([name, category, description]) => (
          <tr key={name}>
            <th scope="row">{name}</th>
            <td>{category}</td>
            <td>{description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const renderRoadmapTable = () => (
  <div className="whitepaper-data-table-wrap">
    <table className="whitepaper-data-table whitepaper-roadmap-table">
      <thead>
        <tr>
          <th scope="col">Phase</th>
          <th scope="col">Timeline</th>
          <th scope="col">Focus</th>
          <th scope="col">Key Deliverables</th>
        </tr>
      </thead>
      <tbody>
        {roadmapRows.map(([phase, timeline, focus, deliverables]) => (
          <tr key={phase}>
            <th scope="row">{phase}</th>
            <td>{timeline}</td>
            <td>{focus}</td>
            <td>{deliverables}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const renderSectionBody = (section: WhitePaperSection) => {
  if (section.id.startsWith("9-the-15-integrated-platforms")) {
    return (
      <>
        <p>
          The SMAJ PI HUB is comprised of 15 interconnected platforms, each designed to address specific real-world
          needs while benefiting from the unified identity and payment system.
        </p>
        {renderPlatformTable()}
      </>
    );
  }

  if (section.id.startsWith("12-roadmap")) {
    return (
      <>
        <p>
          The development and deployment of SMAJ PI HUB will follow a strategic, phased approach to ensure stability,
          security, and user adoption.
        </p>
        {renderRoadmapTable()}
      </>
    );
  }

  return section.lines.map((line, index) => renderLine(line, section.id, index));
};

const sections = buildSections(whitePaperText);
const tocSections = sections.filter((section) => section.id !== "opening");

const WhitePaperPage = () => {
  return (
    <AppLayout>
      <main className="whitepaper-page">
        <div className="whitepaper-shell">
          <nav className="whitepaper-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span>White Paper</span>
          </nav>

          <section className="whitepaper-hero">
            <span className="whitepaper-kicker">SMAJ PI HUB WHITE PAPER</span>
            <h1>SMAJ PI HUB White Paper</h1>
            <p>A Unified Digital Hub Connecting Services, Commerce, and Innovation on the Pi Network</p>
            <div className="whitepaper-meta-row" aria-label="White paper details">
              <span>Version 2.0</span>
              <span>Edited Publication Date: April 16, 2026</span>
              <span>Authored By: SMAJ Core Team</span>
            </div>
          </section>

          <div className="whitepaper-version-tabs" aria-label="White paper highlights">
            <a href="#1-executive-summary">Executive Summary</a>
            <a href="#7-the-smaj-pi-hub-solution-unified-access-and-intelligent-assistance">Unified Access</a>
            <a href="#9-the-15-integrated-platforms-a-comprehensive-hub">15 Platforms</a>
            <a href="#12-roadmap-phased-rollout">Roadmap</a>
          </div>

          <div className="whitepaper-layout">
            <aside className="whitepaper-toc" aria-label="White paper table of contents">
              <h2>Contents</h2>
              <ol>
                {tocSections.map((section) => (
                  <li key={section.id} className={section.level === 3 ? "whitepaper-toc-subitem" : undefined}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </aside>

            <article className="whitepaper-article">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="whitepaper-document-section">
                  {section.id === "opening" ? (
                    <h2>{section.title}</h2>
                  ) : section.level === 3 ? (
                    <h3>{section.title}</h3>
                  ) : (
                    <h2>{section.title}</h2>
                  )}
                  <div className="whitepaper-section-body">
                    {renderSectionBody(section)}
                  </div>
                  {section.id !== sections[sections.length - 1]?.id ? (
                    <a className="whitepaper-scroll-link" href="#opening">
                      Scroll Up
                    </a>
                  ) : null}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default WhitePaperPage;
