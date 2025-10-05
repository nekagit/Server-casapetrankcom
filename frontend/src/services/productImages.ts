// Product Images Service
export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  caption?: string;
  isMain: boolean;
  order: number;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  image?: ProductImage;
  data?: any;
}

class ProductImageService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.casa-petrada.de' 
    : 'http://localhost:8000';

  // Upload product image
  async uploadImage(file: File, productId: string, isMain: boolean = false): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', productId);
      formData.append('isMain', isMain.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/products/images/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Image upload failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Bild erfolgreich hochgeladen',
        image: data.image,
        data
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bild-Upload fehlgeschlagen'
      };
    }
  }

  // Get product images
  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/${productId}/images`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch product images');
      }

      const data = await response.json();
      return data.images;
    } catch (error) {
      console.error('Get product images error:', error);
      return [];
    }
  }

  // Delete product image
  async deleteImage(imageId: string): Promise<ImageUploadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/images/${imageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Image deletion failed');
      }

      return {
        success: true,
        message: 'Bild erfolgreich gelöscht'
      };
    } catch (error) {
      console.error('Image deletion error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bild-Löschung fehlgeschlagen'
      };
    }
  }

  // Set main image
  async setMainImage(imageId: string): Promise<ImageUploadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/images/${imageId}/set-main`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to set main image');
      }

      return {
        success: true,
        message: 'Hauptbild erfolgreich gesetzt'
      };
    } catch (error) {
      console.error('Set main image error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Hauptbild-Setzung fehlgeschlagen'
      };
    }
  }

  // Reorder images
  async reorderImages(productId: string, imageIds: string[]): Promise<ImageUploadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reorder images');
      }

      return {
        success: true,
        message: 'Bildreihenfolge erfolgreich aktualisiert'
      };
    } catch (error) {
      console.error('Reorder images error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bildreihenfolge-Update fehlgeschlagen'
      };
    }
  }

  // Validate image file
  validateImage(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxDimensions = { width: 4000, height: 4000 };

    if (!allowedTypes.includes(file.type)) {
      errors.push('Nur JPEG, PNG und WebP Dateien sind erlaubt');
    }

    if (file.size > maxSize) {
      errors.push('Datei ist zu groß. Maximum: 5MB');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate image URL with transformations
  generateImageUrl(imageUrl: string, transformations: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  } = {}): string {
    const params = new URLSearchParams();
    
    if (transformations.width) params.append('w', transformations.width.toString());
    if (transformations.height) params.append('h', transformations.height.toString());
    if (transformations.quality) params.append('q', transformations.quality.toString());
    if (transformations.format) params.append('f', transformations.format);
    if (transformations.fit) params.append('fit', transformations.fit);

    const queryString = params.toString();
    return queryString ? `${imageUrl}?${queryString}` : imageUrl;
  }

  // Show image messages
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

export const productImageService = new ProductImageService();
