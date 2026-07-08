import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { privateSearchItems, privateSearchPopular } from "../../content/privateSearch";
import { serviceCatalog } from "../../content/serviceCatalog";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";

const explore = [
  ["Shopping", ShoppingBagOutlinedIcon, "/store"], ["Food", RestaurantOutlinedIcon, "/app/services/food"], ["Jobs", WorkOutlineOutlinedIcon, "/app/services/jobs"], ["Education", SchoolOutlinedIcon, "/app/services/education"],
  ["Health", HealthAndSafetyOutlinedIcon, "/app/services/health"], ["Transport", DirectionsCarOutlinedIcon, "/app/services/transport"], ["Stream", LiveTvOutlinedIcon, "/app/services/stream"], ["Sports", SportsSoccerOutlinedIcon, "/app/services/sports"],
  ["Events", EventOutlinedIcon, "/app/services/events"], ["Wallet", AccountBalanceWalletOutlinedIcon, "/app/wallet"], ["Housing", HomeWorkOutlinedIcon, "/app/services/housing"], ["Charity", VolunteerActivismOutlinedIcon, "/app/services/charity"],
] as const;
const suggestions = ["Mobile payments", "Sports tickets", "Food delivery", "Online shopping", "Find jobs", "Health services", "Movies", "Property rentals"];
const RECENT_SEARCHES_KEY = "smaj_recent_searches";
type SearchUser = { uid: string; username?: string; piUsername?: string; displayName: string; country?: string; role?: string; sellerActive?: boolean };
type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void;
  onerror: () => void;
  start: () => void;
};
type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

const readLocalRecentSearches = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((item) => typeof item === "string").slice(0, 10) : [];
  } catch {
    return [];
  }
};

const SearchPage = () => {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRecentSearches(readLocalRecentSearches());
    axiosClient.get<{ searches: string[] }>("/user/recent-searches").then(({ data }) => {
      const searches = data.searches || [];
      setRecentSearches(searches);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setUsers([]);
      setError("");
      setLoading(false);
      return;
    }

    let mounted = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      axiosClient.get<{ products: Product[] }>("/marketplace/products", { params: { search: query, sort: "newest" }, signal: controller.signal }),
      axiosClient.get<{ users: SearchUser[] }>("/user/search", { params: { q: query }, signal: controller.signal }),
    ]).then(([productResponse, userResponse]) => {
      if (!mounted) return;
      setProducts(productResponse.data.products || []);
      setUsers(userResponse.data.users || []);
    }).catch(() => {
      if (!mounted) return;
      setProducts([]);
      setUsers([]);
      setError("Search is not available right now. Please try again.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; controller.abort(); };
  }, [query]);

  const saveRecentSearch = (value: string) => {
    const term = value.trim();
    if (!term) return;
    const searches = [term, ...recentSearches.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 10);
    setRecentSearches(searches);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    axiosClient.post<{ searches: string[] }>("/user/recent-searches", { query: term }).then(({ data }) => {
      const next = data.searches || searches;
      setRecentSearches(next);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    }).catch(() => undefined);
  };

  const runSearch = (value: string) => {
    const term = value.trim();
    setInput(term);
    setQuery(term);
    saveRecentSearch(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([]));
    axiosClient.delete("/user/recent-searches").catch(() => undefined);
  };

  const startVoiceSearch = () => {
    const speechWindow = window as unknown as { SpeechRecognition?: BrowserSpeechRecognitionConstructor; webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice search is not available in this browser yet.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) runSearch(transcript);
    };
    recognition.onerror = () => setError("Voice search could not start. Please type your search.");
    recognition.start();
  };

  const submit = (event: FormEvent) => { event.preventDefault(); runSearch(input); };
  const grouped = useMemo(() => {
    if (!query) return [];
    const needle = query.toLowerCase();
    const services = serviceCatalog.filter((item) => [item.name, item.description, ...item.items].join(" ").toLowerCase().includes(needle)).map((item) => ({ label:item.name, to:item.live ? "/store" : `/app/services/${item.slug}` }));
    const productResults = products.map((product) => ({ label: product.title, to: `/product/${product._id}` }));
    const sellers = users.filter((user) => user.sellerActive || user.role === "seller").map((user) => ({ label: `${user.displayName}${user.country ? ` - ${user.country}` : ""}`, to: `/seller/${user.uid}` }));
    const userResults = users.map((user) => ({ label: user.displayName || user.piUsername || user.username || "Pi user", to: `/seller/${user.uid}` }));
    return [
      ["Services", services],
      ["Products", productResults.length ? productResults : [{ label:`Search products for “${query}”`, to:`/store?search=${encodeURIComponent(query)}` }]],
      ["Sellers", sellers],
      ["Users", userResults],
      ["Help", privateSearchItems.filter((item) => [item.label,...item.keywords].join(" ").toLowerCase().includes(needle)).map(({ label,to }) => ({ label,to }))],
    ] as const;
  }, [products, query, users]);
  const hasResults = grouped.some(([, items]) => items.length);

  return <main className="private-page mobile-search-page">
    <form className="mobile-search-box" onSubmit={submit}><SearchOutlinedIcon /><input autoFocus value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search or ask SMAJ PI HUB" /><button type="button" aria-label="Voice search" onClick={startVoiceSearch}><MicNoneOutlinedIcon /></button></form>
    {!query ? <>
      <section className="mobile-search-section"><h1>Explore services</h1><div className="mobile-explore-grid">{explore.map(([label,Icon,to]) => <Link to={to} key={label}><span>{label}</span><Icon /></Link>)}</div></section>
      {recentSearches.length ? <section className="mobile-search-section"><div className="mobile-search-result-head"><h2>Recent searches</h2><button type="button" onClick={clearRecentSearches}>Clear All</button></div><div className="mobile-suggestion-grid">{recentSearches.map((item) => <button type="button" key={item} onClick={() => runSearch(item)}><span>{item}</span><SearchOutlinedIcon /></button>)}</div></section> : null}
      <section className="mobile-search-section"><h2>Trending searches</h2><div className="mobile-suggestion-grid">{suggestions.map((item) => <button type="button" key={item} onClick={() => runSearch(item)}><span>{item}</span><SearchOutlinedIcon /></button>)}</div></section>
    </> : <section className="mobile-search-results"><div className="mobile-search-result-head"><h1>Results for “{query}”</h1><button onClick={() => { setInput(""); setQuery(""); }}>Clear</button></div>{loading ? <section><h2>Searching</h2><Link to="#">Loading results...</Link></section> : error ? <section><h2>Search error</h2><Link to="#">{error}</Link></section> : hasResults ? grouped.map(([group,items]) => items.length ? <section key={group}><h2>{group}</h2>{items.map((item) => <Link key={`${group}-${item.label}`} to={item.to} onClick={() => saveRecentSearch(query)}>{item.label}</Link>)}</section> : null) : <section><h2>No results</h2><Link to="/categories">No results found. Try another keyword or browse categories.</Link></section>}</section>}
    <div className="search-desktop-fallback"><h2>Popular</h2>{privateSearchPopular.map((item) => <Link key={item.label} to={item.to}>{item.label}</Link>)}</div>
  </main>;
};

export default SearchPage;
