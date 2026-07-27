import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AgricultureOutlinedIcon from "@mui/icons-material/AgricultureOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import "./AgroPage.css";

export type AgroPageKind =
  | "home"
  | "search"
  | "saved"
  | "quotes"
  | "orders"
  | "farmer"
  | "add"
  | "requests"
  | "product"
  | "supplier";
type AgroProduct = {
  id: string;
  name: string;
  category: string;
  pricePi: number;
  unit: string;
  minimum: number;
  location: string;
  harvest: string;
  stock: number;
  image: string;
  supplier: string;
  supplierId: string;
  verified: boolean;
  description: string;
};
const products: AgroProduct[] = [
  {
    id: "premium-maize",
    name: "Premium yellow maize",
    category: "Crops",
    pricePi: 4.8,
    unit: "50 kg bag",
    minimum: 5,
    location: "Kaduna, Nigeria",
    harvest: "Aug 2026",
    stock: 320,
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1000&q=85",
    supplier: "Green Field Cooperative",
    supplierId: "green-field",
    verified: true,
    description: "Clean, dry yellow maize suitable for food processing and animal feed.",
  },
  {
    id: "fresh-tomatoes",
    name: "Fresh market tomatoes",
    category: "Produce",
    pricePi: 2.2,
    unit: "20 kg crate",
    minimum: 3,
    location: "Nakuru, Kenya",
    harvest: "Weekly",
    stock: 85,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1000&q=85",
    supplier: "Rift Fresh Farms",
    supplierId: "rift-fresh",
    verified: true,
    description: "Firm, sorted tomatoes harvested to order for shops and restaurants.",
  },
  {
    id: "rice-seed",
    name: "Certified rice seed",
    category: "Seeds",
    pricePi: 1.6,
    unit: "10 kg pack",
    minimum: 2,
    location: "Kumasi, Ghana",
    harvest: "In stock",
    stock: 140,
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1000&q=85",
    supplier: "Pioneer Agro Inputs",
    supplierId: "pioneer-inputs",
    verified: true,
    description: "High-germination certified seed with planting and storage guidance.",
  },
  {
    id: "compact-tractor",
    name: "Compact farm tractor",
    category: "Equipment",
    pricePi: 4850,
    unit: "unit",
    minimum: 1,
    location: "Dakar, Senegal",
    harvest: "Ready",
    stock: 6,
    image: "https://images.unsplash.com/photo-1605338198618-d6c3f3b4c699?auto=format&fit=crop&w=1000&q=85",
    supplier: "SMAJ Farm Equipment",
    supplierId: "smaj-equipment",
    verified: true,
    description: "Fuel-efficient compact tractor for small and medium farms, with service support.",
  },
];
const SAVED = "smaj_agro_saved",
  QUOTES = "smaj_agro_quotes",
  ORDERS = "smaj_agro_orders",
  LISTINGS = "smaj_agro_listings",
  REQUESTS = "smaj_agro_requests";
const readSaved = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(SAVED) || "[]"));
  } catch {
    return new Set<string>();
  }
};
const readRecords = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as Array<Record<string, string | number>>;
  } catch {
    return [];
  }
};
const Header = () => (
  <header className="agro-header">
    <Link to="/app/services">← Hub</Link>
    <Link className="agro-brand" to="/services/agro">
      Agro
    </Link>
    <nav>
      <NavLink end to="/services/agro">
        Market
      </NavLink>
      <NavLink to="/services/agro/search">Products</NavLink>
      <NavLink to="/services/agro/quotes">Quotes</NavLink>
      <NavLink to="/services/agro/orders">Orders</NavLink>
      <NavLink to="/services/agro/farmer">Sell</NavLink>
    </nav>
  </header>
);
const ProductCard = ({ product, saved, onSave }: { product: AgroProduct; saved: boolean; onSave: () => void }) => (
  <article className="agro-card">
    <Link to={`/services/agro/product/${product.id}`}>
      <img src={product.image} alt={product.name} />
      <div>
        <small>{product.category}</small>
        <h2>{product.name}</h2>
        <p>
          <LocationOnOutlinedIcon />
          {product.location}
        </p>
        <strong>
          π {product.pricePi.toLocaleString()} / {product.unit}
        </strong>
        <span>
          Minimum {product.minimum} · {product.stock} available
        </span>
        <p>
          <VerifiedOutlinedIcon />
          {product.supplier}
        </p>
      </div>
    </Link>
    <button className={saved ? "saved" : ""} onClick={onSave}>
      <BookmarkBorderOutlinedIcon />
    </button>
  </article>
);

