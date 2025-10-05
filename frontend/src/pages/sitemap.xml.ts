// Sitemap Generator
export async function GET() {
  const baseUrl = 'https://casa-petrada.de';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/armbaender',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: '/ketten',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: '/fashion',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: '/sale',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: '/blog',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: '/about',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/contact',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/search',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      url: '/cart',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      url: '/checkout',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      url: '/account',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      url: '/wishlist',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      url: '/order-tracking',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      url: '/auth/login',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4'
    },
    {
      url: '/auth/register',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4'
    },
    {
      url: '/impressum',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: '/datenschutz',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: '/agb',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];

  // Blog posts (mock data - in real app this would come from API)
  const blogPosts = [
    {
      url: '/blog/boho-styling-trends-2024',
      lastmod: '2024-01-15T10:00:00Z',
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/blog/handgefertigter-schmuck-kunst-handwerk',
      lastmod: '2024-01-10T10:00:00Z',
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/blog/schmuck-pflege-tipps',
      lastmod: '2024-01-05T10:00:00Z',
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/blog/boho-styling-jeden-anlass',
      lastmod: '2024-01-01T10:00:00Z',
      changefreq: 'monthly',
      priority: '0.6'
    }
  ];

  // Product pages (mock data - in real app this would come from API)
  const productPages = [
    {
      url: '/product/tibet-armband',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: '/product/boho-wickelarmband',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: '/product/naturstein-kette',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    }
  ];

  // Combine all pages
  const allPages = [...staticPages, ...blogPosts, ...productPages];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
