export type Product = {
  _id: string;
  sellerId: string;
  sellerName: string;
  piUsername?: string;
  title: string;
  image: string;
  pricePi: number;
  description: string;
  category: string;
  location: string;
  sellerContact: string;
  createdAt: string;
};

export type OrderStatus = "pending" | "paid" | "completed" | "cancelled";

export type Order = {
  _id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productTitle: string;
  productImage: string;
  pricePi: number;
  status: OrderStatus;
  createdAt: string;
};
