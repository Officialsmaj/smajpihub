export type HousingProperty = {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  description: string;
  agentId: string;
  available: boolean;
};

export type HousingAgent = {
  id: string;
  name: string;
  image: string;
  rating: string;
  listings: number;
  location: string;
  description: string;
};

export type HousingBooking = {
  propertyId: string;
  agentId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  notes?: string;
};

export type HousingCategory = string;
