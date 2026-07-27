import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import { formatServicePrice, piFromUsdt, PI_USDT_RATE } from "../../lib/piPricing";
import "./EventsPage.css";

export type EventsPageKind =
  | "home"
  | "search"
  | "saved"
  | "tickets"
  | "organizer"
  | "create"
  | "detail"
  | "checkout"
  | "ticket"
  | "venue";
type EventItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  venueId: string;
  organizer: string;
  organizerId: string;
  image: string;
  fromUsdt: number;
  description: string;
  tiers: Array<{ name: string; price: number; remaining: number }>;
};
const events: EventItem[] = [
  {
    id: "pi-build-summit",
    title: "Pi Builders Summit",
    category: "Technology",
    date: "2026-09-12",
    time: "09:00",
    city: "Lagos",
    venue: "Pioneer Convention Centre",
    venueId: "pioneer-centre",
    organizer: "SMAJ Community",
    organizerId: "smaj-community",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1100&q=85",
    fromUsdt: 35,
    description: "A full day of product talks, workshops, founder stories, and community networking.",
    tiers: [
      { name: "General", price: 35, remaining: 180 },
      { name: "Builder", price: 65, remaining: 70 },
      { name: "VIP", price: 120, remaining: 20 },
    ],
  },
  {
    id: "afrobeats-night",
    title: "Afrobeats City Night",
    category: "Music",
    date: "2026-10-03",
    time: "19:30",
    city: "Accra",
    venue: "Independence Arena",
    venueId: "independence-arena",
    organizer: "Pulse Live",
    organizerId: "pulse-live",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1100&q=85",
    fromUsdt: 22,
    description: "Live artists, DJs, food, and an unforgettable celebration of African sound.",
    tiers: [
      { name: "Standard", price: 22, remaining: 320 },
      { name: "Front row", price: 48, remaining: 60 },
    ],
  },
  {
    id: "startup-market",
    title: "Startup & Creator Market",
    category: "Business",
    date: "2026-08-22",
    time: "11:00",
    city: "Nairobi",
    venue: "Urban Works Hall",
    venueId: "urban-works",
    organizer: "Build Africa",
    organizerId: "build-africa",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1100&q=85",
    fromUsdt: 12,
    description: "Discover new products, meet creators, and join practical business sessions.",
    tiers: [
      { name: "Entry", price: 12, remaining: 240 },
      { name: "Exhibitor", price: 80, remaining: 25 },
    ],
  },
  {
    id: "wellness-weekend",
    title: "Wellness Weekend",
    category: "Lifestyle",
    date: "2026-11-14",
    time: "08:30",
    city: "Dakar",
    venue: "Ocean Garden",
    venueId: "ocean-garden",
    organizer: "Nia Wellness",
    organizerId: "nia-wellness",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1100&q=85",
    fromUsdt: 18,
    description: "Movement, mindfulness, healthy food, and guided wellness sessions.",
    tiers: [
      { name: "Day pass", price: 18, remaining: 90 },
      { name: "Full weekend", price: 42, remaining: 45 },
    ],
  },
];
const SAVED = "smaj_event_saved",
  TICKETS = "smaj_event_tickets",
  CREATED = "smaj_created_events";
