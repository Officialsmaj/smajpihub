export type Product = {
  _id: string;
  sellerId: string;
  sellerName: string;
  piUsername?: string;
  title: string;
  image: string;
  images?: string[];
  pricePi: number;
  description: string;
  category: string;
  location: string;
  sellerContact: string;
  active: boolean;
  approved?: boolean;
  hidden?: boolean;
  createdAt: string;
  verificationLevel?: VerificationLevel;
  rating?: number;
};

export type VerificationLevel = "basic" | "verified" | "trusted_seller";
export type SellerSummary = { uid: string; username?: string; piUsername?: string; displayName: string; country?: string; createdAt?: string; verificationLevel?: VerificationLevel; totalProducts?: number; successfulOrders?: number; averageRating?: number; reviewCount?: number };
export type Review = { _id: string; buyerName: string; rating: number; message?: string; createdAt: string };
export type Conversation = { _id: string; buyerId: string; sellerId: string; productId: string; productTitle: string; productImage?: string; lastMessage?: string; updatedAt: string; unreadBy?: string[]; buyerName?: string; sellerName?: string };
export type ChatMessage = { _id: string; conversationId: string; senderId: string; message: string; createdAt: string; readAt?: string };
export type AppNotification = { _id: string; type: string; title: string; message: string; read: boolean; relatedId?: string; createdAt: string; image?: string };

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";

export type OrderTimelineItem = {
  status: OrderStatus | "payment_pending";
  label: string;
  note?: string;
  at: string;
};

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
  paymentId?: string | null;
  paidAt?: string | null;
  paymentStatus?: "pending" | "processing" | "paid" | "failed" | "cancelled";
  paymentTxid?: string | null;
  createdAt: string;
  updatedAt?: string;
  timeline?: OrderTimelineItem[];
};
