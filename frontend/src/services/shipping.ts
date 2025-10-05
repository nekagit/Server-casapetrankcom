// Shipping Calculator Service
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  freeShippingThreshold?: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  carrier: string;
  service: string;
  tracking: boolean;
  insurance: boolean;
  signature: boolean;
  restrictions: {
    maxWeight?: number;
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
    };
    countries?: string[];
    excludedCountries?: string[];
  };
}

export interface ShippingAddress {
  country: string;
  state?: string;
  city: string;
  postalCode: string;
  street: string;
  streetNumber: string;
}

export interface ShippingCalculation {
  methods: ShippingMethod[];
  selectedMethod?: ShippingMethod;
  totalWeight: number;
  totalDimensions: {
    length: number;
    width: number;
    height: number;
  };
  freeShippingThreshold?: number;
  freeShippingRemaining?: number;
}

export interface ShippingResponse {
  success: boolean;
  message: string;
  data?: any;
}

class ShippingService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  // Calculate shipping costs
  async calculateShipping(
    items: Array<{
      weight: number;
      dimensions: { length: number; width: number; height: number };
      value: number;
    }>,
    address: ShippingAddress
  ): Promise<ShippingCalculation> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/shipping/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          address
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to calculate shipping');
      }

      return await response.json();
    } catch (error) {
      console.error('Calculate shipping error:', error);
      return this.getDefaultShippingMethods();
    }
  }

  // Get available shipping methods
  async getShippingMethods(address: ShippingAddress): Promise<ShippingMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/shipping/methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch shipping methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Get shipping methods error:', error);
      return this.getDefaultShippingMethods();
    }
  }

  // Get shipping rates for specific carrier
  async getCarrierRates(
    carrier: string,
    items: Array<{
      weight: number;
      dimensions: { length: number; width: number; height: number };
    }>,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress
  ): Promise<ShippingMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/shipping/carrier/${carrier}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          fromAddress,
          toAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch carrier rates');
      }

      return await response.json();
    } catch (error) {
      console.error('Get carrier rates error:', error);
      return [];
    }
  }

  // Create shipping label
  async createShippingLabel(
    orderId: string,
    shippingMethodId: string,
    address: ShippingAddress
  ): Promise<ShippingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/shipping/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          shippingMethodId,
          address
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create shipping label');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Versandlabel erfolgreich erstellt',
        data
      };
    } catch (error) {
      console.error('Create shipping label error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Versandlabel-Erstellung fehlgeschlagen'
      };
    }
  }

  // Track shipment
  async trackShipment(trackingNumber: string, carrier?: string): Promise<{
    status: string;
    location: string;
    estimatedDelivery?: string;
    events: Array<{
      timestamp: string;
      status: string;
      location: string;
      description: string;
    }>;
  } | null> {
    try {
      const url = carrier 
        ? `${this.baseUrl}/api/v1/shipping/track/${trackingNumber}?carrier=${carrier}`
        : `${this.baseUrl}/api/v1/shipping/track/${trackingNumber}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to track shipment');
      }

      return await response.json();
    } catch (error) {
      console.error('Track shipment error:', error);
      return null;
    }
  }

  // Get shipping zones
  async getShippingZones(): Promise<Array<{
    id: string;
    name: string;
    countries: string[];
    methods: ShippingMethod[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/shipping/zones`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch shipping zones');
      }

      return await response.json();
    } catch (error) {
      console.error('Get shipping zones error:', error);
      return [];
    }
  }

  // Calculate package dimensions
  calculatePackageDimensions(items: Array<{
    dimensions: { length: number; width: number; height: number };
    quantity: number;
  }>): { length: number; width: number; height: number; weight: number } {
    // Simple box packing algorithm
    let totalLength = 0;
    let totalWidth = 0;
    let totalHeight = 0;
    let totalWeight = 0;

    items.forEach(item => {
      totalLength = Math.max(totalLength, item.dimensions.length);
      totalWidth = Math.max(totalWidth, item.dimensions.width);
      totalHeight += item.dimensions.height * item.quantity;
      totalWeight += (item.dimensions.length * item.dimensions.width * item.dimensions.height * 0.001) * item.quantity;
    });

    return {
      length: Math.ceil(totalLength),
      width: Math.ceil(totalWidth),
      height: Math.ceil(totalHeight),
      weight: Math.ceil(totalWeight * 1000) / 1000 // Round to 3 decimal places
    };
  }

  // Check if address is eligible for free shipping
  checkFreeShippingEligibility(
    address: ShippingAddress,
    orderTotal: number,
    freeShippingThreshold: number = 39.90
  ): { eligible: boolean; remaining: number } {
    const eligible = orderTotal >= freeShippingThreshold;
    const remaining = Math.max(0, freeShippingThreshold - orderTotal);
    
    return { eligible, remaining };
  }

  // Validate shipping address
  validateShippingAddress(address: ShippingAddress): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.country?.trim()) {
      errors.push('Land ist erforderlich');
    }

    if (!address.city?.trim()) {
      errors.push('Stadt ist erforderlich');
    }

    if (!address.postalCode?.trim()) {
      errors.push('Postleitzahl ist erforderlich');
    }

    if (!address.street?.trim()) {
      errors.push('Straße ist erforderlich');
    }

    if (!address.streetNumber?.trim()) {
      errors.push('Hausnummer ist erforderlich');
    }

    // Validate postal code format for Germany
    if (address.country === 'DE' && address.postalCode) {
      const germanPostalCodeRegex = /^\d{5}$/;
      if (!germanPostalCodeRegex.test(address.postalCode)) {
        errors.push('Ungültige deutsche Postleitzahl');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get default shipping methods (fallback)
  private getDefaultShippingMethods(): ShippingMethod[] {
    return [
      {
        id: 'standard',
        name: 'Standard Versand',
        description: '2-5 Werktage',
        cost: 4.90,
        freeShippingThreshold: 39.90,
        estimatedDays: { min: 2, max: 5 },
        carrier: 'DHL',
        service: 'Standard',
        tracking: true,
        insurance: false,
        signature: false,
        restrictions: {
          maxWeight: 31.5,
          countries: ['DE', 'AT', 'CH']
        }
      },
      {
        id: 'express',
        name: 'Express Versand',
        description: '1-2 Werktage',
        cost: 9.90,
        estimatedDays: { min: 1, max: 2 },
        carrier: 'DHL',
        service: 'Express',
        tracking: true,
        insurance: true,
        signature: true,
        restrictions: {
          maxWeight: 31.5,
          countries: ['DE', 'AT', 'CH']
        }
      },
      {
        id: 'free',
        name: 'Kostenloser Versand',
        description: '2-5 Werktage',
        cost: 0,
        freeShippingThreshold: 39.90,
        estimatedDays: { min: 2, max: 5 },
        carrier: 'DHL',
        service: 'Standard',
        tracking: true,
        insurance: false,
        signature: false,
        restrictions: {
          maxWeight: 31.5,
          countries: ['DE', 'AT', 'CH']
        }
      }
    ];
  }

  // Show shipping messages
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

export const shippingService = new ShippingService();
