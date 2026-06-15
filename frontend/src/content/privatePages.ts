export type PrivatePageDefinition = {
  path: string;
  title: string;
  description: string;
  section: "core" | "workspace";
  roles?: string[];
};

export const privatePages: PrivatePageDefinition[] = [
  { path: "dashboard", title: "Dashboard", description: "Your SMAJ PI HUB command center.", section: "core" },
  { path: "profile", title: "My Profile", description: "Manage your public and account identity details.", section: "core" },
  { path: "wallet", title: "Wallet", description: "Track Pi wallet balances, activity, and transfers.", section: "core" },
  { path: "orders", title: "Orders", description: "View purchase history and active marketplace orders.", section: "core" },
  { path: "messages", title: "Messages", description: "Chat with buyers, sellers, and providers.", section: "core" },
  {
    path: "notifications",
    title: "Notifications",
    description: "Stay updated on platform alerts and transaction events.",
    section: "core",
  },
  {
    path: "saved-services",
    title: "Saved Services",
    description: "Keep a shortlist of your preferred services and providers.",
    section: "core",
  },
  {
    path: "applications",
    title: "My Applications",
    description: "Track job, grant, and program applications in one place.",
    section: "core",
  },
  { path: "bookings", title: "My Bookings", description: "Manage appointments, sessions, and reservations.", section: "core" },
  { path: "payments", title: "My Payments", description: "Review payment history and pending confirmations.", section: "core" },
  { path: "reviews", title: "My Reviews", description: "Manage ratings and feedback across ecosystem services.", section: "core" },
  {
    path: "settings",
    title: "Settings",
    description: "Control account preferences, privacy, and communication.",
    section: "core",
  },
  {
    path: "verification-center",
    title: "Verification Center",
    description: "Submit and monitor identity and business verification status.",
    section: "core",
  },
  {
    path: "support-tickets",
    title: "Support Tickets",
    description: "Open and track support issues with the SMAJ operations team.",
    section: "core",
  },
  {
    path: "vendor-dashboard",
    title: "Vendor Dashboard",
    description: "Seller workspace for catalog, orders, and revenue operations.",
    section: "workspace",
    roles: ["vendor", "seller", "provider"],
  },
  {
    path: "freelancer-dashboard",
    title: "Freelancer Dashboard",
    description: "Manage projects, bids, and delivery milestones.",
    section: "workspace",
    roles: ["freelancer"],
  },
  {
    path: "provider-dashboard",
    title: "Provider Dashboard",
    description: "Service-provider operations for bookings, clients, and delivery.",
    section: "workspace",
    roles: ["provider", "vendor"],
  },
  {
    path: "add-product",
    title: "Add Product",
    description: "Create new product listings with pricing, stock, and images.",
    section: "workspace",
    roles: ["vendor", "seller"],
  },
  {
    path: "manage-products",
    title: "Manage Products",
    description: "Update catalog entries, inventory, and visibility.",
    section: "workspace",
    roles: ["vendor", "seller"],
  },
  {
    path: "manage-orders",
    title: "Manage Orders",
    description: "Handle fulfillment, delivery status, and customer communication.",
    section: "workspace",
    roles: ["vendor", "seller", "provider"],
  },
  {
    path: "revenue",
    title: "Revenue",
    description: "Monitor earnings, payouts, and business growth metrics.",
    section: "workspace",
    roles: ["vendor", "seller", "provider", "freelancer"],
  },
  {
    path: "business-verification",
    title: "Business Verification",
    description: "Complete verification for seller and provider trust badges.",
    section: "workspace",
    roles: ["vendor", "seller", "provider"],
  },
];

export const privateHeaderLinks = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/services", label: "Services" },
  { to: "/app/wallet", label: "Wallet" },
  { to: "/app/messages", label: "Messages" },
  { to: "/app/notifications", label: "Notifications" },
  { to: "/app/profile", label: "Profile" },
];
