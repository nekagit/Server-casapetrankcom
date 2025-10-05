// Advanced Search Service - Enhanced search with filters and faceted search
export interface SearchFilters {
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  rating?: number;
  tags?: string[];
  brand?: string[];
  features?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface SearchSort {
  field: 'relevance' | 'price' | 'name' | 'rating' | 'date' | 'popularity';
  order: 'asc' | 'desc';
}

export interface SearchFacet {
  name: string;
  field: string;
  values: Array<{
    value: string;
    count: number;
    selected: boolean;
  }>;
  type: 'single' | 'multiple' | 'range';
}

export interface SearchResult {
  products: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    tags: string[];
    materials: string[];
    colors: string[];
    sizes: string[];
    relevanceScore?: number;
  }>;
  total: number;
  page: number;
  totalPages: number;
  facets: SearchFacet[];
  suggestions: string[];
  relatedSearches: string[];
  searchTime: number;
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'tag';
  count?: number;
  url?: string;
}

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  filters: SearchFilters;
  sort: SearchSort;
  searchTime: number;
  clickedResults: number[];
  conversionRate: number;
}

class AdvancedSearchService {
  private baseUrl: string;
  private searchHistory: string[] = [];
  private searchAnalytics: SearchAnalytics[] = [];

  constructor(baseUrl: string = '/api/search') {
    this.baseUrl = baseUrl;
    this.loadSearchHistory();
  }

