// Email Notifications Service - Real email service integration
export interface EmailProvider {
  name: string;
  type: 'smtp' | 'api' | 'service';
  config: {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
    apiKey?: string;
    apiUrl?: string;
  };
  enabled: boolean;
  priority: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'notification';
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  recipientList: string[];
  scheduledAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sentCount: number;
  failedCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribes: number;
  complaints: number;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, any>;
  tags?: string[];
  unsubscribed?: boolean;
  bounced?: boolean;
  complained?: boolean;
}

class EmailNotificationsService {
  private providers: EmailProvider[] = [];
  private baseUrl: string;
  private defaultProvider: string = 'smtp';

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.initializeProviders();
  }

  // Initialize email providers
  private initializeProviders(): void {
    this.providers = [
      {
        name: 'smtp',
        type: 'smtp',
        config: {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        },
        enabled: true,
        priority: 1
      },
      {
        name: 'sendgrid',
        type: 'api',
        config: {
          apiKey: process.env.SENDGRID_API_KEY || '',
          apiUrl: 'https://api.sendgrid.com/v3/mail/send'
        },
        enabled: !!process.env.SENDGRID_API_KEY,
        priority: 2
      },
      {
        name: 'mailgun',
        type: 'api',
        config: {
          apiKey: process.env.MAILGUN_API_KEY || '',
          apiUrl: `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`
        },
        enabled: !!process.env.MAILGUN_API_KEY,
        priority: 3
      },
      {
        name: 'ses',
        type: 'service',
        config: {
          apiKey: process.env.AWS_ACCESS_KEY_ID || '',
          apiUrl: 'https://email.us-east-1.amazonaws.com'
        },
        enabled: !!process.env.AWS_ACCESS_KEY_ID,
        priority: 4
      }
    ];
  }

  // Send transactional email
  async sendTransactionalEmail(
    to: string | string[],
    template: string,
    variables: Record<string, any> = {},
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          template,
          variables,
          attachments,
          type: 'transactional'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send transactional email');
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(
    orderData: {
      orderId: string;
      customerEmail: string;
      customerName: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
        image?: string;
      }>;
      total: number;
      shippingAddress: any;
      billingAddress: any;
      paymentMethod: string;
      estimatedDelivery: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      orderData.customerEmail,
      'order-confirmation',
      {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        estimatedDelivery: orderData.estimatedDelivery,
        orderUrl: `${window.location.origin}/order/${orderData.orderId}`,
        trackingUrl: `${window.location.origin}/track/${orderData.orderId}`
      }
    );
  }

  // Send order status update email
  async sendOrderStatusUpdate(
    orderData: {
      orderId: string;
      customerEmail: string;
      customerName: string;
      status: string;
      trackingNumber?: string;
      trackingUrl?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      orderData.customerEmail,
      'order-status-update',
      {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        status: orderData.status,
        trackingNumber: orderData.trackingNumber,
        trackingUrl: orderData.trackingUrl,
        notes: orderData.notes,
        orderUrl: `${window.location.origin}/order/${orderData.orderId}`
      }
    );
  }

  // Send welcome email
  async sendWelcomeEmail(
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      verificationUrl?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      userData.email,
      'welcome',
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        verificationUrl: userData.verificationUrl,
        accountUrl: `${window.location.origin}/account`,
        shopUrl: `${window.location.origin}/products`
      }
    );
  }

  // Send password reset email
  async sendPasswordResetEmail(
    userData: {
      email: string;
      firstName: string;
      resetUrl: string;
      expiresIn: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      userData.email,
      'password-reset',
      {
        firstName: userData.firstName,
        resetUrl: userData.resetUrl,
        expiresIn: userData.expiresIn,
        supportUrl: `${window.location.origin}/contact`
      }
    );
  }

  // Send newsletter confirmation
  async sendNewsletterConfirmation(
    email: string,
    unsubscribeUrl: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      email,
      'newsletter-confirmation',
      {
        email,
        unsubscribeUrl,
        preferencesUrl: `${window.location.origin}/newsletter/preferences`
      }
    );
  }

  // Send contact form notification
  async sendContactNotification(
    contactData: {
      name: string;
      email: string;
      subject: string;
      message: string;
      category: string;
      adminEmail: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      contactData.adminEmail,
      'contact-notification',
      {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        category: contactData.category,
        replyUrl: `mailto:${contactData.email}?subject=Re: ${contactData.subject}`
      }
    );
  }

  // Send low stock alert
  async sendLowStockAlert(
    productData: {
      productId: string;
      productName: string;
      currentStock: number;
      minStockLevel: number;
      adminEmails: string[];
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTransactionalEmail(
      productData.adminEmails,
      'low-stock-alert',
      {
        productId: productData.productId,
        productName: productData.productName,
        currentStock: productData.currentStock,
        minStockLevel: productData.minStockLevel,
        productUrl: `${window.location.origin}/admin/products/${productData.productId}`,
        inventoryUrl: `${window.location.origin}/admin/inventory`
      }
    );
  }

  // Send marketing email
  async sendMarketingEmail(
    campaign: EmailCampaign,
    recipients: EmailRecipient[]
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/email/campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          scheduledAt: campaign.scheduledAt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send marketing email');
      }

      const data = await response.json();
      return {
        success: true,
        sent: data.sent,
        failed: data.failed,
        errors: data.errors || []
      };
    } catch (error) {
      return {
        success: false,
        sent: 0,
        failed: recipients.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Create email template
  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; template?: EmailTemplate; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/email/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        throw new Error('Failed to create email template');
      }

      const data = await response.json();
      return {
        success: true,
        template: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get email templates
  async getEmailTemplates(params?: {
    category?: string;
    language?: string;
    page?: number;
    limit?: number;
  }): Promise<{ templates: EmailTemplate[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/api/v1/email/templates?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to get email templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get email templates:', error);
      return { templates: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Get email statistics
  async getEmailStats(dateFrom?: string, dateTo?: string): Promise<EmailStats> {
    try {
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await fetch(`${this.baseUrl}/api/v1/email/stats?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to get email statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get email statistics:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalBounced: 0,
        totalOpened: 0,
        totalClicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        unsubscribes: 0,
        complaints: 0
      };
    }
  }

  // Handle email webhooks
  async handleEmailWebhook(webhook: {
    type: string;
    data: any;
    timestamp: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/email/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhook)
      });

      if (!response.ok) {
        throw new Error('Webhook processing failed');
      }

      return {
        success: true,
        message: 'Email webhook processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Email webhook processing failed'
      };
    }
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<{ success: boolean; message: string; providers: Array<{ name: string; status: string; error?: string }> }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/email/test`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Email configuration test failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Email configuration test completed',
        providers: data.providers
      };
    } catch (error) {
      return {
        success: false,
        message: 'Email configuration test failed',
        providers: []
      };
    }
  }

  // Get available email providers
  getEmailProviders(): EmailProvider[] {
    return this.providers.filter(provider => provider.enabled);
  }

  // Get default email provider
  getDefaultProvider(): EmailProvider | null {
    return this.providers.find(provider => provider.name === this.defaultProvider) || null;
  }

  // Set default email provider
  setDefaultProvider(providerName: string): void {
    if (this.providers.find(provider => provider.name === providerName)) {
      this.defaultProvider = providerName;
    }
  }
}

export const emailNotificationsService = new EmailNotificationsService();
