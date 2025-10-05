// Discount System Service
export interface Discount {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // Percentage (0-100) or fixed amount
  minimumAmount?: number;
  maximumDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  customerLimit?: number; // Per customer usage limit
  applicableProducts?: string[]; // Product IDs
  applicableCategories?: string[]; // Category names
  excludedProducts?: string[]; // Product IDs
  customerGroups?: string[]; // Customer group IDs
  status: 'active' | 'inactive' | 'expired' | 'exhausted';
  createdAt: string;
  updatedAt: string;
}

export interface DiscountApplication {
  discountId: string;
  code: string;
  type: string;
  value: number;
  appliedAmount: number;
  originalAmount: number;
  finalAmount: number;
  isValid: boolean;
  errorMessage?: string;
}

export interface DiscountResponse {
  success: boolean;
  message: string;
  data?: any;
}

class DiscountService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  // Apply discount code
  async applyDiscountCode(code: string, cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
    category: string;
  }>, customerId?: string): Promise<DiscountApplication | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/discounts/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          cartItems,
          customerId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to apply discount code');
      }

      const data = await response.json();
      return data.discount;
    } catch (error) {
      console.error('Apply discount code error:', error);
      return null;
    }
  }

  // Validate discount code
  async validateDiscountCode(code: string, customerId?: string): Promise<{
    isValid: boolean;
    discount?: Discount;
    errorMessage?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/discounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, customerId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          isValid: false,
          errorMessage: errorData.detail || 'Invalid discount code'
        };
      }

      const data = await response.json();
      return {
        isValid: true,
        discount: data.discount
      };
    } catch (error) {
      console.error('Validate discount code error:', error);
      return {
        isValid: false,
        errorMessage: 'Failed to validate discount code'
      };
    }
  }

  // Get available discounts
  async getAvailableDiscounts(customerId?: string): Promise<Discount[]> {
    try {
      const url = customerId 
        ? `${this.baseUrl}/api/v1/discounts/available?customerId=${customerId}`
        : `${this.baseUrl}/api/v1/discounts/available`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch available discounts');
      }

      return await response.json();
    } catch (error) {
      console.error('Get available discounts error:', error);
      return [];
    }
  }

  // Create discount
  async createDiscount(discountData: Omit<Discount, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<DiscountResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create discount');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Rabatt erfolgreich erstellt',
        data
      };
    } catch (error) {
      console.error('Create discount error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Rabatt-Erstellung fehlgeschlagen'
      };
    }
  }

  // Update discount
  async updateDiscount(discountId: string, discountData: Partial<Discount>): Promise<DiscountResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/discounts/${discountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update discount');
      }

      return {
        success: true,
        message: 'Rabatt erfolgreich aktualisiert'
      };
    } catch (error) {
      console.error('Update discount error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Rabatt-Update fehlgeschlagen'
      };
    }
  }

  // Delete discount
  async deleteDiscount(discountId: string): Promise<DiscountResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/discounts/${discountId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete discount');
      }

      return {
        success: true,
        message: 'Rabatt erfolgreich gelöscht'
      };
    } catch (error) {
      console.error('Delete discount error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Rabatt-Löschung fehlgeschlagen'
      };
    }
  }

  // Get discount analytics
  async getDiscountAnalytics(discountId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    totalUsage: number;
    totalSavings: number;
    averageOrderValue: number;
    conversionRate: number;
    topCustomers: Array<{
      customerId: string;
      customerName: string;
      usageCount: number;
      totalSavings: number;
    }>;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/discounts/${discountId}/analytics?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch discount analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get discount analytics error:', error);
      return {
        totalUsage: 0,
        totalSavings: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        topCustomers: []
      };
    }
  }

  // Calculate discount amount
  calculateDiscountAmount(discount: Discount, cartTotal: number): number {
    let discountAmount = 0;

    switch (discount.type) {
      case 'percentage':
        discountAmount = (cartTotal * discount.value) / 100;
        if (discount.maximumDiscount) {
          discountAmount = Math.min(discountAmount, discount.maximumDiscount);
        }
        break;
      case 'fixed':
        discountAmount = Math.min(discount.value, cartTotal);
        break;
      case 'free_shipping':
        // This would be handled separately in shipping calculation
        discountAmount = 0;
        break;
    }

    return Math.max(0, discountAmount);
  }

  // Validate discount data
  validateDiscount(discount: Partial<Discount>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!discount.code?.trim()) {
      errors.push('Rabattcode ist erforderlich');
    }

    if (!discount.name?.trim()) {
      errors.push('Name ist erforderlich');
    }

    if (discount.type === 'percentage' && (discount.value < 0 || discount.value > 100)) {
      errors.push('Prozentsatz muss zwischen 0 und 100 liegen');
    }

    if (discount.type === 'fixed' && discount.value < 0) {
      errors.push('Fester Betrag muss positiv sein');
    }

    if (discount.minimumAmount && discount.minimumAmount < 0) {
      errors.push('Mindestbetrag muss positiv sein');
    }

    if (discount.validFrom && discount.validUntil) {
      const fromDate = new Date(discount.validFrom);
      const untilDate = new Date(discount.validUntil);
      
      if (fromDate >= untilDate) {
        errors.push('Gültigkeitsdatum muss nach Startdatum liegen');
      }
    }

    if (discount.usageLimit && discount.usageLimit < 1) {
      errors.push('Nutzungslimit muss mindestens 1 sein');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate discount code
  generateDiscountCode(prefix: string = 'CP', length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Show discount messages
  showMessage(message: string, isSuccess: boolean = true): void {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
      isSuccess 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

export const discountService = new DiscountService();
