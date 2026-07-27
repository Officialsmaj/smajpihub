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
import SafetyCheckRoundedIcon from "@mui/icons-material/SafetyCheckRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import AppLayout from "../../layouts/AppLayout";
import { transportApi } from "../../lib/transportApi";
import type { AdminTransportStats, TransportDriver, TransportReceipt, TransportVehicle } from "../../lib/transportApi";
import FlightsPage from "./FlightsPage";
import "./TransportPage.css";

type RideOption = {
  id: string;
  name: string;
  note: string;
  eta: string;
  seats: number;
  pricePerKm: number;
  icon: "bike" | "car" | "van";
  popular?: boolean;
};

const rideOptions: RideOption[] = [
  {
    id: "bike",
    name: "SMAJ Bike",
    note: "Quick and affordable",
    eta: "2 min",
    seats: 1,
    pricePerKm: 1.8,
    icon: "bike",
  },
  {
    id: "economy",
    name: "Economy",
    note: "Everyday rides",
    eta: "4 min",
    seats: 4,
    pricePerKm: 3.6,
    icon: "car",
    popular: true,
  },
  {
    id: "comfort",
    name: "Comfort",
    note: "Newer, spacious cars",
    eta: "6 min",
    seats: 4,
    pricePerKm: 5.2,
    icon: "car",
  },
  {
    id: "delivery",
    name: "Delivery",
    note: "Send packages safely",
    eta: "8 min",
    seats: 0,
    pricePerKm: 4.4,
    icon: "van",
  },
];

const savedPlaces = [
  { label: "Home", address: "18 Pioneer Avenue" },
  { label: "Work", address: "SMAJ Innovation District" },
];

const RideIcon = ({ type }: { type: RideOption["icon"] }) =>
  type === "bike" ? (
    <DirectionsBikeRoundedIcon />
  ) : type === "van" ? (
    <LocalShippingRoundedIcon />
  ) : (
    <DirectionsCarRoundedIcon />
  );

