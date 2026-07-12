import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type TouchEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useAuthContext } from "../contexts/AuthContext";
import { axiosClient } from "../lib/axiosClient";
import ConfirmSignOutModal from "../components/ConfirmSignOutModal";
import PrivateSkeleton from "../components/PrivateSkeleton";
import WelcomeTour from "../components/WelcomeTour";
import logoImage from "/logo.png";
import { serviceCatalog } from "../content/serviceCatalog";
import useRouteScrollTop from "../hooks/useRouteScrollTop";

type PrivateLayoutProps = { children: ReactNode };
const SIDEBAR_STORAGE_KEY = "smaj_private_sidebar_collapsed";
const LAST_PRIVATE_ROUTE_KEY = "smaj_last_private_route";
const PROFILE_VERIFY_REMINDER_KEY = "smaj_profile_verify_reminder_completed";
const PROFILE_VERIFY_REMINDER_INTERVAL_MS = 60 * 1000;
const PROFILE_VERIFY_REMINDER_VISIBLE_MS = 10 * 1000;
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/store": "Store",
  "/add-product": "Add Product",
  "/orders": "Orders",
  "/seller": "Seller Dashboard",
  "/profile": "Profile",
  "/settings": "Settings",
  "/search": "Search",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/saved": "Saved Products",
  "/app/services": "Services",
  "/trending": "Trending",
  "/lifestyle": "Lifestyle",
  "/categories": "Categories",
  "/app/help-center": "Help Center",
  "/app/wallet": "SMAJ PI Activity",
};

const links = [
  { to: "/dashboard", label: "Home", icon: <DashboardOutlinedIcon /> },
  { to: "/app/services", label: "Services", icon: <AppsOutlinedIcon /> },
  { to: "/store", label: "Marketplace", icon: <StorefrontOutlinedIcon /> },
  { to: "/messages", label: "Messages", icon: <ChatOutlinedIcon /> },
];

const mainTabs = [
  { to: "/dashboard", label: "Home", icon: <DashboardOutlinedIcon /> },
  { to: "/app/services", label: "Services", icon: <AppsOutlinedIcon /> },
  { to: "/search", label: "Search", icon: <SearchOutlinedIcon /> },
  { to: "/messages", label: "Messages", icon: <ChatOutlinedIcon /> },
  { to: "/settings", label: "You", icon: <PersonOutlineIcon /> },
];

const SWIPE_MIN_DISTANCE = 86;
const SWIPE_MAX_VERTICAL_DRIFT = 54;
const swipeBlockedSelector = [
  "input",
  "textarea",
  "select",
  "option",
  "button",
  "a",
  "audio",
  "video",
  "[contenteditable='true']",
  "[role='slider']",
  "[data-no-swipe]",
  ".mobile-search-box",
  ".private-search-results",
  ".chat-messages",
  ".carousel",
  ".product-carousel",
  ".storefront-media",
  ".storefront-product-image-wrap",
  ".map",
  "iframe",
].join(",");

const getMainTabIndex = (pathname: string) => mainTabs.findIndex((tab) => tab.to === pathname);

const shouldIgnoreSwipeTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(swipeBlockedSelector));

const backFallbackForPath = (pathname: string) => {
  if (pathname.startsWith("/product/")) return "/store";
  if (pathname.startsWith("/edit-product/")) return "/seller";
  if (pathname.startsWith("/orders/") && pathname.endsWith("/track")) return "/orders";
  if (pathname.startsWith("/seller/")) return "/store";
  if (pathname === "/add-product") return "/seller";
  if (pathname === "/cart" || pathname === "/checkout" || pathname === "/payment-method") return "/store";
  if (pathname === "/profile" || pathname === "/app/wallet" || pathname === "/settings/preferences") return "/settings";
  if (pathname === "/saved" || pathname === "/orders") return "/settings";
  if (pathname === "/notifications" || pathname === "/app/help-center" || pathname === "/help") return "/dashboard";
  if (pathname === "/trending" || pathname === "/lifestyle" || pathname === "/categories") return "/dashboard";
  return "";
};

