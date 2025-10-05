// Wishlist Service
export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
  category: string;
  description: string;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  wishlist?: WishlistItem[];
  item?: WishlistItem;
}

class WishlistService {
  private baseUrl = '/api/wishlist';
  private wishlistKey = 'casa-petrada-wishlist';

  // Get wishlist from localStorage or API
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      // Try API first
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.wishlist || [];
      }
    } catch (error) {
      console.log('API not available, using localStorage');
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(this.wishlistKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Add item to wishlist
  async addToWishlist(product: Omit<WishlistItem, 'addedAt'>): Promise<WishlistResponse> {
    try {
      // Try API first
      const response = await fetch(`${this.baseUrl}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          slug: product.slug,
          category: product.category,
          description: product.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log('API not available, using localStorage');
    }

    // Fallback to localStorage
    const wishlist = await this.getWishlist();
    
    // Check if item already exists
    if (wishlist.some(item => item.id === product.id)) {
      return {
        success: false,
        message: 'Produkt ist bereits in der Wunschliste'
      };
    }

    const newItem: WishlistItem = {
      ...product,
      addedAt: new Date().toISOString()
    };

    wishlist.push(newItem);
    localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist));

    return {
      success: true,
      message: 'Produkt zur Wunschliste hinzugefügt',
      item: newItem
    };
  }

  // Remove item from wishlist
  async removeFromWishlist(productId: number): Promise<WishlistResponse> {
    try {
      // Try API first
      const response = await fetch(`${this.baseUrl}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log('API not available, using localStorage');
    }

    // Fallback to localStorage
    const wishlist = await this.getWishlist();
    const filteredWishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem(this.wishlistKey, JSON.stringify(filteredWishlist));

    return {
      success: true,
      message: 'Produkt aus Wunschliste entfernt'
    };
  }

  // Check if item is in wishlist
  async isInWishlist(productId: number): Promise<boolean> {
    const wishlist = await this.getWishlist();
    return wishlist.some(item => item.id === productId);
  }

  // Clear wishlist
  async clearWishlist(): Promise<WishlistResponse> {
    try {
      // Try API first
      const response = await fetch(`${this.baseUrl}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log('API not available, using localStorage');
    }

    // Fallback to localStorage
    localStorage.removeItem(this.wishlistKey);

    return {
      success: true,
      message: 'Wunschliste geleert'
    };
  }

  // Get wishlist count
  async getWishlistCount(): Promise<number> {
    const wishlist = await this.getWishlist();
    return wishlist.length;
  }

  // Get auth token (placeholder)
  private getAuthToken(): string {
    return localStorage.getItem('auth-token') || '';
  }

  // Show notification
  showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

export const wishlistService = new WishlistService();
