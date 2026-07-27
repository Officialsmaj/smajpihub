import { axiosClient } from "./axiosClient";
import type { FoodRestaurant, FoodMenuItem, FoodCategory } from "../types/food";

const FALLBACK_CATEGORIES: FoodCategory[] = [
  "All",
  "Burgers",
  "Pizza",
  "Sushi",
  "African",
  "Healthy",
  "Desserts",
  "Drinks",
];

const FALLBACK_RESTAURANTS: FoodRestaurant[] = [
  {
    id: "smaj-bites",
    name: "SMAJ Bites",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
    rating: "4.8",
    deliveryTime: "15–25 min",
    deliveryFee: 2.5,
    categories: ["Burgers", "Fast Food"],
    description: "Artisan burgers and sides made with fresh local ingredients.",
    isOpen: true,
  },
  {
    id: "pioneer-pizza",
    name: "Pioneer Pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",
    rating: "4.6",
    deliveryTime: "20–35 min",
    deliveryFee: 3.0,
    categories: ["Pizza", "Italian"],
    description: "Wood-fired pizza with locally sourced toppings.",
    isOpen: true,
  },
  {
    id: "african-spice",
    name: "African Spice House",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
    rating: "4.9",
    deliveryTime: "25–40 min",
    deliveryFee: 2.0,
    categories: ["African", "Healthy"],
    description: "Traditional flavors reimagined for fast, healthy delivery.",
    isOpen: true,
  },
  {
    id: "sushi-roll",
    name: "Sushi Roll Co",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=85",
    rating: "4.7",
    deliveryTime: "20–30 min",
    deliveryFee: 4.0,
    categories: ["Sushi", "Japanese"],
    description: "Fresh sushi rolls, sashimi, and Japanese-inspired bowls.",
    isOpen: true,
  },
];

const FALLBACK_MENU: Record<string, FoodMenuItem[]> = {
  "smaj-bites": [
    {
      id: "smaj-bites-1",
      restaurantId: "smaj-bites",
      name: "Classic Smash Burger",
      description: "Double patty, cheddar, pickles, house sauce.",
      price: 12.5,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",
      category: "Burgers",
      popular: true,
    },
    {
      id: "smaj-bites-2",
      restaurantId: "smaj-bites",
      name: "Crispy Chicken Sandwich",
      description: "Fried chicken, slaw, spicy mayo, brioche.",
      price: 10.0,
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85",
      category: "Burgers",
    },
    {
      id: "smaj-bites-3",
      restaurantId: "smaj-bites",
      name: "Loaded Fries",
      description: "Loaded with cheese, jalapeños, and herbs.",
      price: 6.5,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
      category: "Sides",
    },
  ],
  "pioneer-pizza": [
    {
      id: "pioneer-pizza-1",
      restaurantId: "pioneer-pizza",
      name: "Margherita",
      description: "San Marzano tomato, mozzarella, basil.",
      price: 14.0,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
      category: "Pizza",
      popular: true,
    },
    {
      id: "pioneer-pizza-2",
      restaurantId: "pioneer-pizza",
      name: "Pepperoni Feast",
      description: "Double pepperoni, mozzarella, chili oil.",
      price: 16.5,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85",
      category: "Pizza",
    },
  ],
  "african-spice": [
    {
      id: "african-spice-1",
      restaurantId: "african-spice",
      name: "Jollof Bowl",
      description: "Smoky jollof rice with grilled chicken.",
      price: 11.0,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
      category: "African",
      popular: true,
    },
    {
      id: "african-spice-2",
      restaurantId: "african-spice",
      name: "Plantain Wrap",
      description: "Sweet plantain, beans, peppers, and salad.",
      price: 8.5,
      image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=900&q=85",
      category: "Healthy",
    },
  ],
  "sushi-roll": [
    {
      id: "sushi-roll-1",
      restaurantId: "sushi-roll",
      name: "Salmon Roll",
      description: "Fresh salmon, avocado, cucumber, sesame.",
      price: 13.5,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=85",
      category: "Sushi",
      popular: true,
    },
    {
      id: "sushi-roll-2",
      restaurantId: "sushi-roll",
      name: "Tuna Poke Bowl",
      description: "Ahi tuna, rice, edamame, ponzu.",
      price: 15.0,
      image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=900&q=85",
      category: "Bowls",
    },
  ],
};

export const getFoodCategories = async (): Promise<FoodCategory[]> => {
  try {
    const response = await axiosClient.get<{ categories: FoodCategory[] }>("/food-delivery/categories");
    const data = response.data.categories;
    return data.length ? data : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
};

export const getFoodRestaurants = async (params?: { category?: string; query?: string }): Promise<FoodRestaurant[]> => {
  try {
    const response = await axiosClient.get<{ restaurants: FoodRestaurant[] }>("/food-delivery/restaurants", { params });
    const data = response.data.restaurants;
    return data.length ? data : FALLBACK_RESTAURANTS;
  } catch {
    return FALLBACK_RESTAURANTS;
  }
};

export const getFoodRestaurant = async (id: string): Promise<FoodRestaurant | undefined> => {
  try {
    const response = await axiosClient.get<{ restaurant: FoodRestaurant }>(
      `/food-delivery/restaurants/${encodeURIComponent(id)}`
    );
    return response.data.restaurant;
  } catch {
    return FALLBACK_RESTAURANTS.find(restaurant => restaurant.id === id);
  }
};

export const getFoodMenu = async (restaurantId: string): Promise<FoodMenuItem[]> => {
  try {
    const response = await axiosClient.get<{ menu: FoodMenuItem[] }>(
      `/food-delivery/restaurants/${encodeURIComponent(restaurantId)}/menu`
    );
    const data = response.data.menu;
    return data.length ? data : (FALLBACK_MENU[restaurantId] ?? []);
  } catch {
    return FALLBACK_MENU[restaurantId] ?? [];
  }
};
