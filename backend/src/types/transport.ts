import { ObjectId } from "mongodb";

export interface TransportBooking {
  _id: ObjectId;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "ride" | "flight";
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  paymentId: string | null;
  paymentTxid: string | null;
  providerRef: string | null;
  farePi: number;
  fareUsd: number;
  currency: "PI" | "USD";
  createdAt: Date;
  updatedAt: Date;
  timeline: Array<{
    status: string;
    label: string;
    note?: string;
    at: string;
  }>;
}

export interface RideBooking extends TransportBooking {
  type: "ride";
  pickup: string;
  destination: string;
  vehicleType: string;
  vehicleName: string;
  vehiclePlate: string;
  driverId: string | null;
  driverName: string | null;
  etaMinutes: number;
  distanceKm: number;
  durationMin: number;
}

export interface FlightBooking extends TransportBooking {
  type: "flight";
  airline: string;
  flightCode: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabin: string;
  seat: string;
  baggage: string;
  passengerName: string;
  passengerEmail: string;
  passengerNationality: string;
  ticketNumber: string | null;
  eTicketUrl: string | null;
}

export interface Driver {
  _id: ObjectId;
  driverId: string;
  userId: string;
  displayName: string;
  piUsername: string;
  avatar: string;
  vehicleType: string;
  vehicleName: string;
  vehiclePlate: string;
  color: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  _id: ObjectId;
  vehicleId: string;
  driverId: string;
  userId: string;
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  capacity: number;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  _id: ObjectId;
  tripId: string;
  userId: string;
  bookingId: string;
  driverId: string;
  driverName: string;
  pickup: string;
  destination: string;
  vehicleType: string;
  vehicleName: string;
  vehiclePlate: string;
  status: "requested" | "driver_assigned" | "driver_on_the_way" | "in_progress" | "completed" | "cancelled";
  farePi: number;
  distanceKm: number;
  durationMin: number;
  pickupLocation: { lat: number; lng: number; address: string } | null;
  destinationLocation: { lat: number; lng: number; address: string } | null;
  routePolyline: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface TripReceipt {
  _id: ObjectId;
  receiptId: string;
  tripId: string;
  bookingId: string;
  userId: string;
  driverId: string;
  driverName: string;
  pickup: string;
  destination: string;
  vehicleName: string;
  vehiclePlate: string;
  farePi: number;
  fareUsd: number;
  distanceKm: number;
  durationMin: number;
  paymentStatus: string;
  paymentTxid: string | null;
  createdAt: Date;
}

export interface TransportNotification {
  _id: ObjectId;
  userId: string;
  type: "ride_confirmed" | "driver_assigned" | "driver_on_the_way" | "trip_completed" | "trip_cancelled" | "ride_requested" | "flight_booked" | "flight_cancelled";
  title: string;
  message: string;
  relatedId: string;
  image: string;
  read: boolean;
  createdAt: Date;
}