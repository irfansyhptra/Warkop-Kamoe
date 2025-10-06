export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  availability: "available" | "unavailable" | "limited";
  isRecommended?: boolean;
  ingredients?: string[];
  nutrition?: {
    calories: number;
    caffeine: string;
    fat: string;
    carbs: string;
    protein?: string;
  };
  spicyLevel?: number;
  preparationTime?: string;
  allergens?: string[];
  tags?: string[];
}

export interface Warkop {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalReviews: number;
  categories: string[];
  distance: string;
  badges: string[];
  busyLevel: string;
  promo?: string;
  images: string[];
  openingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  contactInfo: {
    phone?: string;
    whatsapp?: string;
  };
  facilities: string[];
  menu: MenuItem[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  warkopId: string;
  warkopName: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  orderDate: string;
  deliveryInfo: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  paymentMethod: "cod" | "qris" | "bank_transfer";
  estimatedDeliveryTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  profileImage?: string;
  favoriteWarkops: string[];
  role?: "admin" | "customer" | "warkop_owner";
  isVerified?: boolean;
  warkopId?: string;
}

export interface FilterOptions {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  distance: number;
  rating: number;
  features: string[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: number;
  validUntil: string;
  warkopIds?: string[];
  minPurchase?: number;
}

export interface SalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  topSellingItems: {
    menuItem: MenuItem;
    quantity: number;
    revenue: number;
  }[];
}

export interface WarkopRegistration {
  name: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  contactInfo: { phone: string; whatsapp: string; email?: string };
  openingHours: { open: string; close: string; is24Hours: boolean };
  facilities: string[];
  images: string[];
  ownerInfo: { name: string; email: string; phone: string; idCard: string };
}
