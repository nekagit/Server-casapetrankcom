// Inventory Management Service - Comprehensive inventory management system
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  cost: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  location: string;
  supplier: string;
  supplierSku?: string;
  lastRestocked: string;
  lastSold: string;
  lastCounted: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, Transfer ID, etc.
  location: string;
  cost: number;
  notes?: string;
  performedBy: string;
  timestamp: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder';
  currentStock: number;
  threshold: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  totalMovements: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  slowMovingProducts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    daysInStock: number;
  }>;
  stockTurnover: number;
  averageStockValue: number;
}

export interface InventoryFilters {
  search?: string;
  status?: string;
  location?: string;
  supplier?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  overstock?: boolean;
  sortBy?: 'name' | 'stock' | 'value' | 'last_movement' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class InventoryManagementService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.INVENTORY_API_KEY || '';
  }

  // Get inventory items
  async getInventoryItems(filters: InventoryFilters = {}): Promise<{
    items: InventoryItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/inventory?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get inventory items:', error);
      return { items: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Get inventory item by ID
  async getInventoryItem(itemId: string): Promise<InventoryItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get inventory item:', error);
      return null;
    }
  }

  // Update stock quantity
  async updateStock(
    itemId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): Promise<{ success: boolean; movement?: StockMovement; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity, reason, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update stock' };
      }

      const movement = await response.json();
      return { success: true, movement };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Add stock
  async addStock(
    itemId: string,
    quantity: number,
    reason: string,
    cost?: number,
    notes?: string
  ): Promise<{ success: boolean; movement?: StockMovement; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}/add-stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity, reason, cost, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to add stock' };
      }

      const movement = await response.json();
      return { success: true, movement };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Remove stock
  async removeStock(
    itemId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): Promise<{ success: boolean; movement?: StockMovement; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}/remove-stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity, reason, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to remove stock' };
      }

      const movement = await response.json();
      return { success: true, movement };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Transfer stock
  async transferStock(
    fromItemId: string,
    toItemId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): Promise<{ success: boolean; movements?: StockMovement[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fromItemId, toItemId, quantity, reason, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to transfer stock' };
      }

      const movements = await response.json();
      return { success: true, movements };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get stock movements
  async getStockMovements(
    itemId?: string,
    type?: string,
    dateFrom?: string,
    dateTo?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ movements: StockMovement[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (itemId) queryParams.append('itemId', itemId);
      if (type) queryParams.append('type', type);
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/inventory/movements?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { movements: [], total: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get stock movements:', error);
      return { movements: [], total: 0 };
    }
  }

  // Get stock alerts
  async getStockAlerts(
    status?: string,
    priority?: string,
    limit: number = 50
  ): Promise<StockAlert[]> {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (priority) queryParams.append('priority', priority);
      queryParams.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/inventory/alerts?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get stock alerts:', error);
      return [];
    }
  }

  // Acknowledge stock alert
  async acknowledgeStockAlert(
    alertId: string,
    notes?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to acknowledge alert' };
      }

      return { success: true, message: 'Alert acknowledged successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Resolve stock alert
  async resolveStockAlert(
    alertId: string,
    notes?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to resolve alert' };
      }

      return { success: true, message: 'Alert resolved successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get inventory report
  async getInventoryReport(
    dateFrom?: string,
    dateTo?: string
  ): Promise<InventoryReport> {
    try {
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await fetch(`${this.baseUrl}/api/v1/inventory/report?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get inventory report');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get inventory report:', error);
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        overstockItems: 0,
        totalMovements: 0,
        topSellingProducts: [],
        slowMovingProducts: [],
        stockTurnover: 0,
        averageStockValue: 0
      };
    }
  }

  // Update inventory item
  async updateInventoryItem(
    itemId: string,
    updates: Partial<InventoryItem>
  ): Promise<{ success: boolean; item?: InventoryItem; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update inventory item' };
      }

      const item = await response.json();
      return { success: true, item };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create inventory item
  async createInventoryItem(
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; item?: InventoryItem; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create inventory item' };
      }

      const item = await response.json();
      return { success: true, item };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete inventory item
  async deleteInventoryItem(
    itemId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete inventory item' };
      }

      return { success: true, message: 'Inventory item deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Perform stock count
  async performStockCount(
    itemId: string,
    countedQuantity: number,
    notes?: string
  ): Promise<{ success: boolean; adjustment?: StockMovement; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/${itemId}/count`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ countedQuantity, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to perform stock count' };
      }

      const adjustment = await response.json();
      return { success: true, adjustment };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get low stock items
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/low-stock`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get low stock items:', error);
      return [];
    }
  }

  // Get out of stock items
  async getOutOfStockItems(): Promise<InventoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/out-of-stock`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get out of stock items:', error);
      return [];
    }
  }

  // Generate reorder suggestions
  async generateReorderSuggestions(): Promise<Array<{
    itemId: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    suggestedQuantity: number;
    estimatedCost: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/inventory/reorder-suggestions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get reorder suggestions:', error);
      return [];
    }
  }

  // Export inventory
  async exportInventory(
    filters: InventoryFilters = {},
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      queryParams.append('format', format);

      const response = await fetch(`${this.baseUrl}/api/v1/inventory/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to export inventory' };
      }

      const data = await response.json();
      return { success: true, downloadUrl: data.downloadUrl };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const inventoryManagementService = new InventoryManagementService();
