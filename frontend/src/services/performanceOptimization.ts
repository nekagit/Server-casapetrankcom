// Performance Optimization Service - Production performance optimization
export interface PerformanceConfig {
  caching: {
    enabled: boolean;
    strategy: 'memory' | 'redis' | 'database';
    ttl: number; // seconds
    maxSize: number; // MB
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'deflate';
    level: number; // 1-9
    minSize: number; // bytes
  };
  images: {
    optimization: boolean;
    formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
    quality: number; // 1-100
    lazyLoading: boolean;
    responsive: boolean;
  };
  code: {
    minification: boolean;
    treeShaking: boolean;
    codeSplitting: boolean;
    bundleAnalysis: boolean;
  };
  database: {
    connectionPooling: boolean;
    queryOptimization: boolean;
    indexing: boolean;
    caching: boolean;
  };
  cdn: {
    enabled: boolean;
    provider: 'cloudflare' | 'aws-cloudfront' | 'fastly' | 'keycdn';
    edgeCaching: boolean;
    compression: boolean;
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: boolean;
    reporting: boolean;
  };
}

export interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  resourceTiming: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
  networkTiming: {
    dns: number;
    tcp: number;
    ssl: number;
    ttfb: number;
    download: number;
    total: number;
  };
  userTiming: {
    navigation: number;
    rendering: number;
    scripting: number;
    layout: number;
    paint: number;
  };
  memory: {
    used: number;
    total: number;
    limit: number;
    pressure: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface OptimizationReport {
  score: number; // 0-100
  recommendations: Array<{
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  metrics: PerformanceMetrics;
  improvements: Array<{
    metric: string;
    before: number;
    after: number;
    improvement: number;
  }>;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
    modules: number;
  }>;
  duplicates: Array<{
    module: string;
    count: number;
    size: number;
  }>;
  recommendations: string[];
}

class PerformanceOptimizationService {
  private config: PerformanceConfig;
  private baseUrl: string;
  private apiKey: string;
  private metrics: PerformanceMetrics | null = null;

  constructor() {
    this.config = {
      caching: {
        enabled: true,
        strategy: 'memory',
        ttl: 3600, // 1 hour
        maxSize: 100 // 100MB
      },
      compression: {
        enabled: true,
        algorithm: 'gzip',
        level: 6,
        minSize: 1024 // 1KB
      },
      images: {
        optimization: true,
        formats: ['webp', 'avif', 'jpeg'],
        quality: 85,
        lazyLoading: true,
        responsive: true
      },
      code: {
        minification: true,
        treeShaking: true,
        codeSplitting: true,
        bundleAnalysis: true
      },
      database: {
        connectionPooling: true,
        queryOptimization: true,
        indexing: true,
        caching: true
      },
      cdn: {
        enabled: true,
        provider: 'cloudflare',
        edgeCaching: true,
        compression: true
      },
      monitoring: {
        enabled: true,
        metrics: ['lcp', 'fid', 'cls', 'fcp', 'ttfb'],
        alerts: true,
        reporting: true
      }
    };
    
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.PERFORMANCE_API_KEY || '';
    
    this.initializePerformanceMonitoring();
  }

  // Initialize performance monitoring
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor resource timing
    this.monitorResourceTiming();
    
    // Monitor user timing
    this.monitorUserTiming();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network performance
    this.monitorNetworkPerformance();
  }

  // Monitor Core Web Vitals
  private monitorCoreWebVitals(): void {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.updateMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.updateMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Monitor resource timing
  private monitorResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.updateMetric('domContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
            this.updateMetric('loadComplete', entry.loadEventEnd - entry.loadEventStart);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  // Monitor user timing
  private monitorUserTiming(): void {
    if ('PerformanceObserver' in window) {
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.updateMetric(entry.name, entry.duration);
          }
        });
      });
      userTimingObserver.observe({ entryTypes: ['measure'] });
    }
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetric('memory', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        pressure: this.calculateMemoryPressure(memory.usedJSHeapSize, memory.jsHeapSizeLimit)
      });
    }
  }

  // Monitor network performance
  private monitorNetworkPerformance(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateMetric('network', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });
    }
  }

  // Update metric
  private updateMetric(metric: string, value: any): void {
    if (!this.metrics) {
      this.metrics = this.initializeMetrics();
    }

    // Update specific metric based on type
    if (metric === 'lcp') this.metrics.coreWebVitals.lcp = value;
    else if (metric === 'fid') this.metrics.coreWebVitals.fid = value;
    else if (metric === 'cls') this.metrics.coreWebVitals.cls = value;
    else if (metric === 'fcp') this.metrics.coreWebVitals.fcp = value;
    else if (metric === 'ttfb') this.metrics.coreWebVitals.ttfb = value;
    else if (metric === 'memory') this.metrics.memory = value;
    else if (metric === 'network') this.metrics.networkTiming = value;

    // Send to backend if monitoring is enabled
    if (this.config.monitoring.enabled) {
      this.sendMetricsToBackend();
    }
  }

  // Initialize metrics
  private initializeMetrics(): PerformanceMetrics {
    return {
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      },
      resourceTiming: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0
      },
      networkTiming: {
        dns: 0,
        tcp: 0,
        ssl: 0,
        ttfb: 0,
        download: 0,
        total: 0
      },
      userTiming: {
        navigation: 0,
        rendering: 0,
        scripting: 0,
        layout: 0,
        paint: 0
      },
      memory: {
        used: 0,
        total: 0,
        limit: 0,
        pressure: 'low'
      }
    };
  }

  // Calculate memory pressure
  private calculateMemoryPressure(used: number, limit: number): 'low' | 'medium' | 'high' | 'critical' {
    const percentage = (used / limit) * 100;
    if (percentage < 50) return 'low';
    if (percentage < 75) return 'medium';
    if (percentage < 90) return 'high';
    return 'critical';
  }

  // Send metrics to backend
  private sendMetricsToBackend(): void {
    if (!this.metrics) return;

    fetch(`${this.baseUrl}/api/v1/performance/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        metrics: this.metrics,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(error => {
      console.error('Failed to send performance metrics:', error);
    });
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  // Run performance audit
  async runPerformanceAudit(): Promise<OptimizationReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/performance/audit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: window.location.href,
          config: this.config
        })
      });

      if (!response.ok) {
        throw new Error('Performance audit failed');
      }

      return await response.json();
    } catch (error) {
      return {
        score: 0,
        recommendations: [],
        metrics: this.metrics || this.initializeMetrics(),
        improvements: []
      };
    }
  }

  // Optimize images
  async optimizeImages(images: Array<{ src: string; alt: string }>): Promise<Array<{ src: string; optimized: string; savings: number }>> {
    if (!this.config.images.optimization) return images.map(img => ({ src: img.src, optimized: img.src, savings: 0 }));

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/performance/optimize-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images,
          config: this.config.images
        })
      });

      if (!response.ok) {
        throw new Error('Image optimization failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Image optimization failed:', error);
      return images.map(img => ({ src: img.src, optimized: img.src, savings: 0 }));
    }
  }

  // Analyze bundle
  async analyzeBundle(): Promise<BundleAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/performance/bundle-analysis`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Bundle analysis failed');
      }

      return await response.json();
    } catch (error) {
      return {
        totalSize: 0,
        gzippedSize: 0,
        chunks: [],
        duplicates: [],
        recommendations: []
      };
    }
  }

  // Enable caching
  enableCaching(): void {
    if (typeof window === 'undefined') return;

    // Service Worker caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Browser caching headers
    this.setCacheHeaders();
  }

  // Set cache headers
  private setCacheHeaders(): void {
    // This would typically be done server-side
    // For client-side, we can set cache control on resources
    const resources = document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]');
    resources.forEach((resource: any) => {
      if (resource.href || resource.src) {
        resource.setAttribute('data-cache', 'true');
      }
    });
  }

  // Enable compression
  enableCompression(): void {
    // This would typically be done server-side
    // For client-side, we can optimize data before sending
    console.log('Compression enabled');
  }

  // Enable lazy loading
  enableLazyLoading(): void {
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

  // Preload critical resources
  preloadCriticalResources(resources: Array<{ href: string; as: string; type?: string }>): void {
    if (typeof document === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }

  // Optimize database queries
  async optimizeDatabaseQueries(): Promise<{ success: boolean; message: string; optimizations: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/performance/optimize-database`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Database optimization failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Database optimization completed',
        optimizations: data.optimizations
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        optimizations: 0
      };
    }
  }

  // Setup CDN
  async setupCDN(): Promise<{ success: boolean; message: string; cdnUrl?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/performance/setup-cdn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.config.cdn)
      });

      if (!response.ok) {
        throw new Error('CDN setup failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'CDN setup completed successfully',
        cdnUrl: data.cdnUrl
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get performance configuration
  getPerformanceConfig(): PerformanceConfig {
    return this.config;
  }

  // Update performance configuration
  updatePerformanceConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Generate performance report
  async generatePerformanceReport(): Promise<{
    score: number;
    recommendations: string[];
    metrics: PerformanceMetrics;
    improvements: Array<{ metric: string; improvement: number }>;
  }> {
    const metrics = this.getPerformanceMetrics();
    const audit = await this.runPerformanceAudit();
    
    return {
      score: audit.score,
      recommendations: audit.recommendations.map(r => r.title),
      metrics: metrics || this.initializeMetrics(),
      improvements: audit.improvements
    };
  }

  // Test performance optimizations
  async testPerformanceOptimizations(): Promise<{
    success: boolean;
    results: Record<string, boolean>;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/performance/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Performance test failed');
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        results: {},
        recommendations: ['Enable all performance optimizations', 'Update performance configuration']
      };
    }
  }
}

export const performanceOptimizationService = new PerformanceOptimizationService();
