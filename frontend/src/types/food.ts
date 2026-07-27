export type FoodRestaurant = {
  id: string;
  name: string;
  image: string;
  rating: string;
  deliveryTime: string;
  deliveryFee: number;
  categories: string[];
  description: string;
  isOpen: boolean;
};

export type FoodMenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
};

export type CartItem = {
  menuItem: FoodMenuItem;
  quantity: number;
};

export type FoodCategory = string;
