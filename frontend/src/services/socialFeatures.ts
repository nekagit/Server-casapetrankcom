// Social Features Service - Social sharing and social login
export interface SocialShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface SocialLoginProvider {
  name: string;
  id: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface SocialPost {
  id: number;
  type: 'product' | 'blog' | 'general';
  content: string;
  image?: string;
  url?: string;
  hashtags: string[];
  likes: number;
  shares: number;
  comments: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
}

export interface SocialAnalytics {
  totalShares: number;
  sharesByPlatform: Record<string, number>;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  topSharedProducts: Array<{
    productId: number;
    productName: string;
    shareCount: number;
  }>;
  socialTraffic: Array<{
    platform: string;
    visitors: number;
    conversions: number;
  }>;
}

class SocialFeaturesService {
  private baseUrl: string;
  private shareAnalytics: Array<{
    platform: string;
    url: string;
    timestamp: string;
  }> = [];

  constructor(baseUrl: string = '/api/social') {
    this.baseUrl = baseUrl;
  }

  // Share to social media
  async shareToSocial(platform: string, data: SocialShareData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share');
      }

      // Track share analytics
      this.trackShare(platform, data.url);

      return await response.json();
    } catch (error) {
      console.warn('API not available, using client-side sharing');
      return this.clientSideShare(platform, data);
    }
  }

  // Client-side social sharing
  private clientSideShare(platform: string, data: SocialShareData): { success: boolean; message: string } {
    const encodedUrl = encodeURIComponent(data.url);
    const encodedTitle = encodeURIComponent(data.title);
    const encodedDescription = encodeURIComponent(data.description);
    const encodedImage = data.image ? encodeURIComponent(data.image) : '';
    const encodedHashtags = data.hashtags ? encodeURIComponent(data.hashtags.join(',')) : '';

    let shareUrl = '';

    switch (platform.toLowerCase()) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, show instructions
        this.showInstagramInstructions(data);
        return { success: true, message: 'Instagram sharing instructions shown' };
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedDescription}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`;
        break;
      default:
        return { success: false, message: 'Unsupported platform' };
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      this.trackShare(platform, data.url);
      return { success: true, message: 'Share window opened' };
    }

    return { success: false, message: 'Failed to open share window' };
  }

  // Show Instagram sharing instructions
  private showInstagramInstructions(data: SocialShareData): void {
    const instructions = `
      Um diesen Inhalt auf Instagram zu teilen:
      1. Kopiere den Link: ${data.url}
      2. Öffne Instagram
      3. Erstelle einen neuen Post
      4. Füge den Link in deine Story oder deinen Post ein
    `;
    
    alert(instructions);
  }

  // Get social login providers
  async getSocialLoginProviders(): Promise<SocialLoginProvider[]> {
    try {
      const response = await fetch(`${this.baseUrl}/login-providers`);
      
      if (!response.ok) {
        throw new Error('Failed to get social login providers');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock providers');
      return this.getMockSocialLoginProviders();
    }
  }

  // Social login
  async socialLogin(provider: string, token: string): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          token
        }),
      });

      if (!response.ok) {
        throw new Error('Social login failed');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Social login successful (mock)',
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'Name',
          provider: provider
        }
      };
    }
  }

  // Get social posts
  async getSocialPosts(params?: {
    page?: number;
    limit?: number;
    type?: string;
    hashtag?: string;
  }): Promise<{ posts: SocialPost[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/posts?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to get social posts');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockSocialPosts(params);
    }
  }

  // Create social post
  async createSocialPost(postData: {
    type: 'product' | 'blog' | 'general';
    content: string;
    image?: string;
    url?: string;
    hashtags?: string[];
  }): Promise<{ success: boolean; post?: SocialPost; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create social post');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Social post created successfully (mock)',
        post: this.getMockSocialPost(1)
      };
    }
  }

  // Get social analytics
  async getSocialAnalytics(): Promise<SocialAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics`);
      
      if (!response.ok) {
        throw new Error('Failed to get social analytics');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockSocialAnalytics();
    }
  }

  // Track share analytics
  private trackShare(platform: string, url: string): void {
    this.shareAnalytics.push({
      platform,
      url,
      timestamp: new Date().toISOString()
    });

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('share-analytics', JSON.stringify(this.shareAnalytics));
    }
  }

  // Get share analytics
  getShareAnalytics(): Array<{ platform: string; url: string; timestamp: string }> {
    return this.shareAnalytics;
  }

  // Generate social sharing buttons HTML
  generateSocialButtons(data: SocialShareData, platforms: string[] = ['facebook', 'twitter', 'pinterest', 'whatsapp']): string {
    return platforms.map(platform => {
      const provider = this.getSocialLoginProviders().then(providers => 
        providers.find(p => p.id === platform)
      );
      
      return `
        <button 
          class="social-share-btn" 
          data-platform="${platform}"
          data-title="${data.title}"
          data-description="${data.description}"
          data-url="${data.url}"
          data-image="${data.image || ''}"
          data-hashtags="${data.hashtags?.join(',') || ''}"
          title="Auf ${platform} teilen"
        >
          <i class="fab fa-${platform}"></i>
          <span>${platform}</span>
        </button>
      `;
    }).join('');
  }

  // Mock data methods
  private getMockSocialLoginProviders(): SocialLoginProvider[] {
    return [
      {
        name: 'Google',
        id: 'google',
        icon: 'fab fa-google',
        color: '#4285F4',
        enabled: true
      },
      {
        name: 'Facebook',
        id: 'facebook',
        icon: 'fab fa-facebook',
        color: '#1877F2',
        enabled: true
      },
      {
        name: 'Apple',
        id: 'apple',
        icon: 'fab fa-apple',
        color: '#000000',
        enabled: true
      },
      {
        name: 'GitHub',
        id: 'github',
        icon: 'fab fa-github',
        color: '#333333',
        enabled: false
      }
    ];
  }

  private getMockSocialPosts(params?: any): { posts: SocialPost[]; total: number; page: number; totalPages: number } {
    const mockPosts: SocialPost[] = [
      {
        id: 1,
        type: 'product',
        content: 'Neues handgefertigtes Tibet Armband in unserem Shop! ✨ #boho #handmade #casaPetrada',
        image: '/images/products/tibet-armband.jpg',
        url: '/product/tibet-armband',
        hashtags: ['boho', 'handmade', 'casaPetrada'],
        likes: 45,
        shares: 12,
        comments: 8,
        createdAt: '2024-01-20T10:00:00Z',
        author: {
          name: 'Casa Petrada',
          avatar: '/images/avatars/casa-petrada.jpg',
          verified: true
        }
      },
      {
        id: 2,
        type: 'blog',
        content: 'Boho Styling Trends 2024 - Entdecke die neuesten Trends! 🌿 #boho #trends #styling',
        image: '/images/blog/boho-trends-2024.jpg',
        url: '/blog/boho-styling-trends-2024',
        hashtags: ['boho', 'trends', 'styling'],
        likes: 38,
        shares: 15,
        comments: 12,
        createdAt: '2024-01-19T14:30:00Z',
        author: {
          name: 'Casa Petrada',
          avatar: '/images/avatars/casa-petrada.jpg',
          verified: true
        }
      }
    ];

    return {
      posts: mockPosts,
      total: mockPosts.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockSocialPost(id: number): SocialPost {
    const posts = this.getMockSocialPosts().posts;
    return posts.find(post => post.id === id) || posts[0];
  }

  private getMockSocialAnalytics(): SocialAnalytics {
    return {
      totalShares: 1250,
      sharesByPlatform: {
        facebook: 450,
        twitter: 320,
        pinterest: 280,
        instagram: 200
      },
      totalLikes: 3200,
      totalComments: 450,
      engagementRate: 4.2,
      topSharedProducts: [
        {
          productId: 1,
          productName: 'Tibet Armband',
          shareCount: 125
        },
        {
          productId: 2,
          productName: 'Boho Wickelarmband',
          shareCount: 98
        },
        {
          productId: 3,
          productName: 'Naturstein Kette',
          shareCount: 87
        }
      ],
      socialTraffic: [
        {
          platform: 'Facebook',
          visitors: 1250,
          conversions: 45
        },
        {
          platform: 'Instagram',
          visitors: 980,
          conversions: 38
        },
        {
          platform: 'Pinterest',
          visitors: 750,
          conversions: 28
        },
        {
          platform: 'Twitter',
          visitors: 420,
          conversions: 15
        }
      ]
    };
  }
}

export const socialFeaturesService = new SocialFeaturesService();