const readSaved = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(SAVED) || "[]"));
  } catch {
    return new Set<string>();
  }
};
const Header = () => (
  <header className="events-header">
    <Link to="/app/services">← Hub</Link>
    <Link className="events-brand" to="/services/events">
      Events
    </Link>
    <nav>
      <NavLink end to="/services/events">
        Discover
      </NavLink>
      <NavLink to="/services/events/search">Browse</NavLink>
      <NavLink to="/services/events/saved">Saved</NavLink>
      <NavLink to="/services/events/tickets">My tickets</NavLink>
      <NavLink to="/services/events/organizer">Organize</NavLink>
    </nav>
  </header>
);
const Card = ({ event, saved, onSave }: { event: EventItem; saved: boolean; onSave: () => void }) => (
  <article className="event-card">
    <Link to={`/services/events/event/${event.id}`}>
      <img src={event.image} alt={event.title} />
      <div>
        <small>{event.category}</small>
        <h2>{event.title}</h2>
        <p>
          <CalendarMonthOutlinedIcon />
          {new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {event.time}
        </p>
        <p>
          <LocationOnOutlinedIcon />
          {event.venue}, {event.city}
        </p>
        <strong>From {formatServicePrice(event.fromUsdt)}</strong>
      </div>
    </Link>
    <button className={saved ? "saved" : ""} onClick={onSave}>
      <BookmarkBorderOutlinedIcon />
    </button>
  </article>
);

const EventsPage = ({ kind = "home" }: { kind?: EventsPageKind }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState(readSaved);
  const [selectedTier, setSelectedTier] = useState("");
  const [quantity, setQuantity] = useState(1);
  const event = events.find(item => item.id === id);
  const organizerEvents = events.filter(item => item.organizerId === id);
  const venueEvents = events.filter(item => item.venueId === id);
  const visible = useMemo(
    () =>
      events.filter(
        item =>
          (category === "All" || item.category === category) &&
          `${item.title} ${item.city} ${item.venue} ${item.organizer}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, category]
  );
  const toggleSaved = (eventId: string) =>
    setSaved(current => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      localStorage.setItem(SAVED, JSON.stringify([...next]));
      return next;
    });
  const readTickets = () => {
    try {
      return JSON.parse(localStorage.getItem(TICKETS) || "[]") as Array<Record<string, string | number>>;
    } catch {
      return [];
    }
  };
  const tickets = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(TICKETS) || "[]") as Array<Record<string, string | number>>;
    } catch {
      return [];
    }
  }, []);
  const created = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(CREATED) || "[]") as Array<Record<string, string>>;
    } catch {
      return [];
    }
  }, []);
  const checkout = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!event) return;
    const tier = event.tiers.find(item => item.name === (selectedTier || params.get("tier"))) || event.tiers[0];
    if (!tier) return;
    const form = Object.fromEntries(new FormData(formEvent.currentTarget));
    const ticket = {
      id: `TKT-${crypto.randomUUID()}`,
      eventId: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      city: event.city,
      tier: tier.name,
      quantity,
      total: piFromUsdt(tier.price * quantity),
      totalUsdt: tier.price * quantity,
      piRateUsed: PI_USDT_RATE,
      status: "Confirmed",
      ...form,
    };
    const current = readTickets();
    current.unshift(ticket);
    localStorage.setItem(TICKETS, JSON.stringify(current));
    sessionStorage.setItem("smaj_latest_event_ticket", JSON.stringify(ticket));
    navigate(`/services/events/ticket/${ticket.id}`);
  };
  const createEvent = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const form = Object.fromEntries(new FormData(formEvent.currentTarget));
    const current = JSON.parse(localStorage.getItem(CREATED) || "[]");
    current.unshift({ id: `EVT-${crypto.randomUUID()}`, status: "Draft", ticketsSold: "0", ...form });
    localStorage.setItem(CREATED, JSON.stringify(current));
    navigate("/services/events/organizer");
  };
  const cards = (items: EventItem[]) => (
    <div className="events-grid">
      {items.map(item => (
        <Card key={item.id} event={item} saved={saved.has(item.id)} onSave={() => toggleSaved(item.id)} />
      ))}
    </div>
  );
  let content;
  if (kind === "detail" && event)
    content = (
      <section className="event-detail">
        <Link to="/services/events/search">← Back to events</Link>
        <div className="event-detail-hero">
          <img src={event.image} alt={event.title} />
          <div>
            <small>{event.category}</small>
            <h1>{event.title}</h1>
            <p>
              <CalendarMonthOutlinedIcon />
              {event.date} at {event.time}
            </p>
            <p>
              <LocationOnOutlinedIcon />
              {event.venue}, {event.city}
            </p>
            <Link to={`/services/events/organizer/${event.organizerId}`}>
              <VerifiedOutlinedIcon />
              {event.organizer}
            </Link>
            <p>{event.description}</p>
          </div>
        </div>
        <div className="event-detail-grid">
          <article>
            <h2>Choose tickets</h2>
            {event.tiers.map(tier => (
              <button
                key={tier.name}
                className={selectedTier === tier.name ? "selected" : ""}
                onClick={() => setSelectedTier(tier.name)}
              >
                <span>
                  <b>{tier.name}</b>
                  <small>{tier.remaining} remaining</small>
                </span>
                <strong>{formatServicePrice(tier.price)}</strong>
              </button>
            ))}
          </article>
          <aside>
            <h2>Ready to attend?</h2>
            <p>Select a ticket tier to continue.</p>
            <button
              disabled={!selectedTier}
              onClick={() => navigate(`/services/events/checkout/${event.id}?tier=${encodeURIComponent(selectedTier)}`)}
            >
              Continue to checkout
            </button>
            <Link to={`/services/events/venue/${event.venueId}`}>View venue</Link>
          </aside>
        </div>
      </section>
    );
  else if (kind === "checkout" && event) {
    const tierName = params.get("tier") || event.tiers[0].name;
    const tier = event.tiers.find(item => item.name === tierName) || event.tiers[0];
    content = (
      <section className="events-inner">
        <h1>Ticket checkout</h1>
        <div className="event-checkout">
          <form onSubmit={checkout}>
            <h2>Attendee information</h2>
            <label>
              Full name
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Quantity
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </label>
            <label className="event-terms">
              <input type="checkbox" required />I accept the event and cancellation conditions.
            </label>
            <button>Confirm ticket · {formatServicePrice(tier.price * quantity)}</button>
            <p>Pi payment integration will activate when the event payment backend is enabled.</p>
          </form>
          <aside>
            <img src={event.image} alt="" />
            <h2>{event.title}</h2>
            <p>
              {event.date} · {event.venue}
            </p>
            <strong>
              {tier.name} × {quantity}
            </strong>
          </aside>
        </div>
      </section>
    );
  } else if (kind === "ticket") {
    let ticket: Record<string, string | number> | null = null;
    try {
      ticket = JSON.parse(sessionStorage.getItem("smaj_latest_event_ticket") || "null");
    } catch {
      ticket = null;
    }
    content = (
      <section className="events-inner event-ticket-page">
        {ticket ? (
          <article className="event-ticket">
            <small>CONFIRMED TICKET</small>
            <h1>{ticket.title}</h1>
            <QrCode2OutlinedIcon />
            <strong>{ticket.id}</strong>
            <p>
              {ticket.date} at {ticket.time}
            </p>
            <p>
              {ticket.venue}, {ticket.city}
            </p>
            <div>
              <span>
                {ticket.tier} × {ticket.quantity}
              </span>
              <b>{formatServicePrice(Number(ticket.totalUsdt ?? 0))}</b>
            </div>
            <button onClick={() => window.print()}>Download ticket</button>
          </article>
        ) : (
          <div className="events-empty">Ticket not found.</div>
        )}
      </section>
    );
  } else if (kind === "tickets")
    content = (
      <section className="events-inner">
        <h1>My tickets</h1>
        {tickets.length ? (
          <div className="event-records">
            {tickets.map(ticket => (
              <article key={String(ticket.id)}>
                <ConfirmationNumberOutlinedIcon />
                <div>
                  <h2>{ticket.title}</h2>
                  <p>
                    {ticket.date} · {ticket.venue}
                  </p>
                </div>
                <b>{ticket.status}</b>
              </article>
            ))}
          </div>
        ) : (
          <div className="events-empty">No event tickets yet.</div>
        )}
      </section>
    );
  else if (kind === "organizer" && id)
    content = (
      <section className="events-inner">
        <div className="organizer-hero">
          <VerifiedOutlinedIcon />
          <div>
            <small>VERIFIED ORGANIZER</small>
            <h1>{organizerEvents[0]?.organizer || "Event organizer"}</h1>
            <p>Trusted events and community experiences.</p>
          </div>
        </div>
        {cards(organizerEvents)}
      </section>
    );
  else if (kind === "venue")
    content = (
      <section className="events-inner">
        <div className="organizer-hero">
          <LocationOnOutlinedIcon />
          <div>
            <small>EVENT VENUE</small>
            <h1>{venueEvents[0]?.venue || "Venue"}</h1>
            <p>{venueEvents[0]?.city} · Upcoming events</p>
          </div>
        </div>
        {cards(venueEvents)}
      </section>
    );
  else if (kind === "organizer")
    content = (
      <section className="events-inner">
        <div className="events-heading">
          <div>
            <small>ORGANIZER WORKSPACE</small>
            <h1>Manage events</h1>
          </div>
          <Link to="/services/events/create">Create event</Link>
        </div>
        <div className="event-stats">
          <article>
            <strong>{created.length}</strong>
            <span>Created events</span>
          </article>
          <article>
            <strong>{tickets.length}</strong>
            <span>Tickets issued</span>
          </article>
          <article>
            <strong>{tickets.reduce((sum, t) => sum + Number(t.total || 0), 0)}</strong>
            <span>Pi ticket value</span>
          </article>
        </div>
        {created.length ? (
          <div className="event-records">
            {created.map(item => (
              <article key={item.id}>
                <CalendarMonthOutlinedIcon />
                <div>
                  <h2>{item.title}</h2>
                  <p>
                    {item.date} · {item.city}
                  </p>
                </div>
                <b>{item.status}</b>
              </article>
            ))}
          </div>
        ) : (
          <div className="events-empty">No organizer events yet.</div>
        )}
      </section>
    );
  else if (kind === "create")
    content = (
      <section className="events-inner">
        <h1>Create an event</h1>
        <form className="event-form" onSubmit={createEvent}>
          <label>
            Event title
            <input name="title" required />
          </label>
          <div>
            <label>
              Category
              <select name="category">
                <option>Technology</option>
                <option>Music</option>
                <option>Business</option>
                <option>Lifestyle</option>
                <option>Sports</option>
              </select>
            </label>
            <label>
              City
              <input name="city" required />
            </label>
          </div>
          <div>
            <label>
              Date
              <input name="date" type="date" required />
            </label>
            <label>
              Time
              <input name="time" type="time" required />
            </label>
          </div>
          <label>
            Venue
            <input name="venue" required />
          </label>
          <label>
            Description
            <textarea name="description" minLength={30} rows={6} required />
          </label>
          <div>
            <label>
              Starting real-world price in USDT
              <input name="price" type="number" min="0" required />
            </label>
            <label>
              Capacity
              <input name="capacity" type="number" min="1" required />
            </label>
          </div>
          <button>Save event</button>
        </form>
      </section>
    );
  else {
    const items = kind === "saved" ? visible.filter(item => saved.has(item.id)) : visible;
    content = (
      <>
        <section className={kind === "home" ? "events-hero" : "events-search-hero"}>
          <div>
            <small>LIVE EXPERIENCES. POWERED BY PI.</small>
            <h1>{kind === "home" ? "Find your next unforgettable moment." : "Discover events near you."}</h1>
            <p>Explore concerts, conferences, markets, sports, and community experiences.</p>
            <form
              onSubmit={e => {
                e.preventDefault();
                navigate(`/services/events/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <SearchOutlinedIcon />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Event, venue, city, or organizer"
              />
              <button>Search events</button>
            </form>
          </div>
        </section>
        <section className="events-inner">
          <div className="event-categories">
            {["All", "Technology", "Music", "Business", "Lifestyle"].map(item => (
              <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <div className="events-heading">
            <div>
              <small>UPCOMING EVENTS</small>
              <h1>{kind === "saved" ? "Saved events" : "Popular experiences"}</h1>
            </div>
            <span>{items.length} events</span>
          </div>
          {items.length ? cards(items) : <div className="events-empty">No events match your selection.</div>}
        </section>
      </>
    );
  }
  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="events-page">
        <Header />
        {content}
        <nav className="events-mobile-nav">
          <NavLink end to="/services/events">
            Discover
          </NavLink>
          <NavLink to="/services/events/search">Browse</NavLink>
          <NavLink to="/services/events/saved">Saved</NavLink>
          <NavLink to="/services/events/tickets">Tickets</NavLink>
        </nav>
      </main>
    </AppLayout>
  );
};
export default EventsPage;
