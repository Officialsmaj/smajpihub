import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import ServiceMobileMenu from "../../components/ServiceMobileMenu";
import { formatServicePrice } from "../../lib/piPricing";
import "./HousingPage.css";

export type HousingPageKind =
  | "home"
  | "search"
  | "saved"
  | "compare"
  | "viewings"
  | "landlord"
  | "add"
  | "property"
  | "agent";
type Property = {
  id: string;
  title: string;
  type: string;
  purpose: string;
  city: string;
  country: string;
  priceUsdt: number;
  beds: number;
  baths: number;
  area: string;
  image: string;
  agentId: string;
  agent: string;
  verified: boolean;
  description: string;
  amenities: string[];
};
const properties: Property[] = [
  {
    id: "lagos-waterfront",
    title: "Waterfront apartment",
    type: "Apartment",
    purpose: "Rent",
    city: "Lagos",
    country: "Nigeria",
    priceUsdt: 420,
    beds: 2,
    baths: 2,
    area: "110 m²",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85",
    agentId: "amara-homes",
    agent: "Amara Homes",
    verified: true,
    description: "Bright furnished apartment with secure access, backup power, and waterfront views.",
    amenities: ["Furnished", "Security", "Parking", "Backup power"],
  },
  {
    id: "accra-family-home",
    title: "Modern family home",
    type: "House",
    purpose: "Sale",
    city: "Accra",
    country: "Ghana",
    priceUsdt: 18500,
    beds: 4,
    baths: 3,
    area: "280 m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    agentId: "pioneer-realty",
    agent: "Pioneer Realty",
    verified: true,
    description: "Spacious modern home in a quiet neighborhood with a private garden.",
    amenities: ["Garden", "Security", "Garage", "Solar"],
  },
  {
    id: "nairobi-studio",
    title: "Central city studio",
    type: "Studio",
    purpose: "Rent",
    city: "Nairobi",
    country: "Kenya",
    priceUsdt: 210,
    beds: 1,
    baths: 1,
    area: "48 m²",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=85",
    agentId: "urban-key",
    agent: "Urban Key",
    verified: true,
    description: "Compact city studio close to transport, shops, and business districts.",
    amenities: ["Wi-Fi", "Furnished", "Lift", "Security"],
  },
  {
    id: "dakar-land",
    title: "Serviced residential land",
    type: "Land",
    purpose: "Sale",
    city: "Dakar",
    country: "Senegal",
    priceUsdt: 7200,
    beds: 0,
    baths: 0,
    area: "500 m²",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=85",
    agentId: "teranga-property",
    agent: "Teranga Property",
    verified: true,
    description: "Surveyed residential plot with road, water, and electricity access.",
    amenities: ["Surveyed", "Road access", "Utilities", "Residential"],
  },
];
const STORE_KEY = "smaj_housing_saved",
  VIEWING_KEY = "smaj_housing_viewings",
  LISTING_KEY = "smaj_housing_listings";
const readIds = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORE_KEY) || "[]"));
  } catch {
    return new Set<string>();
  }
};

const HousingHeader = () => (
  <header className="housing-header">
    <Link to="/app/services">← Hub</Link>
    <Link className="housing-brand" to="/services/housing">
      Housing
    </Link>
    <nav>
      <NavLink end to="/services/housing">
        Discover
      </NavLink>
      <NavLink to="/services/housing/search">Properties</NavLink>
      <NavLink to="/services/housing/saved">Saved</NavLink>
      <NavLink to="/services/housing/viewings">Viewings</NavLink>
      <NavLink to="/services/housing/landlord">List property</NavLink>
    </nav>
    <ServiceMobileMenu
      title="SMAJ Housing"
      accent="#315c82"
      items={[
        { label: "Discover", to: "/services/housing" },
        { label: "Properties", to: "/services/housing/search" },
        { label: "Saved", to: "/services/housing/saved" },
        { label: "Compare", to: "/services/housing/compare" },
        { label: "Viewings", to: "/services/housing/viewings" },
        { label: "List property", to: "/services/housing/landlord" },
        { label: "Add property", to: "/services/housing/add" },
      ]}
    />
  </header>
);
const PropertyCard = ({ property, saved, onSave }: { property: Property; saved: boolean; onSave: () => void }) => (
  <article className="housing-card">
    <Link to={`/services/housing/property/${property.id}`}>
      <img src={property.image} alt={property.title} />
      <div>
        <small>
          {property.purpose} · {property.type}
        </small>
        <h2>{property.title}</h2>
        <p>
          <LocationOnOutlinedIcon />
          {property.city}, {property.country}
        </p>
        <strong>
          {formatServicePrice(property.priceUsdt)} {property.purpose === "Rent" ? "/ month" : ""}
        </strong>
        <span>
          {property.beds || "—"} beds · {property.baths || "—"} baths · {property.area}
        </span>
      </div>
    </Link>
    <button className={saved ? "saved" : ""} onClick={onSave} aria-label="Save property">
      <BookmarkBorderOutlinedIcon />
    </button>
  </article>
);

