// API Service - Centralized API communication
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.authToken = this.getAuthToken();
  }

  // Authentication
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
      this.authToken = token;
    }
  }

  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      this.authToken = null;
    }
  }

  // HTTP Methods
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
        ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Authentication API
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.removeAuthToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  // Products API
  async getProducts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/products?${queryParams.toString()}`);
  }

  async getProduct(id: string | number): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`);
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<any>> {
    return this.request(`/products/slug/${slug}`);
  }

  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request('/products/categories');
  }

  async getFeaturedProducts(): Promise<ApiResponse<any[]>> {
    return this.request('/products/featured');
  }

  async getRelatedProducts(productId: string | number): Promise<ApiResponse<any[]>> {
    return this.request(`/products/${productId}/related`);
  }

  // Cart API
  async getCart(): Promise<ApiResponse<any[]>> {
    return this.request('/cart');
  }

  async addToCart(productId: string | number, quantity: number = 1): Promise<ApiResponse> {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId: string | number, quantity: number): Promise<ApiResponse> {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string | number): Promise<ApiResponse> {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse> {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Wishlist API
  async getWishlist(): Promise<ApiResponse<any[]>> {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: string | number): Promise<ApiResponse> {
    return this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string | number): Promise<ApiResponse> {
    return this.request(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async createOrder(orderData: {
    items: Array<{ productId: string | number; quantity: number; price: number }>;
    shippingAddress: any;
    billingAddress: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<{ orderId: string; paymentUrl?: string }>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.request('/orders');
  }

  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}`);
  }

  async trackOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/track`);
  }

  // Reviews API
  async getProductReviews(productId: string | number): Promise<ApiResponse<any[]>> {
    return this.request(`/products/${productId}/reviews`);
  }

  async createReview(reviewData: {
    productId: string | number;
    rating: number;
    title: string;
    comment: string;
  }): Promise<ApiResponse> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Search API
  async searchProducts(query: string, filters?: any): Promise<ApiResponse<any[]>> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  }

  // Newsletter API
  async subscribeToNewsletter(email: string): Promise<ApiResponse> {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Contact API
  async sendContactMessage(messageData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
  }): Promise<ApiResponse> {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Analytics API
  async trackEvent(event: string, data?: any): Promise<ApiResponse> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, data }),
    });
  }

  // Admin API
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async getAdminOrders(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/admin/orders?${queryParams.toString()}`);
  }

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<ApiResponse> {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, trackingNumber }),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getAuthHeaders(): HeadersInit {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }
}

export const apiService = new ApiService();