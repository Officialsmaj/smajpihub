import { axiosClient } from "./axiosClient";

export type TransportBooking = {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    label: string;
    note?: string;
    at: string;
  }>;
};

export type RideBooking = TransportBooking & {
  type: "ride";
  pickup: string;
  destination: string;
  scheduledPickupAt?: string | null;
  vehicleType: string;
  vehicleName: string;
  vehiclePlate: string;
  driverId: string | null;
  driverName: string | null;
  etaMinutes: number;
  distanceKm: number;
  durationMin: number;
};

export type FlightBooking = TransportBooking & {
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
};

export type TransportDriver = {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
};

export type TransportVehicle = {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
};

export type TransportTrip = {
  _id: string;
  tripId: string;
  userId: string;
  bookingId: string;
  driverId: string;
  driverName: string;
  pickup: string;
  destination: string;
  scheduledPickupAt?: string | null;
  vehicleType: string;
  vehicleName: string;
  vehiclePlate: string;
  status: "requested" | "driver_assigned" | "driver_on_the_way" | "in_progress" | "completed" | "cancelled";
  farePi: number;
  fareUsd?: number;
  distanceKm: number;
  durationMin: number;
  pickupLocation: { lat: number; lng: number; address: string } | null;
  destinationLocation: { lat: number; lng: number; address: string } | null;
  routePolyline: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TransportReceipt = {
  _id: string;
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
  createdAt: string;
};

export type NearbyDriver = {
  _id: string;
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
  distanceKm?: number;
};

export type AdminTransportStats = {
  totalBookings: number;
  totalDrivers: number;
  totalVehicles: number;
  totalTrips: number;
  pendingDrivers: number;
  activeTrips: number;
};

export type TransportNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt: string;
};

export type PlaceSuggestion = { placeId: string; label: string; description: string };
export type PlaceDetails = { placeId: string; label: string; lat: number; lng: number };

