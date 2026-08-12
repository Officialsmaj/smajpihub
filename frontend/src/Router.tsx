import { createBrowserRouter, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
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
import { CookiesPage, PrivacyPage, ReportAbusePage, SellerAgreementPage, TermsPage } from "./pages/LegalPages.tsx";
import { platformDefinitions } from "./content/platforms";
import { privatePages } from "./content/privatePages";
import ProtectedRoute from "./components/ProtectedRoute";
import LastPrivateRouteRedirect from "./components/LastPrivateRouteRedirect";
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
import AccountDashboardPage from "./pages/private/AccountDashboardPage";
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
import AdminLayout from "./layouts/AdminLayout";
import AdminHeroBannersPage from "./pages/admin/AdminHeroBannersPage";
import {
  AdminDashboardPage,
  AdminOnboardingPage,
  AdminOrdersPage,
  AdminProductsPage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminUsersPage,
} from "./pages/admin/AdminPages";
import StreamPage from "./pages/StreamPage";
import StreamWorkspacePage, { type StreamPageKind } from "./pages/stream/StreamWorkspacePage";
import SportsPage, { type SportsPageKind } from "./pages/sports/SportsPage";
import JobsPage, { type JobsPageKind } from "./pages/jobs/JobsPage";
import TransportPage from "./pages/transport/TransportPage";
import EducationPage from "./pages/EducationPage";
import CourseDetailPage from "./pages/education/CourseDetailPage";
import FoodDeliveryPage from "./pages/food-delivery/FoodDeliveryPage";
import RestaurantDetailPage from "./pages/food-delivery/RestaurantDetailPage";
import CartPage from "./pages/food-delivery/CartPage";
import FoodDealsOrdersPage from "./pages/food-delivery/FoodDealsOrdersPage";
import HealthPage from "./pages/health/HealthPage";
import ProviderDetailPage from "./pages/health/ProviderDetailPage";
import BookingPage from "./pages/health/BookingPage";
import HousingPage, { type HousingPageKind } from "./pages/housing/HousingPage";
import EventsPage, { type EventsPageKind } from "./pages/events/EventsPage";
import AgroPage, { type AgroPageKind } from "./pages/agro/AgroPage";
import EnergyPage, { type EnergyPageKind } from "./pages/energy/EnergyPage";
import CharityPage, { type CharityPageKind } from "./pages/charity/CharityPage";
import SwapPage, { type SwapPageKind } from "./pages/swap/SwapPage";
import HealthAppointmentsPage from "./pages/health/HealthAppointmentsPage";

const LegacyProductRedirect = () => {
  const { id } = useParams();
  return <Navigate to={id ? `/product/${id}` : "/store"} replace />;
};

const buildPrivatePageElement = (title: string, description: string, roles?: string[]) => {
  const page = <PrivatePage title={title} description={description} />;

  return (
    <ProtectedRoute>
      <PrivateLayout>
        {roles ? (
          <RoleRoute allowedRoles={roles} title={title}>
            {page}
          </RoleRoute>
        ) : (
          page
        )}
      </PrivateLayout>
    </ProtectedRoute>
  );
};

const streamRoutes: Array<[string, StreamPageKind]> = [
  ["live", "live-now"],
  ["live/now", "live-now"],
  ["categories", "categories"],
  ["search", "search"],
  ["my-list", "my-list"],
  ["downloads", "downloads"],
  ["history", "history"],
  ["subscriptions", "subscriptions"],
  ["creators", "creator-directory"],
  ["notifications", "notifications"],
  ["plans", "plans"],
  ["parental", "parental"],
  ["studio", "studio"],
  ["studio/upload", "upload"],
  ["studio/live", "create-live"],
  ["studio/content", "content"],
  ["studio/analytics", "analytics"],
  ["studio/channel", "channel"],
  ["studio/earnings", "earnings"],
];

const streamAdminRoutes: Array<[string, StreamPageKind]> = [
  ["", "admin"],
  ["moderation", "moderation"],
  ["reports", "reports"],
  ["creators", "creators"],
  ["catalog", "catalog-admin"],
  ["analytics", "admin-analytics"],
  ["settings", "stream-settings"],
];

const sportsRoutes: Array<[string, SportsPageKind]> = [
  ["live", "live"],
  ["matches", "matches"],
  ["competitions", "competitions"],
  ["teams", "teams"],
  ["news", "news"],
  ["community", "community"],
];

const jobsRoutes: Array<[string, JobsPageKind]> = [
  ["search", "search"],
  ["freelance", "freelance"],
  ["companies", "companies"],
  ["saved", "saved"],
  ["applications", "applications"],
  ["activity", "activity"],
  ["profile", "profile"],
  ["settings", "settings"],
  ["settings/visibility", "visibility"],
  ["settings/account", "account-settings"],
  ["settings/blocked-employers", "blocked-employers"],
  ["post", "post"],
  ["employer", "employer"],
];

const housingRoutes: Array<[string, HousingPageKind]> = [
  ["search", "search"],
  ["saved", "saved"],
  ["compare", "compare"],
  ["viewings", "viewings"],
  ["landlord", "landlord"],
  ["add", "add"],
];
const eventsRoutes: Array<[string, EventsPageKind]> = [
  ["search", "search"],
  ["saved", "saved"],
  ["tickets", "tickets"],
  ["organizer", "organizer"],
  ["create", "create"],
];
const agroRoutes: Array<[string, AgroPageKind]> = [
  ["search", "search"],
  ["saved", "saved"],
  ["quotes", "quotes"],
  ["orders", "orders"],
  ["farmer", "farmer"],
  ["add", "add"],
  ["requests", "requests"],
];
const energyRoutes: Array<[string, EnergyPageKind]> = [
  ["search", "search"],
  ["saved", "saved"],
  ["quotes", "quotes"],
  ["bookings", "bookings"],
  ["orders", "orders"],
  ["dashboard", "dashboard"],
  ["utilities", "utilities"],
  ["providers", "providers"],
];
const charityRoutes: Array<[string, CharityPageKind]> = [
  ["discover", "discover"],
  ["saved", "saved"],
  ["donations", "donations"],
  ["fundraise", "fundraise"],
  ["dashboard", "dashboard"],
];
const swapRoutes: Array<[string, SwapPageKind]> = [
  ["tokens", "tokens"],
  ["history", "history"],
  ["pools", "pools"],
  ["liquidity", "liquidity"],
  ["confirm", "confirm"],
];

export const router = createBrowserRouter([
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
  ...platformDefinitions.map(platform => ({
    path: `/services/${platform.routeSegment}`,
    element:
      platform.routeSegment === "transport" ? (
        <TransportPage />
      ) : platform.routeSegment === "stream" ? (
        <Navigate to="/app/services/stream" replace />
      ) : platform.routeSegment === "sports" ? (
        <SportsPage />
      ) : platform.routeSegment === "jobs" ? (
        <JobsPage />
      ) : platform.routeSegment === "education" ? (
        <EducationPage />
      ) : platform.routeSegment === "food-delivery" ? (
        <FoodDeliveryPage />
      ) : platform.routeSegment === "health" ? (
        <HealthPage />
      ) : platform.routeSegment === "housing" ? (
        <HousingPage />
      ) : platform.routeSegment === "events" ? (
        <EventsPage />
      ) : platform.routeSegment === "agro" ? (
        <AgroPage />
      ) : platform.routeSegment === "energy" ? (
        <EnergyPage />
      ) : platform.routeSegment === "charity" ? (
        <CharityPage />
      ) : platform.routeSegment === "swap" ? (
        <SwapPage />
      ) : platform.routeSegment === "store" ? (
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
    element: <Navigate to="/services/store" replace />,
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
    element: <Navigate to="/app/services/stream" replace />,
  },
  {
    path: "/smaj-pi-sports",
    element: <Navigate to="/services/sports" replace />,
  },
  ...sportsRoutes.map(([path, kind]) => ({
    path: `/services/sports/${path}`,
    element: <SportsPage kind={kind} />,
  })),
  ...jobsRoutes.map(([path, kind]) => ({
    path: `/services/jobs/${path}`,
    element: <JobsPage kind={kind} />,
  })),
  ...housingRoutes.map(([path, kind]) => ({
    path: `/services/housing/${path}`,
    element: <HousingPage kind={kind} />,
  })),
  {
    path: "/services/housing/property/:id",
    element: <HousingPage kind="property" />,
  },
  {
    path: "/services/housing/agent/:id",
    element: <HousingPage kind="agent" />,
  },
  ...eventsRoutes.map(([path, kind]) => ({
    path: `/services/events/${path}`,
    element: <EventsPage kind={kind} />,
  })),
  { path: "/services/events/event/:id", element: <EventsPage kind="detail" /> },
  { path: "/services/events/checkout/:id", element: <EventsPage kind="checkout" /> },
  { path: "/services/events/ticket/:id", element: <EventsPage kind="ticket" /> },
  { path: "/services/events/organizer/:id", element: <EventsPage kind="organizer" /> },
  { path: "/services/events/venue/:id", element: <EventsPage kind="venue" /> },
  ...agroRoutes.map(([path, kind]) => ({
    path: `/services/agro/${path}`,
    element: <AgroPage kind={kind} />,
  })),
  { path: "/services/agro/product/:id", element: <AgroPage kind="product" /> },
  { path: "/services/agro/supplier/:id", element: <AgroPage kind="supplier" /> },
  ...energyRoutes.map(([path, kind]) => ({
    path: `/services/energy/${path}`,
    element: <EnergyPage kind={kind} />,
  })),
  { path: "/services/energy/product/:id", element: <EnergyPage kind="product" /> },
  { path: "/services/energy/provider/:id", element: <EnergyPage kind="provider" /> },
  ...charityRoutes.map(([path, kind]) => ({
    path: `/services/charity/${path}`,
    element: <CharityPage kind={kind} />,
  })),
  { path: "/services/charity/campaign/:id", element: <CharityPage kind="campaign" /> },
  { path: "/services/charity/checkout/:id", element: <CharityPage kind="checkout" /> },
  { path: "/services/charity/receipt/:id", element: <CharityPage kind="receipt" /> },
  { path: "/services/charity/organization/:id", element: <CharityPage kind="organization" /> },
  ...swapRoutes.map(([path, kind]) => ({
    path: `/services/swap/${path}`,
    element: <SwapPage kind={kind} />,
  })),
  { path: "/services/swap/receipt/:id", element: <SwapPage kind="receipt" /> },
  {
    path: "/services/jobs/job/:id",
    element: <JobsPage kind="job" />,
  },
  {
    path: "/services/jobs/company/:id",
    element: <JobsPage kind="company" />,
  },
  {
    path: "/services/sports/match/:id",
    element: <SportsPage kind="match" />,
  },
  {
    path: "/services/sports/team/:id",
    element: <SportsPage kind="team" />,
  },
  {
    path: "/services/sports/news/:id",
    element: <SportsPage kind="article" />,
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
    path: "/news",
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
    path: "/seller-agreement",
    element: <SellerAgreementPage />,
  },
  {
    path: "/engagement-tasks",
    element: <EngagementTasksPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <LastPrivateRouteRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <DashboardPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ProfilePage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet",
    element: <Navigate to="/app/wallet" replace />,
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <OrdersPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:id/track",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <OrderTrackingPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <MessagesPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <NotificationsPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  { path: "/account", element: <Navigate to="/settings" replace /> },
  { path: "/account/manage", element: <Navigate to="/settings" replace /> },
  {
    path: "/saved",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <SavedProductsPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <CommerceFlowPage mode="cart" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <CommerceFlowPage mode="checkout" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-method",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <CommerceFlowPage mode="payment-method" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  { path: "/my-products", element: <Navigate to="/seller" replace /> },
  {
    path: "/app/services",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ServicesHubPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamPage embedded />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/services/transport/*",
    element: <TransportPage />,
  },
  {
    path: "/app/services/transport/*",
    element: (
      <ProtectedRoute>
        <TransportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/jobs",
    element: (
      <ProtectedRoute>
        <JobsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/jobs/*",
    element: <Navigate to="/services/jobs" replace />,
  },
  {
    path: "/app/services/education",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <EducationPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/services/education/courses",
    element: <EducationPage />,
  },
  {
    path: "/services/education/partners",
    element: <EducationPage />,
  },
  {
    path: "/services/education/courses/:courseId",
    element: <CourseDetailPage />,
  },
  {
    path: "/app/services/education/courses/:courseId",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <CourseDetailPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/services/food-delivery/deals",
    element: <FoodDealsOrdersPage kind="deals" />,
  },
  {
    path: "/services/food-delivery/orders",
    element: <FoodDealsOrdersPage kind="orders" />,
  },
  {
    path: "/services/food-delivery/restaurants/:id",
    element: <RestaurantDetailPage />,
  },
  {
    path: "/services/food-delivery/cart",
    element: <CartPage />,
  },
  {
    path: "/app/services/food-delivery",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <FoodDeliveryPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/food-delivery/cart",
    element: <Navigate to="/services/food-delivery/cart" replace />,
  },
  {
    path: "/app/services/food-delivery/deals",
    element: <Navigate to="/services/food-delivery/deals" replace />,
  },
  {
    path: "/app/services/food-delivery/orders",
    element: <Navigate to="/services/food-delivery/orders" replace />,
  },
  {
    path: "/app/services/food-delivery/restaurants/:id",
    element: <RestaurantDetailPage />,
  },
  {
    path: "/app/services/food-delivery/*",
    element: <Navigate to="/services/food-delivery" replace />,
  },
  {
    path: "/services/health/providers",
    element: <HealthPage />,
  },
  {
    path: "/services/health/appointments",
    element: <HealthAppointmentsPage />,
  },
  {
    path: "/services/health/providers/:id",
    element: <ProviderDetailPage />,
  },
  {
    path: "/services/health/book/:providerId/:serviceId",
    element: <BookingPage />,
  },
  {
    path: "/app/services/health",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <HealthPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/health/appointments",
    element: <Navigate to="/services/health/appointments" replace />,
  },
  {
    path: "/app/services/health/providers/:id",
    element: <ProviderDetailPage />,
  },
  {
    path: "/app/services/health/book/:providerId/:serviceId",
    element: <BookingPage />,
  },
  {
    path: "/app/services/health/*",
    element: <Navigate to="/services/health" replace />,
  },
  {
    path: "/app/services/stream/movies",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamPage embedded categorySlug="movies" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream/series",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamPage embedded categorySlug="series" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream/category/:slug",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind="category" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  ...streamRoutes.map(([path, kind]) => ({
    path: `/app/services/stream/${path}`,
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind={kind} />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  })),
  {
    path: "/app/services/stream/title/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind="movie-detail" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream/series/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind="series-detail" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream/watch/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind="player" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream/live/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind="live-player" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/services/stream/channel/:handle",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StreamWorkspacePage kind="public-channel" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  { path: "/app/services/sports", element: <Navigate to="/services/sports" replace /> },
  {
    path: "/app/services/:slug",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ServiceDetailPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/trending",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ServiceDiscoveryPage mode="trending" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/lifestyle",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ServiceDiscoveryPage mode="lifestyle" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/categories",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ServiceDiscoveryPage mode="categories" />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/help-center",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <HelpCenterPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/help",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <HelpCenterPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <AccountDashboardPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/preferences",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <SettingsPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/store",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <StorePage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-product",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <AddProductPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/product/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <ProductDetailPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <SellerPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <SellerProfilePage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-product/:id",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <EditProductPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/app/wallet",
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <WalletPage />
        </PrivateLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/heroes",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminHeroBannersPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminUsersPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/onboarding",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminOnboardingPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminProductsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminOrdersPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminReportsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AdminSettingsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  ...streamAdminRoutes.map(([path, kind]) => ({
    path: `/admin/stream${path ? `/${path}` : ""}`,
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <StreamWorkspacePage kind={kind} />
        </AdminLayout>
      </ProtectedRoute>
    ),
  })),
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
  { path: "/app/store/:id", element: <LegacyProductRedirect /> },
  { path: "/app/add-product", element: <Navigate to="/add-product" replace /> },
  { path: "/app/orders", element: <Navigate to="/orders" replace /> },
  { path: "/app/profile", element: <Navigate to="/profile" replace /> },
  { path: "/app/settings", element: <Navigate to="/settings" replace /> },
  ...privatePages
    .filter(page => !["dashboard", "add-product", "orders", "profile", "settings", "wallet"].includes(page.path))
    .map(page => ({
      path: `/app/${page.path}`,
      element: buildPrivatePageElement(page.title, page.description, page.roles),
    })),
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
