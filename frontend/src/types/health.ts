export type HealthProvider = {
  id: string;
  name: string;
  image: string;
  specialty: string;
  rating: string;
  location: string;
  availableToday: boolean;
  nextSlot: string;
  description: string;
};

export type HealthService = {
  id: string;
  providerId: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
};

export type HealthCategory = string;

export type BookingDetails = {
  providerId: string;
  serviceId: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  notes?: string;
};
