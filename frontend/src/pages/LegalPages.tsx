import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { axiosClient } from "../lib/axiosClient";

const legalEmail = "info@smajpihub.com";

const LegalShell = ({
  kicker,
  title,
  description,
  backTo,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  backTo?: string;
  children: ReactNode;
}) => (
  <AppLayout>
    <main className="home-page legal-company-page">
      {backTo ? (
        <Link className="legal-back-link" to={backTo}>
          <ArrowBackIcon />
          Back
        </Link>
      ) : null}
      <section className="home-hero legal-company-hero">
        <div>
          <span className="home-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <aside className="legal-hero-card">
          <GavelOutlinedIcon />
          <strong>SMAJ PI HUB</strong>
          <span>Digital marketplace and service platform.</span>
        </aside>
      </section>
      {children}
    </main>
  </AppLayout>
);

const LegalPanel = ({ title, items }: { title: string; items: string[] }) => (
  <article className="legal-policy-panel">
    <h2>{title}</h2>
    <ul>
      {items.map((item) => (
        <li key={item}>
          <ShieldOutlinedIcon />
          {item}
        </li>
      ))}
    </ul>
  </article>
);

const LegalTextDocument = ({
  title,
  sections,
}: {
  title: string;
  sections: { heading: string; paragraphs?: string[]; items?: string[] }[];
}) => (
  <section className="home-section legal-text-document">
    <div className="legal-text-intro">
      <span className="home-kicker">TEXT DOCUMENT</span>
      <h2>{title}</h2>
      <p>Effective Date: July 1, 2026. Read the policy directly on this page for clear user understanding across mobile and desktop.</p>
    </div>
    {sections.map((section, index) => (
      <article className="legal-text-section" key={section.heading}>
        <h3>{index + 1}. {section.heading}</h3>
        {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.items?.length ? (
          <ul>
            {section.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : null}
      </article>
    ))}
  </section>
);

export const PrivacyPage = () => (
  <LegalShell
    kicker="PRIVACY POLICY"
    title="How SMAJ PI HUB handles user and marketplace data."
    description="This page explains how SMAJ PI HUB collects, uses, processes, and protects information across account access, Pi wallet flows, marketplace activity, and support."
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Information We May Use"
        items={[
          "Pi identity information required for login, account access, and platform participation where supported.",
          "Marketplace activity such as listings, seller profiles, buyer/seller communication, reviews, and support records.",
          "Technical information used for security, fraud prevention, performance, analytics, and service reliability.",
          "Contact information submitted through forms, provider onboarding, reports, or partnership requests.",
        ]}
      />
      <LegalPanel
        title="How We Protect Users"
        items={[
          "SMAJ PI HUB uses access controls, verification signals, and safety workflows to reduce abuse.",
          "Sensitive service flows are designed around user awareness, transaction confirmation, and support review.",
          "We do not sell personal data as a business model.",
          "Questions about privacy can be sent to info@smajpihub.com.",
        ]}
      />
    </section>
    <LegalTextDocument
      title="SMAJ PI HUB Privacy Policy"
      sections={[
        {
          heading: "Introduction",
          paragraphs: [
            "This Privacy Policy describes how SMAJ PI HUB (\"we,\" \"us,\" or \"our\"), operating the digital super platform accessible at smaj.org, collects, uses, processes, and shares your information. We are committed to protecting your privacy and ensuring the security of your personal data. By accessing or using SMAJ PI HUB, you agree to the terms of this Privacy Policy.",
            "SMAJ PI HUB is a comprehensive digital super platform powered by the Pi Network, offering 15 integrated services including a marketplace, food delivery, jobs, health, education, transport, agriculture, energy, charity, housing, events, swap, streaming, sports, and a utility token.",
            "Our platform is designed to provide a seamless and secure experience, utilizing Pi cryptocurrency for payments and a single verified identity across all services. This policy outlines our practices regarding data collection, usage, and protection, in compliance with global data protection regulations such as the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).",
          ],
        },
        {
          heading: "Data Collection",
          paragraphs: [
            "We collect various types of information to provide and improve our services. This includes:",
          ],
        },
        {
          heading: "Personal Information",
          items: [
            "This refers to data that can be used to identify you directly or indirectly. We collect personal information when you register for an account, complete your profile, or undergo identity verification (KYC).",
            "Register for an account: This may include your name, email address, phone number, and other contact details.",
            "Complete your profile: Additional information such as your date of birth, gender, and location may be collected to enhance your user experience and service personalization.",
            "Undergo identity verification (KYC): As part of our commitment to security and regulatory compliance, we may collect government-issued identification details to verify your identity. This data is crucial for maintaining a trusted ecosystem within the Pi Network.",
          ],
        },
        {
          heading: "Pi Wallet Data",
          items: [
            "Given our integration with the Pi Network, we collect specific data related to your Pi wallet.",
            "Pi Wallet Address: Your unique identifier on the Pi blockchain, necessary for transactions and identity verification within the SMAJ PI HUB ecosystem.",
            "Transaction History: Details of transactions conducted using Pi cryptocurrency on our platform, including amounts, dates, and parties involved. This data is essential for escrow protection, dispute resolution, and maintaining a transparent marketplace.",
            "Pi Network Authentication Data: Information related to your login and authentication via your Pi wallet, which serves as your verified identity across all SMAJ PI HUB services.",
          ],
        },
        {
          heading: "Transaction Data",
          items: [
            "When you engage in transactions across our 15 integrated services, we collect data related to these activities.",
            "Service-Specific Transaction Details: For example, marketplace purchases, food delivery orders, job applications, health consultations, educational course enrollments, transport bookings, agricultural product transactions, energy service usage, charity donations, housing rentals, event ticket purchases, swap agreements, streaming subscriptions, and sports-related transactions.",
            "Payment Information: While payments are primarily made with Pi cryptocurrency, we may collect information related to payment processing and confirmations.",
            "Escrow and Dispute Resolution Data: Information pertinent to transactions under escrow, including communications, evidence submitted, and resolution outcomes.",
          ],
        },
        {
          heading: "Usage Data",
          items: [
            "We automatically collect information about your interaction with our platform.",
            "Device Information: IP address, device type, operating system, browser type, and unique device identifiers.",
            "Log Data: Details of how you use our services, such as pages viewed, features accessed, search queries, and timestamps of your activities.",
            "Location Data: Depending on your device settings and service requirements, such as food delivery or transport, we may collect precise or approximate location data.",
            "AI Assistant Interactions: Records of your interactions with our AI assistant, including queries and responses, to improve service quality and personalization.",
          ],
        },
        {
          heading: "How Data is Used",
          items: [
            "Service Provision: To operate and deliver the 15 integrated services, process transactions, and fulfill your requests.",
            "Account Management: To create, maintain, and secure your account, and to authenticate your identity via your Pi wallet.",
            "Personalization: To customize your experience, recommend relevant services, and provide tailored content based on your usage and preferences.",
            "Communication: To send you service-related notifications, updates, security alerts, and promotional messages where permitted.",
            "Security and Fraud Prevention: To detect and prevent fraudulent activities, unauthorized access, and other illegal activities, including leveraging Pi Network's security features.",
            "Escrow and Dispute Resolution: To facilitate secure transactions, manage escrow services, and resolve disputes between users.",
            "Platform Improvement: To analyze usage patterns, conduct research, and develop new features and services.",
            "Compliance and Legal Obligations: To comply with applicable laws, regulations, legal processes, and governmental requests, including KYC requirements.",
            "AI Assistant Enhancement: To train and improve the performance and accuracy of our AI assistant.",
          ],
        },
        {
          heading: "Third-Party Sharing",
          items: [
            "We may share your information with third parties under specific circumstances and with appropriate safeguards.",
            "Service Providers: We engage third-party vendors and service providers to assist us in operating our platform, such as hosting, analytics, payment processing for fiat gateways if introduced, and customer support. These providers are contractually obligated to protect your data and use it only for the purposes for which it was disclosed.",
            "Pi Network Ecosystem: As an integral part of the Pi Network, certain data, particularly Pi wallet authentication and transaction data, may be shared within the broader Pi ecosystem to ensure interoperability and security. This is fundamental to the operation of SMAJ PI HUB.",
            "Business Transfers: In the event of a merger, acquisition, or asset sale, your information may be transferred to the acquiring entity.",
            "Legal Requirements: We may disclose your information if required by law, court order, or governmental regulation, or if we believe such disclosure is necessary to protect our rights, property, or safety, or the rights, property, or safety of others.",
            "With Your Consent: We may share your information with third parties when we have your explicit consent to do so.",
            "Aggregated or Anonymized Data: We may share aggregated or anonymized data that cannot reasonably be used to identify you with third parties for research, marketing, analytics, or other purposes.",
          ],
        },
        {
          heading: "Pi Network Integration and Wallet Data",
          items: [
            "SMAJ PI HUB's core functionality relies on its deep integration with the Pi Network. Your Pi wallet serves as your primary authentication method and payment instrument.",
            "Unified Identity: Your verified Pi Network identity is used across all 15 services on SMAJ PI HUB.",
            "Secure Transactions: All cryptocurrency payments are processed via the Pi blockchain, leveraging its inherent security features.",
            "Data Interoperability: Certain wallet-related data is necessary for the seamless operation of services and may be shared with the Pi Network infrastructure as required for authentication, transaction validation, and ecosystem integrity. We adhere to the Pi Network's privacy standards in handling such data.",
          ],
        },
        {
          heading: "Cookies and Tracking Technologies",
          paragraphs: [
            "We use cookies and similar tracking technologies, like web beacons and pixels, to collect and use personal information about you, including to serve interest-based advertising.",
            "For more information about the types of cookies we use, why, and how you can control them, please refer to our separate Cookie Policy.",
          ],
        },
        {
          heading: "User Rights (GDPR and CCPA Compliance)",
          items: [
            "We respect your data protection rights and provide you with mechanisms to exercise them.",
            "Depending on your location, particularly for users in the European Economic Area (EEA) and California, these rights may include right to access, right to rectification, right to erasure, right to restrict processing, right to object to processing, right to data portability, and right to opt-out of sale or sharing under CCPA.",
            "To exercise any of these rights, please contact us using the details provided in the Contact Information section. We will respond to your request in accordance with applicable data protection laws.",
          ],
        },
        {
          heading: "Data Security",
          items: [
            "We implement robust technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction.",
            "Encryption: Data is encrypted both in transit and at rest where appropriate.",
            "Access Controls: Strict access controls are in place to limit who can access your personal data.",
            "Regular Security Audits: We conduct regular security assessments and penetration testing to identify and address vulnerabilities.",
            "Employee Training: Our staff receives regular training on data protection and security best practices.",
            "Pi Network Security: We leverage the inherent security features of the Pi Network for wallet authentication and transaction security.",
            "However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.",
          ],
        },
        {
          heading: "Children's Privacy",
          paragraphs: [
            "SMAJ PI HUB is not intended for use by individuals under the age of 16. We do not knowingly collect personal data from children under 16.",
            "If we become aware that we have collected personal data from a child under 16 without parental consent, we will take steps to delete that information promptly. If you believe that we might have any information from or about a child under 16, please contact us.",
          ],
        },
        {
          heading: "International Data Transfers",
          paragraphs: [
            "As a global platform, your information may be stored and processed in any country where we have facilities or where we engage service providers. By using SMAJ PI HUB, you understand that your information may be transferred to countries outside of your country of residence, which may have different data protection laws than those in your country.",
            "We ensure that such transfers comply with applicable data protection laws, for example, by implementing standard contractual clauses approved by the European Commission or other appropriate safeguards.",
          ],
        },
        {
          heading: "Data Retention",
          paragraphs: [
            "We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.",
            "The retention period is determined by the type of data, the purpose of processing, and legal or regulatory obligations. When your personal data is no longer required, we will securely delete or anonymize it.",
          ],
        },
        {
          heading: "Changes to This Privacy Policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.",
            "We will notify you of any material changes by posting the new Privacy Policy on smaj.org and updating the Effective Date at the top of this policy. We encourage you to review this Privacy Policy periodically for any changes.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:",
            "SMAJ PI HUB",
            "Website: smaj.org",
            `Email: ${legalEmail}`,
            "Address: Online-only operation",
          ],
        },
      ]}
    />
  </LegalShell>
);

export const TermsPage = () => (
  <LegalShell
    kicker="TERMS & CONDITIONS"
    title="Rules for using SMAJ PI HUB services."
    description="These terms summarize the platform expectations for users, sellers, providers, partners, and visitors."
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Platform Use"
        items={[
          "Users must provide accurate information and must not impersonate others, abuse listings, or attempt fraud.",
          "Sellers and providers are responsible for truthful listings, service delivery, legal compliance, and customer support.",
          "SMAJ PI HUB may restrict access when users abuse the platform, bypass safety systems, or harm other participants.",
          "Service availability, roadmap timing, payment flows, and token utility may change as the platform develops.",
        ]}
      />
      <LegalPanel
        title="Important Disclaimer"
        items={[
          "SMAJ PI HUB is a digital marketplace and service platform, not a bank or financial institution.",
          "The platform does not provide investment advice, guarantee profits, guarantee token value, or provide custody services.",
          "Users are responsible for complying with laws and regulations in their own jurisdictions.",
          "Pi wallet actions should be reviewed carefully by each user before confirmation.",
        ]}
      />
    </section>
    <LegalTextDocument
      title="SMAJ PI HUB Terms and Conditions"
      sections={[
        {
          heading: "Acceptance of Terms",
          paragraphs: [
            "By accessing, browsing, creating an account, authenticating with a Pi wallet, or using any part of SMAJ PI HUB, users agree to these Terms, the Privacy Policy, Cookie Policy, and Report Abuse Policy.",
            "These Terms apply to visitors, buyers, sellers, service providers, partners, and account holders.",
          ],
        },
        {
          heading: "Eligibility, Account Registration, and Pi Wallet Authentication",
          items: [
            "Users must be at least 18 years old and legally able to enter into a binding agreement.",
            "Users must provide accurate, current, and complete account information and keep it updated.",
            "Users must not impersonate another person, company, seller, buyer, Pi Network representative, or SMAJ PI HUB representative.",
            "Users are responsible for actions taken through their account.",
            "Pi wallet authentication may be used as the primary login credential and verified identity across supported SMAJ PI HUB services.",
            "Users are responsible for the security of their Pi wallet and for reviewing wallet actions before confirmation.",
          ],
        },
        {
          heading: "Platform Services",
          paragraphs: [
            "SMAJ PI HUB integrates services including marketplace, food delivery, jobs, health, education, transport, agriculture, energy, charity, housing, events, swap, streaming, sports, and SMAJ Token utility features. Specific services may have additional guidelines or supplementary terms.",
          ],
        },
        {
          heading: "User Responsibilities and Marketplace Rules",
          items: [
            "Users must comply with applicable laws, use the platform only for lawful purposes, provide truthful information, respect intellectual property rights, communicate respectfully, and report suspicious activity or abuse.",
            "Listings must be real, accurate, lawful, and supported by clear product or service information.",
            "Sellers must honor delivery, pickup, refund, communication, and customer support responsibilities.",
            "Buyers must review listing details carefully before placing orders or confirming transactions.",
            "SMAJ PI HUB may review, reject, remove, hide, or restrict listings that create risk or violate policy.",
          ],
        },
        {
          heading: "Payments, Escrow, and Disputes",
          paragraphs: [
            "Payments within SMAJ PI HUB are primarily conducted using Pi cryptocurrency where supported. SMAJ PI HUB facilitates platform flows but is not a bank, investment adviser, wallet custodian, financial institution, or guarantor of cryptocurrency value.",
            "Escrow protection and dispute-resolution mechanisms may be provided for eligible transactions. Users agree to participate in dispute processes in good faith.",
          ],
        },
        {
          heading: "Prohibited Activities",
          items: [
            "Violating laws, infringing rights, posting harmful or unlawful content, engaging in scams or misrepresentation, creating fake accounts, impersonating others, spreading malware, interfering with the platform, harvesting personal data without consent, or bypassing security measures.",
          ],
        },
        {
          heading: "AI Assistant, Token Terms, and Intellectual Property",
          paragraphs: [
            "The SMAJ PI HUB AI assistant provides platform-related assistance for informational purposes and should not be treated as medical, legal, financial, or other professional advice.",
            "SMAJ Token features, if and when launched or integrated, may be governed by separate terms. Platform content, trademarks, logos, and intellectual property belong to SMAJ PI HUB or its licensors, while users grant SMAJ PI HUB the rights needed to operate and promote uploaded content.",
          ],
        },
        {
          heading: "Limitation, Termination, Changes, and Contact",
          paragraphs: [
            "To the maximum extent permitted by law, SMAJ PI HUB is not liable for indirect, incidental, special, consequential, punitive, profit, revenue, data, goodwill, or similar losses related to platform access, third-party conduct, content, or unauthorized use.",
            "SMAJ PI HUB may suspend or terminate accounts or access for violations of these Terms or platform policies. Service availability, roadmap timing, supported features, payment flow, pricing display, seller tools, and service categories may change as the platform develops.",
            `Questions about these Terms can be sent to ${legalEmail}.`,
          ],
        },
      ]}
    />
  </LegalShell>
);

export const CookiesPage = () => (
  <LegalShell
    kicker="COOKIE POLICY"
    title="How cookies and local storage support the website."
    description="SMAJ PI HUB uses browser storage carefully to support sessions, theme preference, performance, and user experience."
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Storage We May Use"
        items={[
          "Theme preference such as light or dark mode.",
          "Session and account continuity where login and authentication flows require it.",
          "Recent search or navigation preferences that improve user experience.",
          "Analytics or performance signals used to improve service reliability and launch readiness.",
        ]}
      />
      <LegalPanel
        title="User Control"
        items={[
          "Users can manage cookies and browser storage through their browser settings.",
          "Disabling some storage may affect login, theme preference, account sessions, and service behavior.",
          "SMAJ PI HUB does not use cookies to make investment promises or financial guarantees.",
        ]}
      />
    </section>
    <LegalTextDocument
      title="SMAJ PI HUB Cookie Policy"
      sections={[
        {
          heading: "What Cookies Are",
          paragraphs: [
            "Cookies are small data files placed on a computer or mobile device when visiting a website. They help websites function, remember actions and preferences, support reporting, and improve browsing experience.",
            "SMAJ PI HUB may use cookies, local storage, and similar browser storage to keep the website functional, remember preferences, support account sessions, and improve user experience.",
          ],
        },
        {
          heading: "Types of Cookies and Storage We Use",
          items: [
            "Essential cookies and storage required for secure areas, login, account sessions, shopping carts, billing flows, and protected pages.",
            "Analytics and customization cookies used in aggregate to understand site usage, improve performance, and refine user experience.",
            "Functional cookies used to remember choices such as login details, language, theme, country, search, navigation, or interface preferences.",
            "Marketing cookies may be used where applicable to make messages more relevant and manage advertising display.",
            "Performance, security, and reliability signals used to improve the platform.",
          ],
        },
        {
          heading: "Third-Party Cookies and Pi Browser Compatibility",
          paragraphs: [
            "Third-party services may set cookies for analytics, reporting, advertising, social media plugins, or other supported functionality. SMAJ PI HUB is designed for Pi Browser compatibility so authentication and transaction experiences remain consistent and secure where supported.",
          ],
        },
        {
          heading: "Managing Cookies and Consent",
          paragraphs: [
            "Users can accept, reject, clear, or block cookies through browser settings and, where available, the cookie consent banner or consent tool. Some platform features may not work correctly if required cookies or storage are disabled.",
          ],
        },
        {
          heading: "Changes and Contact",
          paragraphs: [
            "We may update this Cookie Policy from time to time to reflect changes to the cookies or storage we use.",
            `Questions about cookies or similar technologies can be sent to ${legalEmail}.`,
          ],
        },
      ]}
    />
  </LegalShell>
);

export const SellerAgreementPage = () => (
  <LegalShell
    kicker="SELLER AGREEMENT"
    title="Seller rules for listing products on SMAJ PI HUB."
    description="Read the official seller agreement before listing products, accepting orders, or using seller tools."
    backTo="/add-product"
  >
    <section className="home-section legal-company-section">
      <LegalPanel
        title="Before You List"
        items={[
          "Products must be real, accurately described, and supported by clear product images.",
          "Seller contact, delivery details, location, quantity, price, and condition must be truthful.",
          "SMAJ PI HUB may review, reject, hide, or remove listings that are unsafe, fake, misleading, or incomplete.",
          "Sellers are responsible for customer communication, delivery promises, refunds, and legal compliance.",
        ]}
      />
      <LegalPanel
        title="Marketplace Trust"
        items={[
          "Do not request users to bypass SMAJ PI HUB safety, order, or payment flows.",
          "Do not impersonate another seller, brand, company, buyer, or Pi Network representative.",
          "Fraud, unsafe items, abuse, spam, counterfeit goods, and prohibited content may lead to account restriction.",
          "By accepting the seller agreement, you confirm your listing is review-ready and connected to your verified account.",
        ]}
      />
    </section>
    <LegalTextDocument
      title="SMAJ PI HUB Seller Agreement"
      sections={[
        {
          heading: "Introduction",
          paragraphs: [
            "This Agreement sets forth the rights and obligations of Sellers utilizing the SMAJ PI HUB platform. It is a legally binding document that Sellers must read, understand, and accept prior to engaging in any selling activities on the Platform.",
            "The purpose of this Agreement is to ensure a consistent and high-quality experience for both Sellers and Buyers within the SMAJ PI HUB ecosystem.",
          ],
        },
        {
          heading: "Seller Eligibility",
          paragraphs: [
            "To be eligible to sell on SMAJ PI HUB, prospective Sellers must meet specific criteria as determined by the Platform. This includes, but is not limited to, compliance with all applicable laws and regulations, and adherence to the Platform's community guidelines and standards.",
            "SMAJ PI HUB reserves the right to approve or reject any Seller application at its sole discretion.",
          ],
        },
        {
          heading: "Seller Responsibilities",
          items: [
            "Listing Authenticity: Sellers must list only genuine products or services. Sellers are responsible for the authenticity of their listings.",
            "Accurate Descriptions: Sellers must provide accurate descriptions and images that truthfully represent the products or services offered.",
            "Compliance: Sellers must adhere to all Platform policies, guidelines, and applicable laws.",
            "Customer Service: Sellers must provide timely and professional customer support to Buyers.",
            "Order Fulfillment: Sellers must ensure efficient and accurate processing, shipping, and delivery of orders.",
          ],
        },
        {
          heading: "Product and Service Listing Rules",
          items: [
            "Listings must be for genuine products or services.",
            "Descriptions and images must be accurate, clear, and not misleading.",
            "All necessary information, including specifications, condition, and availability, must be provided.",
            "Fraudulent, misleading, counterfeit, or illegal listings are strictly prohibited.",
          ],
        },
        {
          heading: "Pricing Policy",
          paragraphs: [
            "Sellers are required to use honest market pricing for all products and services listed on SMAJ PI HUB. The Platform aims to promote fair competition and value for Buyers.",
            "Price manipulation or deceptive pricing practices are strictly forbidden.",
          ],
        },
        {
          heading: "Pi Utility and Price Conversion Policy",
          items: [
            "SMAJ PI HUB uses an internal marketplace reference value of 1 Pi = 3,141.59 USDT for platform price calculations.",
            "Sellers voluntarily agree to this pricing model when publishing listings.",
            "Buyers voluntarily choose whether to purchase under this pricing model.",
            "SMAJ PI HUB does not guarantee external exchange values for Pi.",
          ],
        },
        {
          heading: "Prohibited Products and Services",
          items: [
            "Illegal items or services.",
            "Counterfeit goods or unauthorized replicas.",
            "Items that promote hate, violence, discrimination, or illegal activities.",
            "Adult content or sexually explicit materials.",
            "Hazardous materials or dangerous goods.",
            "Any other items deemed inappropriate or harmful by SMAJ PI HUB.",
          ],
          paragraphs: [
            "Violations may result in listing removal, account suspension, or permanent account termination.",
          ],
        },
        {
          heading: "Intellectual Property",
          paragraphs: [
            "Sellers must respect intellectual property rights. Listing products or services that infringe upon copyrights, trademarks, patents, or other proprietary rights of third parties is strictly prohibited.",
            "Sellers are solely responsible for ensuring that their listings do not violate any intellectual property laws.",
          ],
        },
        {
          heading: "Orders, Shipping, and Delivery",
          items: [
            "Processing orders promptly.",
            "Packaging items securely.",
            "Arranging for shipping and delivery to the Buyer.",
            "Providing accurate tracking information where applicable.",
            "Adhering to stated shipping times.",
          ],
        },
        {
          heading: "Returns, Refunds, and Disputes",
          paragraphs: [
            "Sellers must establish clear and fair return and refund policies that comply with Platform guidelines and applicable consumer protection laws.",
            "In the event of a dispute between a Seller and a Buyer, SMAJ PI HUB may mediate to facilitate a resolution, but the ultimate responsibility for resolving disputes lies with the Seller.",
          ],
        },
        {
          heading: "Buyer Protection",
          paragraphs: [
            "SMAJ PI HUB is committed to providing a safe and secure environment for Buyers. The Platform implements various measures to protect Buyers, including dispute resolution mechanisms and policies against fraudulent activities.",
            "Buyers are encouraged to report any issues or concerns to SMAJ PI HUB.",
          ],
        },
        {
          heading: "Marketplace Trust and Safety",
          items: [
            "Operating with honesty and integrity.",
            "Communicating respectfully with Buyers and the Platform.",
            "Reporting any suspicious activities or violations of this Agreement.",
          ],
        },
        {
          heading: "Fraud, Abuse, and Misconduct",
          paragraphs: [
            "Any form of fraudulent activity, abuse, or misconduct on the Platform is strictly prohibited. This includes, but is not limited to, misrepresentation, phishing, spamming, or any actions intended to harm other users or the Platform.",
            "Violations may result in listing removal, account suspension, or permanent account termination.",
          ],
        },
        {
          heading: "Account Suspension and Termination",
          paragraphs: [
            "SMAJ PI HUB reserves the right to suspend or terminate a Seller's account, or remove listings, at its sole discretion, for violations of this Agreement, Platform policies, or any applicable laws.",
            "Reasons for suspension or termination may include, but are not limited to, fraudulent activities, repeated policy violations, or engaging in prohibited conduct.",
          ],
        },
        {
          heading: "Privacy and Data Protection",
          paragraphs: [
            "Sellers must comply with all applicable privacy and data protection laws regarding the collection, use, storage, and processing of Buyer information.",
            "Sellers are prohibited from using Buyer data for any purpose other than fulfilling orders and providing customer service, unless explicit consent is obtained from the Buyer.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "SMAJ PI HUB shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.",
            "This limitation applies to losses resulting from access to or use of, or inability to access or use, the Platform; any conduct or content of any third party on the Platform; or unauthorized access, use, or alteration of transmissions or content.",
          ],
        },
        {
          heading: "Changes to this Agreement",
          paragraphs: [
            "SMAJ PI HUB reserves the right to modify or update this Agreement at any time. Sellers will be notified of any significant changes, and continued use of the Platform after such modifications constitutes acceptance of the revised Agreement.",
            "It is the Seller's responsibility to regularly review this Agreement for updates.",
          ],
        },
        {
          heading: "Governing Law",
          paragraphs: [
            "This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction to be specified by SMAJ PI HUB.",
            "Any disputes arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in the jurisdiction to be specified by SMAJ PI HUB.",
          ],
        },
        {
          heading: "Contact Information",
          paragraphs: [
            `For any questions or concerns regarding this Agreement, Sellers may contact SMAJ PI HUB at ${legalEmail}.`,
          ],
        },
        {
          heading: "Seller Declaration",
          paragraphs: [
            "I confirm that I have carefully read, understood, and agree to comply with the SMAJ PI HUB Seller Agreement. I understand that my seller account and listings are subject to these rules and that failure to comply may result in suspension or permanent removal from the SMAJ PI HUB marketplace.",
          ],
        },
        {
          heading: "Acceptance",
          paragraphs: [
            "Seller Name:",
            "Seller ID:",
            "Date:",
            "Signature:",
            "I have read and agree to the SMAJ PI HUB Seller Agreement.",
          ],
        },
      ]}
    />
  </LegalShell>
);

export const ReportAbusePage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitted(false);
    setError("");
    try {
      await axiosClient.post("/support", {
        source: "report-abuse",
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        topic: String(form.get("type") || ""),
        message: String(form.get("details") || ""),
      });
      event.currentTarget.reset();
      setSubmitted(true);
    } catch {
      setError("Could not submit this report. Please email info@smajpihub.com.");
    }
  };

  return (
    <LegalShell
      kicker="REPORT ABUSE"
      title="Report suspicious activity, unsafe listings, or platform abuse."
      description="Use this page to report scams, impersonation, harmful content, fake sellers, unsafe service behavior, or policy violations."
    >
      <section className="home-section legal-company-section legal-report-grid">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-form-head">
            <span className="home-kicker">ABUSE REPORT</span>
            <h2>Submit a Report</h2>
            <p>Include enough detail for the SMAJ PI HUB team to review the issue.</p>
          </div>
          <label htmlFor="report-name">
            <span>Name</span>
            <input id="report-name" name="name" type="text" placeholder="Your full name" required />
          </label>
          <label htmlFor="report-email">
            <span>Email</span>
            <input id="report-email" name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label htmlFor="report-type">
            <span>Report Type</span>
            <select id="report-type" name="type" required defaultValue="">
              <option value="" disabled>Select report type</option>
              <option>Fake seller or provider</option>
              <option>Scam or suspicious payment request</option>
              <option>Impersonation</option>
              <option>Unsafe listing or content</option>
              <option>Other platform abuse</option>
            </select>
          </label>
          <label htmlFor="report-details">
            <span>Report Details</span>
            <textarea id="report-details" name="details" rows={6} placeholder="Describe what happened..." required />
          </label>
          <button type="submit">Submit Report</button>
          {submitted ? <p className="contact-form-success">Thank you. Your report has been recorded for review.</p> : null}
          {error ? <p className="contact-form-success error">{error}</p> : null}
        </form>
        <aside className="legal-report-card">
          <ReportProblemOutlinedIcon />
          <h2>What to Include</h2>
          <p>Share links, usernames, listing titles, screenshots description, payment context, and any timeline details.</p>
          <p>For urgent company contact, email <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.</p>
        </aside>
      </section>
      <LegalTextDocument
        title="SMAJ PI HUB Report Abuse Policy"
        sections={[
          {
            heading: "How to Report Abuse",
            items: [
              "Use a report button or link within the user interface when it appears on profiles, listings, messages, or content.",
              `Send a detailed report by email to ${legalEmail}.`,
              "Use the dedicated report-abuse page form to provide guided report details.",
            ],
          },
          {
            heading: "Information to Include",
            items: [
              "Your username and the username, seller name, listing title, order reference, or page link for the reported party or content.",
              "The specific service where the abuse occurred, such as Marketplace, Food Delivery, Chat, or another SMAJ PI HUB service.",
              "Date and time of the incident.",
              "Screenshots, links, messages, payment context, or other evidence supporting the report.",
              "A clear, accurate, and factual description of the abusive behavior or content.",
            ],
          },
          {
            heading: "What Happens After Submission",
            paragraphs: [
              "After a report is submitted, users may receive an automated confirmation of receipt. The moderation team reviews submitted reports, and while individual updates may not always be available, reports are taken seriously.",
              "Please provide accurate and factual information. Intentionally false or malicious reports can result in platform consequences.",
            ],
          },
          {
            heading: "Investigation Process",
            items: [
              "Review the submitted report and evidence.",
              "Gather additional relevant platform information such as activity logs, transaction records, and communications when appropriate.",
              "Assess the reported content or behavior against the Terms & Conditions, Privacy Policy, and platform guidelines.",
              "Contact the reporting party or reported party when more information is needed.",
              "Make a decision based on evidence and policy review.",
            ],
          },
          {
            heading: "Actions, Appeals, and False Reporting",
            paragraphs: [
              "Depending on severity, SMAJ PI HUB may issue a warning, remove content, temporarily suspend an account, permanently ban an account, or escalate illegal activity to relevant law enforcement authorities.",
              "Users may be able to appeal enforcement actions believed to be made in error. Details will be provided in the enforcement notice where applicable.",
              `For general inquiries or to report abuse, contact SMAJ PI HUB at ${legalEmail}.`,
            ],
          },
        ]}
      />
    </LegalShell>
  );
};
