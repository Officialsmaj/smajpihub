import type { ReactNode } from "react";
import AppLayout from "../layouts/AppLayout";
import { whitePaperText } from "../content/whitePaperSource";

type WhitePaperSection = {
  id: string;
  title: string;
  level: 2 | 3;
  lines: string[];
};

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
            <a href="#12-roadmap">Roadmap</a>
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
                    {section.lines.map((line, index) => renderLine(line, section.id, index))}
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
