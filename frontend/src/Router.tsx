import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EngagementTasksPage from "./pages/EngagementTasksPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import GenericPage from "./pages/GenericPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ServicesPage from "./pages/ServicesPage.tsx";
import HowItWorksPage from "./pages/HowItWorksPage.tsx";
import FaqPage from "./pages/FaqPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import WhitePaperPage from "./pages/WhitePaperPage.tsx";
import TrustPage from "./pages/TrustPage.tsx";
import CompanyPage from "./pages/CompanyPage.tsx";
import CommunityPage from "./pages/CommunityPage.tsx";
import DevelopersPage from "./pages/DevelopersPage.tsx";
import PartnersPage from "./pages/PartnersPage.tsx";
import AffiliatePage from "./pages/AffiliatePage.tsx";
import CollaboratePage from "./pages/CollaboratePage.tsx";
import PublicStorePage from "./pages/PublicStorePage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import BlogPostPage from "./pages/BlogPostPage.tsx";
import { CookiesPage, PrivacyPage, ReportAbusePage, TermsPage } from "./pages/LegalPages.tsx";
import { platformDefinitions } from "./content/platforms";
import { privatePages } from "./content/privatePages";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layouts/PrivateLayout";
import PrivatePage from "./pages/private/PrivatePage";
import RoleRoute from "./components/RoleRoute";
import SearchPage from "./pages/private/SearchPage";
import DashboardPage from "./pages/private/DashboardPage";
import StorePage from "./pages/private/StorePage";
import ProductDetailPage from "./pages/private/ProductDetailPage";
import AddProductPage from "./pages/private/AddProductPage";
import OrdersPage from "./pages/private/OrdersPage";
import ProfilePage from "./pages/private/ProfilePage";
import SettingsPage from "./pages/private/SettingsPage";
import SellerPage from "./pages/private/SellerPage";
import EditProductPage from "./pages/private/EditProductPage";
import SellerProfilePage from "./pages/private/SellerProfilePage";
import SavedProductsPage from "./pages/private/SavedProductsPage";
import MessagesPage from "./pages/private/MessagesPage";
import NotificationsPage from "./pages/private/NotificationsPage";
import ServicesHubPage from "./pages/private/ServicesHubPage";
import WalletPage from "./pages/private/WalletPage";
import HelpCenterPage from "./pages/private/HelpCenterPage";
import ServiceDetailPage from "./pages/private/ServiceDetailPage";
import ServiceDiscoveryPage from "./pages/private/ServiceDiscoveryPage";
import CommerceFlowPage from "./pages/private/CommerceFlowPage";
import OrderTrackingPage from "./pages/private/OrderTrackingPage";
import AccountDashboardPage from "./pages/private/AccountDashboardPage";
import ManageAccountPage from "./pages/private/ManageAccountPage";
import AdminLayout from "./layouts/AdminLayout";
import { AdminDashboardPage, AdminOnboardingPage, AdminOrdersPage, AdminProductsPage, AdminReportsPage, AdminSettingsPage, AdminUsersPage } from "./pages/admin/AdminPages";

