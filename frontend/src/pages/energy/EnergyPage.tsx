import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import BatteryChargingFullOutlinedIcon from "@mui/icons-material/BatteryChargingFullOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SolarPowerOutlinedIcon from "@mui/icons-material/SolarPowerOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import ServiceMobileMenu from "../../components/ServiceMobileMenu";
import { formatServicePrice, piFromUsdt, PI_USDT_RATE } from "../../lib/piPricing";
import "./EnergyPage.css";

export type EnergyPageKind =
  | "home"
  | "search"
  | "saved"
  | "quotes"
  | "bookings"
  | "orders"
  | "dashboard"
  | "utilities"
  | "providers"
  | "product"
  | "provider";

type EnergyProduct = {
  id: string;
  name: string;
  category: string;
  priceUsdt: number;
  location: string;
  warranty: string;
  rating: number;
  image: string;
  provider: string;
  providerId: string;
  description: string;
  specs: string[];
};

const products: EnergyProduct[] = [
  {
    id: "home-solar-3kw",
    name: "3 kW Home Solar System",
    category: "Solar kits",
    priceUsdt: 1280,
    location: "Lagos, Nigeria",
    warranty: "10-year panel warranty",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=85",
    provider: "SunGrid Africa",
    providerId: "sungrid",
    description:
      "A complete residential solar solution sized for lighting, refrigeration, television, and daily device charging.",
    specs: ["6 × 500 W panels", "3 kVA hybrid inverter", "5 kWh lithium storage", "Professional installation"],
  },
  {
    id: "lithium-powerwall",
    name: "10 kWh Lithium Powerwall",
    category: "Batteries",
    priceUsdt: 890,
    location: "Nairobi, Kenya",
    warranty: "8-year warranty",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=85",
    provider: "VoltWorks Energy",
    providerId: "voltworks",
    description: "Long-life wall-mounted storage with smart monitoring for solar systems and backup power.",
    specs: ["10 kWh capacity", "6,000+ cycles", "Mobile monitoring", "IP65 enclosure"],
  },
  {
    id: "commercial-install",
    name: "Commercial Solar Installation",
    category: "Installation",
    priceUsdt: 3500,
    location: "Accra, Ghana",
    warranty: "5-year workmanship",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=85",
    provider: "EcoSpark Solutions",
    providerId: "ecospark",
    description:
      "Site assessment, engineering, supply, and installation for shops, offices, schools, and production sites.",
    specs: ["Free remote assessment", "Custom system design", "Certified technicians", "Performance reporting"],
  },
  {
    id: "smart-generator",
    name: "8 kVA Smart Backup Generator",
    category: "Backup power",
    priceUsdt: 620,
    location: "Dakar, Senegal",
    warranty: "3-year warranty",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
    provider: "PowerLink Services",
    providerId: "powerlink",
    description: "Quiet automatic backup generation for homes and small businesses with remote status alerts.",
    specs: ["8 kVA output", "Automatic transfer", "Low-noise enclosure", "Remote monitoring"],
  },
];

const SAVED = "smaj_energy_saved";
const QUOTES = "smaj_energy_quotes";
const BOOKINGS = "smaj_energy_bookings";
const ORDERS = "smaj_energy_orders";
const PAYMENTS = "smaj_energy_payments";
type RecordValue = string | number;
type SavedRecord = Record<string, RecordValue>;

const readSaved = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(SAVED) || "[]"));
  } catch {
    return new Set<string>();
  }
};
const readRecords = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as SavedRecord[];
  } catch {
    return [];
  }
};
const saveRecord = (key: string, record: SavedRecord) => {
  localStorage.setItem(key, JSON.stringify([record, ...readRecords(key)]));
};

