import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import SafetyCheckRoundedIcon from "@mui/icons-material/SafetyCheckRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import AppLayout from "../../layouts/AppLayout";
import FlightsPage from "./FlightsPage";
import "./TransportPage.css";

type RideType = {
  id: string;
  name: string;
  note: string;
  eta: string;
  seats: number;
  price: number;
  icon: "bike" | "car" | "van";
  popular?: boolean;
};

type Trip = {
  id: string;
  pickup: string;
  destination: string;
  rideName: string;
  price: number;
  status: "active" | "completed" | "cancelled";
  date: string;
};

const rides: RideType[] = [
  { id: "bike", name: "SMAJ Bike", note: "Quick and affordable", eta: "2 min", seats: 1, price: 1.8, icon: "bike" },
  { id: "economy", name: "Economy", note: "Everyday rides", eta: "4 min", seats: 4, price: 3.6, icon: "car", popular: true },
  { id: "comfort", name: "Comfort", note: "Newer, spacious cars", eta: "6 min", seats: 4, price: 5.2, icon: "car" },
  { id: "delivery", name: "Delivery", note: "Send packages safely", eta: "8 min", seats: 0, price: 4.4, icon: "van" },
];

const savedPlaces = [
  { label: "Home", address: "18 Pioneer Avenue" },
  { label: "Work", address: "SMAJ Innovation District" },
];

const sampleTrips: Trip[] = [
  { id: "SMJ-4821", pickup: "SMAJ Innovation District", destination: "Central Market", rideName: "Economy", price: 3.8, status: "completed", date: "22 Jul, 14:30" },
  { id: "SMJ-4759", pickup: "Pioneer Avenue", destination: "International Airport", rideName: "Comfort", price: 8.4, status: "completed", date: "18 Jul, 09:15" },
];

const RideIcon = ({ type }: { type: RideType["icon"] }) => type === "bike"
  ? <DirectionsBikeRoundedIcon />
  : type === "van" ? <LocalShippingRoundedIcon /> : <DirectionsCarRoundedIcon />;

const getStoredTrips = (): Trip[] => {
  try {
    const value = window.localStorage.getItem("smaj-transport-trips");
    return value ? JSON.parse(value) as Trip[] : sampleTrips;
  } catch {
    return sampleTrips;
  }
};

