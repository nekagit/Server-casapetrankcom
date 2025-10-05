// Robots.txt Generator
export async function GET() {
  const baseUrl = 'https://casa-petrada.de';
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order-tracking/
Disallow: /search?*

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Specific rules for different bots
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order-tracking/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order-tracking/

User-agent: facebookexternalhit
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order-tracking/

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: BLEXBot
Disallow: /`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
