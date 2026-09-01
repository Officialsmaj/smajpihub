export type MobileProduct = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  image?: string;
  images?: string[];
  pricePi?: number;
  priceUsdt?: number;
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  piUsername?: string;
  country?: string;
  city?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  verificationLevel?: string;
  verificationStatus?: string;
};

export type ProductDetailResponse = {
  product: MobileProduct;
  seller: {
    uid: string;
    displayName?: string;
    piUsername?: string;
    avatar?: string;
    country?: string;
    verificationLevel?: string;
    verificationStatus?: string;
  } | null;
  related: MobileProduct[];
  saved: boolean;
};

export const productId = (product: MobileProduct) => product._id || product.id || "";
export const productTitle = (product: MobileProduct) => product.title || product.name || "SMAJ product";