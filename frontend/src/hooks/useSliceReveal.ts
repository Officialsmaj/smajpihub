import { useEffect } from "react";

const revealSelector = [
  ".slice-in",
  ".slice-up",
  ".slice-left",
  ".slice-right",
  ".slice-stagger > *",
  ".home-page > section",
  ".whitepaper-hero",
  ".whitepaper-layout",
  ".home-highlight-grid > *",
  ".public-home-service-grid > *",
  ".public-home-mvp-grid > *",
  ".public-home-steps > *",
  ".about-fact-grid > *",
  ".about-step-grid > *",
  ".about-layer-grid > *",
  ".about-reason-list > *",
  ".about-audience-grid > *",
  ".about-principle-list > *",
  ".about-trust-grid > *",
  ".about-status-grid > *",
  ".services-principle-grid > *",
  ".services-directory-grid > *",
  ".how-step-grid > *",
  ".contact-route-grid > *",
  ".service-detail-feature-grid > *",
  ".service-detail-trust > *",
  ".trust-layer-grid > *",
  ".company-profile-grid > *",
  ".company-official-links a",
  ".partner-type-grid > *",
  ".partner-onboarding-panel li",
  ".program-card-grid > *",
  ".program-thread-grid > *",
  ".program-process-panel li",
  ".public-store-feature-grid > *",
  ".public-store-flow-panel li",
  ".legal-policy-panel",
  ".legal-policy-panel li",
  ".legal-report-card",
].join(", ");

const useSliceReveal = () => {
  useEffect(() => {
    let revealObserver: IntersectionObserver | undefined;

    const revealImmediately = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
      elements.forEach((element) => element.classList.add("slice-visible"));
    };

    const observe = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));

      if (!elements.length) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
        revealImmediately();
        return;
      }

      revealObserver?.disconnect();
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("slice-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
      );

      elements.forEach((element) => {
        if (!element.classList.contains("slice-visible")) {
          revealObserver?.observe(element);
        }
      });
    };

    observe();

    const mutationObserver = new MutationObserver(() => {
      window.requestAnimationFrame(observe);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      revealObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
};

export default useSliceReveal;