export const transportApi = {
  searchPlaces: async (input: string, sessionToken: string) => {
    const response = await axiosClient.get<{ suggestions: PlaceSuggestion[] }>("/transport/places/autocomplete", { params: { input, sessionToken } });
    return response.data.suggestions;
  },

  getPlace: async (placeId: string, sessionToken: string) => {
    const response = await axiosClient.get<{ place: PlaceDetails }>(`/transport/places/${encodeURIComponent(placeId)}`, { params: { sessionToken } });
    return response.data.place;
  },
  getBookings: async (params?: { type?: string; status?: string }) => {
    const response = await axiosClient.get<{ bookings: TransportBooking[] }>("/transport/bookings", { params });
    return response.data.bookings;
  },

  getBooking: async (id: string) => {
    const response = await axiosClient.get<{ booking: TransportBooking }>(`/transport/bookings/${id}`);
    return response.data.booking;
  },

  createRideBooking: async (data: {
    pickup: string;
    destination: string;
    vehicleType?: string;
    etaMinutes?: number;
    distanceKm?: number;
    durationMin?: number;
    scheduledPickupAt?: string;
    destinationLocation?: { lat: number; lng: number; address: string };
  }) => {
    const response = await axiosClient.post<{ booking: RideBooking; trip: TransportTrip }>("/transport/bookings/ride", data);
    return response.data;
  },

  createFlightBooking: async (data: {
    airline: string;
    flightCode: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: string;
    arrivalTime: string;
    duration?: string;
    cabin: string;
    seat: string;
    baggage: string;
    passengerName: string;
    passengerEmail: string;
    passengerNationality: string;
    farePi: number;
    fareUsd?: number;
  }) => {
    const response = await axiosClient.post<{ booking: FlightBooking }>("/transport/bookings/flight", data);
    return response.data.booking;
  },

  approveFlightPayment: async (bookingId: string, paymentId: string) => {
    const response = await axiosClient.post(`/transport/bookings/${bookingId}/payment/approve`, { paymentId });
    return response.data;
  },

  completeFlightPayment: async (bookingId: string, paymentId: string, txid: string) => {
    const response = await axiosClient.post<{ booking: FlightBooking }>(`/transport/bookings/${bookingId}/payment/complete`, { paymentId, txid });
    return response.data.booking;
  },

  cancelFlightPayment: async (bookingId: string, paymentId: string) => {
    const response = await axiosClient.post(`/transport/bookings/${bookingId}/payment/cancel`, { paymentId });
    return response.data;
  },
  updateBookingStatus: async (
    id: string,
    data: {
      status?: string;
      paymentStatus?: string;
      paymentId?: string;
      paymentTxid?: string;
    }
  ) => {
    const response = await axiosClient.patch<{ message: string; bookingId: string }>(
      `/transport/bookings/${id}/status`,
      data
    );
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await axiosClient.post<{ message: string; bookingId: string }>(`/transport/bookings/${id}/cancel`);
    return response.data;
  },

  getTrips: async () => {
    const response = await axiosClient.get<{ trips: TransportTrip[] }>("/transport/trips");
    return response.data.trips;
  },

  getTrip: async (id: string) => {
    const response = await axiosClient.get<{ trip: TransportTrip }>(`/transport/trips/${id}`);
    return response.data.trip;
  },

  updateTripStatus: async (id: string, status: string) => {
    const response = await axiosClient.patch<{ message: string; tripId: string }>(`/transport/trips/${id}/status`, {
      status,
    });
    return response.data;
  },

  getNearbyDrivers: async (lat: number, lng: number, radiusKm?: number) => {
    const response = await axiosClient.get<{ drivers: NearbyDriver[]; count: number }>("/transport/drivers/nearby", {
      params: { lat, lng, radius: radiusKm },
    });
    return response.data;
  },

  getDrivers: async () => {
    const response = await axiosClient.get<{ drivers: TransportDriver[] }>("/transport/drivers");
    return response.data.drivers;
  },

  registerDriver: async (data: {
    vehicleType: string;
    vehicleName: string;
    vehiclePlate: string;
    color?: string;
    currentLocation?: { lat: number; lng: number; address: string };
  }) => {
    const response = await axiosClient.post<{ driver: TransportDriver }>("/transport/drivers", data);
    return response.data.driver;
  },

  updateDriverLocation: async (id: string, lat: number, lng: number, address?: string) => {
    const response = await axiosClient.patch(`/transport/drivers/${id}/location`, { lat, lng, address });
    return response.data;
  },

  setDriverOnline: async (id: string, isOnline: boolean) => {
    const response = await axiosClient.patch(`/transport/drivers/${id}/online`, { isOnline });
    return response.data;
  },

  getVehicles: async () => {
    const response = await axiosClient.get<{ vehicles: TransportVehicle[] }>("/transport/vehicles");
    return response.data.vehicles;
  },

  registerVehicle: async (data: {
    type: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
    plate: string;
    capacity?: number;
  }) => {
    const response = await axiosClient.post<{ vehicle: TransportVehicle }>("/transport/vehicles", data);
    return response.data.vehicle;
  },

  getReceipts: async () => {
    const response = await axiosClient.get<{ receipts: TransportReceipt[] }>("/transport/receipts");
    return response.data.receipts;
  },

  getReceipt: async (id: string) => {
    const response = await axiosClient.get<{ receipt: TransportReceipt }>(`/transport/receipts/${id}`);
    return response.data.receipt;
  },

  getNotifications: async (limit?: number) => {
    const response = await axiosClient.get<{ notifications: TransportNotification[] }>("/transport/notifications", {
      params: { limit },
    });
    return response.data.notifications;
  },

  markNotificationRead: async (id: string) => {
    const response = await axiosClient.patch(`/transport/notifications/${id}/read`);
    return response.data;
  },

  getAdminStats: async () => {
    const response = await axiosClient.get<{
      stats: AdminTransportStats;
      recentBookings: TransportBooking[];
      recentTrips: TransportTrip[];
    }>("/transport/admin/stats");
    return response.data;
  },
};