const EnergyHeader = () => (
  <header className="energy-header">
    <Link className="energy-back" to="/app/services">
      ← Hub
    </Link>
    <Link className="energy-brand" to="/services/energy">
      <BoltOutlinedIcon /> SMAJ Energy
    </Link>
    <nav>
      <NavLink end to="/services/energy">
        Explore
      </NavLink>
      <NavLink to="/services/energy/search">Solutions</NavLink>
      <NavLink to="/services/energy/providers">Providers</NavLink>
      <NavLink to="/services/energy/dashboard">My energy</NavLink>
    </nav>
    <ServiceMobileMenu
      title="SMAJ Energy"
      accent="#126b57"
      items={[
        { label: "Explore", to: "/services/energy" },
        { label: "Solutions", to: "/services/energy/search" },
        { label: "Providers", to: "/services/energy/providers" },
        { label: "Saved", to: "/services/energy/saved" },
        { label: "Quotes", to: "/services/energy/quotes" },
        { label: "Bookings", to: "/services/energy/bookings" },
        { label: "Orders", to: "/services/energy/orders" },
        { label: "Utility bills", to: "/services/energy/utilities" },
        { label: "My energy", to: "/services/energy/dashboard" },
      ]}
    />
  </header>
);

const ProductCard = ({ item, saved, onSave }: { item: EnergyProduct; saved: boolean; onSave: () => void }) => (
  <article className="energy-card">
    <Link to={`/services/energy/product/${item.id}`}>
      <img src={item.image} alt={item.name} />
      <div className="energy-card-body">
        <small>{item.category}</small>
        <h2>{item.name}</h2>
        <p>
          <LocationOnOutlinedIcon /> {item.location}
        </p>
        <strong>{formatServicePrice(item.priceUsdt)}</strong>
        <span>{item.warranty}</span>
        <p>
          <VerifiedOutlinedIcon /> {item.provider} · {item.rating} ★
        </p>
      </div>
    </Link>
    <button aria-label={saved ? "Remove saved item" : "Save item"} className={saved ? "saved" : ""} onClick={onSave}>
      <BookmarkBorderOutlinedIcon />
    </button>
  </article>
);

const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="energy-empty">
    <SolarPowerOutlinedIcon />
    <h2>{title}</h2>
    <p>{text}</p>
    <Link to="/services/energy/search">Explore energy solutions</Link>
  </div>
);