const routeHasOwnLoader = (pathname: string) => {
  const path = pathname.split("?")[0].split("#")[0];
  return path === "/dashboard" ||
    path === "/store" ||
    path === "/saved" ||
    path === "/orders" ||
    path === "/messages" ||
    path === "/notifications" ||
    path === "/seller" ||
    path === "/search" ||
    path === "/app/wallet" ||
    path.startsWith("/product/") ||
    path.startsWith("/seller/");
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  useRouteScrollTop();
  const { signOut, isLoading, user, updateSettings } = useAuthContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => window.localStorage.getItem("smaj_private_theme_mode") === "dark" ? "dark" : "light");
  const [showSignOut, setShowSignOut] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => Math.max(0, getMainTabIndex(window.location.pathname)));
  const [tabTransition, setTabTransition] = useState<"left" | "right" | "none">("none");
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const profileAvatarRef = useRef<HTMLButtonElement | null>(null);
  const routeLoadingTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; tabIndex: number } | null>(null);
  const previousTabRef = useRef(getMainTabIndex(window.location.pathname));
  const [profileMenuPosition, setProfileMenuPosition] = useState<{ top: number; left: number }>({ top: 64, left: 16 });
  const notificationBadgeLabel = unreadCount > 99 ? "99+" : unreadCount;
  const navigate = useNavigate();
  const location = useLocation();
  const isStoreShell = location.pathname === "/store";
  const currentTabIndex = getMainTabIndex(location.pathname);
  const isMainTabRoute = currentTabIndex >= 0;
  const tabPageKey = isMainTabRoute ? mainTabs[currentTabIndex].to : location.key;
  const backFallback = backFallbackForPath(location.pathname);
  const profileReminderStorageKey = user?.uid ? `${PROFILE_VERIFY_REMINDER_KEY}:${user.uid}` : PROFILE_VERIFY_REMINDER_KEY;
  const profileReadyForVerification = Boolean(user?.displayName?.trim() && (user?.piUsername || user?.username) && user?.country?.trim() && user?.contactPhone?.trim() && user?.avatar && user?.bio?.trim());
  const hasPublicVerification = user?.verificationStatus === "approved" && user?.verificationLevel !== "basic";
  const needsProfileVerificationReminder = Boolean(user?.uid && !hasPublicVerification && !profileReadyForVerification);
  const routeSkeleton = useMemo(() => {
    if (location.pathname === "/dashboard") return { variant: "home" as const, count: 6 };
    if (location.pathname === "/profile") return { variant: "profile" as const, count: 6 };
    if (location.pathname === "/settings" || location.pathname.startsWith("/settings/")) return { variant: "page" as const, count: 4 };
    if (location.pathname === "/store" || location.pathname === "/saved") return { variant: "grid" as const, count: 6 };
    if (location.pathname === "/search") return { variant: "search" as const, count: 5 };
    if (location.pathname === "/app/wallet") return { variant: "wallet" as const, count: 4 };
    if (location.pathname.startsWith("/product/")) return { variant: "product" as const, count: 1 };
    if (location.pathname.startsWith("/seller/")) return { variant: "seller" as const, count: 1 };
    if (location.pathname === "/seller") return { variant: "sellerDashboard" as const, count: 4 };
    if (location.pathname === "/orders") return { variant: "orders" as const, count: 4 };
    if (location.pathname === "/messages") return { variant: "messages" as const, count: 6 };
    if (location.pathname === "/notifications") return { variant: "notifications" as const, count: 5 };
    return { variant: "page" as const, count: 4 };
  }, [location.pathname]);
  const pageTitle = location.pathname.startsWith("/product/") ? "Product Details"
    : location.pathname.startsWith("/app/services/") ? "Service"
    : location.pathname.startsWith("/edit-product/") ? "Edit Product"
      : pageTitles[location.pathname] || "SMAJ PI HUB";

  useEffect(() => {
    const route = `${location.pathname}${location.search}${location.hash}`;
    try {
      window.sessionStorage.setItem(LAST_PRIVATE_ROUTE_KEY, route);
      window.localStorage.setItem(LAST_PRIVATE_ROUTE_KEY, route);
    } catch {
      // Ignore storage failures in constrained browsers.
    }
    if (location.pathname === "/dashboard") return;
    try {
      const current = JSON.parse(window.localStorage.getItem("smaj_recent_pages") || "[]");
      const items = Array.isArray(current) ? current : [];
      const next = [{ label: pageTitle, to: `${location.pathname}${location.search}`, meta: "Recent page" }, ...items.filter((item) => item?.to !== `${location.pathname}${location.search}`)].slice(0, 8);
      window.localStorage.setItem("smaj_recent_pages", JSON.stringify(next));
    } catch {
      window.localStorage.removeItem("smaj_recent_pages");
    }
  }, [location.hash, location.pathname, location.search, pageTitle]);

  useEffect(() => {
    document.documentElement.dataset.privateTheme = themeMode;
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("smaj_private_theme_mode", themeMode);
    window.localStorage.setItem("smaj_public_theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const theme = (event as CustomEvent<"light" | "dark">).detail;
      if (theme === "light" || theme === "dark") setThemeMode(theme);
    };
    window.addEventListener("smaj:theme-change", onThemeChange);
    return () => window.removeEventListener("smaj:theme-change", onThemeChange);
  }, []);

  const loadUnreadCount = useCallback(() => {
    axiosClient.get("/notifications").then(({ data }) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined);
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount, location.pathname]);

  useEffect(() => {
    const onRefresh = () => loadUnreadCount();
    const timer = window.setInterval(loadUnreadCount, 15000);
    window.addEventListener("smaj:notifications-refresh", onRefresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("smaj:notifications-refresh", onRefresh);
    };
  }, [loadUnreadCount]);
  useEffect(() => { document.body.style.overflow = mobileSidebarOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileSidebarOpen]);
  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const logout = async () => {
    await signOut();
    setShowSignOut(false);
    navigate("/home", { replace: true });
  };

  const toggleTheme = async () => {
    const settings = user?.settings || { theme: "light" as const, language: "English", notifications: true };
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
    await updateSettings({ ...settings, theme: next }).catch(() => undefined);
  };
  const themeIcon = themeMode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />;
  const headerResults = useMemo(() => { const query = headerSearch.trim().toLowerCase(); if (!query) return []; const services = serviceCatalog.filter((item) => [item.name, item.experience, item.description, ...item.items].join(" ").toLowerCase().includes(query)).map((item) => ({ group: "Services", label: item.name, to: item.live ? "/store" : `/app/services/${item.slug}` })); const pages = [{ group: "Account", label: "Profile", to: "/profile" }, { group: "Account", label: "Wallet", to: "/wallet" }, { group: "Account", label: "Settings", to: "/settings" }, { group: "Support", label: "Help Center", to: "/help" }, { group: "Marketplace", label: "Products and sellers", to: `/store?search=${encodeURIComponent(query)}` }].filter((item) => item.label.toLowerCase().includes(query) || ["products", "stores", "sellers", "help", "settings"].some((term) => query.includes(term))); return [...services, ...pages].slice(0, 10); }, [headerSearch]);
  const submitHeaderSearch = (event: FormEvent) => { event.preventDefault(); if (headerResults[0]) { startRouteLoading(headerResults[0].to); navigate(headerResults[0].to); setSearchOpen(false); setHeaderSearch(""); } else if (headerSearch.trim()) { const target = `/store?search=${encodeURIComponent(headerSearch.trim())}`; startRouteLoading("/store"); navigate(target); } };
  const positionProfileMenu = () => {
    const avatar = profileAvatarRef.current;
    if (!avatar) return;
    const rect = avatar.getBoundingClientRect();
    const width = 220;
    const gutter = 16;
    const top = Math.max(gutter, Math.min(window.innerHeight - gutter, rect.bottom + 10));
    const preferredLeft = rect.right - width;
    const maxLeft = window.innerWidth - width - gutter;
    const left = Math.max(gutter, Math.min(maxLeft, preferredLeft));
    setProfileMenuPosition({ top, left });
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    positionProfileMenu();
    window.addEventListener("resize", positionProfileMenu);
    window.addEventListener("scroll", positionProfileMenu, true);
    return () => {
      window.removeEventListener("resize", positionProfileMenu);
      window.removeEventListener("scroll", positionProfileMenu, true);
    };
  }, [profileMenuOpen]);

  const clearRouteLoadingTimer = useCallback(() => {
    if (routeLoadingTimerRef.current !== null) {
      window.clearTimeout(routeLoadingTimerRef.current);
      routeLoadingTimerRef.current = null;
    }
  }, []);

  const startRouteLoading = useCallback((targetPath = location.pathname) => {
    if (isLoading || routeHasOwnLoader(targetPath)) {
      clearRouteLoadingTimer();
      setRouteLoading(false);
      return;
    }
    clearRouteLoadingTimer();
    setRouteLoading(true);
    routeLoadingTimerRef.current = window.setTimeout(() => {
      setRouteLoading(false);
      routeLoadingTimerRef.current = null;
    }, 420);
  }, [clearRouteLoadingTimer, isLoading, location.pathname]);

  useEffect(() => {
    const nextIndex = getMainTabIndex(location.pathname);
    const previousIndex = previousTabRef.current;
    if (nextIndex >= 0) {
      setActiveTab(nextIndex);
      if (previousIndex >= 0 && previousIndex !== nextIndex) {
        setTabTransition(nextIndex > previousIndex ? "left" : "right");
      }
    } else {
      setTabTransition("none");
    }
    previousTabRef.current = nextIndex;
  }, [location.pathname]);

  const navigateMainTab = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= mainTabs.length || nextIndex === activeTab) return;
    const nextTab = mainTabs[nextIndex];
    setTabTransition(nextIndex > activeTab ? "left" : "right");
    startRouteLoading(nextTab.to);
    navigate(nextTab.to);
  }, [activeTab, navigate, startRouteLoading]);

  const handleSwipeStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!isMainTabRoute || event.touches.length !== 1 || shouldIgnoreSwipeTarget(event.target)) {
      touchStartRef.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, tabIndex: currentTabIndex };
  }, [currentTabIndex, isMainTabRoute]);

  const handleSwipeEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (start.tabIndex !== currentTabIndex) return;
    if (absX < SWIPE_MIN_DISTANCE || absY > SWIPE_MAX_VERTICAL_DRIFT || absX < absY * 1.8) return;
    const nextIndex = deltaX < 0 ? start.tabIndex + 1 : start.tabIndex - 1;
    navigateMainTab(nextIndex);
  }, [currentTabIndex, navigateMainTab]);

  const handleRouteClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target || anchor.origin !== window.location.origin) return;
    if (anchor.pathname === location.pathname && anchor.search === location.search && anchor.hash === location.hash) return;
    startRouteLoading(anchor.pathname);
  }, [location.hash, location.pathname, location.search, startRouteLoading]);

  useEffect(() => {
    if (!routeLoading) return undefined;
    clearRouteLoadingTimer();
    routeLoadingTimerRef.current = window.setTimeout(() => {
      setRouteLoading(false);
      routeLoadingTimerRef.current = null;
    }, 220);
    return clearRouteLoadingTimer;
  }, [clearRouteLoadingTimer, location.key, routeLoading]);

  useEffect(() => clearRouteLoadingTimer, [clearRouteLoadingTimer]);

  useEffect(() => {
    setShowProfileReminder(false);
    if (!needsProfileVerificationReminder || location.pathname === "/profile") return undefined;
    if (window.localStorage.getItem(profileReminderStorageKey) === "true") return undefined;

    let hideTimer: number | null = null;
    const openReminder = () => {
      if (window.localStorage.getItem(profileReminderStorageKey) === "true") return;
      setShowProfileReminder(true);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setShowProfileReminder(false), PROFILE_VERIFY_REMINDER_VISIBLE_MS);
    };

    const startTimer = window.setTimeout(openReminder, 800);
    const repeatTimer = window.setInterval(openReminder, PROFILE_VERIFY_REMINDER_INTERVAL_MS);
    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(repeatTimer);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
    };
  }, [location.pathname, needsProfileVerificationReminder, profileReminderStorageKey]);

  const completeProfileFromReminder = () => {
    window.localStorage.setItem(profileReminderStorageKey, "true");
    setShowProfileReminder(false);
    startRouteLoading("/profile");
    navigate("/profile");
  };

  return (
    <div className={`private-shell ${isStoreShell ? "store-private-shell" : ""} ${location.pathname === "/dashboard" ? "mobile-home-shell" : ""} ${location.pathname === "/categories" ? "mobile-category-shell" : ""}`} onClickCapture={handleRouteClick}>
      <header className="private-header">
        <div className="mobile-private-header-content">
          <Link to="/dashboard" className="mobile-private-brand" aria-label="SMAJ PI HUB Home"><img src={logoImage} alt="SMAJ PI HUB" /></Link>
          <span className="environment-badge mobile-environment-badge" aria-label="Testnet beta environment">Beta</span>
          <div className="mobile-private-header-actions">
            <Link className="mobile-private-icon notification-icon" to="/notifications" aria-label="Notifications"><NotificationsNoneOutlinedIcon />{unreadCount ? <span>{notificationBadgeLabel}</span> : null}</Link>
            <button className="mobile-private-icon" type="button" onClick={() => void toggleTheme()} aria-label="Toggle theme" title="Toggle light or dark mode">
              {themeIcon}
            </button>
          </div>
        </div>
        <button className="private-menu-toggle" type="button" onClick={() => setMobileSidebarOpen((open) => !open)} aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}>
          {mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Link to="/dashboard" className="private-header-brand" aria-label="SMAJ PI HUB Home"><img src={logoImage} alt="" /></Link>
        <span className="environment-badge" aria-label="Testnet beta environment">Testnet / Beta</span>
        <form className="private-global-search" onSubmit={submitHeaderSearch}><SearchOutlinedIcon /><input value={headerSearch} onFocus={() => setSearchOpen(true)} onChange={(event) => { setHeaderSearch(event.target.value); setSearchOpen(true); }} placeholder="Search SMAJ PI HUB..." />{searchOpen && headerSearch.trim() ? <div className="private-search-results">{headerResults.length ? Object.entries(headerResults.reduce<Record<string, typeof headerResults>>((groups, item) => { (groups[item.group] ||= []).push(item); return groups; }, {})).map(([group, items]) => <section key={group}><strong>{group}</strong>{items.map((item) => <button type="button" key={`${group}-${item.label}`} onClick={() => { startRouteLoading(item.to); navigate(item.to); setHeaderSearch(""); setSearchOpen(false); }}>{item.label}</button>)}</section>) : <button type="submit">Search Marketplace for “{headerSearch}”</button>}</div> : null}</form>
        <div className="private-header-title"><span>Workspace</span><strong>{pageTitle}</strong></div>
        <div className="private-header-actions">
          <Link className="private-header-icon notification-icon" to="/notifications" aria-label="Notifications" title="Notifications"><NotificationsNoneOutlinedIcon />{unreadCount ? <span>{notificationBadgeLabel}</span> : null}</Link>
          <button className="private-header-icon" type="button" onClick={() => void toggleTheme()} aria-label="Toggle theme" title="Toggle light or dark mode">
            {themeIcon}
          </button>
          <div className="private-header-profile">
            {profileMenuOpen ? <div className="private-profile-menu private-header-profile-menu" style={profileMenuPosition}><Link to="/settings" onClick={() => setProfileMenuOpen(false)}><PersonOutlineIcon />Account</Link><Link to="/app/wallet" onClick={() => setProfileMenuOpen(false)}><AccountBalanceWalletOutlinedIcon />Wallet</Link><Link to="/settings/preferences" onClick={() => setProfileMenuOpen(false)}><SettingsOutlinedIcon />Settings</Link><Link to="/app/help-center" onClick={() => setProfileMenuOpen(false)}><HelpOutlineOutlinedIcon />Help Center</Link><button type="button" className="profile-menu-logout" onClick={() => { setProfileMenuOpen(false); setShowSignOut(true); }}><LogoutIcon />Logout</button></div> : null}
            <button ref={profileAvatarRef} type="button" className="private-header-avatar" title="Account" aria-label="Open account menu" aria-expanded={profileMenuOpen} onClick={() => { positionProfileMenu(); setProfileMenuOpen((open) => !open); }}>{user?.avatar ? <img src={user.avatar} alt="" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</button>
          </div>
        </div>
      </header>

      <div className={`private-body ${sidebarCollapsed ? "private-body-collapsed" : ""}`}>
        <aside className={`private-sidebar ${sidebarCollapsed ? "private-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "private-sidebar-open" : ""}`}>
          <div className="private-sidebar-top">
            <Link to="/dashboard" className="private-sidebar-brand" title="SMAJ PI HUB"><img src={logoImage} alt="SMAJ PI HUB" /></Link>
            <button className="private-sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {sidebarCollapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
            </button>
          </div>
          <nav aria-label="Private navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMobileSidebarOpen(false)} title={sidebarCollapsed ? link.label : undefined} aria-label={link.label}>
                {link.icon}
                <span className="private-nav-label">{link.label}</span>
                {link.to === "/notifications" && unreadCount ? <b className="sidebar-count">{notificationBadgeLabel}</b> : null}
              </NavLink>
            ))}
          </nav>
          <div className="private-sidebar-account">
            {profileMenuOpen ? <div className="private-profile-menu"><Link to="/settings" onClick={() => setProfileMenuOpen(false)}><PersonOutlineIcon />Account</Link><Link to="/app/wallet" onClick={() => setProfileMenuOpen(false)}><AccountBalanceWalletOutlinedIcon />Wallet</Link><Link to="/settings/preferences" onClick={() => setProfileMenuOpen(false)}><SettingsOutlinedIcon />Settings</Link><Link to="/app/help-center" onClick={() => setProfileMenuOpen(false)}><HelpOutlineOutlinedIcon />Help Center</Link><button type="button" className="profile-menu-logout" onClick={() => { setProfileMenuOpen(false); setShowSignOut(true); }}><LogoutIcon />Logout</button></div> : null}
            <button type="button" className="private-sidebar-profile" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} title={sidebarCollapsed ? (user?.displayName || user?.username) : undefined}>
              <span className="private-profile-avatar">{user?.avatar ? <img src={user.avatar} alt="" /> : (user?.displayName || user?.username || "U").slice(0, 1).toUpperCase()}</span><span className="private-profile-copy"><strong>{user?.displayName || user?.username}</strong><small>{user?.role || "buyer"} account</small></span><KeyboardArrowUpIcon className="private-profile-chevron" />
            </button>
          </div>
        </aside>
        {mobileSidebarOpen ? <button className="private-overlay" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu" /> : null}
        <div className="private-content">
          {backFallback ? (
            <button
              className="private-route-back"
              type="button"
              onClick={() => {
                startRouteLoading(backFallback);
                navigate(backFallback, { replace: true });
              }}
            >
              <ArrowBackIosNewOutlinedIcon />
              <span>Back</span>
            </button>
          ) : null}
          {routeLoading && !isLoading ? (
            <div className="private-route-loading" role="status" aria-live="polite" aria-label="Loading page">
              <PrivateSkeleton variant={routeSkeleton.variant} count={routeSkeleton.count} />
            </div>
          ) : (
            <div
              key={tabPageKey}
              className={`private-tab-page private-tab-page-${tabTransition}`}
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
            >
              {children}
            </div>
          )}
        </div>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile private navigation">
        {mainTabs.map((tab, index) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            onClick={() => {
              if (isMainTabRoute && index !== activeTab) setTabTransition(index > activeTab ? "left" : "right");
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
      {showProfileReminder ? (
        <aside className="profile-verify-reminder" role="alert" aria-live="polite">
          <span><VerifiedUserOutlinedIcon /></span>
          <div>
            <strong>Complete your profile</strong>
            <p>Add your profile info to unlock Real Pi User verification.</p>
          </div>
          <button type="button" onClick={completeProfileFromReminder}>Go Complete</button>
        </aside>
      ) : null}
      <WelcomeTour />
      <ConfirmSignOutModal open={showSignOut} busy={isLoading} onCancel={() => setShowSignOut(false)} onConfirm={() => void logout()} />
    </div>
  );
};

export default PrivateLayout;