const buildPrivatePageElement = (title: string, description: string, roles?: string[]) => {
  const page = <PrivatePage title={title} description={description} />;

  return (
    <ProtectedRoute>
      <PrivateLayout>{roles ? <RoleRoute allowedRoles={roles} title={title}>{page}</RoleRoute> : page}</PrivateLayout>
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/home" replace />,
    },
    {
      path: "/home",
      element: <HomePage />,
    },
    {
      path: "/about",
      element: <AboutPage />,
    },
    {
      path: "/services",
      element: <ServicesPage />,
    },
    {
      path: "/white-paper",
      element: <WhitePaperPage />,
    },
    {
      path: "/how-it-works",
      element: <HowItWorksPage />,
    },
    {
      path: "/faq",
      element: <FaqPage />,
    },
    {
      path: "/contact",
      element: <ContactPage />,
    },
    {
      path: "/onboarding",
      element: <OnboardingPage />,
    },
    {
      path: "/trust",
      element: <TrustPage />,
    },
    {
      path: "/company",
      element: <CompanyPage />,
    },
    ...platformDefinitions.map((platform) => ({
      path: `/services/${platform.routeSegment}`,
      element: platform.routeSegment === "store" ? (
        <PublicStorePage />
      ) : (
        <GenericPage
          title={platform.name}
          description={`${platform.description} Access with one Pi wallet login through SMAJ PI HUB.`}
          routeSegment={platform.routeSegment}
          status={platform.status}
        />
      ),
    })),
    {
      path: "/smaj-store",
      element: <Navigate to="/store" replace />,
    },
    {
      path: "/smaj-food-delivery",
      element: <Navigate to="/services/food-delivery" replace />,
    },
    {
      path: "/services/food",
      element: <Navigate to="/services/food-delivery" replace />,
    },
    {
      path: "/smaj-pi-jobs",
      element: <Navigate to="/services/jobs" replace />,
    },
    {
      path: "/smaj-pi-health",
      element: <Navigate to="/services/health" replace />,
    },
    {
      path: "/smaj-pi-edu",
      element: <Navigate to="/services/education" replace />,
    },
    {
      path: "/smaj-pi-transport",
      element: <Navigate to="/services/transport" replace />,
    },
    {
      path: "/smaj-pi-agro",
      element: <Navigate to="/services/agro" replace />,
    },
    {
      path: "/smaj-pi-energy",
      element: <Navigate to="/services/energy" replace />,
    },
    {
      path: "/smaj-pi-charity",
      element: <Navigate to="/services/charity" replace />,
    },
    {
      path: "/smaj-pi-housing",
      element: <Navigate to="/services/housing" replace />,
    },
    {
      path: "/smaj-pi-events",
      element: <Navigate to="/services/events" replace />,
    },
    {
      path: "/smaj-pi-swap",
      element: <Navigate to="/services/swap" replace />,
    },
    {
      path: "/smaj-pi-stream",
      element: <Navigate to="/services/stream" replace />,
    },
    {
      path: "/smaj-pi-sports",
      element: <Navigate to="/services/sports" replace />,
    },
    {
      path: "/smaj-token",
      element: <Navigate to="/services/token" replace />,
    },
    {
      path: "/affiliate",
      element: <AffiliatePage />,
    },
    {
      path: "/collaborate",
      element: <CollaboratePage />,
    },
    {
      path: "/partners",
      element: <PartnersPage />,
    },
    {
      path: "/community",
      element: <CommunityPage />,
    },
    {
      path: "/developers",
      element: <DevelopersPage />,
    },
    {
      path: "/blog",
      element: <BlogPage />,
    },
    {
      path: "/blog/:slug",
      element: <BlogPostPage />,
    },
    {
      path: "/privacy",
      element: <PrivacyPage />,
    },
    {
      path: "/terms",
      element: <TermsPage />,
    },
    {
      path: "/cookies",
      element: <CookiesPage />,
    },
    {
      path: "/report-abuse",
      element: <ReportAbusePage />,
    },
    {
      path: "/engagement-tasks",
      element: <EngagementTasksPage />,
    },
    {
      path: "/app",
      element: <Navigate to="/app/dashboard" replace />,
    },
    {
      path: "/dashboard",
      element: <ProtectedRoute><PrivateLayout><DashboardPage /></PrivateLayout></ProtectedRoute>,
    },
    {
      path: "/profile",
      element: <ProtectedRoute><PrivateLayout><ProfilePage /></PrivateLayout></ProtectedRoute>,
    },
    {
      path: "/wallet",
      element: <Navigate to="/app/wallet" replace />,
    },
    {
      path: "/orders",
      element: <ProtectedRoute><PrivateLayout><OrdersPage /></PrivateLayout></ProtectedRoute>,
    },
    {
      path: "/orders/:id/track",
      element: <ProtectedRoute><PrivateLayout><OrderTrackingPage /></PrivateLayout></ProtectedRoute>,
    },
    {
      path: "/messages",
      element: <ProtectedRoute><PrivateLayout><MessagesPage /></PrivateLayout></ProtectedRoute>,
    },
    { path: "/notifications", element: <ProtectedRoute><PrivateLayout><NotificationsPage /></PrivateLayout></ProtectedRoute> },
    { path: "/account", element: <ProtectedRoute><PrivateLayout><AccountDashboardPage /></PrivateLayout></ProtectedRoute> },
    { path: "/account/manage", element: <ProtectedRoute><PrivateLayout><ManageAccountPage /></PrivateLayout></ProtectedRoute> },
    { path: "/saved", element: <ProtectedRoute><PrivateLayout><SavedProductsPage /></PrivateLayout></ProtectedRoute> },
    { path: "/cart", element: <ProtectedRoute><PrivateLayout><CommerceFlowPage mode="cart" /></PrivateLayout></ProtectedRoute> },
    { path: "/checkout", element: <ProtectedRoute><PrivateLayout><CommerceFlowPage mode="checkout" /></PrivateLayout></ProtectedRoute> },
    { path: "/payment-method", element: <ProtectedRoute><PrivateLayout><CommerceFlowPage mode="payment-method" /></PrivateLayout></ProtectedRoute> },
    { path: "/my-products", element: <Navigate to="/seller" replace /> },
    { path: "/app/services", element: <ProtectedRoute><PrivateLayout><ServicesHubPage /></PrivateLayout></ProtectedRoute> },
    { path: "/app/services/:slug", element: <ProtectedRoute><PrivateLayout><ServiceDetailPage /></PrivateLayout></ProtectedRoute> },
    { path: "/trending", element: <ProtectedRoute><PrivateLayout><ServiceDiscoveryPage mode="trending" /></PrivateLayout></ProtectedRoute> },
    { path: "/lifestyle", element: <ProtectedRoute><PrivateLayout><ServiceDiscoveryPage mode="lifestyle" /></PrivateLayout></ProtectedRoute> },
    { path: "/categories", element: <ProtectedRoute><PrivateLayout><ServiceDiscoveryPage mode="categories" /></PrivateLayout></ProtectedRoute> },
    { path: "/app/help-center", element: <ProtectedRoute><PrivateLayout><HelpCenterPage /></PrivateLayout></ProtectedRoute> },
    { path: "/help", element: <ProtectedRoute><PrivateLayout><HelpCenterPage /></PrivateLayout></ProtectedRoute> },
    {
      path: "/settings",
      element: <ProtectedRoute><PrivateLayout><SettingsPage /></PrivateLayout></ProtectedRoute>,
    },
    { path: "/store", element: <ProtectedRoute><PrivateLayout><StorePage /></PrivateLayout></ProtectedRoute> },
    { path: "/add-product", element: <ProtectedRoute><PrivateLayout><AddProductPage /></PrivateLayout></ProtectedRoute> },
    { path: "/product/:id", element: <ProtectedRoute><PrivateLayout><ProductDetailPage /></PrivateLayout></ProtectedRoute> },
    { path: "/seller", element: <ProtectedRoute><PrivateLayout><SellerPage /></PrivateLayout></ProtectedRoute> },
    { path: "/seller/:id", element: <ProtectedRoute><PrivateLayout><SellerProfilePage /></PrivateLayout></ProtectedRoute> },
    { path: "/edit-product/:id", element: <ProtectedRoute><PrivateLayout><EditProductPage /></PrivateLayout></ProtectedRoute> },
    { path: "/app/wallet", element: <ProtectedRoute><PrivateLayout><WalletPage /></PrivateLayout></ProtectedRoute> },
    { path: "/admin", element: <ProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute> },
    { path: "/admin/users", element: <ProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute> },
    { path: "/admin/onboarding", element: <ProtectedRoute><AdminLayout><AdminOnboardingPage /></AdminLayout></ProtectedRoute> },
    { path: "/admin/products", element: <ProtectedRoute><AdminLayout><AdminProductsPage /></AdminLayout></ProtectedRoute> },
    { path: "/admin/orders", element: <ProtectedRoute><AdminLayout><AdminOrdersPage /></AdminLayout></ProtectedRoute> },
    { path: "/admin/reports", element: <ProtectedRoute><AdminLayout><AdminReportsPage /></AdminLayout></ProtectedRoute> },
    { path: "/admin/settings", element: <ProtectedRoute><AdminLayout><AdminSettingsPage /></AdminLayout></ProtectedRoute> },
    {
      path: "/search",
      element: (
        <ProtectedRoute>
          <PrivateLayout>
            <SearchPage />
          </PrivateLayout>
        </ProtectedRoute>
      ),
    },
    { path: "/app/dashboard", element: <Navigate to="/dashboard" replace /> },
    { path: "/app/store", element: <Navigate to="/store" replace /> },
    { path: "/app/store/:id", element: <Navigate to="/store" replace /> },
    { path: "/app/add-product", element: <Navigate to="/add-product" replace /> },
    { path: "/app/orders", element: <Navigate to="/orders" replace /> },
    { path: "/app/profile", element: <Navigate to="/profile" replace /> },
    { path: "/app/settings", element: <Navigate to="/settings" replace /> },
    ...privatePages.filter((page) => !["dashboard", "add-product", "orders", "profile", "settings", "wallet"].includes(page.path)).map((page) => ({
      path: `/app/${page.path}`,
      element: buildPrivatePageElement(page.title, page.description, page.roles),
    })),
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]
);

export default router;

