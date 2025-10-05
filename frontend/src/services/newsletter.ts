// Newsletter Service
export interface NewsletterSubscription {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: {
    productUpdates: boolean;
    blogPosts: boolean;
    sales: boolean;
    newArrivals: boolean;
  };
  source?: string; // Where the subscription came from
  subscribedAt: Date;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: any;
}

class NewsletterService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  async subscribe(subscription: Omit<NewsletterSubscription, 'subscribedAt'>): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...subscription,
          subscribedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Newsletter subscription failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Erfolgreich für den Newsletter angemeldet!',
        data
      };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
      };
    }
  }

  async unsubscribe(email: string): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Newsletter unsubscription failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Erfolgreich vom Newsletter abgemeldet.',
        data
      };
    } catch (error) {
      console.error('Newsletter unsubscription error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
      };
    }
  }

  async updatePreferences(email: string, preferences: NewsletterSubscription['preferences']): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/newsletter/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, preferences })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Preferences update failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Newsletter-Einstellungen erfolgreich aktualisiert!',
        data
      };
    } catch (error) {
      console.error('Newsletter preferences update error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
      };
    }
  }

  // Client-side validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Show success/error messages
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

export const newsletterService = new NewsletterService();
