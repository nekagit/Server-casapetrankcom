// SEO Service - Comprehensive SEO optimization and structured data
export interface SEOData {
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
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface ProductSEOData extends SEOData {
  productName: string;
  productPrice: number;
  productCurrency: string;
  productAvailability: string;
  productCondition: string;
  productBrand: string;
  productCategory: string;
  productImages: string[];
  productRating?: number;
  productReviewCount?: number;
  productSKU?: string;
  productWeight?: number;
  productDimensions?: string;
}

export interface ArticleSEOData extends SEOData {
  articleTitle: string;
  articleAuthor: string;
  articlePublishedTime: string;
  articleModifiedTime: string;
  articleSection: string;
  articleTags: string[];
  articleImage?: string;
  articleWordCount?: number;
  articleReadingTime?: number;
}

class SEOService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://casa-petrada.de') {
    this.baseUrl = baseUrl;
  }

  // Generate SEO data for homepage
  generateHomepageSEO(): SEOData {
    return {
      title: 'Casa Petrada - Handmade Boho Schmuck & Mode | Einzigartige Handwerkskunst',
      description: 'Entdecke einzigartige handgefertigte Boho Schmuckstücke und Mode bei Casa Petrada. Jedes Stück wird mit Liebe und Sorgfalt von Hand gefertigt. Kostenloser Versand ab 39€.',
      keywords: [
        'handmade schmuck',
        'boho schmuck',
        'handgefertigter schmuck',
        'boho mode',
        'handmade jewelry',
        'artisan jewelry',
        'unique jewelry',
        'handcrafted accessories',
        'casa petrada',
        'boho style',
        'natural jewelry',
        'sustainable fashion'
      ],
      canonicalUrl: this.baseUrl,
      ogTitle: 'Casa Petrada - Handmade Boho Schmuck & Mode',
      ogDescription: 'Entdecke einzigartige handgefertigte Boho Schmuckstücke und Mode. Jedes Stück wird mit Liebe und Sorgfalt von Hand gefertigt.',
      ogImage: `${this.baseUrl}/images/og-homepage.jpg`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Casa Petrada - Handmade Boho Schmuck & Mode',
      twitterDescription: 'Entdecke einzigartige handgefertigte Boho Schmuckstücke und Mode.',
      twitterImage: `${this.baseUrl}/images/twitter-homepage.jpg`,
      structuredData: this.generateHomepageStructuredData(),
      robots: 'index, follow',
      author: 'Casa Petrada'
    };
  }

  // Generate SEO data for product pages
  generateProductSEO(product: any): ProductSEOData {
    const productUrl = `${this.baseUrl}/product/${product.slug}`;
    const productImage = product.images?.[0] || `${this.baseUrl}/images/products/${product.slug}.jpg`;
    
    return {
      title: `${product.name} - Casa Petrada | Handmade Boho Schmuck`,
      description: `${product.description} ✓ Handgefertigt ✓ Einzigartig ✓ Nachhaltig ✓ Kostenloser Versand ab 39€`,
      keywords: [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        'handmade schmuck',
        'boho schmuck',
        'handgefertigt',
        'einzigartig',
        'nachhaltig',
        'casa petrada',
        ...(product.materials || []).map((m: string) => m.toLowerCase()),
        ...(product.tags || []).map((t: string) => t.toLowerCase())
      ],
      canonicalUrl: productUrl,
      ogTitle: `${product.name} - Casa Petrada`,
      ogDescription: product.description,
      ogImage: productImage,
      ogType: 'product',
      twitterCard: 'summary_large_image',
      twitterTitle: `${product.name} - Casa Petrada`,
      twitterDescription: product.description,
      twitterImage: productImage,
      structuredData: this.generateProductStructuredData(product),
      robots: 'index, follow',
      productName: product.name,
      productPrice: product.price,
      productCurrency: 'EUR',
      productAvailability: product.inStock ? 'InStock' : 'OutOfStock',
      productCondition: 'NewCondition',
      productBrand: 'Casa Petrada',
      productCategory: product.category,
      productImages: product.images || [productImage],
      productRating: product.rating,
      productReviewCount: product.reviewCount,
      productSKU: product.sku,
      productWeight: product.weight,
      productDimensions: product.dimensions
    };
  }

  // Generate SEO data for category pages
  generateCategorySEO(category: any): SEOData {
    const categoryUrl = `${this.baseUrl}/${category.slug}`;
    
    return {
      title: `${category.name} - Casa Petrada | Handmade Boho ${category.name}`,
      description: `Entdecke unsere ${category.name} Kollektion. Einzigartige handgefertigte ${category.name} bei Casa Petrada. ✓ Handmade ✓ Boho Style ✓ Nachhaltig`,
      keywords: [
        category.name.toLowerCase(),
        'handmade schmuck',
        'boho schmuck',
        'handgefertigt',
        'casa petrada',
        `${category.name.toLowerCase()} schmuck`,
        'boho style',
        'nachhaltig'
      ],
      canonicalUrl: categoryUrl,
      ogTitle: `${category.name} - Casa Petrada`,
      ogDescription: `Entdecke unsere ${category.name} Kollektion. Einzigartige handgefertigte ${category.name} bei Casa Petrada.`,
      ogImage: `${this.baseUrl}/images/categories/${category.slug}.jpg`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      structuredData: this.generateCategoryStructuredData(category),
      robots: 'index, follow'
    };
  }

  // Generate SEO data for blog articles
  generateArticleSEO(article: any): ArticleSEOData {
    const articleUrl = `${this.baseUrl}/blog/${article.slug}`;
    
    return {
      title: `${article.title} - Casa Petrada Blog`,
      description: article.excerpt || article.content.substring(0, 160),
      keywords: [
        ...article.tags || [],
        'casa petrada blog',
        'boho lifestyle',
        'handmade schmuck',
        'nachhaltige mode',
        'boho style'
      ],
      canonicalUrl: articleUrl,
      ogTitle: article.title,
      ogDescription: article.excerpt,
      ogImage: article.featuredImage || `${this.baseUrl}/images/blog/${article.slug}.jpg`,
      ogType: 'article',
      twitterCard: 'summary_large_image',
      structuredData: this.generateArticleStructuredData(article),
      robots: 'index, follow',
      articleTitle: article.title,
      articleAuthor: article.author || 'Casa Petrada',
      articlePublishedTime: article.publishedAt,
      articleModifiedTime: article.updatedAt,
      articleSection: article.category || 'Lifestyle',
      articleTags: article.tags || [],
      articleImage: article.featuredImage,
      articleWordCount: article.wordCount,
      articleReadingTime: article.readingTime
    };
  }

  // Generate structured data for homepage
  private generateHomepageStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Casa Petrada',
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description: 'Handmade Boho Schmuck und Mode - Einzigartige handgefertigte Schmuckstücke',
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
      ],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  // Generate structured data for products
  private generateProductStructuredData(product: any): any {
    const productUrl = `${this.baseUrl}/product/${product.slug}`;
    const productImage = product.images?.[0] || `${this.baseUrl}/images/products/${product.slug}.jpg`;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images || [productImage],
      url: productUrl,
      brand: {
        '@type': 'Brand',
        name: 'Casa Petrada'
      },
      category: product.category,
      sku: product.sku,
      gtin: product.gtin,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'EUR',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Casa Petrada'
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'EUR'
          },
          shippingDestination: {
            '@type': 'Country',
            name: 'Germany'
          }
        }
      },
      aggregateRating: product.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      review: product.reviews?.map((review: any) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating
        },
        author: {
          '@type': 'Person',
          name: review.author
        },
        reviewBody: review.comment,
        datePublished: review.createdAt
      })) || []
    };
  }

  // Generate structured data for categories
  private generateCategoryStructuredData(category: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: `Entdecke unsere ${category.name} Kollektion bei Casa Petrada`,
      url: `${this.baseUrl}/${category.slug}`,
      mainEntity: {
        '@type': 'ItemList',
        name: `${category.name} Produkte`,
        description: `Alle ${category.name} Produkte bei Casa Petrada`
      }
    };
  }

  // Generate structured data for articles
  private generateArticleStructuredData(article: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: article.featuredImage,
      url: `${this.baseUrl}/blog/${article.slug}`,
      author: {
        '@type': 'Person',
        name: article.author || 'Casa Petrada'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Casa Petrada',
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/images/logo.png`
        }
      },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/blog/${article.slug}`
      },
      articleSection: article.category,
      keywords: article.tags?.join(', '),
      wordCount: article.wordCount,
      timeRequired: `PT${article.readingTime}M`
    };
  }

  // Generate breadcrumb structured data
  generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string; url: string}>): any {
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
  generateFAQStructuredData(faqs: Array<{question: string; answer: string}>): any {
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

  // Generate local business structured data
  generateLocalBusinessStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Casa Petrada',
      description: 'Handmade Boho Schmuck und Mode - Einzigartige handgefertigte Schmuckstücke',
      url: this.baseUrl,
      telephone: '+49-123-456789',
      email: 'info@casa-petrada.de',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Musterstraße 123',
        addressLocality: 'Musterstadt',
        postalCode: '12345',
        addressCountry: 'DE'
      },
      openingHours: 'Mo-Fr 09:00-18:00',
      priceRange: '€€',
      paymentAccepted: 'Cash, Credit Card, PayPal',
      currenciesAccepted: 'EUR'
    };
  }

  // Generate sitemap data
  generateSitemapData(pages: Array<{url: string; lastmod: string; changefreq: string; priority: number}>): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return sitemap;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_astro/

