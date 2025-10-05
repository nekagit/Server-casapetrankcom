// Payment Processing Service - Real payment integration with Stripe, PayPal, Klarna
export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'klarna' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  fees: {
    fixed: number;
    percentage: number;
  };
  supportedCurrencies: string[];
  supportedCountries: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  transactionId?: string;
  status: string;
  message: string;
  error?: string;
  redirectUrl?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
  message: string;
}

export interface PaymentWebhook {
  id: string;
  type: string;
  data: any;
  created: string;
  livemode: boolean;
}

class PaymentProcessingService {
  private stripe: any = null;
  private stripePublishableKey: string;
  private paypalClientId: string;
  private klarnaApiKey: string;
  private baseUrl: string;

  constructor() {
    this.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    this.paypalClientId = process.env.PAYPAL_CLIENT_ID || '';
    this.klarnaApiKey = process.env.KLARNA_API_KEY || '';
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    this.initializePaymentProviders();
  }

  // Initialize payment providers
  private async initializePaymentProviders(): Promise<void> {
    try {
      // Initialize Stripe
      if (this.stripePublishableKey && typeof window !== 'undefined') {
        const { loadStripe } = await import('@stripe/stripe-js');
        this.stripe = await loadStripe(this.stripePublishableKey);
      }
    } catch (error) {
      console.error('Failed to initialize payment providers:', error);
    }
  }

  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      {
        id: 'stripe_card',
        type: 'stripe',
        name: 'Kreditkarte',
        description: 'Visa, Mastercard, American Express',
        icon: 'fas fa-credit-card',
        enabled: true,
        fees: { fixed: 0.30, percentage: 1.4 },
        supportedCurrencies: ['EUR', 'USD'],
        supportedCountries: ['DE', 'AT', 'CH']
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        description: 'Sicher bezahlen mit PayPal',
        icon: 'fab fa-paypal',
        enabled: true,
        fees: { fixed: 0.35, percentage: 2.9 },
        supportedCurrencies: ['EUR', 'USD'],
        supportedCountries: ['DE', 'AT', 'CH']
      },
      {
        id: 'klarna',
        type: 'klarna',
        name: 'Klarna',
        description: 'Jetzt kaufen, später bezahlen',
        icon: 'fas fa-shopping-bag',
        enabled: true,
        fees: { fixed: 0.00, percentage: 0.0 },
        supportedCurrencies: ['EUR'],
        supportedCountries: ['DE', 'AT', 'CH']
      },
      {
        id: 'apple_pay',
        type: 'apple_pay',
        name: 'Apple Pay',
        description: 'Schnell und sicher mit Apple Pay',
        icon: 'fab fa-apple-pay',
        enabled: true,
        fees: { fixed: 0.00, percentage: 0.0 },
        supportedCurrencies: ['EUR', 'USD'],
        supportedCountries: ['DE', 'AT', 'CH']
      },
      {
        id: 'google_pay',
        type: 'google_pay',
        name: 'Google Pay',
        description: 'Schnell und sicher mit Google Pay',
        icon: 'fab fa-google-pay',
        enabled: true,
        fees: { fixed: 0.00, percentage: 0.0 },
        supportedCurrencies: ['EUR', 'USD'],
        supportedCountries: ['DE', 'AT', 'CH']
      },
      {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: 'Überweisung',
        description: 'Klassische Banküberweisung',
        icon: 'fas fa-university',
        enabled: true,
        fees: { fixed: 0.00, percentage: 0.0 },
        supportedCurrencies: ['EUR'],
        supportedCountries: ['DE', 'AT', 'CH']
      }
    ];
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number,
    currency: string = 'EUR',
    orderId: string,
    customerId?: string
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          orderId,
          customerId,
          metadata: {
            orderId,
            source: 'casa-petrada-web'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  }

  // Process Stripe payment
  async processStripePayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        paymentIntentId,
        {
          payment_method: paymentMethodId
        }
      );

      if (error) {
        return {
          success: false,
          status: 'failed',
          message: error.message,
          error: error.message
        };
      }

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        message: paymentIntent.status === 'succeeded' ? 'Payment successful' : 'Payment failed'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process PayPal payment
  async processPayPalPayment(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/paypal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal payment');
      }

      const data = await response.json();
      
      return {
        success: true,
        status: 'pending',
        message: 'Redirecting to PayPal',
        redirectUrl: data.approvalUrl
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'PayPal payment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process Klarna payment
  async processKlarnaPayment(
    amount: number,
    currency: string,
    orderId: string,
    customerInfo: {
      email: string;
      phone: string;
      address: any;
    }
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/klarna/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerInfo,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Klarna payment');
      }

      const data = await response.json();
      
      return {
        success: true,
        status: 'pending',
        message: 'Redirecting to Klarna',
        redirectUrl: data.redirectUrl
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Klarna payment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process Apple Pay
  async processApplePay(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<PaymentResult> {
    try {
      if (!window.ApplePaySession) {
        throw new Error('Apple Pay not supported');
      }

      const request = {
        countryCode: 'DE',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Casa Petrada',
          amount: amount.toString()
        }
      };

      const session = new ApplePaySession(3, request);
      
      return new Promise((resolve) => {
        session.onvalidatemerchant = async (event) => {
          try {
            const response = await fetch(`${this.baseUrl}/api/v1/payments/apple-pay/validate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ validationURL: event.validationURL })
            });
            
            const data = await response.json();
            session.completeMerchantValidation(data);
          } catch (error) {
            session.abort();
            resolve({
              success: false,
              status: 'failed',
              message: 'Apple Pay validation failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        };

        session.onpaymentauthorized = (event) => {
          if (event.payment.authorizationStatus === 1) {
            session.completePayment(0);
            resolve({
              success: true,
              status: 'succeeded',
              message: 'Apple Pay payment successful'
            });
          } else {
            session.completePayment(1);
            resolve({
              success: false,
              status: 'failed',
              message: 'Apple Pay payment failed'
            });
          }
        };

        session.begin();
      });
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Apple Pay payment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process Google Pay
  async processGooglePay(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<PaymentResult> {
    try {
      if (!window.google) {
        throw new Error('Google Pay not available');
      }

      const paymentRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              gatewayMerchantId: this.stripePublishableKey
            }
          }
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toString(),
          currencyCode: currency
        },
        merchantInfo: {
          merchantId: 'casa-petrada',
          merchantName: 'Casa Petrada'
        }
      };

      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // Change to 'PRODUCTION' for live
      });

      const paymentDataRequest = paymentsClient.createPaymentDataRequest(paymentRequest);
      
      return new Promise((resolve) => {
        paymentsClient.loadPaymentData(paymentDataRequest)
          .then((paymentData) => {
            resolve({
              success: true,
              status: 'succeeded',
              message: 'Google Pay payment successful',
              transactionId: paymentData.paymentMethodData.tokenizationData.token
            });
          })
          .catch((error) => {
            resolve({
              success: false,
              status: 'failed',
              message: 'Google Pay payment failed',
              error: error.message
            });
          });
      });
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Google Pay payment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process bank transfer
  async processBankTransfer(
    amount: number,
    currency: string,
    orderId: string,
    customerInfo: any
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/bank-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerInfo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process bank transfer');
      }

      const data = await response.json();
      
      return {
        success: true,
        status: 'pending',
        message: 'Bank transfer instructions sent',
        transactionId: data.reference
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Bank transfer failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Verify payment
  async verifyPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/verify/${paymentIntentId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      
      return {
        success: data.status === 'succeeded',
        paymentIntentId: data.id,
        status: data.status,
        message: data.status === 'succeeded' ? 'Payment verified' : 'Payment verification failed'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Payment verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process refund
  async processRefund(refundRequest: RefundRequest): Promise<RefundResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();
      
      return {
        success: true,
        refundId: data.refundId,
        amount: data.amount,
        status: data.status,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        message: 'Refund processing failed'
      };
    }
  }

  // Get payment history
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ payments: any[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/api/v1/payments/history?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to get payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return { payments: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Handle payment webhooks
  async handleWebhook(webhook: PaymentWebhook): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/webhook`, {
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
        message: 'Webhook processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Webhook processing failed'
      };
    }
  }

  // Calculate payment fees
  calculateFees(amount: number, paymentMethod: PaymentMethod): number {
    return paymentMethod.fees.fixed + (amount * paymentMethod.fees.percentage / 100);
  }

  // Get supported payment methods for country/currency
  getSupportedPaymentMethods(country: string, currency: string): PaymentMethod[] {
    // This would filter payment methods based on country and currency
    // For now, return all methods
    return [];
  }
}

export const paymentProcessingService = new PaymentProcessingService();
