// Payment Service
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'paypal' | 'stripe' | 'klarna' | 'bank_transfer';
  enabled: boolean;
  icon: string;
  description: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  billingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    description?: string;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  redirectUrl?: string;
  clientSecret?: string;
  data?: any;
}

class PaymentService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  // Available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'paypal',
        name: 'PayPal',
        type: 'paypal',
        enabled: true,
        icon: 'fab fa-paypal',
        description: 'Sicher bezahlen mit PayPal'
      },
      {
        id: 'stripe',
        name: 'Kreditkarte',
        type: 'stripe',
        enabled: true,
        icon: 'fas fa-credit-card',
        description: 'Visa, Mastercard, American Express'
      },
      {
        id: 'klarna',
        name: 'Klarna',
        type: 'klarna',
        enabled: true,
        icon: 'fas fa-shopping-cart',
        description: 'Kauf auf Rechnung, Ratenzahlung'
      },
      {
        id: 'bank_transfer',
        name: 'Vorkasse',
        type: 'bank_transfer',
        enabled: true,
        icon: 'fas fa-university',
        description: 'Überweisung vor Lieferung'
      }
    ];
  }

  // Create payment intent
  async createPaymentIntent(paymentData: PaymentData, method: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          paymentMethod: method
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Payment intent creation failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Zahlungsintent erfolgreich erstellt',
        paymentId: data.paymentId,
        redirectUrl: data.redirectUrl,
        clientSecret: data.clientSecret,
        data
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten beim Erstellen der Zahlung'
      };
    }
  }

  // Process PayPal payment
  async processPayPalPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'PayPal payment failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'PayPal-Zahlung erfolgreich initiiert',
        redirectUrl: data.redirectUrl,
        paymentId: data.paymentId,
        data
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'PayPal-Zahlung fehlgeschlagen'
      };
    }
  }

  // Process Stripe payment
  async processStripePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Stripe payment failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Stripe-Zahlung erfolgreich initiiert',
        clientSecret: data.clientSecret,
        paymentId: data.paymentId,
        data
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Stripe-Zahlung fehlgeschlagen'
      };
    }
  }

  // Process Klarna payment
  async processKlarnaPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/klarna`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Klarna payment failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Klarna-Zahlung erfolgreich initiiert',
        redirectUrl: data.redirectUrl,
        paymentId: data.paymentId,
        data
      };
    } catch (error) {
      console.error('Klarna payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Klarna-Zahlung fehlgeschlagen'
      };
    }
  }

  // Process bank transfer
  async processBankTransfer(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/bank-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Bank transfer failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Vorkasse-Zahlung erfolgreich erstellt',
        paymentId: data.paymentId,
        data
      };
    } catch (error) {
      console.error('Bank transfer error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Vorkasse-Zahlung fehlgeschlagen'
      };
    }
  }

  // Confirm payment
  async confirmPayment(paymentId: string, paymentMethod: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          paymentMethod
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Payment confirmation failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Zahlung erfolgreich bestätigt',
        data
      };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Zahlungsbestätigung fehlgeschlagen'
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/status/${paymentId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Payment status check failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Zahlungsstatus erfolgreich abgerufen',
        data
      };
    } catch (error) {
      console.error('Payment status error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Zahlungsstatus konnte nicht abgerufen werden'
      };
    }
  }

  // Show payment messages
  showMessage(message: string, isSuccess: boolean = true): void {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
      isSuccess 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

export const paymentService = new PaymentService();