const HousingPage = ({ kind = "home" }: { kind?: HousingPageKind }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [type, setType] = useState("All");
  const [purpose, setPurpose] = useState("All");
  const [saved, setSaved] = useState(readIds);
  const [compare, setCompare] = useState<Set<string>>(
    () => new Set((params.get("ids") || "").split(",").filter(Boolean))
  );
  const [message, setMessage] = useState("");
  const property = properties.find(item => item.id === id);
  const agentProperties = properties.filter(item => item.agentId === id);
  const visible = useMemo(
    () =>
      properties.filter(
        item =>
          (type === "All" || item.type === type) &&
          (purpose === "All" || item.purpose === purpose) &&
          `${item.title} ${item.city} ${item.country} ${item.agent}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, type, purpose]
  );
  const toggleSave = (propertyId: string) =>
    setSaved(current => {
      const next = new Set(current);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      localStorage.setItem(STORE_KEY, JSON.stringify([...next]));
      return next;
    });
  const requestViewing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const current = JSON.parse(localStorage.getItem(VIEWING_KEY) || "[]");
    current.unshift({
      id: `VIEW-${window.crypto.randomUUID()}`,
      propertyId: property.id,
      title: property.title,
      agent: property.agent,
      status: "Requested",
      ...form,
    });
    localStorage.setItem(VIEWING_KEY, JSON.stringify(current));
    setMessage("Viewing request sent.");
    event.currentTarget.reset();
  };
  const addListing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const current = JSON.parse(localStorage.getItem(LISTING_KEY) || "[]");
    current.unshift({ id: `LIST-${window.crypto.randomUUID()}`, status: "Draft", ...form });
    localStorage.setItem(LISTING_KEY, JSON.stringify(current));
    setMessage("Property saved to your landlord dashboard.");
    navigate("/services/housing/landlord");
  };
  const viewings = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(VIEWING_KEY) || "[]") as Array<Record<string, string>>;
    } catch {
      return [];
    }
  }, []);
  const listings = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(LISTING_KEY) || "[]") as Array<Record<string, string>>;
    } catch {
      return [];
    }
  }, []);
  const cards = (items: Property[]) => (
    <div className="housing-grid">
      {items.map(item => (
        <div className="housing-card-wrap" key={item.id}>
          <PropertyCard property={item} saved={saved.has(item.id)} onSave={() => toggleSave(item.id)} />
          <button
            className={compare.has(item.id) ? "compare active" : "compare"}
            onClick={() =>
              setCompare(current => {
                const next = new Set(current);
                if (next.has(item.id)) next.delete(item.id);
                else if (next.size < 3) next.add(item.id);
                return next;
              })
            }
          >
            <CompareArrowsOutlinedIcon /> Compare
          </button>
        </div>
      ))}
    </div>
  );
  let content;
  if (kind === "property" && property)
    content = (
      <section className="housing-detail">
        <Link to="/services/housing/search">← Back to properties</Link>
        <div className="housing-detail-hero">
          <img src={property.image} alt={property.title} />
          <div>
            <span>
              {property.purpose} · {property.type}
            </span>
            <h1>{property.title}</h1>
            <p>
              <LocationOnOutlinedIcon />
              {property.city}, {property.country}
            </p>
            <strong>{formatServicePrice(property.priceUsdt)}</strong>
            <p>{property.description}</p>
            <div>
              {property.amenities.map(a => (
                <small key={a}>{a}</small>
              ))}
            </div>
            <Link to={`/services/housing/agent/${property.agentId}`}>
              <VerifiedOutlinedIcon />
              {property.agent}
            </Link>
          </div>
        </div>
        <div className="housing-detail-columns">
          <article>
            <h2>Property details</h2>
            <p>
              {property.beds || "—"} bedrooms · {property.baths || "—"} bathrooms · {property.area}
            </p>
            <h2>Safety first</h2>
            <p>Verify ownership, visit the property, and never transfer funds outside an approved SMAJ flow.</p>
          </article>
          <form onSubmit={requestViewing}>
            <h2>Request a viewing</h2>
            <label>
              Date
              <input name="date" type="date" required />
            </label>
            <label>
              Time
              <input name="time" type="time" required />
            </label>
            <label>
              Full name
              <input name="name" required />
            </label>
            <label>
              Phone or email
              <input name="contact" required />
            </label>
            <textarea name="message" placeholder="Message to the agent" />
            <button>Send request</button>
            {message && <p>{message}</p>}
          </form>
        </div>
      </section>
    );
  else if (kind === "agent")
    content = (
      <section className="housing-inner">
        <div className="housing-agent">
          <span>{agentProperties[0]?.agent.slice(0, 2).toUpperCase()}</span>
          <div>
            <small>VERIFIED HOUSING AGENT</small>
            <h1>{agentProperties[0]?.agent || "Agent"}</h1>
            <p>Responsive local property specialist.</p>
          </div>
        </div>
        {cards(agentProperties)}
      </section>
    );
  else if (kind === "viewings")
    content = (
      <section className="housing-inner">
        <h1>My viewings</h1>
        {viewings.length ? (
          <div className="housing-records">
            {viewings.map(v => (
              <article key={v.id}>
                <ApartmentOutlinedIcon />
                <div>
                  <h2>{v.title}</h2>
                  <p>
                    {v.date} at {v.time} · {v.agent}
                  </p>
                </div>
                <b>{v.status}</b>
              </article>
            ))}
          </div>
        ) : (
          <div className="housing-empty">No viewing requests yet.</div>
        )}
      </section>
    );
  else if (kind === "landlord")
    content = (
      <section className="housing-inner">
        <div className="housing-heading">
          <div>
            <small>LANDLORD WORKSPACE</small>
            <h1>Manage properties</h1>
          </div>
          <Link to="/services/housing/add">Add property</Link>
        </div>
        <div className="housing-stats">
          <article>
            <strong>{listings.length}</strong>
            <span>Listings</span>
          </article>
          <article>
            <strong>{viewings.length}</strong>
            <span>Viewing requests</span>
          </article>
          <article>
            <strong>0</strong>
            <span>Active leases</span>
          </article>
        </div>
        {listings.length ? (
          <div className="housing-records">
            {listings.map(v => (
              <article key={v.id}>
                <ApartmentOutlinedIcon />
                <div>
                  <h2>{v.title}</h2>
                  <p>
                    {v.city} · {v.type}
                  </p>
                </div>
                <b>{v.status}</b>
              </article>
            ))}
          </div>
        ) : (
          <div className="housing-empty">No landlord listings yet.</div>
        )}
      </section>
    );
  else if (kind === "add")
    content = (
      <section className="housing-inner">
        <h1>Add a property</h1>
        <form className="housing-form" onSubmit={addListing}>
          <label>
            Title
            <input name="title" required />
          </label>
          <div>
            <label>
              Type
              <select name="type">
                <option>Apartment</option>
                <option>House</option>
                <option>Studio</option>
                <option>Land</option>
              </select>
            </label>
            <label>
              Purpose
              <select name="purpose">
                <option>Rent</option>
                <option>Sale</option>
                <option>Short stay</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              City
              <input name="city" required />
            </label>
            <label>
              Country
              <input name="country" required />
            </label>
          </div>
          <label>
            Real-world price in USDT
            <input name="priceUsdt" type="number" min="1" required />
          </label>
          <label>
            Description
            <textarea name="description" rows={6} minLength={30} required />
          </label>
          <label>
            Image URL
            <input name="image" type="url" />
          </label>
          <button>Save property</button>
        </form>
      </section>
    );
  else {
    const items =
      kind === "saved"
        ? visible.filter(item => saved.has(item.id))
        : kind === "compare"
          ? visible.filter(item => compare.has(item.id))
          : visible;
    content = (
      <>
        <section className={kind === "home" ? "housing-hero" : "housing-search-head"}>
          <div>
            <small>VERIFIED HOMES. LOCAL EXPERTS.</small>
            <h1>{kind === "home" ? "Find a place that feels like home." : "Find your next property."}</h1>
            <p>Discover rentals, homes, land, and verified agents across the SMAJ ecosystem.</p>
            <form
              onSubmit={e => {
                e.preventDefault();
                navigate(`/services/housing/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <SearchOutlinedIcon />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="City, neighborhood, or property"
              />
              <button>Search</button>
            </form>
          </div>
        </section>
        <section className="housing-inner">
          <div className="housing-filters">
            <select value={purpose} onChange={e => setPurpose(e.target.value)}>
              <option>All</option>
              <option>Rent</option>
              <option>Sale</option>
            </select>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>All</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Studio</option>
              <option>Land</option>
            </select>
            <span>{items.length} properties</span>
            {compare.size > 1 && (
              <Link to={`/services/housing/compare?ids=${[...compare].join(",")}`}>Compare {compare.size}</Link>
            )}
          </div>
          {items.length ? cards(items) : <div className="housing-empty">No properties match your filters.</div>}
        </section>
      </>
    );
  }
  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="housing-page">
        <HousingHeader />
        {content}
        <nav className="housing-mobile-nav">
          <NavLink end to="/services/housing">
            Home
          </NavLink>
          <NavLink to="/services/housing/search">Search</NavLink>
          <NavLink to="/services/housing/saved">Saved</NavLink>
          <NavLink to="/services/housing/viewings">Viewings</NavLink>
        </nav>
      </main>
    </AppLayout>
  );
};
export default HousingPage;
