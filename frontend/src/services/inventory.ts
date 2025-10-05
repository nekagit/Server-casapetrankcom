// Inventory Management Service - Stock tracking and alerts
export interface InventoryItem {
  id: number;
  productId: number;
  sku: string;
  name: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  cost: number;
  price: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  alerts: InventoryAlert[];
}

export interface InventoryAlert {
  id: number;
  type: 'low_stock' | 'out_of_stock' | 'reorder_needed' | 'overstock';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'released';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, PO number, etc.
  createdAt: string;
  createdBy: string;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  reorderNeeded: number;
  overstockItems: number;
  stockTurnover: number;
  topSellingProducts: Array<{
    productId: number;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  slowMovingProducts: Array<{
    productId: number;
    name: string;
    daysInStock: number;
    stockValue: number;
  }>;
}

class InventoryService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/inventory') {
    this.baseUrl = baseUrl;
  }

  // Get inventory items
  async getInventoryItems(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: InventoryItem[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/items?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockInventoryItems(params);
    }
  }

  // Get inventory item by ID
  async getInventoryItem(id: number): Promise<InventoryItem> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory item');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockInventoryItem(id);
    }
  }

  // Update stock levels
  async updateStock(
    productId: number,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string,
    reference?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stock/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          type,
          reason,
          reference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Stock updated successfully (mock)',
      };
    }
  }

  // Reserve stock for order
  async reserveStock(
    productId: number,
    quantity: number,
    orderId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stock/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reserve stock');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Stock reserved successfully (mock)',
      };
    }
  }

  // Release reserved stock
  async releaseStock(
    productId: number,
    quantity: number,
    orderId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stock/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to release stock');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Stock released successfully (mock)',
      };
    }
  }

  // Get stock alerts
  async getStockAlerts(): Promise<InventoryAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock alerts');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockStockAlerts();
    }
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Alert acknowledged successfully (mock)',
      };
    }
  }

  // Get inventory report
  async getInventoryReport(): Promise<InventoryReport> {
    try {
      const response = await fetch(`${this.baseUrl}/report`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory report');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockInventoryReport();
    }
  }

  // Get stock movements
  async getStockMovements(
    productId?: number,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ movements: StockMovement[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (productId) queryParams.append('productId', productId.toString());
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/movements?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock movements');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockStockMovements(productId, params);
    }
  }

  // Check product availability
  async checkAvailability(productId: number, quantity: number): Promise<{
    available: boolean;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/availability/${productId}?quantity=${quantity}`);
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockAvailability(productId, quantity);
    }
  }

  // Mock data methods
  private getMockInventoryItems(params?: any): { items: InventoryItem[]; total: number; page: number; totalPages: number } {
    const mockItems: InventoryItem[] = [
      {
        id: 1,
        productId: 1,
        sku: 'CP-ARM-001',
        name: 'Tibet Armband',
        currentStock: 15,
        reservedStock: 3,
        availableStock: 12,
        minStockLevel: 5,
        maxStockLevel: 50,
        reorderPoint: 10,
        reorderQuantity: 25,
        cost: 12.50,
        price: 24.90,
        lastUpdated: '2024-01-20T10:30:00Z',
        status: 'in_stock',
        alerts: []
      },
      {
        id: 2,
        productId: 2,
        sku: 'CP-ARM-002',
        name: 'Boho Wickelarmband',
        currentStock: 3,
        reservedStock: 1,
        availableStock: 2,
        minStockLevel: 5,
        maxStockLevel: 30,
        reorderPoint: 8,
        reorderQuantity: 20,
        cost: 8.50,
        price: 19.90,
        lastUpdated: '2024-01-20T09:15:00Z',
        status: 'low_stock',
        alerts: [
          {
            id: 1,
            type: 'low_stock',
            severity: 'medium',
            message: 'Niedriger Lagerbestand: Nur noch 3 Stück verfügbar',
            createdAt: '2024-01-20T09:15:00Z',
            acknowledged: false
          }
        ]
      },
      {
        id: 3,
        productId: 3,
        sku: 'CP-KET-001',
        name: 'Naturstein Kette',
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        minStockLevel: 3,
        maxStockLevel: 20,
        reorderPoint: 5,
        reorderQuantity: 15,
        cost: 18.50,
        price: 32.90,
        lastUpdated: '2024-01-19T16:45:00Z',
        status: 'out_of_stock',
        alerts: [
          {
            id: 2,
            type: 'out_of_stock',
            severity: 'high',
            message: 'Ausverkauft: Sofortige Nachbestellung erforderlich',
            createdAt: '2024-01-19T16:45:00Z',
            acknowledged: false
          }
        ]
      }
    ];

    return {
      items: mockItems,
      total: mockItems.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockInventoryItem(id: number): InventoryItem {
    const items = this.getMockInventoryItems().items;
    return items.find(item => item.id === id) || items[0];
  }

  private getMockStockAlerts(): InventoryAlert[] {
    return [
      {
        id: 1,
        type: 'low_stock',
        severity: 'medium',
        message: 'Niedriger Lagerbestand: Boho Wickelarmband - Nur noch 3 Stück',
        createdAt: '2024-01-20T09:15:00Z',
        acknowledged: false
      },
      {
        id: 2,
        type: 'out_of_stock',
        severity: 'high',
        message: 'Ausverkauft: Naturstein Kette - Sofortige Nachbestellung erforderlich',
        createdAt: '2024-01-19T16:45:00Z',
        acknowledged: false
      },
      {
        id: 3,
        type: 'reorder_needed',
        severity: 'critical',
        message: 'Nachbestellung erforderlich: Tibet Armband - Reorder Point erreicht',
        createdAt: '2024-01-20T11:30:00Z',
        acknowledged: false
      }
    ];
  }

  private getMockInventoryReport(): InventoryReport {
    return {
      totalProducts: 25,
      totalValue: 12500.00,
      lowStockItems: 3,
      outOfStockItems: 1,
      reorderNeeded: 2,
      overstockItems: 0,
      stockTurnover: 4.2,
      topSellingProducts: [
        {
          productId: 1,
          name: 'Tibet Armband',
          quantitySold: 45,
          revenue: 1120.50
        },
        {
          productId: 2,
          name: 'Boho Wickelarmband',
          quantitySold: 32,
          revenue: 636.80
        }
      ],
      slowMovingProducts: [
        {
          productId: 5,
          name: 'Luxus Kette',
          daysInStock: 45,
          stockValue: 250.00
        }
      ]
    };
  }

  private getMockStockMovements(productId?: number, params?: any): { movements: StockMovement[]; total: number; page: number; totalPages: number } {
    const mockMovements: StockMovement[] = [
      {
        id: 1,
        productId: 1,
        type: 'out',
        quantity: 2,
        reason: 'Verkauf',
        reference: 'CP-2024-001',
        createdAt: '2024-01-20T10:30:00Z',
        createdBy: 'System'
      },
      {
        id: 2,
        productId: 1,
        type: 'in',
        quantity: 25,
        reason: 'Nachbestellung',
        reference: 'PO-2024-001',
        createdAt: '2024-01-18T14:20:00Z',
        createdBy: 'Admin'
      },
      {
        id: 3,
        productId: 2,
        type: 'reserved',
        quantity: 1,
        reason: 'Bestellung reserviert',
        reference: 'CP-2024-002',
        createdAt: '2024-01-20T09:15:00Z',
        createdBy: 'System'
      }
    ];

    const filtered = productId ? mockMovements.filter(m => m.productId === productId) : mockMovements;

    return {
      movements: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockAvailability(productId: number, quantity: number): {
    available: boolean;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
  } {
    const items = this.getMockInventoryItems().items;
    const item = items.find(i => i.productId === productId) || items[0];
    
    return {
      available: item.availableStock >= quantity,
      currentStock: item.currentStock,
      reservedStock: item.reservedStock,
      availableStock: item.availableStock
    };
  }
}

export const inventoryService = new InventoryService();