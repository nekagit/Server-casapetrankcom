// Monitoring & Analytics Service - Real monitoring and analytics integration
export interface AnalyticsConfig {
  googleAnalytics: {
    measurementId: string;
    enabled: boolean;
  };
  googleTagManager: {
    containerId: string;
    enabled: boolean;
  };
  facebookPixel: {
    pixelId: string;
    enabled: boolean;
  };
  hotjar: {
    siteId: string;
    enabled: boolean;
  };
  custom: {
    endpoint: string;
    apiKey: string;
    enabled: boolean;
  };
}

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  fmp: number; // First Meaningful Paint
  si: number; // Speed Index
  tbt: number; // Total Blocking Time
}

export interface UserBehavior {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  sessionDuration: number;
  pagesPerSession: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  checkoutCompletionRate: number;
}

export interface BusinessMetrics {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  returnCustomerRate: number;
  topProducts: Array<{
    productId: string;
    name: string;
    views: number;
    purchases: number;
    revenue: number;
  }>;
  topCategories: Array<{
    categoryId: string;
    name: string;
    views: number;
    purchases: number;
    revenue: number;
  }>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface UptimeStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  incidents: Array<{
    start: string;
    end?: string;
    duration?: number;
    description: string;
  }>;
}

class MonitoringAnalyticsService {
  private config: AnalyticsConfig;
  private baseUrl: string;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.config = {
      googleAnalytics: {
        measurementId: process.env.GA_MEASUREMENT_ID || '',
        enabled: !!process.env.GA_MEASUREMENT_ID
      },
      googleTagManager: {
        containerId: process.env.GTM_CONTAINER_ID || '',
        enabled: !!process.env.GTM_CONTAINER_ID
      },
      facebookPixel: {
        pixelId: process.env.FB_PIXEL_ID || '',
        enabled: !!process.env.FB_PIXEL_ID
      },
      hotjar: {
        siteId: process.env.HOTJAR_SITE_ID || '',
        enabled: !!process.env.HOTJAR_SITE_ID
      },
      custom: {
        endpoint: process.env.ANALYTICS_ENDPOINT || '',
        apiKey: process.env.ANALYTICS_API_KEY || '',
        enabled: !!process.env.ANALYTICS_ENDPOINT
      }
    };
    
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  // Initialize analytics
  private initializeAnalytics(): void {
    if (typeof window === 'undefined') return;

    // Initialize Google Analytics
    if (this.config.googleAnalytics.enabled) {
      this.initializeGoogleAnalytics();
    }

    // Initialize Google Tag Manager
    if (this.config.googleTagManager.enabled) {
      this.initializeGoogleTagManager();
    }

    // Initialize Facebook Pixel
    if (this.config.facebookPixel.enabled) {
      this.initializeFacebookPixel();
    }

    // Initialize Hotjar
    if (this.config.hotjar.enabled) {
      this.initializeHotjar();
    }

    // Initialize custom analytics
    if (this.config.custom.enabled) {
      this.initializeCustomAnalytics();
    }
  }

  // Initialize Google Analytics
  private initializeGoogleAnalytics(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', this.config.googleAnalytics.measurementId);
  }

  // Initialize Google Tag Manager
  private initializeGoogleTagManager(): void {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.config.googleTagManager.containerId}');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${this.config.googleTagManager.containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  // Initialize Facebook Pixel
  private initializeFacebookPixel(): void {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${this.config.facebookPixel.pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  // Initialize Hotjar
  private initializeHotjar(): void {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${this.config.hotjar.siteId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(script);
  }

  // Initialize custom analytics
  private initializeCustomAnalytics(): void {
    // Custom analytics initialization
    console.log('Custom analytics initialized');
  }

  // Track page view
  trackPageView(page: string, title?: string): void {
    const data = {
      page,
      title: title || document.title,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        page_title: data.title,
        page_location: data.url
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel.enabled && window.fbq) {
      window.fbq('track', 'PageView');
    }

    // Custom analytics
    if (this.config.custom.enabled) {
      this.sendCustomEvent('page_view', data);
    }
  }

  // Track event
  trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    const data = {
      event: eventName,
      parameters,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    // Facebook Pixel
    if (this.config.facebookPixel.enabled && window.fbq) {
      window.fbq('track', eventName, parameters);
    }

    // Custom analytics
    if (this.config.custom.enabled) {
      this.sendCustomEvent('custom_event', data);
    }
  }

  // Track e-commerce events
  trackEcommerceEvent(eventName: string, data: any): void {
    switch (eventName) {
      case 'purchase':
        this.trackPurchase(data);
        break;
      case 'add_to_cart':
        this.trackAddToCart(data);
        break;
      case 'remove_from_cart':
        this.trackRemoveFromCart(data);
        break;
      case 'view_item':
        this.trackViewItem(data);
        break;
      case 'begin_checkout':
        this.trackBeginCheckout(data);
        break;
      case 'add_payment_info':
        this.trackAddPaymentInfo(data);
        break;
      case 'add_shipping_info':
        this.trackAddShippingInfo(data);
        break;
    }
  }

  // Track purchase
  private trackPurchase(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: data.transactionId,
        value: data.value,
        currency: data.currency,
        items: data.items
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel.enabled && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: data.value,
        currency: data.currency
      });
    }
  }