const RecordList = ({ records, empty }: { records: SavedRecord[]; empty: string }) =>
  records.length ? (
    <div className="energy-records">
      {records.map((record, index) => (
        <article key={`${record.id}-${index}`}>
          <div>
            <small>{record.id}</small>
            <h2>{record.product || record.service || record.utility}</h2>
            <p>{record.provider || record.account || "SMAJ Energy"}</p>
          </div>
          <div>
            <strong>
              {record.totalUsdt ? formatServicePrice(Number(record.totalUsdt)) : record.date || "Submitted"}
            </strong>
            <span>{record.status}</span>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState title={empty} text="Your activity will appear here when you get started." />
  );

const EnergyPage = ({ kind = "home" }: { kind?: EnergyPageKind }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState(readSaved);
  const [notice, setNotice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const product = products.find(item => item.id === id);
  const providerProducts = products.filter(item => item.providerId === id);
  const records = useMemo(
    () => ({
      quotes: readRecords(QUOTES),
      bookings: readRecords(BOOKINGS),
      orders: readRecords(ORDERS),
      payments: readRecords(PAYMENTS),
    }),
    [kind]
  );
  const visible = useMemo(
    () =>
      products.filter(
        item =>
          (category === "All" || item.category === category) &&
          `${item.name} ${item.provider} ${item.location}`.toLowerCase().includes(query.toLowerCase())
      ),
    [category, query]
  );
  const toggleSaved = (productId: string) =>
    setSaved(current => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      localStorage.setItem(SAVED, JSON.stringify([...next]));
      return next;
    });
  const submitQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    const data = Object.fromEntries(new FormData(event.currentTarget)) as SavedRecord;
    saveRecord(QUOTES, {
      id: `ENQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      product: product.name,
      provider: product.provider,
      status: "Assessment pending",
      ...data,
    });
    setNotice("Your quote request was sent.");
    event.currentTarget.reset();
  };
  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    saveRecord(ORDERS, {
      id: `ENO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      product: product.name,
      provider: product.provider,
      total: piFromUsdt(product.priceUsdt * quantity),
      totalUsdt: product.priceUsdt * quantity,
      piRateUsed: PI_USDT_RATE,
      status: "Order requested",
      quantity,
    });
    navigate("/services/energy/orders");
  };
  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as SavedRecord;
    saveRecord(BOOKINGS, {
      id: `ENB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      service: "Energy consultation",
      status: "Awaiting confirmation",
      ...data,
    });
    navigate("/services/energy/bookings");
  };
  const payUtility = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as SavedRecord;
    saveRecord(PAYMENTS, {
      id: `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: "Payment successful",
      ...data,
    });
    setNotice("Utility payment completed successfully.");
    event.currentTarget.reset();
  };

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/services/energy/search?q=${encodeURIComponent(query)}`);
  };

  let content;
  if (kind === "home") {
    content = (
      <>
        <section className="energy-hero">
          <div>
            <small>CLEAN POWER, MADE SIMPLE</small>
            <h1>Power your life with smarter energy.</h1>
            <p>Compare trusted solar, battery, installation, and backup-power solutions payable with Pi.</p>
            <form onSubmit={search}>
              <SearchOutlinedIcon />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="What energy solution do you need?"
              />
              <button>Search</button>
            </form>
          </div>
        </section>
        <section className="energy-inner">
          <div className="energy-benefits">
            <div>
              <SolarPowerOutlinedIcon />
              <strong>Clean energy</strong>
              <span>Solutions for homes and businesses</span>
            </div>
            <div>
              <VerifiedOutlinedIcon />
              <strong>Verified experts</strong>
              <span>Trusted providers and installers</span>
            </div>
            <div>
              <BatteryChargingFullOutlinedIcon />
              <strong>Reliable backup</strong>
              <span>Storage sized for your needs</span>
            </div>
          </div>
          <div className="energy-heading">
            <div>
              <small>POPULAR SOLUTIONS</small>
              <h1>Start your energy upgrade</h1>
            </div>
            <Link to="/services/energy/search">See all solutions</Link>
          </div>
          <div className="energy-grid">
            {products.map(item => (
              <ProductCard key={item.id} item={item} saved={saved.has(item.id)} onSave={() => toggleSaved(item.id)} />
            ))}
          </div>
          <section className="energy-cta">
            <div>
              <small>NOT SURE WHAT YOU NEED?</small>
              <h2>Book a free energy consultation</h2>
              <p>Tell us about your property and usage. A verified specialist will recommend the right system.</p>
            </div>
            <Link to="/services/energy/bookings">Book consultation</Link>
          </section>
        </section>
      </>
    );
  } else if (kind === "search") {
    content = (
      <>
        <section className="energy-search-hero">
          <div>
            <small>ENERGY MARKETPLACE</small>
            <h1>Find your power solution</h1>
            <form onSubmit={search}>
              <SearchOutlinedIcon />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search solar, batteries, installers..."
              />
              <button>Search</button>
            </form>
          </div>
        </section>
        <section className="energy-inner">
          <div className="energy-filters">
            {["All", "Solar kits", "Batteries", "Installation", "Backup power"].map(item => (
              <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <div className="energy-heading">
            <div>
              <small>{visible.length} RESULTS</small>
              <h1>{query ? `Results for “${query}”` : "All energy solutions"}</h1>
            </div>
          </div>
          {visible.length ? (
            <div className="energy-grid">
              {visible.map(item => (
                <ProductCard key={item.id} item={item} saved={saved.has(item.id)} onSave={() => toggleSaved(item.id)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No matching solutions" text="Try another search or browse all categories." />
          )}
        </section>
      </>
    );
  } else if (kind === "product" && product) {
    content = (
      <main className="energy-detail">
        <div className="energy-detail-grid">
          <img src={product.image} alt={product.name} />
          <section>
            <small>{product.category}</small>
            <h1>{product.name}</h1>
            <Link className="energy-provider-link" to={`/services/energy/provider/${product.providerId}`}>
              <VerifiedOutlinedIcon /> {product.provider} · {product.rating} ★
            </Link>
            <p className="energy-description">{product.description}</p>
            <strong className="energy-price">{formatServicePrice(product.priceUsdt)}</strong>
            <p>
              <LocationOnOutlinedIcon /> Available from {product.location}
            </p>
            <ul>
              {product.specs.map(spec => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
            <form className="energy-buy" onSubmit={placeOrder}>
              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={event => setQuantity(Number(event.target.value))}
                />
              </label>
              <button>Request order · {formatServicePrice(product.priceUsdt * quantity)}</button>
              <button type="button" className="secondary" onClick={() => toggleSaved(product.id)}>
                {saved.has(product.id) ? "Saved" : "Save for later"}
              </button>
            </form>
          </section>
        </div>
        <section className="energy-quote-panel">
          <div>
            <small>CUSTOM PRICING</small>
            <h2>Request a site-specific quote</h2>
            <p>Share basic project details and {product.provider} will contact you with a tailored estimate.</p>
          </div>
          <form className="energy-form" onSubmit={submitQuote}>
            <label>
              Property type
              <select name="property" required>
                <option>Home</option>
                <option>Business</option>
                <option>Farm</option>
                <option>Community facility</option>
              </select>
            </label>
            <label>
              Location
              <input name="location" required placeholder="City, country" />
            </label>
            <label>
              Monthly energy spend
              <input name="spend" required placeholder="Amount or estimate" />
            </label>
            <label>
              Phone or email
              <input name="contact" required placeholder="How should we reach you?" />
            </label>
            <button>Send quote request</button>
            {notice && <p className="energy-notice">{notice}</p>}
          </form>
        </section>
      </main>
    );
  } else if (kind === "provider") {
    const name = providerProducts[0]?.provider || "SMAJ Energy Partner";
    content = (
      <main className="energy-inner">
        <section className="energy-provider">
          <div className="energy-provider-mark">
            <SolarPowerOutlinedIcon />
          </div>
          <div>
            <small>VERIFIED ENERGY PROVIDER</small>
            <h1>{name}</h1>
            <p>
              <LocationOnOutlinedIcon /> Serving residential and commercial customers
            </p>
            <p>Design, supply, installation, and ongoing support from a trusted SMAJ marketplace partner.</p>
          </div>
          <Link to="/services/energy/bookings">Book consultation</Link>
        </section>
        <div className="energy-heading">
          <div>
            <small>AVAILABLE NOW</small>
            <h1>Solutions from this provider</h1>
          </div>
        </div>
        {providerProducts.length ? (
          <div className="energy-grid">
            {providerProducts.map(item => (
              <ProductCard key={item.id} item={item} saved={saved.has(item.id)} onSave={() => toggleSaved(item.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="Provider profile" text="New solutions from this provider are coming soon." />
        )}
      </main>
    );
  } else if (kind === "providers") {
    const providers = [...new Map(products.map(item => [item.providerId, item])).values()];
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>TRUSTED PROFESSIONALS</small>
            <h1>Energy providers</h1>
            <p>Compare verified suppliers, installers, and maintenance teams.</p>
          </div>
        </div>
        <div className="energy-provider-grid">
          {providers.map(item => (
            <Link to={`/services/energy/provider/${item.providerId}`} key={item.providerId}>
              <div>
                <SolarPowerOutlinedIcon />
              </div>
              <small>VERIFIED</small>
              <h2>{item.provider}</h2>
              <p>
                <LocationOnOutlinedIcon /> {item.location}
              </p>
              <span>
                {item.category} · {item.rating} ★
              </span>
            </Link>
          ))}
        </div>
      </main>
    );
  } else if (kind === "saved") {
    const savedProducts = products.filter(item => saved.has(item.id));
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>YOUR SHORTLIST</small>
            <h1>Saved solutions</h1>
          </div>
        </div>
        {savedProducts.length ? (
          <div className="energy-grid">
            {savedProducts.map(item => (
              <ProductCard key={item.id} item={item} saved onSave={() => toggleSaved(item.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing saved yet" text="Save solutions to compare them later." />
        )}
      </main>
    );
  } else if (kind === "quotes") {
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>PROJECT ESTIMATES</small>
            <h1>My quote requests</h1>
          </div>
        </div>
        <RecordList records={records.quotes} empty="No quote requests yet" />
      </main>
    );
  } else if (kind === "orders") {
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>PURCHASES</small>
            <h1>My energy orders</h1>
          </div>
        </div>
        <RecordList records={records.orders} empty="No energy orders yet" />
      </main>
    );
  } else if (kind === "bookings") {
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>EXPERT HELP</small>
            <h1>Consultations & service visits</h1>
          </div>
        </div>
        <div className="energy-two-column">
          <form className="energy-form energy-panel" onSubmit={submitBooking}>
            <h2>Book a consultation</h2>
            <label>
              Service
              <select name="service">
                <option>Energy consultation</option>
                <option>Site assessment</option>
                <option>Installation</option>
                <option>Repair & maintenance</option>
              </select>
            </label>
            <label>
              Preferred date
              <input name="date" type="date" required />
            </label>
            <label>
              Location
              <input name="location" required placeholder="Property address" />
            </label>
            <label>
              Contact
              <input name="contact" required placeholder="Phone or email" />
            </label>
            <button>Request booking</button>
          </form>
          <section>
            <h2>Upcoming requests</h2>
            <RecordList records={records.bookings} empty="No bookings yet" />
          </section>
        </div>
      </main>
    );
  } else if (kind === "utilities") {
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>FAST & SECURE</small>
            <h1>Pay utility bills with Pi</h1>
            <p>Electricity, prepaid meter, water, and gas payments in one place.</p>
          </div>
        </div>
        <div className="energy-two-column">
          <form className="energy-form energy-panel" onSubmit={payUtility}>
            <label>
              Utility
              <select name="utility">
                <option>Electricity</option>
                <option>Prepaid meter</option>
                <option>Water</option>
                <option>Gas</option>
              </select>
            </label>
            <label>
              Provider
              <input name="provider" required placeholder="Utility company" />
            </label>
            <label>
              Account / meter number
              <input name="account" required />
            </label>
            <label>
              Amount in Pi
              <input name="total" type="number" min="1" required />
            </label>
            <button>Review & pay</button>
            {notice && <p className="energy-notice">{notice}</p>}
          </form>
          <section>
            <h2>Recent payments</h2>
            <RecordList records={records.payments} empty="No utility payments yet" />
          </section>
        </div>
      </main>
    );
  } else if (kind === "dashboard") {
    content = (
      <main className="energy-inner">
        <div className="energy-heading">
          <div>
            <small>MY ENERGY</small>
            <h1>Energy dashboard</h1>
            <p>Track your energy activity, services, and estimated impact.</p>
          </div>
          <Link to="/services/energy/utilities">Pay a utility</Link>
        </div>
        <div className="energy-stats">
          <article>
            <small>ESTIMATED SOLAR OUTPUT</small>
            <strong>12.4 kWh</strong>
            <span>Today · demo estimate</span>
          </article>
          <article>
            <small>ESTIMATED SAVINGS</small>
            <strong>π 24.8</strong>
            <span>This month</span>
          </article>
          <article>
            <small>CO₂ AVOIDED</small>
            <strong>18.6 kg</strong>
            <span>This month</span>
          </article>
          <article>
            <small>ACTIVE REQUESTS</small>
            <strong>{records.quotes.length + records.bookings.length}</strong>
            <span>Quotes and bookings</span>
          </article>
        </div>
        <div className="energy-quick">
          <Link to="/services/energy/saved">
            <BookmarkBorderOutlinedIcon />
            <span>
              <strong>Saved solutions</strong>
              <small>{saved.size} items</small>
            </span>
          </Link>
          <Link to="/services/energy/quotes">
            <SolarPowerOutlinedIcon />
            <span>
              <strong>Quote requests</strong>
              <small>{records.quotes.length} requests</small>
            </span>
          </Link>
          <Link to="/services/energy/orders">
            <BatteryChargingFullOutlinedIcon />
            <span>
              <strong>Orders</strong>
              <small>{records.orders.length} orders</small>
            </span>
          </Link>
          <Link to="/services/energy/bookings">
            <VerifiedOutlinedIcon />
            <span>
              <strong>Service visits</strong>
              <small>{records.bookings.length} bookings</small>
            </span>
          </Link>
        </div>
      </main>
    );
  } else {
    content = (
      <EmptyState title="Energy page not found" text="Return to the marketplace to explore available solutions." />
    );
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <div className="energy-page">
        <EnergyHeader />
        {content}
        <footer className="energy-footer">
          <strong>SMAJ Energy</strong>
          <span>Clean power for every community · Powered by the SMAJ PI ecosystem</span>
          <div>
            <Link to="/services/energy/saved">Saved</Link>
            <Link to="/services/energy/quotes">Quotes</Link>
            <Link to="/services/energy/orders">Orders</Link>
            <Link to="/services/energy/utilities">Utilities</Link>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
};

export default EnergyPage;
