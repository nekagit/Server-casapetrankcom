// Image Optimization Service - Real image optimization and CDN
export interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  background?: string;
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
}

export interface ImageTransform {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
}

export interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'fastly' | 'keycdn' | 'custom';
  baseUrl: string;
  apiKey?: string;
  zones: string[];
  optimization: {
    auto: boolean;
    quality: number;
    format: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
    progressive: boolean;
    stripMetadata: boolean;
  };
  caching: {
    ttl: number;
    edge: boolean;
    browser: boolean;
  };
  security: {
    signedUrls: boolean;
    tokenAuth: boolean;
    referrerCheck: boolean;
  };
}

export interface ImageStats {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
  loadTime: number;
  bandwidth: number;
}

class ImageOptimizationService {
  private cdnConfig: CDNConfig;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.cdnConfig = {
      provider: (process.env.CDN_PROVIDER as any) || 'cloudflare',
      baseUrl: process.env.CDN_BASE_URL || 'https://images.casa-petrada.de',
      apiKey: process.env.CDN_API_KEY || '',
      zones: ['global'],
      optimization: {
        auto: true,
        quality: 85,
        format: 'auto',
        progressive: true,
        stripMetadata: true
      },
      caching: {
        ttl: 31536000, // 1 year
        edge: true,
        browser: true
      },
      security: {
        signedUrls: false,
        tokenAuth: false,
        referrerCheck: false
      }
    };
    