const AgroPage = ({ kind = "home" }: { kind?: AgroPageKind }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState(readSaved);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const product = products.find(item => item.id === id);
  const supplierProducts = products.filter(item => item.supplierId === id);
  const quotes = useMemo(() => readRecords(QUOTES), []),
    orders = useMemo(() => readRecords(ORDERS), []),
    listings = useMemo(() => readRecords(LISTINGS), []),
    requests = useMemo(() => readRecords(REQUESTS), []);
  const visible = useMemo(
    () =>
      products.filter(
        item =>
          (category === "All" || item.category === category) &&
          `${item.name} ${item.location} ${item.supplier}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, category]
  );
  const toggleSaved = (productId: string) =>
    setSaved(current => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      localStorage.setItem(SAVED, JSON.stringify([...next]));
      return next;
    });
  const addRecord = (key: string, record: Record<string, string | number>) => {
    const current = readRecords(key);
    current.unshift(record);
    localStorage.setItem(key, JSON.stringify(current));
  };
  const submitQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    addRecord(QUOTES, {
      id: `Q-${crypto.randomUUID()}`,
      productId: product.id,
      product: product.name,
      supplier: product.supplier,
      status: "Awaiting supplier",
      ...form,
    });
    setNotice("Quote request sent to the supplier.");
    event.currentTarget.reset();
  };
  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    addRecord(ORDERS, {
      id: `AG-${crypto.randomUUID()}`,
      product: product.name,
      supplier: product.supplier,
      quantity,
      total: product.pricePi * quantity,
      status: "Requested",
      ...form,
    });
    navigate("/services/agro/orders");
  };
  const addListing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    addRecord(LISTINGS, { id: `LIST-${crypto.randomUUID()}`, status: "Draft", ...form });
    navigate("/services/agro/farmer");
  };
  const addBuyerRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    addRecord(REQUESTS, { id: `REQ-${crypto.randomUUID()}`, status: "Open", ...form });
    setNotice("Buyer request published.");
    event.currentTarget.reset();
  };
  const cards = (items: AgroProduct[]) => (
    <div className="agro-grid">
      {items.map(item => (
        <ProductCard key={item.id} product={item} saved={saved.has(item.id)} onSave={() => toggleSaved(item.id)} />
      ))}
    </div>
  );
  const records = (items: Array<Record<string, string | number>>, empty: string) => (
    <div className="agro-records">
      {items.length ? (
        items.map(item => (
          <article key={String(item.id)}>
            <Inventory2OutlinedIcon />
            <div>
              <h2>{item.product || item.name || item.title}</h2>
              <p>{item.supplier || item.location || item.delivery}</p>
            </div>
            <b>{item.status}</b>
          </article>
        ))
      ) : (
        <div className="agro-empty">{empty}</div>
      )}
    </div>
  );
  let content;
  if (kind === "product" && product)
    content = (
      <section className="agro-detail">
        <Link to="/services/agro/search">← Back to market</Link>
        <div className="agro-detail-hero">
          <img src={product.image} alt={product.name} />
          <div>
            <small>{product.category}</small>
            <h1>{product.name}</h1>
            <p>
              <LocationOnOutlinedIcon />
              {product.location}
            </p>
            <strong>
              π {product.pricePi.toLocaleString()} / {product.unit}
            </strong>
            <p>{product.description}</p>
            <p>
              Harvest: {product.harvest} · Stock: {product.stock}
            </p>
            <Link to={`/services/agro/supplier/${product.supplierId}`}>
              <VerifiedOutlinedIcon />
              {product.supplier}
            </Link>
          </div>
        </div>
        <div className="agro-detail-actions">
          <form onSubmit={submitQuote}>
            <h2>Request a quote</h2>
            <label>
              Quantity
              <input name="quantity" type="number" min={product.minimum} required />
            </label>
            <label>
              Delivery location
              <input name="location" required />
            </label>
            <textarea name="message" placeholder="Quality, schedule, or packaging requirements" />
            <button>Send quote request</button>
            {notice && <p>{notice}</p>}
          </form>
          <form onSubmit={placeOrder}>
            <h2>Bulk order request</h2>
            <label>
              Quantity
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
                {[product.minimum, product.minimum * 2, product.minimum * 5].map(value => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Fulfilment
              <select name="delivery">
                <option>Supplier delivery</option>
                <option>Buyer pickup</option>
                <option>SMAJ Transport quote</option>
              </select>
            </label>
            <label>
              Contact
              <input name="contact" required />
            </label>
            <strong>Estimated total: π {(product.pricePi * quantity).toLocaleString()}</strong>
            <button>Request order</button>
            <p>Final price and Pi payment follow supplier confirmation.</p>
          </form>
        </div>
      </section>
    );
  else if (kind === "supplier")
    content = (
      <section className="agro-inner">
        <div className="agro-supplier">
          <AgricultureOutlinedIcon />
          <div>
            <small>VERIFIED AGRO SUPPLIER</small>
            <h1>{supplierProducts[0]?.supplier || "Supplier"}</h1>
            <p>{supplierProducts[0]?.location} · Trusted agricultural supply partner.</p>
          </div>
        </div>
        {cards(supplierProducts)}
      </section>
    );
  else if (kind === "quotes")
    content = (
      <section className="agro-inner">
        <h1>Quote requests</h1>
        {records(quotes, "No quote requests yet.")}
      </section>
    );
  else if (kind === "orders")
    content = (
      <section className="agro-inner">
        <h1>Agro orders</h1>
        {records(orders, "No agricultural orders yet.")}
      </section>
    );
  else if (kind === "requests")
    content = (
      <section className="agro-inner">
        <div className="agro-heading">
          <div>
            <small>BUYER REQUESTS</small>
            <h1>What buyers need</h1>
          </div>
        </div>
        {notice && <p className="agro-notice">{notice}</p>}
        <form className="agro-form" onSubmit={addBuyerRequest}>
          <label>
            Product needed
            <input name="title" required />
          </label>
          <div>
            <label>
              Quantity
              <input name="quantity" required placeholder="e.g. 200 bags" />
            </label>
            <label>
              Delivery location
              <input name="location" required />
            </label>
          </div>
          <label>
            Requirements
            <textarea name="requirements" minLength={20} rows={4} required />
          </label>
          <button>Publish request</button>
        </form>
        {records(requests, "No buyer requests published.")}
      </section>
    );
  else if (kind === "farmer")
    content = (
      <section className="agro-inner">
        <div className="agro-heading">
          <div>
            <small>FARMER WORKSPACE</small>
            <h1>Inventory and listings</h1>
          </div>
          <Link to="/services/agro/add">Add product</Link>
        </div>
        <div className="agro-stats">
          <article>
            <strong>{listings.length}</strong>
            <span>Listings</span>
          </article>
          <article>
            <strong>{quotes.length}</strong>
            <span>Quote requests</span>
          </article>
          <article>
            <strong>{orders.length}</strong>
            <span>Orders</span>
          </article>
        </div>
        {records(listings, "No farmer listings yet.")}
        <Link className="agro-buyer-link" to="/services/agro/requests">
          View buyer requests
        </Link>
      </section>
    );
  else if (kind === "add")
    content = (
      <section className="agro-inner">
        <h1>Add agricultural product</h1>
        <form className="agro-form" onSubmit={addListing}>
          <label>
            Product name
            <input name="name" required />
          </label>
          <div>
            <label>
              Category
              <select name="category">
                <option>Crops</option>
                <option>Produce</option>
                <option>Livestock</option>
                <option>Seeds</option>
                <option>Inputs</option>
                <option>Equipment</option>
              </select>
            </label>
            <label>
              Location
              <input name="location" required />
            </label>
          </div>
          <div>
            <label>
              Price in Pi
              <input name="price" type="number" min="0" step=".01" required />
            </label>
            <label>
              Unit
              <input name="unit" placeholder="50 kg bag" required />
            </label>
          </div>
          <div>
            <label>
              Available stock
              <input name="stock" type="number" min="1" required />
            </label>
            <label>
              Harvest/availability
              <input name="harvest" required />
            </label>
          </div>
          <label>
            Description
            <textarea name="description" minLength={30} rows={6} required />
          </label>
          <label>
            Image URL
            <input name="image" type="url" />
          </label>
          <button>Save listing</button>
        </form>
      </section>
    );
  else {
    const items = kind === "saved" ? visible.filter(item => saved.has(item.id)) : visible;
    content = (
      <>
        <section className={kind === "home" ? "agro-hero" : "agro-search-hero"}>
          <div>
            <small>FARMS. MARKETS. OPPORTUNITY.</small>
            <h1>{kind === "home" ? "Grow, trade, and move agriculture forward." : "Find agricultural products."}</h1>
            <p>Connect verified farmers, buyers, suppliers, equipment, and delivery across the Pi economy.</p>
            <form
              onSubmit={e => {
                e.preventDefault();
                navigate(`/services/agro/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <SearchOutlinedIcon />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Produce, equipment, supplier, or location"
              />
              <button>Search market</button>
            </form>
          </div>
        </section>
        <section className="agro-inner">
          <div className="agro-categories">
            {["All", "Crops", "Produce", "Seeds", "Equipment"].map(item => (
              <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <div className="agro-heading">
            <div>
              <small>AGRO MARKETPLACE</small>
              <h1>{kind === "saved" ? "Saved products" : "Available now"}</h1>
            </div>
            <Link to="/services/agro/requests">Buyer requests</Link>
          </div>
          {items.length ? cards(items) : <div className="agro-empty">No products match your search.</div>}
        </section>
      </>
    );
  }
  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="agro-page">
        <Header />
        {content}
        <nav className="agro-mobile-nav">
          <NavLink end to="/services/agro">
            Market
          </NavLink>
          <NavLink to="/services/agro/search">Search</NavLink>
          <NavLink to="/services/agro/saved">Saved</NavLink>
          <NavLink to="/services/agro/orders">Orders</NavLink>
        </nav>
      </main>
    </AppLayout>
  );
};
export default AgroPage;