  // Perform advanced search
  async search(
    query: string,
    filters: SearchFilters = {},
    sort: SearchSort = { field: 'relevance', order: 'desc' },
    page: number = 1,
    limit: number = 24
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          sort,
          page,
          limit
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result: SearchResult = await response.json();
      result.searchTime = Date.now() - startTime;
      
      // Track search analytics
      this.trackSearchAnalytics({
        query,
        resultsCount: result.total,
        filters,
        sort,
        searchTime: result.searchTime,
        clickedResults: [],
        conversionRate: 0
      });

      // Add to search history
      this.addToSearchHistory(query);
      
      return result;
    } catch (error) {
      console.warn('API not available, using mock search');
      return this.getMockSearchResult(query, filters, sort, page, limit);
    }
  }

  // Get search suggestions
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock suggestions');
      return this.getMockSuggestions(query, limit);
    }
  }

  // Get popular searches
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/popular?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to get popular searches');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock popular searches');
      return this.getMockPopularSearches(limit);
    }
  }

  // Get search facets
  async getSearchFacets(filters: SearchFilters = {}): Promise<SearchFacet[]> {
    try {
      const response = await fetch(`${this.baseUrl}/facets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        throw new Error('Failed to get search facets');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock facets');
      return this.getMockSearchFacets();
    }
  }

  // Track search result click
  trackResultClick(resultId: number, query: string, position: number): void {
    const analytics = this.searchAnalytics.find(a => a.query === query);
    if (analytics) {
      analytics.clickedResults.push(resultId);
      analytics.conversionRate = analytics.clickedResults.length / analytics.resultsCount;
    }
  }

  // Get search analytics
  getSearchAnalytics(): SearchAnalytics[] {
    return this.searchAnalytics;
  }

  // Get search history
  getSearchHistory(): string[] {
    return this.searchHistory;
  }

  // Clear search history
  clearSearchHistory(): void {
    this.searchHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('search-history');
    }
  }

  // Add to search history
  private addToSearchHistory(query: string): void {
    if (query.trim() && !this.searchHistory.includes(query.trim())) {
      this.searchHistory.unshift(query.trim());
      this.searchHistory = this.searchHistory.slice(0, 20); // Keep only last 20 searches
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('search-history', JSON.stringify(this.searchHistory));
      }
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
          console.warn('Failed to load search history');
        }
      }
    }
  }

  // Track search analytics
  private trackSearchAnalytics(analytics: SearchAnalytics): void {
    this.searchAnalytics.push(analytics);
    this.searchAnalytics = this.searchAnalytics.slice(-100); // Keep only last 100 searches
  }

  // Mock data methods
  private getMockSearchResult(
    query: string,
    filters: SearchFilters,
    sort: SearchSort,
    page: number,
    limit: number
  ): SearchResult {
    const mockProducts = [
      {
        id: 1,
        name: 'Tibet Armband',
        slug: 'tibet-armband',
        price: 24.90,
        originalPrice: 29.90,
        image: '/images/products/tibet-armband.jpg',
        category: 'Armbänder',
        rating: 4.5,
        reviewCount: 23,
        inStock: true,
        tags: ['boho', 'handmade', 'natural'],
        materials: ['Holz', 'Naturstein'],
        colors: ['Braun', 'Beige'],
        sizes: ['One Size'],
        relevanceScore: 0.95
      },
      {
        id: 2,
        name: 'Boho Wickelarmband',
        slug: 'boho-wickelarmband',
        price: 19.90,
        image: '/images/products/product_1.jpg',
        category: 'Armbänder',
        rating: 4.2,
        reviewCount: 15,
        inStock: true,
        tags: ['boho', 'colorful', 'handmade'],
        materials: ['Glasperlen', 'Metall'],
        colors: ['Multicolor'],
        sizes: ['One Size'],
        relevanceScore: 0.88
      },
      {
        id: 3,
        name: 'Naturstein Kette',
        slug: 'naturstein-kette',
        price: 32.90,
        image: '/images/products/real_product_1.jpg',
        category: 'Ketten',
        rating: 4.8,
        reviewCount: 31,
        inStock: true,
        tags: ['natural', 'elegant', 'stones'],
        materials: ['Silber', 'Naturstein'],
        colors: ['Silber', 'Grün'],
        sizes: ['45cm'],
        relevanceScore: 0.92
      }
    ];

    // Apply filters
    let filteredProducts = mockProducts;
    
    if (filters.category && filters.category.length > 0) {
      filteredProducts = filteredProducts.filter(p => filters.category!.includes(p.category));
    }
    
    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      );
    }
    
    if (filters.materials && filters.materials.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.materials.some(material => filters.materials!.includes(material))
      );
    }
    
    if (filters.colors && filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.colors.some(color => filters.colors!.includes(color))
      );
    }
    
    if (filters.availability === 'in_stock') {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    } else if (filters.availability === 'out_of_stock') {
      filteredProducts = filteredProducts.filter(p => !p.inStock);
    }
    
    if (filters.rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating!);
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      switch (sort.field) {
        case 'price':
          return sort.order === 'asc' ? a.price - b.price : b.price - a.price;
        case 'name':
          return sort.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'rating':
          return sort.order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        case 'popularity':
          return sort.order === 'asc' ? a.reviewCount - b.reviewCount : b.reviewCount - a.reviewCount;
        case 'relevance':
        default:
          return sort.order === 'asc' ? (a.relevanceScore || 0) - (b.relevanceScore || 0) : (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      totalPages: Math.ceil(filteredProducts.length / limit),
      facets: this.getMockSearchFacets(),
      suggestions: this.getMockSuggestions(query, 5),
      relatedSearches: ['boho schmuck', 'handmade jewelry', 'natural accessories'],
      searchTime: 45,
      query,
      filters,
      sort
    };
  }

  private getMockSuggestions(query: string, limit: number): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [
      { text: 'boho armband', type: 'product', count: 15 },
      { text: 'handmade schmuck', type: 'category', count: 45 },
      { text: 'naturstein kette', type: 'product', count: 8 },
      { text: 'wickelarmband', type: 'product', count: 12 },
      { text: 'casa petrada', type: 'brand', count: 1 }
    ];

    return suggestions
      .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

  private getMockPopularSearches(limit: number): string[] {
    return [
      'boho armband',
      'handmade schmuck',
      'naturstein kette',
      'wickelarmband',
      'boho ohrringe',
      'handmade jewelry',
      'natural accessories',
      'boho style',
      'artisan jewelry',
      'unique jewelry'
    ].slice(0, limit);
  }

  private getMockSearchFacets(): SearchFacet[] {
    return [
      {
        name: 'Kategorie',
        field: 'category',
        type: 'multiple',
        values: [
          { value: 'Armbänder', count: 25, selected: false },
          { value: 'Ketten', count: 18, selected: false },
          { value: 'Ohrringe', count: 12, selected: false },
          { value: 'Fashion', count: 8, selected: false }
        ]
      },
      {
        name: 'Preis',
        field: 'price',
        type: 'range',
        values: [
          { value: '0-20', count: 15, selected: false },
          { value: '20-40', count: 28, selected: false },
          { value: '40-60', count: 12, selected: false },
          { value: '60+', count: 8, selected: false }
        ]
      },
      {
        name: 'Material',
        field: 'materials',
        type: 'multiple',
        values: [
          { value: 'Holz', count: 20, selected: false },
          { value: 'Naturstein', count: 15, selected: false },
          { value: 'Silber', count: 12, selected: false },
          { value: 'Glasperlen', count: 8, selected: false }
        ]
      },
      {
        name: 'Farbe',
        field: 'colors',
        type: 'multiple',
        values: [
          { value: 'Braun', count: 18, selected: false },
          { value: 'Beige', count: 15, selected: false },
          { value: 'Silber', count: 12, selected: false },
          { value: 'Multicolor', count: 10, selected: false }
        ]
      },
      {
        name: 'Bewertung',
        field: 'rating',
        type: 'single',
        values: [
          { value: '4+', count: 35, selected: false },
          { value: '3+', count: 45, selected: false },
          { value: '2+', count: 50, selected: false }
        ]
      }
    ];
  }
}

export const advancedSearchService = new AdvancedSearchService();
