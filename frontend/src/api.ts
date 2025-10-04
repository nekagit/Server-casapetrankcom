// Casa Petrada API Service
const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_admin: boolean;
  newsletter_subscribed: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  newsletter_subscribed: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  }

  async register(userData: RegisterRequest): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // Product methods
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request(endpoint);
  }

  async getProduct(id: string): Promise<any> {
    return this.request(`/products/${id}`);
  }

  async getCategories(): Promise<any[]> {
    return this.request('/products/categories');
  }

  // Cart methods (for future API integration)
  async addToCart(productId: string, quantity: number): Promise<void> {
    // For now, this is handled locally
    // In the future, this would sync with the backend
    console.log('Adding to cart:', productId, quantity);
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string): Promise<void> {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Contact methods
  async submitContactForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order methods
  async createOrder(orderData: {
    items: Array<{
      product_id: number;
      quantity: number;
      price: number;
    }>;
    total_amount: number;
    shipping_address: any;
    billing_address?: any;
    payment_method: string;
    notes?: string;
  }): Promise<any> {
    return this.request<any>('POST', '/orders', orderData, true);
  }

  async getUserOrders(): Promise<any[]> {
    return this.request<any[]>('GET', '/orders', undefined, true);
  }

  async getOrder(orderId: number): Promise<any> {
    return this.request<any>('GET', `/orders/${orderId}`, undefined, true);
  }

  // Newsletter methods
  async subscribeNewsletter(email: string, source: string = 'website'): Promise<any> {
    return this.request<any>('POST', '/newsletter/subscribe', { email, source });
  }

  async unsubscribeNewsletter(email: string): Promise<any> {
    return this.request<any>('POST', '/newsletter/unsubscribe', { email });
  }

  async getNewsletterSubscribers(skip: number = 0, limit: number = 100): Promise<any> {
    return this.request<any>('GET', `/newsletter/subscribers?skip=${skip}&limit=${limit}`, undefined, true);
  }

  // Review methods
  async createReview(reviewData: {
    product_id: number;
    rating: number;
    title?: string;
    comment?: string;
    reviewer_name?: string;
    reviewer_email?: string;
  }): Promise<any> {
    return this.request<any>('POST', '/reviews', reviewData, true);
  }

  async getProductReviews(productId: number, skip: number = 0, limit: number = 20): Promise<any[]> {
    return this.request<any[]>('GET', `/reviews/product/${productId}?skip=${skip}&limit=${limit}`);
  }

  async getProductReviewStats(productId: number): Promise<any> {
    return this.request<any>('GET', `/reviews/product/${productId}/stats`);
  }

  async getUserReviews(skip: number = 0, limit: number = 20): Promise<any[]> {
    return this.request<any[]>('GET', `/reviews/user?skip=${skip}&limit=${limit}`, undefined, true);
  }

  async updateReview(reviewId: number, reviewData: {
    product_id: number;
    rating: number;
    title?: string;
    comment?: string;
    reviewer_name?: string;
    reviewer_email?: string;
  }): Promise<any> {
    return this.request<any>('PUT', `/reviews/${reviewId}`, reviewData, true);
  }

  async deleteReview(reviewId: number): Promise<any> {
    return this.request<any>('DELETE', `/reviews/${reviewId}`, undefined, true);
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    return this.request<any>('GET', '/admin/stats', undefined, true);
  }

  async getRecentOrders(limit: number = 20): Promise<any> {
    return this.request<any>('GET', `/admin/orders/recent?limit=${limit}`, undefined, true);
  }

  async getCustomers(skip: number = 0, limit: number = 50): Promise<any> {
    return this.request<any>('GET', `/admin/customers?skip=${skip}&limit=${limit}`, undefined, true);
  }

  async getAnalytics(range: string = 'month'): Promise<any> {
    return this.request<any>('GET', `/admin/analytics?range=${range}`, undefined, true);
  }

  async toggleProductFeatured(productId: number): Promise<any> {
    return this.request<any>('PUT', `/admin/products/${productId}/featured`, undefined, true);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    return this.request<any>('PUT', `/admin/orders/${orderId}/status`, { status }, true);
  }
}

export const apiService = new ApiService();
export default apiService;