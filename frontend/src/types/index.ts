// Casa Petrada TypeScript Types

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface NewsletterSubscription {
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface ContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/v1/products',
  CATEGORIES: '/api/v1/categories',
  USERS: '/api/v1/users',
  ORDERS: '/api/v1/orders',
  CONTACT: '/api/v1/contact',
  NEWSLETTER: '/api/v1/newsletter',
  AUTH: '/api/v1/auth',
} as const;

// Casa Petrada specific types
export interface BohoProduct extends Product {
  materials: string[];
  handcrafted: boolean;
  sustainability: {
    ecoFriendly: boolean;
    recycledMaterials: boolean;
    localSourcing: boolean;
  };
}

export interface ProductFilter {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  materials?: string[];
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery {
  q: string;
  filters?: ProductFilter;
  page?: number;
  limit?: number;
}
