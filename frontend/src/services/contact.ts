// Contact Service
export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: 'general' | 'order' | 'product' | 'complaint' | 'other';
  orderNumber?: string;
  productId?: number;
  preferredContact: 'email' | 'phone';
  consent: boolean;
  submittedAt: Date;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: any;
}

class ContactService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  async sendMessage(message: Omit<ContactMessage, 'submittedAt'>): Promise<ContactResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Contact form submission failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Deine Nachricht wurde erfolgreich gesendet! Wir melden uns schnellstmöglich bei dir.',
        data
      };
    } catch (error) {
      console.error('Contact form error:', error);
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

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  validateMessage(message: ContactMessage): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message.name.trim()) {
      errors.push('Name ist erforderlich');
    }

    if (!message.email.trim()) {
      errors.push('E-Mail-Adresse ist erforderlich');
    } else if (!this.validateEmail(message.email)) {
      errors.push('Bitte gib eine gültige E-Mail-Adresse ein');
    }

    if (message.phone && !this.validatePhone(message.phone)) {
      errors.push('Bitte gib eine gültige Telefonnummer ein');
    }

    if (!message.subject.trim()) {
      errors.push('Betreff ist erforderlich');
    }

    if (!message.message.trim()) {
      errors.push('Nachricht ist erforderlich');
    } else if (message.message.trim().length < 10) {
      errors.push('Nachricht muss mindestens 10 Zeichen lang sein');
    }

    if (!message.consent) {
      errors.push('Du musst den Datenschutzbestimmungen zustimmen');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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

  // Show validation errors
  showValidationErrors(errors: string[]): void {
    const errorMessage = errors.join(', ');
    this.showMessage(errorMessage, false);
  }
}

export const contactService = new ContactService();
