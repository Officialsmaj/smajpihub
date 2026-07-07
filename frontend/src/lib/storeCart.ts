import type { Product } from "../types/marketplace";

export type CartItem = {
  productId: string;
  title: string;
  image: string;
  sellerId: string;
  sellerName: string;
  piUsername?: string;
  category: string;
  location: string;
  pricePi: number;
  priceUsdt?: number;
  quantity: number;
};

const PI_USDT_RATE = 314159;

const CART_KEY = "smaj_store_cart";
const BUY_NOW_KEY = "smaj_store_buy_now";

const parse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const toItem = (product: Product): CartItem => ({
  productId: product._id,
  title: product.title,
  image: product.image,
  sellerId: product.sellerId,
  sellerName: product.sellerName,
  piUsername: product.piUsername,
  category: product.category,
  location: product.location,
  pricePi: product.pricePi > 0 ? product.pricePi : (product.priceUsdt || 0) / PI_USDT_RATE,
  priceUsdt: product.priceUsdt,
  quantity: 1,
});

export const getCartItems = () => parse<CartItem[]>(window.localStorage.getItem(CART_KEY), []);
export const saveCartItems = (items: CartItem[]) => window.localStorage.setItem(CART_KEY, JSON.stringify(items));
export const clearCartItems = () => window.localStorage.removeItem(CART_KEY);

export const addToCart = (product: Product) => {
  const items = getCartItems();
  const index = items.findIndex((item) => item.productId === product._id);
  if (index >= 0) items[index] = { ...items[index], quantity: items[index].quantity + 1 };
  else items.push(toItem(product));
  saveCartItems(items);
  return items;
};

export const updateCartQuantity = (productId: string, quantity: number) => {
  const items = getCartItems().flatMap((item) => item.productId === productId ? (quantity > 0 ? [{ ...item, quantity }] : []) : [item]);
  saveCartItems(items);
  return items;
};

export const removeFromCart = (productId: string) => {
  const items = getCartItems().filter((item) => item.productId !== productId);
  saveCartItems(items);
  return items;
};

export const setBuyNowItem = (product: Product) => window.localStorage.setItem(BUY_NOW_KEY, JSON.stringify(toItem(product)));
export const getBuyNowItem = () => parse<CartItem | null>(window.localStorage.getItem(BUY_NOW_KEY), null);
export const clearBuyNowItem = () => window.localStorage.removeItem(BUY_NOW_KEY);
