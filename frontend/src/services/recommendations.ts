// Product Recommendations Service - AI-powered product suggestions
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  tags: string[];
  materials: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  sale: boolean;
}

export interface RecommendationContext {
  userId?: number;
  currentProductId?: number;
  category?: string;
  priceRange?: { min: number; max: number };
  preferences?: {
    materials: string[];
    colors: string[];
    styles: string[];
  };
  recentViews?: number[];
  purchaseHistory?: number[];
  wishlist?: number[];
}

export interface RecommendationResult {
  products: Product[];
  algorithm: string;
  confidence: number;
  reason: string;
}

class RecommendationService {
  private baseUrl: string;
  private cache: Map<string, RecommendationResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string = '/api/recommendations') {
    this.baseUrl = baseUrl;
  }

  // Get recommendations for a specific context
  async getRecommendations(
    context: RecommendationContext,
    limit: number = 8
  ): Promise<RecommendationResult> {
    const cacheKey = this.generateCacheKey(context, limit);
    const cached = this.getCachedRecommendations(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context, limit }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const result: RecommendationResult = await response.json();
      this.setCachedRecommendations(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('API not available, using fallback recommendations');
      return this.getFallbackRecommendations(context, limit);
    }
  }

  // Get related products for a specific product
  async getRelatedProducts(
    productId: number,
    limit: number = 6
  ): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseUrl}/related/${productId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }

      const result = await response.json();
      return result.products || [];
    } catch (error) {
      console.warn('API not available, using fallback related products');
      return this.getFallbackRelatedProducts(productId, limit);
    }
  }

  // Get recently viewed products
  async getRecentlyViewed(limit: number = 6): Promise<Product[]> {
    const viewed = this.getRecentlyViewedFromStorage();
    
    if (viewed.length === 0) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/recently-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: viewed.slice(0, limit) }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recently viewed products');
      }

      const result = await response.json();
      return result.products || [];
    } catch (error) {
      console.warn('API not available, using fallback recently viewed');
      return this.getFallbackRecentlyViewed(viewed, limit);
    }
  }

  // Get trending products
  async getTrendingProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trending?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending products');
      }

      const result = await response.json();
      return result.products || [];
    } catch (error) {
      console.warn('API not available, using fallback trending products');
      return this.getFallbackTrendingProducts(limit);
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(
    userId: number,
    limit: number = 8
  ): Promise<RecommendationResult> {
    const context: RecommendationContext = {
      userId,
      preferences: this.getUserPreferences(userId),
      recentViews: this.getRecentlyViewedFromStorage(),
      purchaseHistory: this.getPurchaseHistoryFromStorage(),
      wishlist: this.getWishlistFromStorage(),
    };

    return this.getRecommendations(context, limit);
  }

  // Track product view for recommendations
  trackProductView(productId: number): void {
    const viewed = this.getRecentlyViewedFromStorage();
    const updated = [productId, ...viewed.filter(id => id !== productId)].slice(0, 20);
    this.setRecentlyViewedInStorage(updated);
  }

  // Track product purchase for recommendations
  trackProductPurchase(productId: number): void {
    const purchased = this.getPurchaseHistoryFromStorage();
    const updated = [productId, ...purchased.filter(id => id !== productId)].slice(0, 50);
    this.setPurchaseHistoryInStorage(updated);
  }

  // Update user preferences
  updateUserPreferences(userId: number, preferences: any): void {
    const key = `user-preferences-${userId}`;
    localStorage.setItem(key, JSON.stringify(preferences));
  }

  // Cache management
  private generateCacheKey(context: RecommendationContext, limit: number): string {
    return `rec-${JSON.stringify(context)}-${limit}`;
  }

  private getCachedRecommendations(key: string): RecommendationResult | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }
    return null;
  }

  private setCachedRecommendations(key: string, result: RecommendationResult): void {
    this.cache.set(key, { ...result, timestamp: Date.now() });
  }

  // Storage helpers
  private getRecentlyViewedFromStorage(): number[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('recently-viewed');
    return stored ? JSON.parse(stored) : [];
  }

  private setRecentlyViewedInStorage(productIds: number[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('recently-viewed', JSON.stringify(productIds));
  }

  private getPurchaseHistoryFromStorage(): number[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('purchase-history');
    return stored ? JSON.parse(stored) : [];
  }

  private setPurchaseHistoryInStorage(productIds: number[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('purchase-history', JSON.stringify(productIds));
  }

  private getWishlistFromStorage(): number[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('casa-petrada-wishlist');
    const wishlist = stored ? JSON.parse(stored) : [];
    return wishlist.map((item: any) => item.id);
  }

  private getUserPreferences(userId: number): any {
    if (typeof window === 'undefined') return {};
    const key = `user-preferences-${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }

  // Fallback recommendations when API is not available
  private getFallbackRecommendations(
    context: RecommendationContext,
    limit: number
  ): RecommendationResult {
    // Mock product data for fallback
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Tibet Armband",
        slug: "tibet-armband",
        price: 24.90,
        originalPrice: 29.90,
        image: "/images/products/tibet-armband.jpg",
        category: "Armbänder",
        description: "Handgefertigtes Armband aus natürlichen Materialien",
        tags: ["boho", "handmade", "natural"],
        materials: ["Holz", "Naturstein"],
        colors: ["Braun", "Beige"],
        rating: 4.5,
        reviewCount: 23,
        inStock: true,
        featured: true,
        sale: true
      },
      {
        id: 2,
        name: "Boho Wickelarmband",
        slug: "boho-wickelarmband",
        price: 19.90,
        image: "/images/products/product_1.jpg",
        category: "Armbänder",
        description: "Stylisches Wickelarmband im Boho-Stil",
        tags: ["boho", "handmade", "colorful"],
        materials: ["Glasperlen", "Metall"],
        colors: ["Multicolor"],
        rating: 4.2,
        reviewCount: 15,
        inStock: true,
        featured: false,
        sale: false
      },
      {
        id: 3,
        name: "Naturstein Kette",
        slug: "naturstein-kette",
        price: 32.90,
        image: "/images/products/real_product_1.jpg",
        category: "Ketten",
        description: "Elegante Kette mit echten Natursteinen",
        tags: ["natural", "elegant", "stones"],
        materials: ["Silber", "Naturstein"],
        colors: ["Silber", "Grün"],
        rating: 4.8,
        reviewCount: 31,
        inStock: true,
        featured: true,
        sale: false
      }
    ];

    // Simple recommendation logic
    let recommended = [...mockProducts];
    
    // Filter by category if specified
    if (context.category) {
      recommended = recommended.filter(p => p.category === context.category);
    }
    
    // Filter by price range if specified
    if (context.priceRange) {
      recommended = recommended.filter(p => 
        p.price >= context.priceRange!.min && p.price <= context.priceRange!.max
      );
    }
    
    // Exclude current product
    if (context.currentProductId) {
      recommended = recommended.filter(p => p.id !== context.currentProductId);
    }
    
    // Exclude recently viewed
    if (context.recentViews && context.recentViews.length > 0) {
      recommended = recommended.filter(p => !context.recentViews!.includes(p.id));
    }

    return {
      products: recommended.slice(0, limit),
      algorithm: 'fallback',
      confidence: 0.6,
      reason: 'Based on category and price preferences'
    };
  }

  private getFallbackRelatedProducts(productId: number, limit: number): Product[] {
    // Mock related products based on product ID
    const relatedMap: Record<number, number[]> = {
      1: [2, 3, 4, 5],
      2: [1, 3, 6, 7],
      3: [1, 2, 8, 9]
    };
    
    const relatedIds = relatedMap[productId] || [1, 2, 3];
    return this.getFallbackRecommendations({}, limit).products.filter(p => 
      relatedIds.includes(p.id)
    );
  }

  private getFallbackRecentlyViewed(viewedIds: number[], limit: number): Product[] {
    const allProducts = this.getFallbackRecommendations({}, 20).products;
    return allProducts.filter(p => viewedIds.includes(p.id)).slice(0, limit);
  }

  private getFallbackTrendingProducts(limit: number): Product[] {
    const allProducts = this.getFallbackRecommendations({}, 20).products;
    return allProducts
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}

export const recommendationService = new RecommendationService();