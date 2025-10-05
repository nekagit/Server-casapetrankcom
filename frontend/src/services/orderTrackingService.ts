// Order Tracking Service - Comprehensive order tracking and management system
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusUpdate[];
  timeline: OrderTimelineEvent[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  carrier: string;
  service: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'klarna' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'preparing'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type ShippingStatus = 
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export interface OrderStatusUpdate {
  id: string;
  status: OrderStatus;
  timestamp: string;
  notes?: string;
  updatedBy: string;
  location?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface OrderTimelineEvent {
  id: string;
  type: 'status_change' | 'payment' | 'shipping' | 'delivery' | 'notification' | 'note';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  metadata?: Record<string, any>;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  location: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
  lastUpdated: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  details?: string;
}

export interface OrderFilters {
  orderNumber?: string;
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: 'created_at' | 'updated_at' | 'total_amount' | 'order_number';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
  }>;
  shippingMethods: Array<{
    method: string;
    count: number;
    averageDeliveryTime: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}

class OrderTrackingService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.ORDER_TRACKING_API_KEY || '';
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order:', error);
      return null;
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/by-number/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order by number:', error);
      return null;
    }
  }

  // Get orders with filters
  async getOrders(filters: OrderFilters = {}): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/orders?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get orders:', error);
      return { orders: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Get customer orders
  async getCustomerOrders(
    customerId: string,
    filters: Omit<OrderFilters, 'customerId'> = {}
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/customers/${customerId}/orders?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { orders: [], total: 0, page: 1, totalPages: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get customer orders:', error);
      return { orders: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string,
    trackingNumber?: string,
    carrier?: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes, trackingNumber, carrier })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update order status' };
      }

      const order = await response.json();
      return { success: true, order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update payment status
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    notes?: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update payment status' };
      }

      const order = await response.json();
      return { success: true, order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update shipping status
  async updateShippingStatus(
    orderId: string,
    shippingStatus: ShippingStatus,
    trackingNumber?: string,
    carrier?: string,
    notes?: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/shipping-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shippingStatus, trackingNumber, carrier, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update shipping status' };
      }

      const order = await response.json();
      return { success: true, order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get tracking information
  async getTrackingInfo(trackingNumber: string, carrier?: string): Promise<TrackingInfo | null> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('trackingNumber', trackingNumber);
      if (carrier) queryParams.append('carrier', carrier);

      const response = await fetch(`${this.baseUrl}/api/v1/tracking?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get tracking info:', error);
      return null;
    }
  }

  // Get order timeline
  async getOrderTimeline(orderId: string): Promise<OrderTimelineEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/timeline`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order timeline:', error);
      return [];
    }
  }

  // Add order note
  async addOrderNote(
    orderId: string,
    note: string,
    isInternal: boolean = false
  ): Promise<{ success: boolean; timelineEvent?: OrderTimelineEvent; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note, isInternal })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to add order note' };
      }

      const timelineEvent = await response.json();
      return { success: true, timelineEvent };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cancel order
  async cancelOrder(
    orderId: string,
    reason: string,
    refundAmount?: number
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason, refundAmount })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to cancel order' };
      }

      const order = await response.json();
      return { success: true, order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Refund order
  async refundOrder(
    orderId: string,
    amount: number,
    reason: string,
    refundItems?: string[]
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, reason, refundItems })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to refund order' };
      }

      const order = await response.json();
      return { success: true, order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get order analytics
  async getOrderAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<OrderAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await fetch(`${this.baseUrl}/api/v1/orders/analytics?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get order analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {} as Record<OrderStatus, number>,
        ordersByMonth: [],
        topProducts: [],
        customerSegments: [],
        shippingMethods: [],
        paymentMethods: []
      };
    }
  }

  // Get order status history
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusUpdate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/status-history`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order status history:', error);
      return [];
    }
  }

  // Send order notification
  async sendOrderNotification(
    orderId: string,
    type: 'status_update' | 'shipping_update' | 'delivery_update' | 'cancellation' | 'refund',
    customMessage?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/${orderId}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, customMessage })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to send notification' };
      }

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Export orders
  async exportOrders(
    filters: OrderFilters = {},
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      queryParams.append('format', format);

      const response = await fetch(`${this.baseUrl}/api/v1/orders/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to export orders' };
      }

      const data = await response.json();
      return { success: true, downloadUrl: data.downloadUrl };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Bulk update orders
  async bulkUpdateOrders(
    orderIds: string[],
    updates: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      shippingStatus?: ShippingStatus;
      notes?: string;
    }
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderIds, updates })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, updated: 0, errors: [error.message || 'Bulk update failed'] };
      }

      const data = await response.json();
      return { success: true, updated: data.updated, errors: data.errors || [] };
    } catch (error) {
      return {
        success: false,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Get order dashboard data
  async getOrderDashboard(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    shippedOrders: number;
    recentOrders: Order[];
    topProducts: Array<{
      productId: string;
      productName: string;
      quantitySold: number;
    }>;
    orderTrend: Array<{
      date: string;
      orders: number;
      revenue: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/dashboard`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get order dashboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order dashboard:', error);
      return {
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        recentOrders: [],
        topProducts: [],
        orderTrend: []
      };
    }
  }
}

export const orderTrackingService = new OrderTrackingService();
