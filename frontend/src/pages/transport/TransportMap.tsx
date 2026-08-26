import { useCallback, useEffect, useRef, useState } from "react";
import L, { type LatLngExpression, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = { lat: number; lng: number };
type MapDriver = {
  driverId: string;
  displayName: string;
  vehicleName: string;
  vehiclePlate: string;
  currentLocation?: Coordinates | null;
};
type Props = {
  pickup: string;
  destination: string;
  tracking?: boolean;
  drivers?: MapDriver[];
  onDestinationSelected?: (value: string) => void;
};

const DEFAULT_CENTER: LatLngExpression = [25.2048, 55.2708];
const coordinateLabel = ({ lat, lng }: Coordinates) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
const parseCoordinates = (value: string): Coordinates | null => {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
};
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] || character));
const markerIcon = (className: string, label: string) => L.divIcon({
  className: "transport-leaflet-marker",
  html: `<span class="${className}" aria-hidden="true"></span><b>${label}</b>`,
  iconSize: [42, 46],
  iconAnchor: [21, 38],
});

const TransportMap = ({ pickup, destination, tracking = false, drivers = [], onDestinationSelected }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [pickupPosition, setPickupPosition] = useState<Coordinates | null>(null);
  const destinationPosition = parseCoordinates(destination);
  const [mapMessage, setMapMessage] = useState("Tap the map to choose a destination.");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(DEFAULT_CENTER, 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.on("click", event => {
      const next = { lat: event.latlng.lat, lng: event.latlng.lng };
      onDestinationSelected?.(coordinateLabel(next));
      setMapMessage("Destination selected on map.");
    });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    const timer = window.setTimeout(() => { map.invalidateSize(); locate(); }, 0);
    return () => { window.clearTimeout(timer); map.remove(); mapRef.current = null; layerRef.current = null; };
  }, [locate, onDestinationSelected]);

  const locate = useCallback(() => {
    if (!navigator.geolocation) { setMapMessage("Location is unavailable in this browser."); return; }
    setMapMessage("Locating you…");
    navigator.geolocation.getCurrentPosition(
      position => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPickupPosition(next);
        mapRef.current?.flyTo([next.lat, next.lng], 15);
        setMapMessage(`Location accuracy: ${Math.round(position.coords.accuracy)} m`);
      },
      () => setMapMessage("Allow location access to show your position."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layerRef.current;
    if (!map || !layers) return;
    layers.clearLayers();
    const bounds: L.LatLngExpression[] = [];
    if (pickupPosition) {
      L.marker([pickupPosition.lat, pickupPosition.lng], { icon: markerIcon("pickup", "Pickup") }).bindPopup(escapeHtml(pickup || "Current location")).addTo(layers);
      bounds.push([pickupPosition.lat, pickupPosition.lng]);
    }
    if (destinationPosition) {
      L.marker([destinationPosition.lat, destinationPosition.lng], { icon: markerIcon("destination", "Drop-off") }).bindPopup(escapeHtml(destination)).addTo(layers);
      bounds.push([destinationPosition.lat, destinationPosition.lng]);
    }
    if (pickupPosition && destinationPosition) {
      L.polyline([[pickupPosition.lat, pickupPosition.lng], [destinationPosition.lat, destinationPosition.lng]], {
        color: "#18a66a", weight: 5, opacity: 0.85, dashArray: "10 8",
      }).addTo(layers);
    }
    drivers.forEach(driver => {
      if (!driver.currentLocation) return;
      const { lat, lng } = driver.currentLocation;
      L.marker([lat, lng], { icon: markerIcon("driver", "Driver") })
        .bindPopup(`<b>${escapeHtml(driver.displayName)}</b><br>${escapeHtml(driver.vehicleName)} · ${escapeHtml(driver.vehiclePlate)}`)
        .addTo(layers);
      bounds.push([lat, lng]);
    });
    if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), { padding: [44, 44], maxZoom: tracking ? 16 : 14 });
    else if (bounds.length === 1) map.flyTo(bounds[0], 15);
  }, [destination, drivers, pickup, pickupPosition, destinationPosition, tracking]);

  return (
    <div className={`transport-map transport-real-map ${tracking ? "is-tracking" : ""}`} aria-label="Interactive route map">
      <div ref={containerRef} className="transport-leaflet-canvas" />
      <button type="button" className="map-location-button" aria-label="Use my current location" onClick={locate}><span aria-hidden="true">◎</span></button>
      <div className="map-status"><span /> {mapMessage} <b>{drivers.length} nearby</b></div>
    </div>
  );
};

export default TransportMap;