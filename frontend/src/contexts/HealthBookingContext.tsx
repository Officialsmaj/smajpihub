import { createContext, useContext, useState, type ReactNode } from "react";
import type { BookingDetails, HealthProvider, HealthService } from "../types/health";

type HealthBookingContextValue = {
  selectedProvider: HealthProvider | null;
  selectedService: HealthService | null;
  bookingDetails: BookingDetails | null;
  selectProvider: (provider: HealthProvider) => void;
  selectService: (service: HealthService) => void;
  setBookingDetails: (details: BookingDetails) => void;
  clearBooking: () => void;
};

const HealthBookingContext = createContext<HealthBookingContextValue | undefined>(undefined);

export const HealthBookingProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProvider, setSelectedProvider] = useState<HealthProvider | null>(null);
  const [selectedService, setSelectedService] = useState<HealthService | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  const selectProvider = (provider: HealthProvider) => setSelectedProvider(provider);
  const selectService = (service: HealthService) => setSelectedService(service);
  const clearBooking = () => {
    setSelectedProvider(null);
    setSelectedService(null);
    setBookingDetails(null);
  };

  return (
    <HealthBookingContext.Provider value={{ selectedProvider, selectedService, bookingDetails, selectProvider, selectService, setBookingDetails, clearBooking }}>
      {children}
    </HealthBookingContext.Provider>
  );
};

export const useHealthBooking = () => {
  const context = useContext(HealthBookingContext);
  if (!context) throw new Error("useHealthBooking must be used within HealthBookingProvider");
  return context;
};
