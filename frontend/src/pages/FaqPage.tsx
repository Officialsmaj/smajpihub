import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useEventTracking } from "../hooks/useEventTracking";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  linkToContact?: boolean;
};

const faqItems: FaqItem[] = [
  {
    id: "what-is-smaj",
    question: "What is SMAJ PI HUB?",
    answer: "SMAJ PI HUB is a Pi-powered super platform building real-world utility through marketplace access, digital services, opportunities, and one connected Pi identity and wallet experience.",
  },
  {
    id: "pi-browser",
    question: "Do I need Pi Browser to login?",
    answer: "Yes. Login with Pi requires Pi Browser because the Pi SDK is available there. If you open the website in another browser, the site will show a message asking you to continue in Pi Browser.",
  },
  {
    id: "official-pi",
    question: "Is SMAJ PI HUB the official Pi Network?",
    answer: "SMAJ PI HUB is an independent Pi-powered application concept and service platform. It uses Pi identity and wallet utility where supported, but it is not the official Pi Network organization.",
  },
  {
    id: "what-live",
    question: "What is live now?",
    answer: "The MVP focus is SMAJ Store, the marketplace layer. Other services are shown as planned expansion areas and will be rolled out in phases.",
  },
  {
    id: "payments",
    question: "How will Pi payments work?",
    answer: "The product direction is to use Pi wallet flows for supported service transactions, with clear pricing, confirmation, reviews, and marketplace safety steps where available.",
  },
  {
    id: "token",
    question: "Is SMAJ Token live?",
    answer: "SMAJ Token is described as a future utility layer for rewards, discounts, and ecosystem participation. Token details and availability may change and should not be treated as investment advice.",
  },
  {
    id: "sellers",
    question: "How can sellers or service providers join?",
    answer: "Sellers, providers, merchants, and partners can contact SMAJ PI HUB for onboarding interest. The company direction includes provider checks, service status, and trust controls before wider rollout.",
    linkToContact: true,
  },
  {
    id: "trust",
    question: "How does SMAJ PI HUB handle trust and safety?",
    answer: "The trust model includes Pi identity, seller/provider verification, reviews, escrow logic, dispute support, clear service labels, and ongoing fraud prevention improvements.",
  },
  {
    id: "finance",
    question: "Is SMAJ PI HUB a bank or investment platform?",
    answer: "No. SMAJ PI HUB is a digital marketplace and service platform. It does not provide banking services, custody, investment advice, or profit guarantees.",
  },
  {
    id: "support",
    question: "How do I get support?",
    answer: "Use the contact page or email info@smajpihub.com for support, partnerships, provider onboarding, or company inquiries.",
    linkToContact: true,
  },
];

const FaqPage = () => {
  const [openId, setOpenId] = useState<string>(faqItems[0]?.id ?? "");
  const trackEvent = useEventTracking();

  const toggleItem = (id: string) => {
    setOpenId((current) => {
      const next = current === id ? "" : id;
      trackEvent({ event: "faq_toggle", payload: { faq_id: id, is_open: next === id } });
      return next;
    });
  };

  return (
    <AppLayout>
      <main className="home-page">
        <section className="home-hero">
          <span className="home-kicker">HELP CENTER</span>
          <h1>Frequently Asked Questions</h1>
          <p>Quick answers to help you start, explore services, and get support.</p>
        </section>

        <section className="home-section">
          <div className="faq-list" role="list">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <article key={item.id} className="faq-item" role="listitem">
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.question}
                  </button>
                  {isOpen ? (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                      {item.linkToContact ? (
                        <Link
                          to="/contact"
                          onClick={() => trackEvent({ event: "faq_contact_cta_click", payload: { source: "faq" } })}
                        >
                          Contact Support
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default FaqPage;
