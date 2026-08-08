import { axiosClient } from "./axiosClient";
import type { HousingProperty, HousingAgent, HousingCategory, HousingBooking } from "../types/housing";

const FALLBACK_CATEGORIES: HousingCategory[] = [
  "All",
  "Apartment",
  "House",
  "Studio",
  "Commercial",
];

const FALLBACK_PROPERTIES: HousingProperty[] = [
  {
    id: "pioneer-apartment",
    title: "Pioneer Heights Apartment",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85",
    price: 1200,
    location: "Lagos, Nigeria",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "85 m²",
    description: "Modern apartment with sea view, secure parking, and 24/7 security.",
    agentId: "agent-ade",
    available: true,
  },
  {
    id: "orbit-studio",
    title: "Orbit Studio Flat",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=85",
    price: 650,
    location: "Accra, Ghana",
    propertyType: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    area: "45 m²",
    description: "Cozy studio in the city center with fast internet and gym access.",
    agentId: "agent-kwame",
    available: true,
  },
  {
    id: "smaj-family-home",
    title: "SMAJ Family Home",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=85",
    price: 2400,
    location: "Nairobi, Kenya",
    propertyType: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: "210 m²",
    description: "Spacious family home with garden, pool, and smart home features.",
    agentId: "agent-nia",
    available: true,
  },
];

const FALLBACK_AGENTS: HousingAgent[] = [
  {
    id: "agent-ade",
    name: "Ade Okafor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=85",
    rating: "4.9",
    listings: 34,
    location: "Lagos, Nigeria",
    description: "Specialist in premium apartments and short-let stays.",
  },
  {
    id: "agent-kwame",
    name: "Kwame Mensah",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85",
    rating: "4.7",
    listings: 21,
    location: "Accra, Ghana",
    description: "City-center specialist for studios and shared living.",
  },
  {
    id: "agent-nia",
    name: "Nia Kamau",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
    rating: "4.8",
    listings: 45,
    location: "Nairobi, Kenya",
    description: "Family homes and gated community listings.",
  },
];

export const getHousingCategories = async (): Promise<HousingCategory[]> => {
  try {
    const response = await axiosClient.get<{ categories: HousingCategory[] }>("/housing/categories");
    const data = response.data.categories;
    return data.length ? data : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
};

export const getHousingProperties = async (params?: { category?: string; query?: string }): Promise<HousingProperty[]> => {
  try {
    const response = await axiosClient.get<{ properties: HousingProperty[] }>("/housing/properties", { params });
    const data = response.data.properties;
    return data.length ? data : FALLBACK_PROPERTIES;
  } catch {
    return FALLBACK_PROPERTIES;
  }
};

export const getHousingProperty = async (id: string): Promise<HousingProperty | undefined> => {
  try {
    const response = await axiosClient.get<{ property: HousingProperty }>(`/housing/properties/${encodeURIComponent(id)}`);
    return response.data.property;
  } catch {
    return FALLBACK_PROPERTIES.find((property) => property.id === id);
  }
};

export const getHousingAgents = async (): Promise<HousingAgent[]> => {
  try {
    const response = await axiosClient.get<{ agents: HousingAgent[] }>("/housing/agents");
    const data = response.data.agents;
    return data.length ? data : FALLBACK_AGENTS;
  } catch {
    return FALLBACK_AGENTS;
  }
};

export const getHousingAgent = async (id: string): Promise<HousingAgent | undefined> => {
  try {
    const response = await axiosClient.get<{ agent: HousingAgent }>(`/housing/agents/${encodeURIComponent(id)}`);
    return response.data.agent;
  } catch {
    return FALLBACK_AGENTS.find((agent) => agent.id === id);
  }
};

export const createHousingBooking = async (booking: HousingBooking): Promise<{ bookingId: string }> => {
  try {
    const response = await axiosClient.post<{ bookingId: string }>("/housing/bookings", booking);
    return response.data;
  } catch {
    return { bookingId: `HOUSING-${Date.now().toString(36).toUpperCase()}` };
  }
};
