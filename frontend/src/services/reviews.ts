// Customer Reviews Service
export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  images?: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  response?: {
    id: string;
    content: string;
    author: string;
    createdAt: string;
  };
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
  verifiedPercentage: number;
  recentReviews: number;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data?: any;
}

class ReviewService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  // Get product reviews
  async getProductReviews(productId: string, params: {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    verified?: boolean;
  } = {}): Promise<{ reviews: Review[]; total: number; pages: number; stats: ReviewStats }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('productId', productId);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/reviews/product?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch product reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Get product reviews error:', error);
      return { reviews: [], total: 0, pages: 0, stats: this.getDefaultStats() };
    }
  }

  // Get review by ID
  async getReview(reviewId: string): Promise<Review | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch review');
      }

      return await response.json();
    } catch (error) {
      console.error('Get review error:', error);
      return null;
    }
  }

  // Create review
  async createReview(reviewData: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: File[];
    orderId?: string;
  }): Promise<ReviewResponse> {
    try {
      const formData = new FormData();
      formData.append('productId', reviewData.productId);
      formData.append('rating', reviewData.rating.toString());
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);
      
      if (reviewData.orderId) {
        formData.append('orderId', reviewData.orderId);
      }
      
      if (reviewData.images) {
        reviewData.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await fetch(`${this.baseUrl}/api/v1/reviews`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create review');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Bewertung erfolgreich erstellt',
        data
      };
    } catch (error) {
      console.error('Create review error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bewertung-Erstellung fehlgeschlagen'
      };
    }
  }

  // Update review
  async updateReview(reviewId: string, reviewData: {
    rating?: number;
    title?: string;
    comment?: string;
  }): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update review');
      }

      return {
        success: true,
        message: 'Bewertung erfolgreich aktualisiert'
      };
    } catch (error) {
      console.error('Update review error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bewertung-Update fehlgeschlagen'
      };
    }
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete review');
      }

      return {
        success: true,
        message: 'Bewertung erfolgreich gelöscht'
      };
    } catch (error) {
      console.error('Delete review error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bewertung-Löschung fehlgeschlagen'
      };
    }
  }

  // Rate review helpfulness
  async rateReviewHelpfulness(reviewId: string, helpful: boolean): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to rate review helpfulness');
      }

      return {
        success: true,
        message: helpful ? 'Bewertung als hilfreich markiert' : 'Bewertung als nicht hilfreich markiert'
      };
    } catch (error) {
      console.error('Rate review helpfulness error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bewertung-Bewertung fehlgeschlagen'
      };
    }
  }

  // Report review
  async reportReview(reviewId: string, reason: string, description?: string): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, description })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to report review');
      }

      return {
        success: true,
        message: 'Bewertung erfolgreich gemeldet'
      };
    } catch (error) {
      console.error('Report review error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bewertung-Meldung fehlgeschlagen'
      };
    }
  }

  // Get customer reviews
  async getCustomerReviews(customerId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{ reviews: Review[]; total: number; pages: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('customerId', customerId);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/reviews/customer?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch customer reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Get customer reviews error:', error);
      return { reviews: [], total: 0, pages: 0 };
    }
  }

  // Validate review
  validateReview(review: {
    rating: number;
    title: string;
    comment: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!review.rating || review.rating < 1 || review.rating > 5) {
      errors.push('Bewertung muss zwischen 1 und 5 Sternen liegen');
    }

    if (!review.title?.trim()) {
      errors.push('Titel ist erforderlich');
    } else if (review.title.length < 5) {
      errors.push('Titel muss mindestens 5 Zeichen lang sein');
    } else if (review.title.length > 100) {
      errors.push('Titel darf maximal 100 Zeichen lang sein');
    }

    if (!review.comment?.trim()) {
      errors.push('Kommentar ist erforderlich');
    } else if (review.comment.length < 10) {
      errors.push('Kommentar muss mindestens 10 Zeichen lang sein');
    } else if (review.comment.length > 1000) {
      errors.push('Kommentar darf maximal 1000 Zeichen lang sein');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get default stats
  private getDefaultStats(): ReviewStats {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedPercentage: 0,
      recentReviews: 0
    };
  }

  // Show review messages
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

export const reviewService = new ReviewService();
