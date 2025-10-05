// Image Management Service - Comprehensive image optimization and management system
export interface ImageUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  url: string;
  thumbnailUrl: string;
  alt: string;
  caption?: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  uploadedBy: string;
  uploadedAt: string;
  metadata: {
    camera?: string;
    lens?: string;
    settings?: string;
    location?: string;
    copyright?: string;
  };
}

export interface ImageOptimization {
  original: string;
  webp: string;
  avif: string;
  jpeg: string;
  sizes: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  responsive: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  lazy: {
    placeholder: string;
    blur: string;
  };
}

export interface ImageGallery {
  id: string;
  name: string;
  description?: string;
  images: ImageUpload[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageFilters {
  search?: string;
  category?: string;
  tags?: string[];
  mimeType?: string;
  sizeMin?: number;
  sizeMax?: number;
  widthMin?: number;
  widthMax?: number;
  heightMin?: number;
  heightMax?: number;
  isPublic?: boolean;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'width' | 'height';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ImageAnalytics {
  totalImages: number;
  totalSize: number;
  averageSize: number;
  imagesByType: Record<string, number>;
  imagesByCategory: Record<string, number>;
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
  optimizationStats: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    savingsPercentage: number;
  };
  popularImages: Array<{
    id: string;
    name: string;
    views: number;
    downloads: number;
  }>;
}

class ImageManagementService {
  private baseUrl: string;
  private apiKey: string;
  private cdnUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.IMAGE_API_KEY || '';
    this.cdnUrl = process.env.CDN_URL || 'https://cdn.casa-petrada.de';
  }

  // Upload image
  async uploadImage(
    file: File,
    metadata: {
      alt: string;
      caption?: string;
      tags?: string[];
      category?: string;
      isPublic?: boolean;
    }
  ): Promise<{ success: boolean; image?: ImageUpload; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', metadata.alt);
      if (metadata.caption) formData.append('caption', metadata.caption);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
      if (metadata.category) formData.append('category', metadata.category);
      if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to upload image' };
      }

      const image = await response.json();
      return { success: true, image };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get images with filters
  async getImages(filters: ImageFilters = {}): Promise<{
    images: ImageUpload[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/images?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get images:', error);
      return { images: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Get image by ID
  async getImage(imageId: string): Promise<ImageUpload | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  // Update image metadata
  async updateImage(
    imageId: string,
    updates: Partial<ImageUpload>
  ): Promise<{ success: boolean; image?: ImageUpload; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update image' };
      }

      const image = await response.json();
      return { success: true, image };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete image
  async deleteImage(imageId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete image' };
      }

      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Optimize image
  async optimizeImage(
    imageId: string,
    options: {
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      quality?: number;
      width?: number;
      height?: number;
      resize?: 'fit' | 'fill' | 'crop';
    }
  ): Promise<{ success: boolean; optimizedUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/${imageId}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to optimize image' };
      }

      const data = await response.json();
      return { success: true, optimizedUrl: data.url };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get optimized image URL
  getOptimizedImageUrl(
    imageId: string,
    options: {
      width?: number;
      height?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      quality?: number;
    } = {}
  ): string {
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.format) params.append('f', options.format);
    if (options.quality) params.append('q', options.quality.toString());

    const queryString = params.toString();
    return `${this.cdnUrl}/images/${imageId}${queryString ? `?${queryString}` : ''}`;
  }

  // Generate responsive image URLs
  generateResponsiveUrls(imageId: string): ImageOptimization {
    return {
      original: `${this.cdnUrl}/images/${imageId}`,
      webp: `${this.cdnUrl}/images/${imageId}?f=webp`,
      avif: `${this.cdnUrl}/images/${imageId}?f=avif`,
      jpeg: `${this.cdnUrl}/images/${imageId}?f=jpeg`,
      sizes: {
        thumbnail: `${this.cdnUrl}/images/${imageId}?w=150&h=150&f=webp`,
        small: `${this.cdnUrl}/images/${imageId}?w=300&h=300&f=webp`,
        medium: `${this.cdnUrl}/images/${imageId}?w=600&h=600&f=webp`,
        large: `${this.cdnUrl}/images/${imageId}?w=1200&h=1200&f=webp`,
        xlarge: `${this.cdnUrl}/images/${imageId}?w=1920&h=1920&f=webp`
      },
      responsive: {
        mobile: `${this.cdnUrl}/images/${imageId}?w=400&h=400&f=webp`,
        tablet: `${this.cdnUrl}/images/${imageId}?w=800&h=800&f=webp`,
        desktop: `${this.cdnUrl}/images/${imageId}?w=1200&h=1200&f=webp`
      },
      lazy: {
        placeholder: `${this.cdnUrl}/images/${imageId}?w=20&h=20&f=webp&blur=10`,
        blur: `${this.cdnUrl}/images/${imageId}?w=40&h=40&f=webp&blur=5`
      }
    };
  }

  // Create image gallery
  async createGallery(
    galleryData: {
      name: string;
      description?: string;
      images: string[];
      coverImage?: string;
      isPublic?: boolean;
    }
  ): Promise<{ success: boolean; gallery?: ImageGallery; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/galleries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(galleryData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create gallery' };
      }

      const gallery = await response.json();
      return { success: true, gallery };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get image galleries
  async getGalleries(): Promise<ImageGallery[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/galleries`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get galleries:', error);
      return [];
    }
  }

  // Update image gallery
  async updateGallery(
    galleryId: string,
    updates: Partial<ImageGallery>
  ): Promise<{ success: boolean; gallery?: ImageGallery; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/galleries/${galleryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update gallery' };
      }

      const gallery = await response.json();
      return { success: true, gallery };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete image gallery
  async deleteGallery(galleryId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/galleries/${galleryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete gallery' };
      }

      return { success: true, message: 'Gallery deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get image analytics
  async getImageAnalytics(): Promise<ImageAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get image analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get image analytics:', error);
      return {
        totalImages: 0,
        totalSize: 0,
        averageSize: 0,
        imagesByType: {},
        imagesByCategory: {},
        storageUsage: { used: 0, available: 0, percentage: 0 },
        optimizationStats: { originalSize: 0, optimizedSize: 0, savings: 0, savingsPercentage: 0 },
        popularImages: []
      };
    }
  }

  // Bulk optimize images
  async bulkOptimizeImages(
    imageIds: string[],
    options: {
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      quality?: number;
      width?: number;
      height?: number;
    }
  ): Promise<{ success: boolean; optimized: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/bulk-optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageIds, options })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, optimized: 0, errors: [error.message || 'Bulk optimization failed'] };
      }

      const data = await response.json();
      return { success: true, optimized: data.optimized, errors: data.errors || [] };
    } catch (error) {
      return {
        success: false,
        optimized: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Bulk delete images
  async bulkDeleteImages(imageIds: string[]): Promise<{ success: boolean; deleted: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageIds })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, deleted: 0, errors: [error.message || 'Bulk deletion failed'] };
      }

      const data = await response.json();
      return { success: true, deleted: data.deleted, errors: data.errors || [] };
    } catch (error) {
      return {
        success: false,
        deleted: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Generate image placeholder
  generatePlaceholder(width: number, height: number, text?: string): string {
    const params = new URLSearchParams();
    params.append('w', width.toString());
    params.append('h', height.toString());
    if (text) params.append('text', text);
    return `${this.cdnUrl}/placeholder?${params.toString()}`;
  }

  // Get image dimensions
  async getImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return null;
    }
  }

  // Validate image file
  validateImageFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const maxDimensions = { width: 4000, height: 4000 };

    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type must be JPEG, PNG, WebP, GIF, or SVG');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate image alt text
  async generateAltText(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/generate-alt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        return 'Product image';
      }

      const data = await response.json();
      return data.altText || 'Product image';
    } catch (error) {
      console.error('Failed to generate alt text:', error);
      return 'Product image';
    }
  }

  // Export images
  async exportImages(
    filters: ImageFilters = {},
    format: 'zip' | 'tar' = 'zip'
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
      queryParams.append('format', format);

      const response = await fetch(`${this.baseUrl}/api/v1/images/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to export images' };
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

export const imageManagementService = new ImageManagementService();
