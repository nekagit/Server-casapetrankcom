// frontend/src/services/webhooks.ts
interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventId: string;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  responseCode?: number;
  responseBody?: string;
  createdAt: string;
  deliveredAt?: string;
}

export const webhookService = {
  // Webhook Event Types
  eventTypes: {
    // Order Events
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_CANCELLED: 'order.cancelled',
    ORDER_SHIPPED: 'order.shipped',
    ORDER_DELIVERED: 'order.delivered',
    
    // Payment Events
    PAYMENT_CREATED: 'payment.created',
    PAYMENT_SUCCEEDED: 'payment.succeeded',
    PAYMENT_FAILED: 'payment.failed',
    PAYMENT_REFUNDED: 'payment.refunded',
    
    // Customer Events
    CUSTOMER_CREATED: 'customer.created',
    CUSTOMER_UPDATED: 'customer.updated',
    CUSTOMER_DELETED: 'customer.deleted',
    
    // Product Events
    PRODUCT_CREATED: 'product.created',
    PRODUCT_UPDATED: 'product.updated',
    PRODUCT_DELETED: 'product.deleted',
    PRODUCT_STOCK_LOW: 'product.stock_low',
    PRODUCT_STOCK_OUT: 'product.stock_out',
    
    // Review Events
    REVIEW_CREATED: 'review.created',
    REVIEW_UPDATED: 'review.updated',
    REVIEW_DELETED: 'review.deleted',
    
    // Newsletter Events
    NEWSLETTER_SUBSCRIBED: 'newsletter.subscribed',
    NEWSLETTER_UNSUBSCRIBED: 'newsletter.unsubscribed',
    
    // Inventory Events
    INVENTORY_UPDATED: 'inventory.updated',
    INVENTORY_ALERT: 'inventory.alert',
    
    // Content Events
    BLOG_POST_CREATED: 'blog_post.created',
    BLOG_POST_UPDATED: 'blog_post.updated',
    BLOG_POST_PUBLISHED: 'blog_post.published',
    BLOG_POST_DELETED: 'blog_post.deleted',
  },

  // Create webhook subscription
  async createSubscription(subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: WebhookSubscription; error?: string }> {
    console.log('Creating webhook subscription:', subscription);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSubscription: WebhookSubscription = {
      ...subscription,
      id: `wh_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    return { success: true, data: newSubscription };
  },

  // Get all webhook subscriptions
  async getSubscriptions(): Promise<{ success: boolean; data?: WebhookSubscription[]; error?: string }> {
    console.log('Fetching webhook subscriptions');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockSubscriptions: WebhookSubscription[] = [
      {
        id: 'wh_001',
        url: 'https://myapp.com/webhooks/orders',
        events: ['order.created', 'order.updated', 'order.shipped'],
        secret: 'whsec_1234567890abcdef',
        active: true,
        createdAt: '2024-01-15T10:00:00Z',
        lastTriggered: '2024-03-10T14:30:00Z',
      },
      {
        id: 'wh_002',
        url: 'https://analytics.example.com/webhook',
        events: ['payment.succeeded', 'order.delivered'],
        secret: 'whsec_abcdef1234567890',
        active: true,
        createdAt: '2024-02-01T09:00:00Z',
        lastTriggered: '2024-03-09T16:45:00Z',
      },
      {
        id: 'wh_003',
        url: 'https://inventory.example.com/webhook',
        events: ['product.stock_low', 'product.stock_out', 'inventory.alert'],
        secret: 'whsec_9876543210fedcba',
        active: false,
        createdAt: '2024-02-15T11:30:00Z',
      },
    ];
    
    return { success: true, data: mockSubscriptions };
  },

  // Update webhook subscription
  async updateSubscription(id: string, updates: Partial<WebhookSubscription>): Promise<{ success: boolean; data?: WebhookSubscription; error?: string }> {
    console.log(`Updating webhook subscription ${id}:`, updates);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, data: { id, ...updates } as WebhookSubscription };
  },

  // Delete webhook subscription
  async deleteSubscription(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    console.log(`Deleting webhook subscription: ${id}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Webhook subscription deleted successfully.' };
  },

  // Test webhook subscription
  async testSubscription(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    console.log(`Testing webhook subscription: ${id}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Test webhook sent successfully.' };
  },

  // Get webhook deliveries
  async getDeliveries(subscriptionId?: string): Promise<{ success: boolean; data?: WebhookDelivery[]; error?: string }> {
    console.log('Fetching webhook deliveries', subscriptionId ? `for subscription: ${subscriptionId}` : '');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockDeliveries: WebhookDelivery[] = [
      {
        id: 'del_001',
        subscriptionId: 'wh_001',
        eventId: 'evt_001',
        status: 'delivered',
        attempts: 1,
        maxAttempts: 3,
        responseCode: 200,
        responseBody: 'OK',
        createdAt: '2024-03-10T14:30:00Z',
        deliveredAt: '2024-03-10T14:30:05Z',
      },
      {
        id: 'del_002',
        subscriptionId: 'wh_001',
        eventId: 'evt_002',
        status: 'failed',
        attempts: 3,
        maxAttempts: 3,
        responseCode: 500,
        responseBody: 'Internal Server Error',
        createdAt: '2024-03-10T15:00:00Z',
      },
      {
        id: 'del_003',
        subscriptionId: 'wh_002',
        eventId: 'evt_003',
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
        nextRetryAt: '2024-03-10T16:00:00Z',
        createdAt: '2024-03-10T15:30:00Z',
      },
    ];
    
    const filteredDeliveries = subscriptionId 
      ? mockDeliveries.filter(d => d.subscriptionId === subscriptionId)
      : mockDeliveries;
    
    return { success: true, data: filteredDeliveries };
  },

  // Retry failed webhook delivery
  async retryDelivery(deliveryId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    console.log(`Retrying webhook delivery: ${deliveryId}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Webhook delivery retry initiated.' };
  },

  // Get webhook event logs
  async getEventLogs(eventType?: string, limit: number = 50): Promise<{ success: boolean; data?: WebhookEvent[]; error?: string }> {
    console.log('Fetching webhook event logs', eventType ? `for event type: ${eventType}` : '');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockEvents: WebhookEvent[] = [
      {
        id: 'evt_001',
        type: 'order.created',
        data: {
          orderId: 'CP20240310001',
          customerId: 'cust_001',
          total: 89.90,
          currency: 'EUR',
        },
        timestamp: '2024-03-10T14:30:00Z',
        source: 'api',
      },
      {
        id: 'evt_002',
        type: 'payment.succeeded',
        data: {
          paymentId: 'pay_001',
          orderId: 'CP20240310001',
          amount: 89.90,
          currency: 'EUR',
        },
        timestamp: '2024-03-10T14:31:00Z',
        source: 'payment_gateway',
      },
      {
        id: 'evt_003',
        type: 'product.stock_low',
        data: {
          productId: 'prod_001',
          productName: 'Tibet Armband',
          currentStock: 5,
          minStockLevel: 10,
        },
        timestamp: '2024-03-10T15:00:00Z',
        source: 'inventory_system',
      },
    ];
    
    const filteredEvents = eventType 
      ? mockEvents.filter(e => e.type === eventType)
      : mockEvents;
    
    return { success: true, data: filteredEvents.slice(0, limit) };
  },

  // Validate webhook signature
  validateSignature(payload: string, signature: string, secret: string): boolean {
    // In a real implementation, this would use HMAC-SHA256 to validate the signature
    console.log('Validating webhook signature');
    
    // Mock validation - in real app, use crypto.createHmac('sha256', secret).update(payload).digest('hex')
    const expectedSignature = `sha256=${Buffer.from(secret + payload).toString('hex')}`;
    return signature === expectedSignature;
  },

  // Generate webhook signature
  generateSignature(payload: string, secret: string): string {
    // In a real implementation, this would generate HMAC-SHA256 signature
    console.log('Generating webhook signature');
    
    // Mock signature generation
    return `sha256=${Buffer.from(secret + payload).toString('hex')}`;
  },

  // Webhook event examples
  getEventExamples(): Record<string, any> {
    return {
      'order.created': {
        id: 'evt_order_created_001',
        type: 'order.created',
        data: {
          order: {
            id: 'CP20240310001',
            customerId: 'cust_001',
            status: 'pending',
            total: 89.90,
            currency: 'EUR',
            items: [
              {
                productId: 'prod_001',
                name: 'Tibet Armband',
                quantity: 2,
                price: 24.90,
              },
            ],
            shippingAddress: {
              name: 'Max Mustermann',
              street: 'Musterstraße 123',
              city: '12345 Musterstadt',
              country: 'Deutschland',
            },
            createdAt: '2024-03-10T14:30:00Z',
          },
        },
        timestamp: '2024-03-10T14:30:00Z',
        source: 'api',
      },
      'payment.succeeded': {
        id: 'evt_payment_succeeded_001',
        type: 'payment.succeeded',
        data: {
          payment: {
            id: 'pay_001',
            orderId: 'CP20240310001',
            amount: 89.90,
            currency: 'EUR',
            method: 'credit_card',
            status: 'succeeded',
            processedAt: '2024-03-10T14:31:00Z',
          },
        },
        timestamp: '2024-03-10T14:31:00Z',
        source: 'payment_gateway',
      },
      'product.stock_low': {
        id: 'evt_stock_low_001',
        type: 'product.stock_low',
        data: {
          product: {
            id: 'prod_001',
            name: 'Tibet Armband',
            sku: 'CP-ARM-001',
            currentStock: 5,
            minStockLevel: 10,
            status: 'low_stock',
          },
        },
        timestamp: '2024-03-10T15:00:00Z',
        source: 'inventory_system',
      },
    };
  },

  // Webhook configuration helpers
  getDefaultEvents(): string[] {
    return [
      'order.created',
      'order.updated',
      'order.shipped',
      'order.delivered',
      'payment.succeeded',
      'payment.failed',
      'customer.created',
      'product.stock_low',
      'product.stock_out',
    ];
  },

  getEventCategories(): Record<string, string[]> {
    return {
      'Orders': [
        'order.created',
        'order.updated',
        'order.cancelled',
        'order.shipped',
        'order.delivered',
      ],
      'Payments': [
        'payment.created',
        'payment.succeeded',
        'payment.failed',
        'payment.refunded',
      ],
      'Customers': [
        'customer.created',
        'customer.updated',
        'customer.deleted',
      ],
      'Products': [
        'product.created',
        'product.updated',
        'product.deleted',
        'product.stock_low',
        'product.stock_out',
      ],
      'Reviews': [
        'review.created',
        'review.updated',
        'review.deleted',
      ],
      'Newsletter': [
        'newsletter.subscribed',
        'newsletter.unsubscribed',
      ],
      'Inventory': [
        'inventory.updated',
        'inventory.alert',
      ],
      'Content': [
        'blog_post.created',
        'blog_post.updated',
        'blog_post.published',
        'blog_post.deleted',
      ],
    };
  },
};
