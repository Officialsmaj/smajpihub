import { useMemo, useState, type FormEvent } from "react";
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

const explore = [
  ["Shopping", ShoppingBagOutlinedIcon, "/store"], ["Food", RestaurantOutlinedIcon, "/app/services/food"], ["Jobs", WorkOutlineOutlinedIcon, "/app/services/jobs"], ["Education", SchoolOutlinedIcon, "/app/services/education"],
  ["Health", HealthAndSafetyOutlinedIcon, "/app/services/health"], ["Transport", DirectionsCarOutlinedIcon, "/app/services/transport"], ["Stream", LiveTvOutlinedIcon, "/app/services/stream"], ["Sports", SportsSoccerOutlinedIcon, "/app/services/sports"],
  ["Events", EventOutlinedIcon, "/app/services/events"], ["Wallet", AccountBalanceWalletOutlinedIcon, "/wallet"], ["Housing", HomeWorkOutlinedIcon, "/app/services/housing"], ["Charity", VolunteerActivismOutlinedIcon, "/app/services/charity"],
] as const;
const suggestions = ["Mobile payments", "Sports tickets", "Food delivery", "Online shopping", "Find jobs", "Health services", "Movies", "Property rentals"];

const SearchPage = () => {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); setQuery(input.trim()); };
  const grouped = useMemo(() => {
    if (!query) return [];
    const needle = query.toLowerCase();
    const services = serviceCatalog.filter((item) => [item.name, item.description, ...item.items].join(" ").toLowerCase().includes(needle)).map((item) => ({ label:item.name, to:item.live ? "/store" : `/app/services/${item.slug}` }));
    return [
      ["Services", services],
      ["Products", [{ label:`Search products for “${query}”`, to:`/store?search=${encodeURIComponent(query)}` }]],
      ["Sellers", [{ label:`Find sellers matching “${query}”`, to:`/store?search=${encodeURIComponent(query)}` }]],
      ["Help", privateSearchItems.filter((item) => [item.label,...item.keywords].join(" ").toLowerCase().includes(needle)).map(({ label,to }) => ({ label,to }))],
    ] as const;
  }, [query]);

  return <main className="private-page mobile-search-page">
    <form className="mobile-search-box" onSubmit={submit}><SearchOutlinedIcon /><input autoFocus value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search or ask SMAJ PI HUB" /><button type="button" aria-label="Voice search"><MicNoneOutlinedIcon /></button></form>
    {!query ? <>
      <section className="mobile-search-section"><h1>Explore services</h1><div className="mobile-explore-grid">{explore.map(([label,Icon,to]) => <Link to={to} key={label}><span>{label}</span><Icon /></Link>)}</div></section>
      <section className="mobile-search-section"><h2>You might also like</h2><div className="mobile-suggestion-grid">{suggestions.map((item) => <button type="button" key={item} onClick={() => { setInput(item); setQuery(item); }}><span>{item}</span><SearchOutlinedIcon /></button>)}</div></section>
    </> : <section className="mobile-search-results"><div className="mobile-search-result-head"><h1>Results for “{query}”</h1><button onClick={() => { setInput(""); setQuery(""); }}>Clear</button></div>{grouped.map(([group,items]) => items.length ? <section key={group}><h2>{group}</h2>{items.map((item) => <Link key={`${group}-${item.label}`} to={item.to}>{item.label}</Link>)}</section> : null)}</section>}
    <div className="search-desktop-fallback"><h2>Popular</h2>{privateSearchPopular.map((item) => <Link key={item.label} to={item.to}>{item.label}</Link>)}</div>
  </main>;
};

export default SearchPage;
