// Recommendation Service - AI-powered product recommendation system
export interface ProductRecommendation {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  reason: string;
  confidence: number;
  algorithm: RecommendationAlgorithm;
  metadata?: Record<string, any>;
}

export type RecommendationAlgorithm = 
  | 'collaborative_filtering'
  | 'content_based'
  | 'hybrid'
  | 'trending'
  | 'similar_products'
  | 'frequently_bought_together'
  | 'customers_also_viewed'
  | 'seasonal'
  | 'price_based'
  | 'category_based';

export interface RecommendationRequest {
  userId?: string;
  productId?: string;
  category?: string;
  limit?: number;
  algorithms?: RecommendationAlgorithm[];
  filters?: {
    priceMin?: number;
    priceMax?: number;
    categories?: string[];
    tags?: string[];
    inStock?: boolean;
  };
  exclude?: string[];
}

export interface RecommendationResponse {
  recommendations: ProductRecommendation[];
  total: number;
  algorithm: RecommendationAlgorithm;
  confidence: number;
  metadata: {
    processingTime: number;
    cacheHit: boolean;
    userProfile?: any;
    context?: any;
  };
}

export interface UserProfile {
  userId: string;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    brands: string[];
    styles: string[];
    colors: string[];
    materials: string[];
  };
  behavior: {
    viewedProducts: string[];
    purchasedProducts: string[];
    wishlistProducts: string[];
    searchHistory: string[];
    sessionDuration: number;
    bounceRate: number;
  };
  demographics: {
    age?: number;
    gender?: string;
    location?: string;
    language?: string;
  };
  engagement: {
    totalSessions: number;
    averageSessionDuration: number;
    conversionRate: number;
    lastActive: string;
  };
}

export interface RecommendationAnalytics {
  totalRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
  averageConfidence: number;
  algorithmPerformance: Array<{
    algorithm: RecommendationAlgorithm;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }>;
  topPerformingCategories: Array<{
    category: string;
    recommendations: number;
    conversions: number;
    revenue: number;
  }>;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    averageRecommendationsPerUser: number;
    userSatisfaction: number;
  };
}

export interface RecommendationFeedback {
  userId: string;
  recommendationId: string;
  productId: string;
  action: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'dismiss' | 'not_interested';
  timestamp: string;
  metadata?: Record<string, any>;
}

class RecommendationService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.RECOMMENDATION_API_KEY || '';
  }

  // Get product recommendations
  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return {
        recommendations: [],
        total: 0,
        algorithm: 'content_based',
        confidence: 0,
        metadata: {
          processingTime: 0,
          cacheHit: false
        }
      };
    }
  }

  // Get similar products
  async getSimilarProducts(
    productId: string,
    limit: number = 10,
    algorithm: RecommendationAlgorithm = 'content_based'
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/similar/${productId}?limit=${limit}&algorithm=${algorithm}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get similar products:', error);
      return [];
    }
  }

  // Get frequently bought together
  async getFrequentlyBoughtTogether(
    productId: string,
    limit: number = 5
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/frequently-bought-together/${productId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get frequently bought together:', error);
      return [];
    }
  }

  // Get customers also viewed
  async getCustomersAlsoViewed(
    productId: string,
    limit: number = 8
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/customers-also-viewed/${productId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get customers also viewed:', error);
      return [];
    }
  }

  // Get trending products
  async getTrendingProducts(
    category?: string,
    limit: number = 10,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<ProductRecommendation[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('period', period);
      if (category) queryParams.append('category', category);

      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/trending?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get trending products:', error);
      return [];
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 20,
    algorithms?: RecommendationAlgorithm[]
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/personalized/${userId}?limit=${limit}${algorithms ? `&algorithms=${algorithms.join(',')}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [];
    }
  }

  // Get category recommendations
  async getCategoryRecommendations(
    category: string,
    limit: number = 12,
    sortBy: 'popularity' | 'rating' | 'price' | 'newest' = 'popularity'
  ): Promise<ProductRecommendation[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('sortBy', sortBy);

      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/category/${category}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get category recommendations:', error);
      return [];
    }
  }

  // Get seasonal recommendations
  async getSeasonalRecommendations(
    season: 'spring' | 'summer' | 'autumn' | 'winter',
    limit: number = 15
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/seasonal/${season}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get seasonal recommendations:', error);
      return [];
    }
  }

  // Get price-based recommendations
  async getPriceBasedRecommendations(
    priceRange: { min: number; max: number },
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/price-based`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceRange, limit })
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get price-based recommendations:', error);
      return [];
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/user-profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/user-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update user profile' };
      }

      const profile = await response.json();
      return { success: true, profile };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Track recommendation feedback
  async trackRecommendationFeedback(
    feedback: RecommendationFeedback
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to track feedback' };
      }

      return { success: true, message: 'Feedback tracked successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get recommendation analytics
  async getRecommendationAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<RecommendationAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/analytics?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get recommendation analytics:', error);
      return {
        totalRecommendations: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        averageConfidence: 0,
        algorithmPerformance: [],
        topPerformingCategories: [],
        userEngagement: {
          totalUsers: 0,
          activeUsers: 0,
          averageRecommendationsPerUser: 0,
          userSatisfaction: 0
        }
      };
    }
  }

  // Train recommendation model
  async trainRecommendationModel(
    algorithm: RecommendationAlgorithm,
    forceRetrain: boolean = false
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/train`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ algorithm, forceRetrain })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to train model' };
      }

      return { success: true, message: 'Model training initiated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get model performance
  async getModelPerformance(
    algorithm: RecommendationAlgorithm
  ): Promise<{
    algorithm: RecommendationAlgorithm;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastTrained: string;
    status: 'training' | 'ready' | 'error';
  } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/model-performance/${algorithm}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get model performance:', error);
      return null;
    }
  }

  // Get recommendation explanations
  async getRecommendationExplanations(
    userId: string,
    productId: string
  ): Promise<{
    explanations: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
    userInsights: Array<{
      insight: string;
      value: any;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/explanations/${userId}/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { explanations: [], userInsights: [] };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get recommendation explanations:', error);
      return { explanations: [], userInsights: [] };
    }
  }

  // A/B test recommendations
  async getABTestRecommendations(
    userId: string,
    testId: string,
    limit: number = 20
  ): Promise<{
    recommendations: ProductRecommendation[];
    testVariant: string;
    testId: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/ab-test/${testId}/${userId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { recommendations: [], testVariant: 'control', testId };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get A/B test recommendations:', error);
      return { recommendations: [], testVariant: 'control', testId };
    }
  }

  // Get cold start recommendations
  async getColdStartRecommendations(
    limit: number = 20,
    category?: string
  ): Promise<ProductRecommendation[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      if (category) queryParams.append('category', category);

      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/cold-start?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get cold start recommendations:', error);
      return [];
    }
  }

  // Get real-time recommendations
  async getRealTimeRecommendations(
    userId: string,
    context: {
      currentPage?: string;
      searchQuery?: string;
      cartItems?: string[];
      viewedProducts?: string[];
    },
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/recommendations/real-time/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context, limit })
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get real-time recommendations:', error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService();
