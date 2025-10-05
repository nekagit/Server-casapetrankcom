// User Management Service - Comprehensive user management system
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar?: string;
  role: 'customer' | 'editor' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: {
    language: string;
    currency: string;
    newsletter: boolean;
    marketing: boolean;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginCount: number;
  totalSpent: number;
  orderCount: number;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | 'klarna';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'password_change' | 'email_change' | 'address_change' | 'order_placed' | 'profile_update';
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  verifiedUsers: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  averageSessionDuration: number;
  topCountries: Array<{ country: string; count: number }>;
  registrationTrend: Array<{ date: string; count: number }>;
}

export interface UserSearchFilters {
  query?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  sortBy?: 'created_at' | 'last_login' | 'name' | 'email' | 'total_spent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class UserManagementService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.USER_MANAGEMENT_API_KEY || '';
  }

  // Get all users
  async getUsers(filters: UserSearchFilters = {}): Promise<{
    users: User[];
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

      const response = await fetch(`${this.baseUrl}/api/v1/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get users:', error);
      return { users: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  // Create new user
  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
    sendWelcomeEmail?: boolean;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create user' };
      }

      const user = await response.json();
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user
  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update user' };
      }

      const user = await response.json();
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete user' };
      }

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user status
  async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending_verification',
    reason?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reason })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update user status' };
      }

      return { success: true, message: 'User status updated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user role
  async updateUserRole(
    userId: string,
    role: 'customer' | 'editor' | 'admin' | 'superadmin'
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update user role' };
      }

      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user addresses
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/addresses`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user addresses:', error);
      return [];
    }
  }

  // Add user address
  async addUserAddress(
    userId: string,
    address: Omit<Address, 'id'>
  ): Promise<{ success: boolean; address?: Address; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to add address' };
      }

      const newAddress = await response.json();
      return { success: true, address: newAddress };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user address
  async updateUserAddress(
    userId: string,
    addressId: string,
    updates: Partial<Address>
  ): Promise<{ success: boolean; address?: Address; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update address' };
      }

      const updatedAddress = await response.json();
      return { success: true, address: updatedAddress };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete user address
  async deleteUserAddress(
    userId: string,
    addressId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete address' };
      }

      return { success: true, message: 'Address deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user activity
  async getUserActivity(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ activities: UserActivity[]; total: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/activity?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { activities: [], total: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return { activities: [], total: 0 };
    }
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        verifiedUsers: 0,
        usersByRole: {},
        usersByStatus: {},
        averageSessionDuration: 0,
        topCountries: [],
        registrationTrend: []
      };
    }
  }

  // Send verification email
  async sendVerificationEmail(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/verify-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to send verification email' };
      }

      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Reset user password
  async resetUserPassword(
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to reset password' };
      }

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Enable/disable two-factor authentication
  async toggleTwoFactor(
    userId: string,
    enabled: boolean
  ): Promise<{ success: boolean; qrCode?: string; secret?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/two-factor`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to toggle two-factor authentication' };
      }

      const data = await response.json();
      return { success: true, qrCode: data.qrCode, secret: data.secret };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Export users
  async exportUsers(
    filters: UserSearchFilters = {},
    format: 'csv' | 'excel' | 'json' = 'csv'
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      queryParams.append('format', format);

      const response = await fetch(`${this.baseUrl}/api/v1/users/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to export users' };
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

  // Bulk update users
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<User>
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds, updates })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, updated: 0, errors: [error.message || 'Bulk update failed'] };
      }

      const data = await response.json();
      return { success: true, updated: data.updated, errors: data.errors || [] };
    } catch (error) {
      return {
        success: false,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  // Update user permissions
  async updateUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update permissions' };
      }

      return { success: true, message: 'Permissions updated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const userManagementService = new UserManagementService();