const TransportHeader = ({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) => (
  <header className="transport-header">
    <Link className="transport-brand" to="/services/transport">
      <span><RouteRoundedIcon /></span>
      <div><b>SMAJ</b><small>TRANSPORT</small></div>
    </Link>
    <nav aria-label="Transport navigation">
      <NavLink end to="/services/transport">Ride</NavLink>
      <NavLink to="/services/transport/flights">Flights</NavLink>
      <NavLink to="/services/transport/trips">My trips</NavLink>
      <NavLink to="/services/transport/wallet">Wallet</NavLink>
      <NavLink to="/services/transport/driver">Drive with us</NavLink>
    </nav>
    <div className="transport-header-actions">
      <Link to="/app/services"><ArrowBackRoundedIcon /> Hub</Link>
      <Link className="transport-profile" to="/profile"><PersonRoundedIcon /></Link>
      <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><MenuRoundedIcon /></button>
    </div>
    {menuOpen ? <div className="transport-mobile-menu">
      <NavLink end to="/services/transport" onClick={() => setMenuOpen(false)}>Book a ride</NavLink>
      <NavLink to="/services/transport/flights" onClick={() => setMenuOpen(false)}>Book a flight</NavLink>
      <NavLink to="/services/transport/trips" onClick={() => setMenuOpen(false)}>My trips</NavLink>
      <NavLink to="/services/transport/wallet" onClick={() => setMenuOpen(false)}>Wallet</NavLink>
      <NavLink to="/services/transport/driver" onClick={() => setMenuOpen(false)}>Drive with us</NavLink>
      <Link to="/app/services">Back to SMAJ Hub</Link>
    </div> : null}
  </header>
);

const MapCanvas = ({ pickup, destination, tracking = false }: { pickup: string; destination: string; tracking?: boolean }) => (
  <div className={`transport-map ${tracking ? "is-tracking" : ""}`} aria-label="Route preview map">
    <div className="map-grid" />
    <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
    <span className="map-place place-one">Pioneer Park</span>
    <span className="map-place place-two">Central Market</span>
    <span className="map-place place-three">Innovation District</span>
    <span className="map-pin pickup-pin"><i />{pickup || "Pickup"}</span>
    {destination ? <><span className="map-route-line" /><span className="map-pin destination-pin"><i />{destination}</span></> : null}
    {tracking ? <span className="driver-marker"><DirectionsCarRoundedIcon /><i>3 min</i></span> : null}
    <button type="button" className="map-location-button" aria-label="Use my current location"><MyLocationRoundedIcon /></button>
    <div className="map-status"><span /> Live driver network <b>128 nearby</b></div>
  </div>
);

const TransportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickup, setPickup] = useState("Current location");
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState("economy");
  const [bookingStep, setBookingStep] = useState<"idle" | "choose" | "review" | "matching" | "confirmed">("idle");
  const [trips, setTrips] = useState<Trip[]>(getStoredTrips);
  const [driverOnline, setDriverOnline] = useState(false);
  const [notice, setNotice] = useState("");
  const activeRide = rides.find((ride) => ride.id === selectedRide) ?? rides[1];
  const path = location.pathname.replace("/app/services/transport", "/services/transport");
  const section = path.split("/services/transport/")[1] || "home";

  useEffect(() => {
    window.localStorage.setItem("smaj-transport-trips", JSON.stringify(trips));
  }, [trips]);
  const quote = useMemo(() => {
    const distanceFactor = Math.max(1, Math.min(2.4, destination.trim().length / 12));
    return Number((activeRide.price * distanceFactor).toFixed(2));
  }, [activeRide.price, destination]);

  const startBooking = (event?: FormEvent) => {
    event?.preventDefault();
    if (!destination.trim()) {
      setNotice("Choose a destination to see available rides.");
      return;
    }
    setNotice("");
    setBookingStep("choose");
    navigate("/services/transport/book");
  };

  const confirmBooking = () => {
    setBookingStep("matching");
    window.setTimeout(() => {
      const trip: Trip = {
        id: `SMJ-${Math.floor(1000 + Math.random() * 8999)}`,
        pickup,
        destination,
        rideName: activeRide.name,
        price: quote,
        status: "active",
        date: "Now",
      };
      setTrips((current) => [trip, ...current.filter((item) => item.status !== "active")]);
      setBookingStep("confirmed");
    }, 1300);
  };

  const completeTrip = () => {
    setTrips((current) => current.map((trip) => trip.status === "active" ? { ...trip, status: "completed", date: "Today" } : trip));
    setBookingStep("idle");
    setDestination("");
    navigate("/services/transport/trips");
  };

  const home = <div className="transport-home">
    <section className="transport-booking">
      <div className="transport-booking-copy">
        <span className="transport-eyebrow"><SafetyCheckRoundedIcon /> VERIFIED RIDES. POWERED BY PI.</span>
        <h1>Your city,<br /><em>within reach.</em></h1>
        <p>Book trusted drivers, move packages, and pay seamlessly with Pi—all from one place.</p>
      </div>
      <form className="transport-search-card" onSubmit={startBooking}>
        <div className="transport-card-heading"><div><span>BOOK A RIDE</span><h2>Where are you going?</h2></div><ScheduleRoundedIcon /></div>
        <label><i className="pickup-dot" /><span>Pickup</span><input value={pickup} onChange={(event) => setPickup(event.target.value)} aria-label="Pickup location" /></label>
        <div className="transport-input-line" />
        <label><i className="destination-dot" /><span>Destination</span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Enter destination" aria-label="Destination" autoComplete="street-address" /></label>
        <div className="transport-saved-places">{savedPlaces.map((place) => <button type="button" key={place.label} onClick={() => setDestination(place.address)}><HomeRoundedIcon /><span><b>{place.label}</b><small>{place.address}</small></span></button>)}</div>
        {notice ? <p className="transport-form-notice" role="alert">{notice}</p> : null}
        <button className="transport-main-button" type="submit">Find a ride <ArrowForwardRoundedIcon /></button>
      </form>
    </section>
    <section className="transport-map-section"><MapCanvas pickup={pickup} destination={destination} /></section>
    <section className="transport-promise">
      <div><span>WHY SMAJ TRANSPORT</span><h2>Move with confidence.</h2></div>
      <article><VerifiedUserRoundedIcon /><h3>Verified drivers</h3><p>Every driver completes identity, vehicle, and safety checks.</p></article>
      <article><PaymentsRoundedIcon /><h3>Transparent Pi fares</h3><p>See the price before you book. Pay securely from your Pi wallet.</p></article>
      <article><SupportAgentRoundedIcon /><h3>Support that follows</h3><p>Share your trip and reach our safety team whenever you need help.</p></article>
    </section>
  </div>;

  const chooseRide = <section className="transport-choose-layout">
    <div className="transport-ride-panel">
      <button className="transport-back-button" type="button" onClick={() => { setBookingStep("idle"); navigate("/services/transport"); }}><ArrowBackRoundedIcon /> Change route</button>
      <span className="transport-eyebrow">AVAILABLE NEARBY</span>
      <h1>Choose your ride</h1>
      <div className="transport-route-summary"><i className="pickup-dot" /><div><small>FROM</small><b>{pickup}</b></div><span /><i className="destination-dot" /><div><small>TO</small><b>{destination}</b></div></div>
      <div className="transport-ride-list">{rides.map((ride) => <button type="button" key={ride.id} className={selectedRide === ride.id ? "selected" : ""} onClick={() => setSelectedRide(ride.id)}>
        <span className="ride-icon"><RideIcon type={ride.icon} /></span>
        <span className="ride-copy"><b>{ride.name}{ride.popular ? <small>POPULAR</small> : null}</b><small>{ride.eta} away · {ride.seats ? `${ride.seats} seats` : "Packages"}</small></span>
        <strong>π {(ride.price * Math.max(1, Math.min(2.4, destination.trim().length / 12))).toFixed(2)}</strong>
      </button>)}</div>
      <div className="transport-payment-row"><PaymentsRoundedIcon /><span><small>PAYMENT</small><b>Pi Wallet</b></span><button type="button">Change</button></div>
      <button className="transport-main-button" type="button" onClick={() => setBookingStep("review")}>Choose {activeRide.name} · π {quote.toFixed(2)}</button>
    </div>
    <MapCanvas pickup={pickup} destination={destination} />
  </section>;

  const tripsPage = <section className="transport-inner-page">
    <header><span className="transport-eyebrow">YOUR JOURNEYS</span><h1>My trips</h1><p>Track an active ride or revisit where you have been.</p></header>
    <div className="transport-trip-tabs"><button className="active">All trips</button><button>Completed</button><button>Cancelled</button></div>
    <div className="transport-trip-list">{trips.map((trip) => <article key={trip.id} className={trip.status === "active" ? "active-trip" : ""}>
      <div className="trip-date"><span><DirectionsCarRoundedIcon /></span><small>{trip.date}</small></div>
      <div className="trip-route"><b>{trip.pickup}</b><span /><b>{trip.destination}</b><small>{trip.rideName} · {trip.id}</small></div>
      <div className="trip-price"><strong>π {trip.price.toFixed(2)}</strong><span className={`trip-status ${trip.status}`}>{trip.status}</span>{trip.status === "active" ? <button onClick={() => { setBookingStep("confirmed"); navigate("/services/transport/track"); }}>Track ride</button> : <button onClick={() => { setPickup(trip.pickup); setDestination(trip.destination); setBookingStep("choose"); navigate("/services/transport/book"); }}>Book again</button>}</div>
    </article>)}</div>
  </section>;

  const walletPage = <section className="transport-inner-page transport-wallet-page">
    <header><span className="transport-eyebrow">PAYMENTS & REWARDS</span><h1>Transport wallet</h1><p>Manage ride payments and see your transport rewards.</p></header>
    <div className="wallet-balance-card"><span>AVAILABLE PI BALANCE</span><strong>π 248.60</strong><small>Connected as pioneer@smaj</small><div><button>Add Pi</button><button>View activity</button></div></div>
    <div className="wallet-content-grid"><article><h2>Payment method</h2><div className="wallet-method"><span>π</span><div><b>Pi Wallet</b><small>Primary · Connected</small></div><CheckCircleRoundedIcon /></div></article><article><h2>SMAJ rewards</h2><strong>1,280</strong><p>points earned from safe, completed trips</p><button>Explore rewards <ArrowForwardRoundedIcon /></button></article></div>
  </section>;

  const driverPage = <section className="transport-driver-page">
    <div className="driver-hero"><div><span className="transport-eyebrow">DRIVE. EARN. GROW.</span><h1>Move your city<br /><em>on your terms.</em></h1><p>Join a verified driver community, choose your hours, and earn directly in Pi.</p><div><button className="transport-main-button" onClick={() => setDriverOnline(true)}>Start driving</button><a href="#driver-requirements">See requirements</a></div></div><aside><span>ESTIMATED WEEKLY EARNINGS</span><strong>π 186–260</strong><p>Based on 25 active hours</p><div><b>0%</b><small>sign-up fee</small></div><div><b>24/7</b><small>driver support</small></div></aside></div>
    <div id="driver-requirements" className="driver-requirements"><div><span>GET STARTED</span><h2>Ready in three steps.</h2></div>{["Create your driver profile", "Verify your vehicle and identity", "Go online and accept trips"].map((text, index) => <article key={text}><b>0{index + 1}</b><h3>{text}</h3><p>{["Tell us about yourself and where you want to drive.", "Submit your documents for our secure review.", "Set your own availability and receive ride requests."][index]}</p></article>)}</div>
    {driverOnline ? <div className="driver-online-card"><button onClick={() => setDriverOnline(false)}><CloseRoundedIcon /></button><span className="online-pulse" /><h2>You are online</h2><p>Looking for a nearby ride request…</p><strong>Today · π 0.00</strong></div> : null}
  </section>;

  const activeTrip = trips.find((trip) => trip.status === "active");
  const trackingPage = <section className="transport-tracking">
    <MapCanvas pickup={activeTrip?.pickup || pickup} destination={activeTrip?.destination || destination} tracking />
    <aside><div className="tracking-handle" /><span className="transport-eyebrow">DRIVER IS ON THE WAY</span><h1>Meet Malik in 3 min</h1><div className="driver-profile"><span>MK</span><div><b>Malik K.</b><small><StarRoundedIcon /> 4.96 · 520 trips</small></div><strong>Toyota Corolla<br /><small>SMAJ 428</small></strong></div><div className="tracking-progress"><span className="active" /><span /><span /></div><div className="tracking-details"><p><LocationOnRoundedIcon /><span><small>PICKUP</small><b>{activeTrip?.pickup || pickup}</b></span></p><p><PaymentsRoundedIcon /><span><small>FARE</small><b>π {(activeTrip?.price || quote).toFixed(2)} · Pi Wallet</b></span></p></div><div className="tracking-actions"><button>Contact driver</button><button>Safety</button></div><button className="transport-main-button" onClick={completeTrip}>Demo: complete trip</button></aside>
  </section>;

  let content = home;
  if (bookingStep === "choose" || section === "book") content = chooseRide;
  if (section === "trips") content = tripsPage;
  if (section === "wallet") content = walletPage;
  if (section === "driver") content = driverPage;
  if (section === "flights" || section.startsWith("flights/")) content = <FlightsPage />;
  if (section === "track" || bookingStep === "confirmed") content = trackingPage;

  return <AppLayout showHeader={false} showFooter={false}>
    <main className="transport-app">
      <TransportHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {content}
      {bookingStep === "review" ? <div className="transport-modal-layer"><button className="transport-modal-overlay" aria-label="Close" onClick={() => setBookingStep("choose")} /><section className="transport-review-modal"><button className="modal-close" onClick={() => setBookingStep("choose")}><CloseRoundedIcon /></button><span className="ride-icon"><RideIcon type={activeRide.icon} /></span><span className="transport-eyebrow">CONFIRM YOUR RIDE</span><h2>{activeRide.name} is {activeRide.eta} away</h2><div><p><small>PICKUP</small><b>{pickup}</b></p><p><small>DESTINATION</small><b>{destination}</b></p><p><small>PAY WITH</small><b>Pi Wallet</b></p><p><small>TOTAL FARE</small><b>π {quote.toFixed(2)}</b></p></div><button className="transport-main-button" onClick={confirmBooking}>Confirm and request ride</button><small>By confirming, you agree to the estimated fare and safety terms.</small></section></div> : null}
      {bookingStep === "matching" ? <div className="transport-modal-layer"><div className="transport-matching"><span><DirectionsCarRoundedIcon /></span><h2>Finding your driver…</h2><p>Matching you with a nearby verified driver.</p><i /></div></div> : null}
      <nav className="transport-bottom-nav"><NavLink end to="/services/transport"><HomeRoundedIcon /><span>Ride</span></NavLink><NavLink to="/services/transport/flights"><FlightRoundedIcon /><span>Flights</span></NavLink><NavLink to="/services/transport/trips"><HistoryRoundedIcon /><span>Trips</span></NavLink><NavLink to="/services/transport/wallet"><PaymentsRoundedIcon /><span>Wallet</span></NavLink><NavLink to="/services/transport/driver"><PersonRoundedIcon /><span>Drive</span></NavLink></nav>
    </main>
  </AppLayout>;
};

export default TransportPage;