# Allow important pages
Allow: /
Allow: /products/
Allow: /blog/
Allow: /about/
Allow: /contact/`;
  }

  // Generate meta tags HTML
  generateMetaTags(seoData: SEOData): string {
    const tags = [
      `<title>${seoData.title}</title>`,
      `<meta name="description" content="${seoData.description}">`,
      `<meta name="keywords" content="${seoData.keywords.join(', ')}">`,
      `<link rel="canonical" href="${seoData.canonicalUrl}">`,
      `<meta name="robots" content="${seoData.robots || 'index, follow'}">`,
      `<meta name="author" content="${seoData.author || 'Casa Petrada'}">`,
      `<meta property="og:title" content="${seoData.ogTitle || seoData.title}">`,
      `<meta property="og:description" content="${seoData.ogDescription || seoData.description}">`,
      `<meta property="og:url" content="${seoData.canonicalUrl}">`,
      `<meta property="og:type" content="${seoData.ogType || 'website'}">`,
      `<meta property="og:image" content="${seoData.ogImage || `${this.baseUrl}/images/og-default.jpg`}">`,
      `<meta name="twitter:card" content="${seoData.twitterCard || 'summary_large_image'}">`,
      `<meta name="twitter:title" content="${seoData.twitterTitle || seoData.title}">`,
      `<meta name="twitter:description" content="${seoData.twitterDescription || seoData.description}">`,
      `<meta name="twitter:image" content="${seoData.twitterImage || seoData.ogImage || `${this.baseUrl}/images/twitter-default.jpg`}">`
    ];

    if (seoData.publishedTime) {
      tags.push(`<meta property="article:published_time" content="${seoData.publishedTime}">`);
    }
    if (seoData.modifiedTime) {
      tags.push(`<meta property="article:modified_time" content="${seoData.modifiedTime}">`);
    }
    if (seoData.section) {
      tags.push(`<meta property="article:section" content="${seoData.section}">`);
    }
    if (seoData.tags) {
      tags.push(`<meta property="article:tag" content="${seoData.tags.join(', ')}">`);
    }

    return tags.join('\n');
  }

  // Generate structured data JSON-LD
  generateStructuredDataJSON(structuredData: any): string {
    return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
  }
}

export const seoService = new SEOService();