  // Track add to cart
  private trackAddToCart(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel.enabled && window.fbq) {
      window.fbq('track', 'AddToCart', {
        value: data.value,
        currency: data.currency
      });
    }
  }

  // Track remove from cart
  private trackRemoveFromCart(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    }
  }

  // Track view item
  private trackViewItem(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel.enabled && window.fbq) {
      window.fbq('track', 'ViewContent', {
        value: data.value,
        currency: data.currency
      });
    }
  }

  // Track begin checkout
  private trackBeginCheckout(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel.enabled && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: data.value,
        currency: data.currency
      });
    }
  }

  // Track add payment info
  private trackAddPaymentInfo(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'add_payment_info', {
        currency: data.currency,
        value: data.value,
        payment_type: data.paymentType
      });
    }
  }

  // Track add shipping info
  private trackAddShippingInfo(data: any): void {
    // Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', 'add_shipping_info', {
        currency: data.currency,
        value: data.value,
        shipping_tier: data.shippingTier
      });
    }
  }

  // Track performance metrics
  trackPerformanceMetrics(metrics: PerformanceMetrics): void {
    const data = {
      ...metrics,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Send to custom analytics
    if (this.config.custom.enabled) {
      this.sendCustomEvent('performance_metrics', data);
    }

    // Send to backend
    this.sendToBackend('/analytics/performance', data);
  }

  // Track user behavior
  trackUserBehavior(behavior: UserBehavior): void {
    const data = {
      ...behavior,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Send to custom analytics
    if (this.config.custom.enabled) {
      this.sendCustomEvent('user_behavior', data);
    }

    // Send to backend
    this.sendToBackend('/analytics/behavior', data);
  }

  // Track business metrics
  trackBusinessMetrics(metrics: BusinessMetrics): void {
    const data = {
      ...metrics,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Send to custom analytics
    if (this.config.custom.enabled) {
      this.sendCustomEvent('business_metrics', data);
    }

    // Send to backend
    this.sendToBackend('/analytics/business', data);
  }

  // Track error
  trackError(error: Error, context?: Record<string, any>): void {
    const errorData: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack || '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      severity: this.determineErrorSeverity(error),
      resolved: false
    };

    // Send to custom analytics
    if (this.config.custom.enabled) {
      this.sendCustomEvent('error', errorData);
    }

    // Send to backend
    this.sendToBackend('/analytics/error', errorData);
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/performance`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return null;
    }
  }

  // Get user behavior metrics
  async getUserBehaviorMetrics(): Promise<UserBehavior | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/behavior`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user behavior metrics:', error);
      return null;
    }
  }

  // Get business metrics
  async getBusinessMetrics(): Promise<BusinessMetrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/business`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      return null;
    }
  }

  // Get uptime status
  async getUptimeStatus(): Promise<UptimeStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/monitoring/uptime`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get uptime status:', error);
      return null;
    }
  }

  // Get error reports
  async getErrorReports(limit: number = 50): Promise<ErrorReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/monitoring/errors?limit=${limit}`);
      
      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get error reports:', error);
      return [];
    }
  }

  // Set user ID
  setUserId(userId: string): void {
    this.userId = userId;
    
    // Update Google Analytics
    if (this.config.googleAnalytics.enabled && window.gtag) {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        user_id: userId
      });
    }
  }

  // Send custom event
  private sendCustomEvent(eventType: string, data: any): void {
    if (this.config.custom.enabled) {
      fetch(this.config.custom.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.custom.apiKey}`
        },
        body: JSON.stringify({
          eventType,
          data,
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.error('Failed to send custom event:', error);
      });
    }
  }

  // Send to backend
  private sendToBackend(endpoint: string, data: any): void {
    fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('Failed to send to backend:', error);
    });
  }

  // Generate session ID
  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Generate error ID
  private generateErrorId(): string {
    return 'error_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Determine error severity
  private determineErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'medium';
    }
    if (error.message.includes('TypeError') || error.message.includes('ReferenceError')) {
      return 'high';
    }
    if (error.message.includes('Security') || error.message.includes('CORS')) {
      return 'critical';
    }
    return 'low';
  }

  // Get analytics configuration
  getAnalyticsConfig(): AnalyticsConfig {
    return this.config;
  }

  // Update analytics configuration
  updateAnalyticsConfig(updates: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

export const monitoringAnalyticsService = new MonitoringAnalyticsService();