    this.baseUrl = this.cdnConfig.baseUrl;
    this.apiKey = this.cdnConfig.apiKey;
  }

  // Optimize image URL
  optimizeImageUrl(
    src: string,
    config: ImageConfig = {}
  ): string {
    const params = new URLSearchParams();
    
    // Add optimization parameters
    if (config.width) params.append('w', config.width.toString());
    if (config.height) params.append('h', config.height.toString());
    if (config.quality) params.append('q', config.quality.toString());
    if (config.format) params.append('f', config.format);
    if (config.fit) params.append('fit', config.fit);
    if (config.position) params.append('pos', config.position);
    if (config.background) params.append('bg', config.background);
    if (config.blur) params.append('blur', config.blur.toString());
    if (config.sharpen) params.append('sharpen', config.sharpen.toString());
    if (config.brightness) params.append('brightness', config.brightness.toString());
    if (config.contrast) params.append('contrast', config.contrast.toString());
    if (config.saturation) params.append('saturation', config.saturation.toString());
    if (config.hue) params.append('hue', config.hue.toString());

    // Add CDN optimization
    if (this.cdnConfig.optimization.auto) {
      params.append('auto', 'format,compress');
    }
    if (this.cdnConfig.optimization.progressive) {
      params.append('progressive', 'true');
    }
    if (this.cdnConfig.optimization.stripMetadata) {
      params.append('strip', 'true');
    }

    const queryString = params.toString();
    return `${this.baseUrl}/${src}${queryString ? `?${queryString}` : ''}`;
  }

  // Generate responsive image srcset
  generateSrcSet(
    src: string,
    sizes: number[] = [320, 640, 768, 1024, 1280, 1920],
    config: ImageConfig = {}
  ): string {
    return sizes
      .map(size => {
        const optimizedUrl = this.optimizeImageUrl(src, { ...config, width: size });
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  }

  // Generate responsive image sizes attribute
  generateSizes(breakpoints: Array<{ media: string; size: string }>): string {
    return breakpoints
      .map(bp => `${bp.media} ${bp.size}`)
      .join(', ');
  }

  // Create optimized image component props
  createOptimizedImage(
    src: string,
    alt: string,
    config: ImageConfig = {},
    responsive: boolean = true
  ): ImageTransform {
    const optimizedSrc = this.optimizeImageUrl(src, config);
    
    if (responsive) {
      const srcset = this.generateSrcSet(src, undefined, config);
      const sizes = this.generateSizes([
        { media: '(max-width: 640px)', size: '100vw' },
        { media: '(max-width: 1024px)', size: '50vw' },
        { media: '(min-width: 1025px)', size: '33vw' }
      ]);

      return {
        src: optimizedSrc,
        alt,
        width: config.width || 800,
        height: config.height || 600,
        loading: 'lazy',
        sizes,
        className: 'optimized-image'
      };
    }

    return {
      src: optimizedSrc,
      alt,
      width: config.width || 800,
      height: config.height || 600,
      loading: 'lazy',
      className: 'optimized-image'
    };
  }

  // Generate blur placeholder
  async generateBlurPlaceholder(src: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/placeholder/${src}?w=20&h=20&blur=10&q=20`);
      if (response.ok) {
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.warn('Failed to generate blur placeholder:', error);
    }
    
    // Fallback to CSS gradient
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo=';
  }

  // Upload image to CDN
  async uploadImage(
    file: File,
    path: string,
    config: ImageConfig = {}
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      formData.append('config', JSON.stringify(config));

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Delete image from CDN
  async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  // Get image statistics
  async getImageStats(src: string): Promise<ImageStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/${src}`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get image stats:', error);
      return null;
    }
  }

  // Batch optimize images
  async batchOptimizeImages(
    images: Array<{ src: string; config: ImageConfig }>
  ): Promise<Array<{ src: string; optimized: string; stats: ImageStats }>> {
    try {
      const response = await fetch(`${this.baseUrl}/batch-optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images })
      });

      if (!response.ok) {
        throw new Error('Batch optimization failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Batch optimization failed:', error);
      return [];
    }
  }

  // Generate image variants
  generateImageVariants(
    src: string,
    variants: Array<{ name: string; config: ImageConfig }>
  ): Record<string, string> {
    const result: Record<string, string> = {};
    
    variants.forEach(variant => {
      result[variant.name] = this.optimizeImageUrl(src, variant.config);
    });
    
    return result;
  }

  // Create image gallery
  createImageGallery(
    images: Array<{ src: string; alt: string; thumbnail?: string }>,
    config: ImageConfig = {}
  ): Array<ImageTransform> {
    return images.map(image => ({
      src: this.optimizeImageUrl(image.src, config),
      alt: image.alt,
      width: config.width || 800,
      height: config.height || 600,
      loading: 'lazy',
      className: 'gallery-image'
    }));
  }

  // Create product image set
  createProductImageSet(
    productImages: Array<{ src: string; alt: string; type: 'main' | 'thumbnail' | 'zoom' }>
  ): {
    main: ImageTransform;
    thumbnails: ImageTransform[];
    zoom: ImageTransform[];
  } {
    const main = productImages.find(img => img.type === 'main');
    const thumbnails = productImages.filter(img => img.type === 'thumbnail');
    const zoom = productImages.filter(img => img.type === 'zoom');

    return {
      main: main ? this.createOptimizedImage(main.src, main.alt, { width: 800, height: 800 }) : {} as ImageTransform,
      thumbnails: thumbnails.map(img => this.createOptimizedImage(img.src, img.alt, { width: 150, height: 150 })),
      zoom: zoom.map(img => this.createOptimizedImage(img.src, img.alt, { width: 1200, height: 1200 }))
    };
  }

  // Lazy load images
  setupLazyLoading(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Preload critical images
  preloadCriticalImages(urls: string[]): void {
    if (typeof window === 'undefined') return;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Get CDN configuration
  getCDNConfig(): CDNConfig {
    return this.cdnConfig;
  }

  // Update CDN configuration
  updateCDNConfig(updates: Partial<CDNConfig>): void {
    this.cdnConfig = { ...this.cdnConfig, ...updates };
  }

  // Test CDN connection
  async testCDNConnection(): Promise<{ success: boolean; latency?: number; error?: string }> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/health`);
      const latency = Date.now() - startTime;
      
      return {
        success: response.ok,
        latency
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CDN connection failed'
      };
    }
  }

  // Get optimization recommendations
  getOptimizationRecommendations(images: Array<{ src: string; size: number; format: string }>): Array<{ src: string; recommendation: string; potentialSavings: number }> {
    return images.map(image => {
      const recommendations: string[] = [];
      let potentialSavings = 0;

      // Check if image is too large
      if (image.size > 500000) { // 500KB
        recommendations.push('Consider reducing image size');
        potentialSavings += image.size * 0.3;
      }

      // Check if format can be optimized
      if (image.format === 'png' && image.size > 100000) {
        recommendations.push('Convert PNG to WebP for better compression');
        potentialSavings += image.size * 0.4;
      }

      // Check if image needs resizing
      if (image.size > 200000) {
        recommendations.push('Consider responsive image sizing');
        potentialSavings += image.size * 0.2;
      }

      return {
        src: image.src,
        recommendation: recommendations.join(', '),
        potentialSavings
      };
    });
  }
}

export const imageOptimizationService = new ImageOptimizationService();
