// SEO Optimization Service - Comprehensive SEO implementation
export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultImage: string;
  twitterHandle: string;
  facebookAppId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  structuredData: {
    organization: boolean;
    website: boolean;
    breadcrumb: boolean;
    product: boolean;
    review: boolean;
    faq: boolean;
    localBusiness: boolean;
  };
  sitemap: {
    enabled: boolean;
    priority: number;
    changefreq: string;
  };
  robots: {
    enabled: boolean;
    allow: string[];
    disallow: string[];
    sitemap: string;
  };
  metaTags: {
    viewport: string;
    robots: string;
    author: string;
    generator: string;
    themeColor: string;
  };
}

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{
    loc: string;
    caption?: string;
    title?: string;
  }>;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

class SEOOptimizationService {
  private config: SEOConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      siteName: 'Casa Petrada',
      siteUrl: 'https://casa-petrada.de',
      defaultLanguage: 'de',
      supportedLanguages: ['de', 'en'],
      defaultImage: '/images/logo.png',
      twitterHandle: '@casapetrada',
      facebookAppId: process.env.FB_APP_ID || '',
      googleAnalyticsId: process.env.GA_MEASUREMENT_ID || '',
      googleTagManagerId: process.env.GTM_CONTAINER_ID || '',
      structuredData: {
        organization: true,
        website: true,
        breadcrumb: true,
        product: true,
        review: true,
        faq: true,
        localBusiness: true
      },
      sitemap: {
        enabled: true,
        priority: 0.8,
        changefreq: 'weekly'
      },
      robots: {
        enabled: true,
        allow: ['/'],
        disallow: ['/admin/', '/api/', '/private/'],
        sitemap: '/sitemap.xml'
      },
      metaTags: {
        viewport: 'width=device-width, initial-scale=1.0',
        robots: 'index, follow',
        author: 'Casa Petrada',
        generator: 'Astro',
        themeColor: '#c4a484'
      }
    };
    
    this.baseUrl = this.config.siteUrl;
  }

  // Generate page SEO data
  generatePageSEO(page: {
    title: string;
    description: string;
    keywords?: string[];
    path: string;
    image?: string;
    type?: string;
    structuredData?: any;
    noindex?: boolean;
    nofollow?: boolean;
  }): PageSEO {
    const canonicalUrl = `${this.baseUrl}${page.path}`;
    const ogImage = page.image || this.config.defaultImage;
    
    return {
      title: `${page.title} | ${this.config.siteName}`,
      description: page.description,
      keywords: page.keywords || [],
      canonicalUrl,
      ogTitle: page.title,
      ogDescription: page.description,
      ogImage: ogImage.startsWith('http') ? ogImage : `${this.baseUrl}${ogImage}`,
      ogType: page.type || 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: page.title,
      twitterDescription: page.description,
      twitterImage: ogImage.startsWith('http') ? ogImage : `${this.baseUrl}${ogImage}`,
      structuredData: page.structuredData,
      noindex: page.noindex,
      nofollow: page.nofollow
    };
  }

  // Generate product SEO
  generateProductSEO(product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    images: string[];
    category: string;
    brand: string;
    availability: string;
    condition: string;
    rating: number;
    reviewCount: number;
    sku: string;
    slug: string;
  }): PageSEO {
    const path = `/products/${product.slug}`;
    const canonicalUrl = `${this.baseUrl}${path}`;
    
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      brand: {
        '@type': 'Brand',
        name: product.brand
      },
      category: product.category,
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`,
        itemCondition: `https://schema.org/${product.condition}`,
        url: canonicalUrl
      }
    };

    if (product.rating > 0) {
      structuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      };
    }

    return this.generatePageSEO({
      title: product.name,
      description: product.description,
      keywords: [product.name, product.category, product.brand, 'handmade', 'boho', 'schmuck'],
      path,
      image: product.image,
      type: 'product',
      structuredData
    });
  }

  // Generate category SEO
  generateCategorySEO(category: {
    name: string;
    description: string;
    path: string;
    image?: string;
    productCount: number;
  }): PageSEO {
    return this.generatePageSEO({
      title: category.name,
      description: category.description,
      keywords: [category.name, 'handmade', 'boho', 'schmuck', 'jewelry'],
      path: category.path,
      image: category.image,
      type: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description,
        url: `${this.baseUrl}${category.path}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: category.productCount
        }
      }
    });
  }

  // Generate blog post SEO
  generateBlogPostSEO(post: {
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: string;
    modifiedAt: string;
    image: string;
    tags: string[];
    slug: string;
  }): PageSEO {
    const path = `/blog/${post.slug}`;
    const publishedDate = new Date(post.publishedAt).toISOString();
    const modifiedDate = new Date(post.modifiedAt).toISOString();
    
    return this.generatePageSEO({
      title: post.title,
      description: post.excerpt,
      keywords: [...post.tags, 'blog', 'handmade', 'boho', 'schmuck'],
      path,
      image: post.image,
      type: 'article',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        author: {
          '@type': 'Person',
          name: post.author
        },
        publisher: {
          '@type': 'Organization',
          name: this.config.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${this.baseUrl}/images/logo.png`
          }
        },
        datePublished: publishedDate,
        dateModified: modifiedDate,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${this.baseUrl}${path}`
        }
      }
    });
  }

  // Generate organization structured data
  generateOrganizationStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.config.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description: 'Handmade Boho Schmuck & Mode - Einzigartige handgefertigte Schmuckstücke',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Musterstraße 123',
        addressLocality: 'Musterstadt',
        postalCode: '12345',
        addressCountry: 'DE'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+49-123-456789',
        contactType: 'customer service',
        availableLanguage: ['German', 'English']
      },
      sameAs: [
        'https://www.instagram.com/casapetrada',
        'https://www.facebook.com/casapetrada',
        'https://www.pinterest.com/casapetrada'
      ]
    };
  }

  // Generate website structured data
  generateWebsiteStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.siteName,
      url: this.baseUrl,
      description: 'Handmade Boho Schmuck & Mode - Einzigartige handgefertigte Schmuckstücke',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  // Generate breadcrumb structured data
  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };
  }

  // Generate FAQ structured data
  generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  // Generate sitemap
  generateSitemap(entries: SitemapEntry[]): string {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    entries.forEach(entry => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${entry.url}</loc>\n`;
      sitemap += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${entry.priority}</priority>\n`;
      
      if (entry.images) {
        entry.images.forEach(image => {
          sitemap += '    <image:image>\n';
          sitemap += `      <image:loc>${image.loc}</image:loc>\n`;
          if (image.caption) {
            sitemap += `      <image:caption>${image.caption}</image:caption>\n`;
          }
          if (image.title) {
            sitemap += `      <image:title>${image.title}</image:title>\n`;
          }
          sitemap += '    </image:image>\n';
        });
      }
      
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    return sitemap;
  }

  // Generate robots.txt
  generateRobotsTxt(): string {
    let robots = 'User-agent: *\n';
    
    this.config.robots.allow.forEach(path => {
      robots += `Allow: ${path}\n`;
    });
    
    this.config.robots.disallow.forEach(path => {
      robots += `Disallow: ${path}\n`;
    });
    
    robots += `\nSitemap: ${this.baseUrl}${this.config.robots.sitemap}\n`;
    
    return robots;
  }

  // Generate meta tags HTML
  generateMetaTags(seo: PageSEO): string {
    let metaTags = '';
    
    // Basic meta tags
    metaTags += `<title>${seo.title}</title>\n`;
    metaTags += `<meta name="description" content="${seo.description}">\n`;
    metaTags += `<meta name="keywords" content="${seo.keywords.join(', ')}">\n`;
    metaTags += `<link rel="canonical" href="${seo.canonicalUrl}">\n`;
    
    // Open Graph tags
    metaTags += `<meta property="og:title" content="${seo.ogTitle || seo.title}">\n`;
    metaTags += `<meta property="og:description" content="${seo.ogDescription || seo.description}">\n`;
    metaTags += `<meta property="og:image" content="${seo.ogImage}">\n`;
    metaTags += `<meta property="og:url" content="${seo.canonicalUrl}">\n`;
    metaTags += `<meta property="og:type" content="${seo.ogType || 'website'}">\n`;
    metaTags += `<meta property="og:site_name" content="${this.config.siteName}">\n`;
    
    // Twitter Card tags
    metaTags += `<meta name="twitter:card" content="${seo.twitterCard || 'summary_large_image'}">\n`;
    metaTags += `<meta name="twitter:title" content="${seo.twitterTitle || seo.title}">\n`;
    metaTags += `<meta name="twitter:description" content="${seo.twitterDescription || seo.description}">\n`;
    metaTags += `<meta name="twitter:image" content="${seo.twitterImage || seo.ogImage}">\n`;
    metaTags += `<meta name="twitter:site" content="${this.config.twitterHandle}">\n`;
    
    // Additional meta tags
    metaTags += `<meta name="viewport" content="${this.config.metaTags.viewport}">\n`;
    metaTags += `<meta name="robots" content="${seo.noindex ? 'noindex' : 'index'}, ${seo.nofollow ? 'nofollow' : 'follow'}">\n`;
    metaTags += `<meta name="author" content="${this.config.metaTags.author}">\n`;
    metaTags += `<meta name="generator" content="${this.config.metaTags.generator}">\n`;
    metaTags += `<meta name="theme-color" content="${this.config.metaTags.themeColor}">\n`;
    
    // Language tags
    metaTags += `<meta http-equiv="content-language" content="${this.config.defaultLanguage}">\n`;
    
    return metaTags;
  }

  // Generate structured data JSON-LD
  generateStructuredDataJSONLD(structuredData: any): string {
    return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
  }

  // Get SEO configuration
  getSEOConfig(): SEOConfig {
    return this.config;
  }

  // Update SEO configuration
  updateSEOConfig(updates: Partial<SEOConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Generate SEO report
  async generateSEOReport(url: string): Promise<{
    score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion: string;
    }>;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/seo/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('SEO analysis failed');
      }

      return await response.json();
    } catch (error) {
      return {
        score: 0,
        issues: [],
        recommendations: ['Enable SEO optimization', 'Add meta tags', 'Implement structured data']
      };
    }
  }

  // Track SEO performance
  async trackSEOPerformance(metrics: {
    page: string;
    loadTime: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    seoScore: number;
  }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/seo/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...metrics,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track SEO performance:', error);
    }
  }
}

export const seoOptimizationService = new SEOOptimizationService();
