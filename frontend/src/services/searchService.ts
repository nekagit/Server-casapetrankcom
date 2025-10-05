// Search Service - Backend-integrated search functionality
export interface SearchFilters {
  query?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  material?: string;
  color?: string;
  size?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popularity' | 'rating';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  material: string;
  color: string;
  size?: string;
  availability: 'in_stock' | 'out_of_stock' | 'low_stock';
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  slug: string;
  url: string;
  relevanceScore: number;
  highlights: {
    name: string[];
    description: string[];
    tags: string[];
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  facets: {
    categories: Array<{ name: string; count: number }>;
    materials: Array<{ name: string; count: number }>;
    colors: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
  suggestions: string[];
  searchTime: number;
  query: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'tag' | 'query';
  count?: number;
  url?: string;
}

class SearchService {
  private baseUrl: string;
  private apiKey: string;
  private searchHistory: string[] = [];
  private popularSearches: string[] = [];

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.SEARCH_API_KEY || '';
    this.loadSearchHistory();
  }

  // Perform search
  async search(filters: SearchFilters): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/search?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      
      // Store search query in history
      if (filters.query) {
        this.addToSearchHistory(filters.query);
      }

      return data;
    } catch (error) {
      console.error('Search failed:', error);
      return {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        facets: {
          categories: [],
          materials: [],
          colors: [],
          priceRanges: []
        },
        suggestions: [],
        searchTime: 0,
        query: filters.query || ''
      };
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Suggestions request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return this.getLocalSuggestions(query, limit);
    }
  }

  // Get local suggestions (fallback)
  private getLocalSuggestions(query: string, limit: number): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    // Add from search history
    this.searchHistory
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .forEach(term => {
        suggestions.push({
          text: term,
          type: 'query',
          count: 1
        });
      });

    // Add popular searches
    this.popularSearches
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit - suggestions.length)
      .forEach(term => {
        suggestions.push({
          text: term,
          type: 'query',
          count: 1
        });
      });

    return suggestions.slice(0, limit);
  }

  // Get popular searches
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/popular?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Popular searches request failed');
      }

      const data = await response.json();
      this.popularSearches = data.searches;
      return data.searches;
    } catch (error) {
      console.error('Failed to get popular searches:', error);
      return this.popularSearches.slice(0, limit);
    }
  }

  // Get search history
  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  // Add to search history
  private addToSearchHistory(query: string): void {
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(term => term !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20);
    
    // Save to localStorage
    this.saveSearchHistory();
  }

  // Clear search history
  clearSearchHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  // Save search history to localStorage
  private saveSearchHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('search-history', JSON.stringify(this.searchHistory));
    }
  }

  // Load search history from localStorage
  private loadSearchHistory(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('search-history');
      if (stored) {
        try {
          this.searchHistory = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to load search history:', error);
          this.searchHistory = [];
        }
      }
    }
  }

  // Get search analytics
  async getSearchAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<{
    totalSearches: number;
    uniqueSearches: number;
    topQueries: Array<{ query: string; count: number }>;
    noResultsQueries: Array<{ query: string; count: number }>;
    conversionRate: number;
    averageResultsPerQuery: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Search analytics request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      return {
        totalSearches: 0,
        uniqueSearches: 0,
        topQueries: [],
        noResultsQueries: [],
        conversionRate: 0,
        averageResultsPerQuery: 0
      };
    }
  }

  // Track search event
  async trackSearchEvent(event: {
    type: 'search' | 'click' | 'no_results' | 'suggestion_click';
    query: string;
    resultId?: string;
    position?: number;
    filters?: SearchFilters;
  }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/search/track`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to track search event:', error);
    }
  }

  // Get search recommendations
  async getSearchRecommendations(query: string): Promise<{
    relatedQueries: string[];
    trendingQueries: string[];
    categorySuggestions: Array<{ name: string; count: number }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/recommendations?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Search recommendations request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get search recommendations:', error);
      return {
        relatedQueries: [],
        trendingQueries: [],
        categorySuggestions: []
      };
    }
  }

  // Advanced search with filters
  async advancedSearch(filters: SearchFilters): Promise<SearchResponse> {
    // Add advanced search parameters
    const advancedFilters = {
      ...filters,
      advanced: true,
      includeFacets: true,
      includeSuggestions: true
    };

    return this.search(advancedFilters);
  }

  // Search within category
  async searchInCategory(category: string, filters: Omit<SearchFilters, 'category'>): Promise<SearchResponse> {
    return this.search({
      ...filters,
      category
    });
  }

  // Search similar products
  async findSimilarProducts(productId: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/similar/${productId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Similar products request failed');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Failed to find similar products:', error);
      return [];
    }
  }

  // Get search autocomplete
  async getAutocomplete(query: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Autocomplete request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get autocomplete:', error);
      return [];
    }
  }

  // Search with typo tolerance
  async searchWithTypoTolerance(query: string, filters: Omit<SearchFilters, 'query'> = {}): Promise<SearchResponse> {
    return this.search({
      ...filters,
      query,
      typoTolerance: true
    });
  }

  // Get search performance metrics
  async getSearchPerformance(): Promise<{
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    cacheHitRate: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search/performance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Search performance request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get search performance:', error);
      return {
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        cacheHitRate: 0
      };
    }
  }
}

export const searchService = new SearchService();
