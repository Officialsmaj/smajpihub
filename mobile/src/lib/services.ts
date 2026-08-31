import type { SmajService } from "@smaj/shared-types";

export const services: SmajService[] = [
  { slug: "store", name: "SMAJ Store", shortName: "Store", icon: "ST", status: "live", description: "Products, sellers, orders and Pi commerce." },
  { slug: "stream", name: "SMAJ Stream", shortName: "Stream", icon: "TV", status: "live", description: "Videos, creators, channels and live content." },
  { slug: "jobs", name: "SMAJ Jobs", shortName: "Jobs", icon: "JB", status: "live", description: "Find work, hire talent and manage applications." },
  { slug: "education", name: "SMAJ Education", shortName: "Education", icon: "ED", status: "coming-soon", description: "Courses, tutors, universities and credentials." },
  { slug: "sports", name: "SMAJ Sports", shortName: "Sports", icon: "SP", status: "in-progress", description: "Scores, teams, fixtures and sports stories." },
  { slug: "food", name: "SMAJ Food", shortName: "Food", icon: "FD", status: "in-progress", description: "Restaurants, groceries and delivery." },
  { slug: "health", name: "SMAJ Health", shortName: "Health", icon: "HL", status: "in-progress", description: "Providers, appointments and care." },
  { slug: "transport", name: "SMAJ Transport", shortName: "Transport", icon: "TR", status: "in-progress", description: "Rides, delivery and mobility." },
  { slug: "events", name: "SMAJ Events", shortName: "Events", icon: "EV", status: "in-progress", description: "Events, tickets and local experiences." },
  { slug: "agro", name: "SMAJ Agro", shortName: "Agro", icon: "AG", status: "in-progress", description: "Farmers, buyers and agricultural trade." },
  { slug: "energy", name: "SMAJ Energy", shortName: "Energy", icon: "EN", status: "in-progress", description: "Utilities, energy and bills." },
  { slug: "charity", name: "SMAJ Charity", shortName: "Charity", icon: "CH", status: "in-progress", description: "Verified causes and transparent giving." },
  { slug: "housing", name: "SMAJ Housing", shortName: "Housing", icon: "HS", status: "in-progress", description: "Property, rentals, agents and land." },
  { slug: "swap", name: "SMAJ Swap", shortName: "Swap", icon: "SW", status: "in-progress", description: "Peer exchange and circular commerce." },
  { slug: "token", name: "SMAJ Token", shortName: "Rewards", icon: "RW", status: "coming-soon", description: "Rewards, packages and ecosystem utility." }
];