import { createContext, useContext, useState, type ReactNode } from "react";

type HousingContextValue = {
  savedProperties: string[];
  toggleSaved: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
};

const HousingContext = createContext<HousingContextValue | undefined>(undefined);

export const HousingProvider = ({ children }: { children: ReactNode }) => {
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  const toggleSaved = (propertyId: string) => {
    setSavedProperties((current) =>
      current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId],
    );
  };

  const isSaved = (propertyId: string) => savedProperties.includes(propertyId);

  return (
    <HousingContext.Provider value={{ savedProperties, toggleSaved, isSaved }}>
      {children}
    </HousingContext.Provider>
  );
};

export const useHousing = () => {
  const context = useContext(HousingContext);
  if (!context) throw new Error("useHousing must be used within HousingProvider");
  return context;
};
