// Backend Integration Service - Real API connections with database
export interface BackendConfig {
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DatabaseStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeConnections: number;
  databaseSize: string;
  lastBackup: string;
  uptime: number;
}

class BackendIntegrationService {
  private config: BackendConfig;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor(config?: Partial<BackendConfig>) {
    this.config = {
      baseUrl: process.env.BACKEND_URL || 'http://localhost:8000',
      apiVersion: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.initializeConnection();
    this.setupEventListeners();
  }

  // Initialize backend connection
  private async initializeConnection(): Promise<void> {
    try {
      // Test backend connection
      const healthCheck = await this.healthCheck();
      if (healthCheck.success) {
        console.log('Backend connection established');
        this.loadAuthTokens();
      } else {
        console.warn('Backend connection failed, using offline mode');
      }
    } catch (error) {
      console.error('Failed to initialize backend connection:', error);
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Token refresh
    setInterval(() => {
      if (this.authToken && this.refreshToken) {
        this.refreshAuthToken();
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        timeout: this.config.timeout
      });

      return {
        success: response.ok,
        data: await response.json(),
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Database connection test
  async testDatabaseConnection(): Promise<ApiResponse<DatabaseStats>> {
    try {
      const response = await this.makeRequest('/admin/database/stats', 'GET');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database connection failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; tokens: { access: string; refresh: string } }>> {
    try {
      const response = await this.makeRequest('/auth/login', 'POST', {
        email,
        password
      });

      if (response.success && response.data) {
        this.authToken = response.data.tokens.access;
        this.refreshToken = response.data.tokens.refresh;
        this.saveAuthTokens();
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ user: any; tokens: { access: string; refresh: string } }>> {
    try {
      const response = await this.makeRequest('/auth/register', 'POST', userData);

      if (response.success && response.data) {
        this.authToken = response.data.tokens.access;
        this.refreshToken = response.data.tokens.refresh;
        this.saveAuthTokens();
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest('/auth/logout', 'POST');
      this.clearAuthTokens();
      return response;
    } catch (error) {
      this.clearAuthTokens();
      return {
        success: true,
        message: 'Logged out locally',
        statusCode: 200,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Products API
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    filters?: any;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      return await this.makeRequest(`/products?${queryParams.toString()}`, 'GET');
    } catch (error) {
      return this.handleOfflineFallback('products', params);
    }
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest(`/products/${id}`, 'GET');
    } catch (error) {
      return this.handleOfflineFallback('product', { id });
    }
  }

  async createProduct(productData: any): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest('/products', 'POST', productData);
    } catch (error) {
      return this.queueOfflineAction('createProduct', productData);
    }
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest(`/products/${id}`, 'PUT', productData);
    } catch (error) {
      return this.queueOfflineAction('updateProduct', { id, ...productData });
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    try {
      return await this.makeRequest(`/products/${id}`, 'DELETE');
    } catch (error) {
      return this.queueOfflineAction('deleteProduct', { id });
    }
  }

  // Orders API
  async getOrders(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      return await this.makeRequest(`/orders?${queryParams.toString()}`, 'GET');
    } catch (error) {
      return this.handleOfflineFallback('orders', params);
    }
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest('/orders', 'POST', orderData);
    } catch (error) {
      return this.queueOfflineAction('createOrder', orderData);
    }
  }

  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest(`/orders/${id}/status`, 'PUT', {
        status,
        trackingNumber
      });
    } catch (error) {
      return this.queueOfflineAction('updateOrderStatus', { id, status, trackingNumber });
    }
  }

  // Cart API
  async getCart(): Promise<ApiResponse<any[]>> {
    try {
      return await this.makeRequest('/cart', 'GET');
    } catch (error) {
      return this.handleOfflineFallback('cart');
    }
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse> {
    try {
      return await this.makeRequest('/cart/add', 'POST', { productId, quantity });
    } catch (error) {
      return this.queueOfflineAction('addToCart', { productId, quantity });
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse> {
    try {
      return await this.makeRequest(`/cart/items/${itemId}`, 'PUT', { quantity });
    } catch (error) {
      return this.queueOfflineAction('updateCartItem', { itemId, quantity });
    }
  }

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    try {
      return await this.makeRequest(`/cart/items/${itemId}`, 'DELETE');
    } catch (error) {
      return this.queueOfflineAction('removeFromCart', { itemId });
    }
  }

  // Wishlist API
  async getWishlist(): Promise<ApiResponse<any[]>> {
    try {
      return await this.makeRequest('/wishlist', 'GET');
    } catch (error) {
      return this.handleOfflineFallback('wishlist');
    }
  }

  async addToWishlist(productId: string): Promise<ApiResponse> {
    try {
      return await this.makeRequest('/wishlist/add', 'POST', { productId });
    } catch (error) {
      return this.queueOfflineAction('addToWishlist', { productId });
    }
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse> {
    try {
      return await this.makeRequest(`/wishlist/remove/${productId}`, 'DELETE');
    } catch (error) {
      return this.queueOfflineAction('removeFromWishlist', { productId });
    }
  }

  // Core HTTP request method
  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    retryCount: number = 0
  ): Promise<ApiResponse> {
    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401 && this.refreshToken) {
        // Try to refresh token
        const refreshResponse = await this.refreshAuthToken();
        if (refreshResponse.success) {
          // Retry the original request
          return this.makeRequest(endpoint, method, data, retryCount);
        }
      }

      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: responseData,
        message: responseData.message,
        error: responseData.error,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (retryCount < this.config.retryAttempts) {
        // Retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * Math.pow(2, retryCount))
        );
        return this.makeRequest(endpoint, method, data, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Refresh authentication token
  private async refreshAuthToken(): Promise<ApiResponse<{ access: string; refresh: string }>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/${this.config.apiVersion}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.access;
        this.refreshToken = data.refresh;
        this.saveAuthTokens();
        
        return {
          success: true,
          data,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      this.clearAuthTokens();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Handle offline fallback
  private handleOfflineFallback(type: string, params?: any): ApiResponse {
    const offlineData = this.getOfflineData(type, params);
    
    return {
      success: true,
      data: offlineData,
      message: 'Offline mode - using cached data',
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  // Queue offline action
  private queueOfflineAction(action: string, data: any): ApiResponse {
    const offlineActions = this.getOfflineActions();
    offlineActions.push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    this.saveOfflineActions(offlineActions);
    
    return {
      success: true,
      message: 'Action queued for when online',
      statusCode: 202,
      timestamp: new Date().toISOString()
    };
  }

  // Sync offline data when back online
  private async syncOfflineData(): Promise<void> {
    const offlineActions = this.getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await this.executeOfflineAction(action);
      } catch (error) {
        console.error('Failed to sync offline action:', action, error);
      }
    }
    
    this.clearOfflineActions();
  }

  // Execute offline action
  private async executeOfflineAction(action: any): Promise<void> {
    switch (action.action) {
      case 'addToCart':
        await this.addToCart(action.data.productId, action.data.quantity);
        break;
      case 'createOrder':
        await this.createOrder(action.data);
        break;
      // Add more action types as needed
    }
  }

  // Token management
  private saveAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', this.authToken || '');
      localStorage.setItem('refresh-token', this.refreshToken || '');
    }
  }

  private loadAuthTokens(): void {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth-token');
      this.refreshToken = localStorage.getItem('refresh-token');
    }
  }

  private clearAuthTokens(): void {
    this.authToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
    }
  }

  // Offline data management
  private getOfflineData(type: string, params?: any): any {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`offline-${type}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  private saveOfflineData(type: string, data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`offline-${type}`, JSON.stringify(data));
    }
  }

  private getOfflineActions(): any[] {
    if (typeof window !== 'undefined') {
      const actions = localStorage.getItem('offline-actions');
      return actions ? JSON.parse(actions) : [];
    }
    return [];
  }

  private saveOfflineActions(actions: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('offline-actions', JSON.stringify(actions));
    }
  }

  private clearOfflineActions(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('offline-actions');
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  isOnline(): boolean {
    return this.isOnline;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // Database backup
  async createBackup(): Promise<ApiResponse<{ backupId: string; downloadUrl: string }>> {
    try {
      return await this.makeRequest('/admin/backup', 'POST');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup creation failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Database restore
  async restoreBackup(backupId: string): Promise<ApiResponse> {
    try {
      return await this.makeRequest(`/admin/restore/${backupId}`, 'POST');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup restore failed',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const backendIntegrationService = new BackendIntegrationService();
