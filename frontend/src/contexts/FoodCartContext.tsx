import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem, FoodMenuItem } from "../types/food";

type FoodCartContextValue = {
  items: CartItem[];
  addItem: (menuItem: FoodMenuItem) => void;
  decreaseItem: (menuItemId: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const FoodCartContext = createContext<FoodCartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "smaj_food_cart";

export const FoodCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]") as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: FoodMenuItem) => {
    setItems(current => {
      const containsAnotherRestaurant = current.some(item => item.menuItem.restaurantId !== menuItem.restaurantId);
      if (containsAnotherRestaurant) {
        return [{ menuItem, quantity: 1 }];
      }
      const existing = current.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return current.map(item =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { menuItem, quantity: 1 }];
    });
  };

  const decreaseItem = (menuItemId: string) => {
    setItems(current =>
      current.flatMap(item =>
        item.menuItem.id !== menuItemId ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []
      )
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems(current => current.filter(item => item.menuItem.id !== menuItemId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <FoodCartContext.Provider value={{ items, addItem, decreaseItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </FoodCartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFoodCart = () => {
  const context = useContext(FoodCartContext);
  if (!context) throw new Error("useFoodCart must be used within FoodCartProvider");
  return context;
};
