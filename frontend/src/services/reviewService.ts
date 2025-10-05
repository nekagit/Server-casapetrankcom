// Review Service - Comprehensive product review system with backend integration
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  isVerifiedPurchase: boolean;
  purchaseDate?: string;
  size?: string;
  color?: string;
  pros?: string[];
  cons?: string[];
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
  helpfulVotes: string[];
  reportedBy: string[];
}

export interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: number;
  verified?: boolean;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful' | 'verified';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviews: number;
  recentReviews: number;
  helpfulReviews: number;
  flaggedReviews: number;
  responseRate: number;
  averageResponseTime: number;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  merchantId: string;
  merchantName: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'irrelevant' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  moderatorNotes?: string;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  reviewTrend: Array<{
    date: string;
    count: number;
    averageRating: number;
  }>;
  topRatedProducts: Array<{
    productId: string;
    productName: string;
    averageRating: number;
    reviewCount: number;
  }>;
  mostHelpfulReviews: Array<{
    reviewId: string;
    productName: string;
    helpfulScore: number;
    content: string;
  }>;
  reviewSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonKeywords: Array<{
    keyword: string;
    frequency: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

class ReviewService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.REVIEW_API_KEY || '';
  }

  // Get reviews for a product
  async getProductReviews(
    productId: string,
    filters: Omit<ReviewFilters, 'productId'> = {}
  ): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    stats: ReviewStats;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/products/${productId}/reviews?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get product reviews:', error);
      return {
        reviews: [],
        total: 0,
        page: 1,
        totalPages: 0,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          verifiedReviews: 0,
          recentReviews: 0,
          helpfulReviews: 0,
          flaggedReviews: 0,
          responseRate: 0,
          averageResponseTime: 0
        }
      };
    }
  }

  // Get all reviews (admin)
  async getAllReviews(filters: ReviewFilters = {}): Promise<{
    reviews: Review[];
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

      const response = await fetch(`${this.baseUrl}/api/v1/reviews?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get all reviews:', error);
      return { reviews: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Create a review
  async createReview(reviewData: {
    productId: string;
    rating: number;
    title: string;
    content: string;
    images?: string[];
    pros?: string[];
    cons?: string[];
    tags?: string[];
    size?: string;
    color?: string;
  }): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create review' };
      }

      const review = await response.json();
      return { success: true, review };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update a review
  async updateReview(
    reviewId: string,
    updates: Partial<Review>
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update review' };
      }

      const review = await response.json();
      return { success: true, review };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete review' };
      }

      return { success: true, message: 'Review deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Vote on review helpfulness
  async voteReview(
    reviewId: string,
    helpful: boolean
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ helpful })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to vote on review' };
      }

      return { success: true, message: 'Vote recorded successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Report a review
  async reportReview(
    reviewId: string,
    reason: string,
    description: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason, description })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to report review' };
      }

      return { success: true, message: 'Review reported successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Moderate a review (admin)
  async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected' | 'flagged',
    notes?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/moderate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to moderate review' };
      }

      return { success: true, message: 'Review moderated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get review responses
  async getReviewResponses(reviewId: string): Promise<ReviewResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/responses`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get review responses:', error);
      return [];
    }
  }

  // Add review response (merchant)
  async addReviewResponse(
    reviewId: string,
    response: string
  ): Promise<{ success: boolean; reviewResponse?: ReviewResponse; error?: string }> {
    try {
      const responseData = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response })
      });

      if (!responseData.ok) {
        const error = await responseData.json();
        return { success: false, error: error.message || 'Failed to add review response' };
      }

      const reviewResponse = await responseData.json();
      return { success: true, reviewResponse };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update review response
  async updateReviewResponse(
    responseId: string,
    response: string
  ): Promise<{ success: boolean; reviewResponse?: ReviewResponse; error?: string }> {
    try {
      const responseData = await fetch(`${this.baseUrl}/api/v1/review-responses/${responseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response })
      });

      if (!responseData.ok) {
        const error = await responseData.json();
        return { success: false, error: error.message || 'Failed to update review response' };
      }

      const reviewResponse = await responseData.json();
      return { success: true, reviewResponse };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete review response
  async deleteReviewResponse(
    responseId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/review-responses/${responseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete review response' };
      }

      return { success: true, message: 'Review response deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get review analytics
  async getReviewAnalytics(
    productId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<ReviewAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      if (productId) queryParams.append('productId', productId);
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await fetch(`${this.baseUrl}/api/v1/reviews/analytics?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get review analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get review analytics:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        reviewTrend: [],
        topRatedProducts: [],
        mostHelpfulReviews: [],
        reviewSentiment: { positive: 0, neutral: 0, negative: 0 },
        commonKeywords: []
      };
    }
  }

  // Get review reports (admin)
  async getReviewReports(
    status?: string,
    limit: number = 50
  ): Promise<ReviewReport[]> {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      queryParams.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/reviews/reports?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get review reports:', error);
      return [];
    }
  }

  // Resolve review report
  async resolveReviewReport(
    reportId: string,
    action: 'dismiss' | 'flag_review' | 'remove_review',
    notes?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to resolve review report' };
      }

      return { success: true, message: 'Review report resolved successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user's reviews
  async getUserReviews(
    userId: string,
    filters: Omit<ReviewFilters, 'userId'> = {}
  ): Promise<{
    reviews: Review[];
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

      const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}/reviews?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { reviews: [], total: 0, page: 1, totalPages: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user reviews:', error);
      return { reviews: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Check if user can review product
  async canUserReviewProduct(
    productId: string,
    userId: string
  ): Promise<{
    canReview: boolean;
    reason?: string;
    hasPurchased: boolean;
    existingReview?: Review;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/${productId}/can-review?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return { canReview: false, reason: 'Unable to verify purchase', hasPurchased: false };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      return { canReview: false, reason: 'Error checking eligibility', hasPurchased: false };
    }
  }

  // Get review summary for product
  async getProductReviewSummary(productId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
    recentReviews: Review[];
    topReviews: Review[];
    verifiedReviews: number;
    responseRate: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/${productId}/review-summary`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get review summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get review summary:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
        recentReviews: [],
        topReviews: [],
        verifiedReviews: 0,
        responseRate: 0
      };
    }
  }

  // Export reviews
  async exportReviews(
    filters: ReviewFilters = {},
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

      const response = await fetch(`${this.baseUrl}/api/v1/reviews/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to export reviews' };
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

  // Bulk moderate reviews
  async bulkModerateReviews(
    reviewIds: string[],
    status: 'approved' | 'rejected' | 'flagged',
    notes?: string
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/bulk-moderate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewIds, status, notes })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, updated: 0, errors: [error.message || 'Bulk moderation failed'] };
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
}

export const reviewService = new ReviewService();