const normalizeStatus = (status: string): "active" | "completed" | "cancelled" | "pending" | "confirmed" => {
  if (status === "active" || status === "confirmed" || status === "in_progress") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

const TransportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickup, setPickup] = useState("Current location");
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState("economy");
  const [bookingStep, setBookingStep] = useState<"idle" | "choose" | "review" | "matching" | "confirmed">("idle");
  const [trips, setTrips] = useState<
    Array<{
      id: string;
      pickup: string;
      destination: string;
      rideName: string;
      price: number;
      status: "active" | "completed" | "cancelled" | "pending" | "confirmed";
      date: string;
      bookingId: string;
    }>
  >([]);
  const [driverOnline, setDriverOnline] = useState(false);
  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [receipts, setReceipts] = useState<TransportReceipt[]>([]);
  const [adminStats, setAdminStats] = useState<AdminTransportStats | null>(null);
  const [notice, setNotice] = useState("");
  const [loading] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<
    Array<{
      driverId: string;
      displayName: string;
      vehicleName: string;
      vehiclePlate: string;
      rating: number;
      isOnline: boolean;
      distanceKm?: number;
    }>
  >([]);
  const activeRide = rideOptions.find(ride => ride.id === selectedRide) ?? rideOptions[1];
  const path = location.pathname.replace("/app/services/transport", "/services/transport");
  const section = path.split("/services/transport/")[1] || "home";

  const fetchTrips = async () => {
    try {
      const data = await transportApi.getTrips();
      const mapped = data.map(t => ({
        id: t.tripId,
        pickup: t.pickup,
        destination: t.destination,
        rideName: t.vehicleType,
        price: t.farePi,
        status: normalizeStatus(t.status),
        date: new Date(t.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        bookingId: t.bookingId,
      }));
      setTrips(mapped);
    } catch {
      // Silently fail for trips fetch; localStorage fallback is not used when backend is available
    }
  };

  const fetchNearbyDrivers = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async pos => {
            const data = await transportApi.getNearbyDrivers(pos.coords.latitude, pos.coords.longitude);
            setNearbyDrivers(
              data.drivers.map(d => ({
                driverId: d.driverId,
                displayName: d.displayName,
                vehicleName: d.vehicleName,
                vehiclePlate: d.vehiclePlate,
                rating: d.rating,
                isOnline: d.isOnline,
                distanceKm: d.distanceKm,
              }))
            );
          },
          () => {}
        );
      }
    } catch {
      // Silently fail
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchTrips();
    fetchNearbyDrivers();
    void Promise.all([
      transportApi.getDrivers().catch(() => []),
      transportApi.getVehicles().catch(() => []),
      transportApi.getReceipts().catch(() => []),
      transportApi.getAdminStats().catch(() => null),
    ]).then(([nextDrivers, nextVehicles, nextReceipts, admin]) => {
      setDrivers(nextDrivers);
      setVehicles(nextVehicles);
      setReceipts(nextReceipts);
      setAdminStats(admin?.stats || null);
    });
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const quote = useMemo(() => {
    const distanceFactor = Math.max(1, Math.min(2.4, destination.trim().length / 12));
    return Number((activeRide.pricePerKm * distanceFactor).toFixed(2));
  }, [activeRide.pricePerKm, destination]);

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

  const confirmBooking = async () => {
    setBookingStep("matching");
    try {
      const booking = await transportApi.createRideBooking({
        pickup,
        destination,
        vehicleType: activeRide.id,
        etaMinutes: activeRide.seats > 0 ? 5 : 10,
        distanceKm: Math.max(1, Math.min(25, destination.trim().length / 3)),
        durationMin: activeRide.seats > 0 ? 15 : 30,
      });
      const trip = {
        id: booking.bookingId,
        pickup,
        destination,
        rideName: activeRide.name,
        price: booking.farePi,
        status: "active" as const,
        date: "Now",
        bookingId: booking.bookingId,
      };
      setTrips(current => [trip, ...current.filter(item => item.status !== "active")]);
      setBookingStep("confirmed");
    } catch {
      setBookingStep("idle");
      setNotice("Booking failed. Please try again.");
    }
  };

  const completeTrip = async () => {
    const active = trips.find(t => t.status === "active");
    if (active?.bookingId) {
      try {
        await transportApi.updateTripStatus(active.bookingId, "completed");
      } catch {
        // Silently fail; UI still updates
      }
    }
    setTrips(current =>
      current.map(trip => (trip.status === "active" ? { ...trip, status: "completed", date: "Today" } : trip))
    );
    setBookingStep("idle");
    setDestination("");
    navigate("/services/transport/trips");
  };

  const cancelTrip = async (bookingId: string) => {
    try {
      await transportApi.cancelBooking(bookingId);
      setTrips(current => current.map(trip => trip.bookingId === bookingId ? { ...trip, status: "cancelled" } : trip));
      setNotice("Ride cancelled.");
    } catch {
      setNotice("This ride could not be cancelled.");
    }
  };

  const registerDriver = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const driver = await transportApi.registerDriver({
        vehicleType: String(data.get("vehicleType") || "economy"),
        vehicleName: String(data.get("vehicleName") || ""),
        vehiclePlate: String(data.get("vehiclePlate") || ""),
        color: String(data.get("color") || ""),
      });
      setDrivers(current => [driver, ...current.filter(item => item.driverId !== driver.driverId)]);
      setNotice("Driver profile submitted for verification.");
    } catch {
      setNotice("Driver registration failed. Sign in and check your details.");
    }
  };

  const registerVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const vehicle = await transportApi.registerVehicle({
        type: String(data.get("type") || "Car"),
        make: String(data.get("make") || ""),
        model: String(data.get("model") || ""),
        year: Number(data.get("year") || new Date().getFullYear()),
        color: String(data.get("color") || ""),
        plate: String(data.get("plate") || ""),
        capacity: Number(data.get("capacity") || 4),
      });
      setVehicles(current => [vehicle, ...current]);
      setNotice("Vehicle submitted for verification.");
      event.currentTarget.reset();
    } catch {
      setNotice("Vehicle registration failed.");
    }
  };

  const home = (
    <div className="transport-home">
      <section className="transport-booking">
        <div className="transport-booking-copy">
          <span className="transport-eyebrow">
            <SafetyCheckRoundedIcon /> VERIFIED RIDES. POWERED BY PI.
          </span>
          <h1>
            Your city,
            <br />
            <em>within reach.</em>
          </h1>
          <p>Book trusted drivers, move packages, and pay seamlessly with Pi—all from one place.</p>
        </div>
        <form className="transport-search-card" onSubmit={startBooking}>
          <div className="transport-card-heading">
            <div>
              <span>BOOK A RIDE</span>
              <h2>Where are you going?</h2>
            </div>
            <ScheduleRoundedIcon />
          </div>
          <label>
            <i className="pickup-dot" />
            <span>Pickup</span>
            <input value={pickup} onChange={event => setPickup(event.target.value)} aria-label="Pickup location" />
          </label>
          <div className="transport-input-line" />
          <label>
            <i className="destination-dot" />
            <span>Destination</span>
            <input
              value={destination}
              onChange={event => setDestination(event.target.value)}
              placeholder="Enter destination"
              aria-label="Destination"
              autoComplete="street-address"
            />
          </label>
          <div className="transport-saved-places">
            {savedPlaces.map(place => (
              <button type="button" key={place.label} onClick={() => setDestination(place.address)}>
                <HomeRoundedIcon />
                <span>
                  <b>{place.label}</b>
                  <small>{place.address}</small>
                </span>
              </button>
            ))}
          </div>
          {notice ? (
            <p className="transport-form-notice" role="alert">
              {notice}
            </p>
          ) : null}
          <button className="transport-main-button" type="submit">
            Find a ride <ArrowForwardRoundedIcon />
          </button>
        </form>
      </section>
      <section className="transport-map-section">
        <MapCanvas pickup={pickup} destination={destination} drivers={nearbyDrivers} />
      </section>
      <section className="transport-promise">
        <div>
          <span>WHY SMAJ TRANSPORT</span>
          <h2>Move with confidence.</h2>
        </div>
        <article>
          <VerifiedUserRoundedIcon />
          <h3>Verified drivers</h3>
          <p>Every driver completes identity, vehicle, and safety checks.</p>
        </article>
        <article>
          <PaymentsRoundedIcon />
          <h3>Transparent Pi fares</h3>
          <p>See the price before you book. Pay securely from your Pi wallet.</p>
        </article>
        <article>
          <SupportAgentRoundedIcon />
          <h3>Support that follows</h3>
          <p>Share your trip and reach our safety team whenever you need help.</p>
        </article>
      </section>
    </div>
  );

  const chooseRide = (
    <section className="transport-choose-layout">
      <div className="transport-ride-panel">
        <button
          className="transport-back-button"
          type="button"
          onClick={() => {
            setBookingStep("idle");
            navigate("/services/transport");
          }}
        >
          <ArrowBackRoundedIcon /> Change route
        </button>
        <span className="transport-eyebrow">AVAILABLE NEARBY</span>
        <h1>Choose your ride</h1>
        <div className="transport-route-summary">
          <i className="pickup-dot" />
          <div>
            <small>FROM</small>
            <b>{pickup}</b>
          </div>
          <span />
          <i className="destination-dot" />
          <div>
            <small>TO</small>
            <b>{destination}</b>
          </div>
        </div>
        {nearbyDrivers.length > 0 && (
          <div className="transport-nearby-drivers">
            <span className="transport-eyebrow">NEARBY DRIVERS</span>
            {nearbyDrivers.slice(0, 3).map(driver => (
              <div key={driver.driverId} className="nearby-driver-card">
                <span className="nearby-driver-avatar">
                  <DirectionsCarRoundedIcon />
                </span>
                <div>
                  <b>{driver.displayName}</b>
                  <small>
                    {driver.vehicleName} · {driver.vehiclePlate}
                  </small>
                  <small>
                    ★ {driver.rating.toFixed(1)} · {driver.distanceKm ? `${driver.distanceKm.toFixed(1)} km` : "Nearby"}
                  </small>
                </div>
                <span className={`nearby-driver-status ${driver.isOnline ? "online" : "offline"}`}>
                  {driver.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="transport-ride-list">
          {rideOptions.map(ride => (
            <button
              type="button"
              key={ride.id}
              className={selectedRide === ride.id ? "selected" : ""}
              onClick={() => setSelectedRide(ride.id)}
            >
              <span className="ride-icon">
                <RideIcon type={ride.icon} />
              </span>
              <span className="ride-copy">
                <b>
                  {ride.name}
                  {ride.popular ? <small>POPULAR</small> : null}
                </b>
                <small>
                  {ride.eta} away · {ride.seats ? `${ride.seats} seats` : "Packages"}
                </small>
              </span>
              <strong>
                π {(ride.pricePerKm * Math.max(1, Math.min(2.4, destination.trim().length / 12))).toFixed(2)}
              </strong>
            </button>
          ))}
        </div>
        <div className="transport-payment-row">
          <PaymentsRoundedIcon />
          <span>
            <small>PAYMENT</small>
            <b>Pi Wallet</b>
          </span>
          <button type="button">Change</button>
        </div>
        <button className="transport-main-button" type="button" onClick={() => setBookingStep("review")}>
          Choose {activeRide.name} · π {quote.toFixed(2)}
        </button>
      </div>
      <MapCanvas pickup={pickup} destination={destination} drivers={nearbyDrivers} />
    </section>
  );

  const tripsPage = (
    <section className="transport-inner-page">
      <header>
        <span className="transport-eyebrow">YOUR JOURNEYS</span>
        <h1>My trips</h1>
        <p>Track an active ride or revisit where you have been.</p>
      </header>
      <div className="transport-trip-tabs">
        <button className="active">All trips</button>
        <button>Completed</button>
        <button>Cancelled</button>
      </div>
      <div className="transport-trip-list">
        {trips.map(trip => (
          <article key={trip.id} className={trip.status === "active" ? "active-trip" : ""}>
            <div className="trip-date">
              <span>
                <DirectionsCarRoundedIcon />
              </span>
              <small>{trip.date}</small>
            </div>
            <div className="trip-route">
              <b>{trip.pickup}</b>
              <span />
              <b>{trip.destination}</b>
              <small>
                {trip.rideName} · {trip.id}
              </small>
            </div>
            <div className="trip-price">
              <strong>π {trip.price.toFixed(2)}</strong>
              <span className={`trip-status ${trip.status}`}>{trip.status}</span>
              {trip.status === "active" ? (
                <>
                  <button onClick={() => { setBookingStep("confirmed"); navigate("/services/transport/track"); }}>Track ride</button>
                  <button className="trip-cancel" onClick={() => void cancelTrip(trip.bookingId)}>Cancel</button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setPickup(trip.pickup);
                    setDestination(trip.destination);
                    setBookingStep("choose");
                    navigate("/services/transport/book");
                  }}
                >
                  Book again
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const walletPage = (
    <section className="transport-inner-page transport-wallet-page">
      <header>
        <span className="transport-eyebrow">PAYMENTS & REWARDS</span>
        <h1>Transport wallet</h1>
        <p>Manage ride payments and see your transport rewards.</p>
      </header>
      <div className="wallet-balance-card">
        <span>AVAILABLE PI BALANCE</span>
        <strong>π 248.60</strong>
        <small>Connected as pioneer@smaj</small>
        <div>
          <button>Add Pi</button>
          <button>View activity</button>
        </div>
      </div>
      <div className="wallet-content-grid">
        <article>
          <h2>Payment method</h2>
          <div className="wallet-method">
            <span>π</span>
            <div>
              <b>Pi Wallet</b>
              <small>Primary · Connected</small>
            </div>
            <CheckCircleRoundedIcon />
          </div>
        </article>
        <article>
          <h2>SMAJ rewards</h2>
          <strong>1,280</strong>
          <p>points earned from safe, completed trips</p>
          <button>
            Explore rewards <ArrowForwardRoundedIcon />
          </button>
        </article>
      </div>
    </section>
  );

  const driverPage = (
    <section className="transport-driver-page">
      <div className="driver-hero">
        <div>
          <span className="transport-eyebrow">DRIVE. EARN. GROW.</span>
          <h1>
            Move your city
            <br />
            <em>on your terms.</em>
          </h1>
          <p>Join a verified driver community, choose your hours, and earn directly in Pi.</p>
          <div>
            <button className="transport-main-button" onClick={() => setDriverOnline(true)}>
              Start driving
            </button>
            <a href="#driver-requirements">See requirements</a>
          </div>
        </div>
        <aside>
          <span>ESTIMATED WEEKLY EARNINGS</span>
          <strong>π 186–260</strong>
          <p>Based on 25 active hours</p>
          <div>
            <b>0%</b>
            <small>sign-up fee</small>
          </div>
          <div>
            <b>24/7</b>
            <small>driver support</small>
          </div>
        </aside>
      </div>
      <div id="driver-requirements" className="driver-requirements">
        <div>
          <span>GET STARTED</span>
          <h2>Ready in three steps.</h2>
        </div>
        {["Create your driver profile", "Verify your vehicle and identity", "Go online and accept trips"].map(
          (text, index) => (
            <article key={text}>
              <b>0{index + 1}</b>
              <h3>{text}</h3>
              <p>
                {
                  [
                    "Tell us about yourself and where you want to drive.",
                    "Submit your documents for our secure review.",
                    "Set your own availability and receive ride requests.",
                  ][index]
                }
              </p>
            </article>
          )
        )}
      </div>
      <section className="transport-management-section">
        <header><span className="transport-eyebrow">DRIVER ONBOARDING</span><h2>{drivers.length ? "Driver profile" : "Register to drive"}</h2></header>
        {notice ? <p className="transport-form-notice">{notice}</p> : null}
        {drivers.length ? drivers.map(driver => (
          <article className="transport-driver-record" key={driver.driverId}>
            <div><b>{driver.displayName}</b><small>{driver.vehicleName} · {driver.vehiclePlate}</small></div>
            <span>{driver.isApproved ? "Approved" : "Under review"}</span>
            <Link to="/services/transport/vehicles">Manage vehicles</Link>
          </article>
        )) : (
          <form className="transport-management-form" onSubmit={registerDriver}>
            <label>Vehicle type<select name="vehicleType"><option value="economy">Economy car</option><option value="comfort">Comfort car</option><option value="bike">Bike</option><option value="delivery">Delivery van</option></select></label>
            <label>Vehicle name<input name="vehicleName" required placeholder="Toyota Corolla" /></label>
            <label>Plate number<input name="vehiclePlate" required placeholder="ABC-123" /></label>
            <label>Color<input name="color" required placeholder="Black" /></label>
            <button type="submit">Submit driver profile</button>
          </form>
        )}
      </section>
      {driverOnline ? (
        <div className="driver-online-card">
          <button onClick={() => setDriverOnline(false)}>
            <CloseRoundedIcon />
          </button>
          <span className="online-pulse" />
          <h2>You are online</h2>
          <p>Looking for a nearby ride request…</p>
          <strong>Today · π 0.00</strong>
        </div>
      ) : null}
    </section>
  );

  const vehiclesPage = (
    <section className="transport-inner-page">
      <header><span className="transport-eyebrow">DRIVER TOOLS</span><h1>My vehicles</h1><p>Register vehicles and monitor verification.</p></header>
      {notice ? <p className="transport-form-notice">{notice}</p> : null}
      <div className="transport-record-grid">{vehicles.map(vehicle => <article key={vehicle.vehicleId}><DirectionsCarRoundedIcon /><h2>{vehicle.make} {vehicle.model}</h2><p>{vehicle.plate} · {vehicle.color} · {vehicle.capacity} seats</p><b>{vehicle.isApproved ? "Approved" : "Pending review"}</b></article>)}</div>
      <form className="transport-management-form" onSubmit={registerVehicle}>
        <label>Type<select name="type"><option>Car</option><option>Bike</option><option>Van</option></select></label>
        <label>Make<input name="make" required placeholder="Toyota" /></label>
        <label>Model<input name="model" required placeholder="Corolla" /></label>
        <label>Year<input name="year" type="number" min="1990" max="2030" required /></label>
        <label>Color<input name="color" required /></label>
        <label>Plate<input name="plate" required /></label>
        <label>Capacity<input name="capacity" type="number" min="1" max="12" defaultValue="4" /></label>
        <button type="submit">Add vehicle</button>
      </form>
    </section>
  );

  const receiptsPage = (
    <section className="transport-inner-page">
      <header><span className="transport-eyebrow">PAYMENT HISTORY</span><h1>Receipts</h1><p>Review completed ride payments.</p></header>
      <div className="transport-receipt-list">{receipts.length ? receipts.map(receipt => <article key={receipt.receiptId}><PaymentsRoundedIcon /><div><h2>{receipt.pickup} → {receipt.destination}</h2><p>{receipt.driverName} · {receipt.vehicleName}</p><small>{new Date(receipt.createdAt).toLocaleString()}</small></div><strong>π {receipt.farePi.toFixed(2)}</strong></article>) : <p>No receipts yet. Completed trips will appear here.</p>}</div>
    </section>
  );

  const adminPage = (
    <section className="transport-inner-page">
      <header><span className="transport-eyebrow">TRANSPORT OPERATIONS</span><h1>Admin overview</h1><p>Live operational totals from the Transport backend.</p></header>
      <div className="transport-admin-grid">{[
        ["Bookings", adminStats?.totalBookings || 0], ["Drivers", adminStats?.totalDrivers || 0],
        ["Vehicles", adminStats?.totalVehicles || 0], ["Trips", adminStats?.totalTrips || 0],
        ["Pending drivers", adminStats?.pendingDrivers || 0], ["Active trips", adminStats?.activeTrips || 0],
      ].map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>
    </section>
  );

  const activeTrip = trips.find(trip => trip.status === "active");
  const trackingPage = (
    <section className="transport-tracking">
      <MapCanvas pickup={activeTrip?.pickup || pickup} destination={activeTrip?.destination || destination} tracking />
      <aside>
        <div className="tracking-handle" />
        <span className="transport-eyebrow">DRIVER IS ON THE WAY</span>
        <h1>Meet driver in 3 min</h1>
        <div className="driver-profile">
          <span>MK</span>
          <div>
            <b>Assigned Driver</b>
            <small>
              <StarRoundedIcon /> 4.96 · Active
            </small>
          </div>
          <strong>
            {activeRide.name}
            <br />
            <small>{activeRide.seats ? `${activeRide.seats} seats` : "Package"}</small>
          </strong>
        </div>
        <div className="tracking-progress">
          <span className="active" />
          <span />
          <span />
        </div>
        <div className="tracking-details">
          <p>
            <LocationOnRoundedIcon />
            <span>
              <small>PICKUP</small>
              <b>{activeTrip?.pickup || pickup}</b>
            </span>
          </p>
          <p>
            <PaymentsRoundedIcon />
            <span>
              <small>FARE</small>
              <b>π {(activeTrip?.price || quote).toFixed(2)} · Pi Wallet</b>
            </span>
          </p>
        </div>
        <div className="tracking-actions">
          <button>Contact driver</button>
          <button>Safety</button>
        </div>
        <button className="transport-main-button" onClick={completeTrip}>
          Complete trip
        </button>
      </aside>
    </section>
  );

  let content = home;
  if (bookingStep === "choose" || section === "book") content = chooseRide;
  if (section === "trips") content = tripsPage;
  if (section === "wallet") content = walletPage;
  if (section === "driver") content = driverPage;
  if (section === "vehicles") content = vehiclesPage;
  if (section === "receipts") content = receiptsPage;
  if (section === "admin") content = adminPage;
  if (section === "flights" || section.startsWith("flights/")) content = <FlightsPage />;
  if (section === "track" || bookingStep === "confirmed") content = trackingPage;

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="transport-app">
        <TransportHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        {content}
        {bookingStep === "review" ? (
          <div className="transport-modal-layer">
            <button className="transport-modal-overlay" aria-label="Close" onClick={() => setBookingStep("choose")} />
            <section className="transport-review-modal">
              <button className="modal-close" onClick={() => setBookingStep("choose")}>
                <CloseRoundedIcon />
              </button>
              <span className="ride-icon">
                <RideIcon type={activeRide.icon} />
              </span>
              <span className="transport-eyebrow">CONFIRM YOUR RIDE</span>
              <h2>
                {activeRide.name} is {activeRide.eta} away
              </h2>
              <div>
                <p>
                  <small>PICKUP</small>
                  <b>{pickup}</b>
                </p>
                <p>
                  <small>DESTINATION</small>
                  <b>{destination}</b>
                </p>
                <p>
                  <small>PAY WITH</small>
                  <b>Pi Wallet</b>
                </p>
                <p>
                  <small>ESTIMATED FARE</small>
                  <b>π {quote.toFixed(2)}</b>
                </p>
              </div>
              <button className="transport-main-button" onClick={confirmBooking} disabled={loading}>
                {loading ? "Booking…" : "Confirm and request ride"}
              </button>
              <small>By confirming, you agree to the estimated fare and safety terms.</small>
            </section>
          </div>
        ) : null}
        {bookingStep === "matching" ? (
          <div className="transport-modal-layer">
            <div className="transport-matching">
              <span>
                <DirectionsCarRoundedIcon />
              </span>
              <h2>Finding your driver…</h2>
              <p>Matching you with a nearby verified driver.</p>
              <i />
            </div>
          </div>
        ) : null}
        <nav className="transport-bottom-nav">
          <NavLink end to="/services/transport">
            <HomeRoundedIcon />
            <span>Ride</span>
          </NavLink>
          <NavLink to="/services/transport/flights">
            <FlightRoundedIcon />
            <span>Flights</span>
          </NavLink>
          <NavLink to="/services/transport/trips">
            <HistoryRoundedIcon />
            <span>Trips</span>
          </NavLink>
          <NavLink to="/services/transport/wallet">
            <PaymentsRoundedIcon />
            <span>Wallet</span>
          </NavLink>
          <NavLink to="/services/transport/driver">
            <PersonRoundedIcon />
            <span>Drive</span>
          </NavLink>
        </nav>
      </main>
    </AppLayout>
  );
};

const MapCanvas = ({
  pickup,
  destination,
  tracking = false,
  drivers = [],
}: {
  pickup: string;
  destination: string;
  tracking?: boolean;
  drivers?: Array<{
    driverId: string;
    displayName: string;
    vehicleName: string;
    vehiclePlate: string;
    rating: number;
    isOnline: boolean;
    distanceKm?: number;
  }>;
}) => (
  <div className={`transport-map ${tracking ? "is-tracking" : ""}`} aria-label="Route preview map">
    <div className="map-grid" />
    <div className="map-road road-one" />
    <div className="map-road road-two" />
    <div className="map-road road-three" />
    <span className="map-place place-one">Pioneer Park</span>
    <span className="map-place place-two">Central Market</span>
    <span className="map-place place-three">Innovation District</span>
    <span className="map-pin pickup-pin">
      <i />
      {pickup || "Pickup"}
    </span>
    {destination ? (
      <>
        <span className="map-route-line" />
        <span className="map-pin destination-pin">
          <i />
          {destination}
        </span>
      </>
    ) : null}
    {tracking ? (
      <span className="driver-marker">
        <DirectionsCarRoundedIcon />
        <i>3 min</i>
      </span>
    ) : null}
    {drivers.length > 0 && !tracking ? (
      <div className="driver-marker" style={{ left: "60%", top: "55%" }}>
        <DirectionsCarRoundedIcon />
        <i>{drivers[0]?.displayName || "Driver"}</i>
      </div>
    ) : null}
    <button type="button" className="map-location-button" aria-label="Use my current location">
      <MyLocationRoundedIcon />
    </button>
    <div className="map-status">
      <span /> Live driver network <b>{drivers.length || 128} nearby</b>
    </div>
  </div>
);

const TransportHeader = ({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) => (
  <header className="transport-header">
    <Link className="transport-back-to-hub" to="/app/services" aria-label="Back to SMAJ PI HUB services">
      ← Hub
    </Link>
    <Link className="transport-brand" to="/services/transport">
      <b>Transport</b>
    </Link>
    <nav aria-label="Transport navigation">
      <NavLink end to="/services/transport">
        Ride
      </NavLink>
      <NavLink to="/services/transport/flights">Flights</NavLink>
      <NavLink to="/services/transport/trips">My trips</NavLink>
      <NavLink to="/services/transport/wallet">Wallet</NavLink>
      <NavLink to="/services/transport/driver">Drive with us</NavLink>
    </nav>
    <div className="transport-header-actions">
      <Link className="transport-profile" to="/profile">
        <PersonRoundedIcon />
      </Link>
      <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
        <MenuRoundedIcon />
      </button>
    </div>
    {menuOpen ? (
      <div className="transport-mobile-menu">
        <NavLink end to="/services/transport" onClick={() => setMenuOpen(false)}>
          Book a ride
        </NavLink>
        <NavLink to="/services/transport/flights" onClick={() => setMenuOpen(false)}>
          Book a flight
        </NavLink>
        <NavLink to="/services/transport/trips" onClick={() => setMenuOpen(false)}>
          My trips
        </NavLink>
        <NavLink to="/services/transport/wallet" onClick={() => setMenuOpen(false)}>
          Wallet
        </NavLink>
        <NavLink to="/services/transport/driver" onClick={() => setMenuOpen(false)}>
          Drive with us
        </NavLink>
        <Link to="/app/services">Back to SMAJ Hub</Link>
      </div>
    ) : null}
  </header>
);

export default TransportPage;
