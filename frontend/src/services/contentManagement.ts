// Content Management Service - Blog and page management
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
  wordCount: number;
  readingTime: number;
  views: number;
  likes: number;
  comments: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  featured: boolean;
  allowComments: boolean;
  metaData?: any;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  template: 'default' | 'landing' | 'contact' | 'about' | 'custom';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  featured: boolean;
  showInMenu: boolean;
  menuOrder: number;
  parentId?: number;
  metaData?: any;
}

export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  tags: string[];
  category: string;
  uploadedBy: number;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ContentStats {
  totalPosts: number;
  totalPages: number;
  totalMedia: number;
  publishedPosts: number;
  draftPosts: number;
  publishedPages: number;
  draftPages: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  popularPosts: Array<{
    id: number;
    title: string;
    views: number;
    likes: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: 'post' | 'page' | 'media';
    title: string;
    action: 'created' | 'updated' | 'published' | 'deleted';
    author: string;
    date: string;
  }>;
}

class ContentManagementService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/content') {
    this.baseUrl = baseUrl;
  }

  // Blog Posts Management
  async getBlogPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    author?: string;
    tags?: string[];
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ posts: BlogPost[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/posts?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockBlogPosts(params);
    }
  }

  async getBlogPost(id: number): Promise<BlogPost> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockBlogPost(id);
    }
  }

  async createBlogPost(postData: Partial<BlogPost>): Promise<{ success: boolean; post?: BlogPost; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Blog post created successfully (mock)',
        post: this.getMockBlogPost(1)
      };
    }
  }

  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<{ success: boolean; post?: BlogPost; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Blog post updated successfully (mock)',
        post: this.getMockBlogPost(id)
      };
    }
  }

  async deleteBlogPost(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Blog post deleted successfully (mock)'
      };
    }
  }

  // Pages Management
  async getPages(params?: {
    page?: number;
    limit?: number;
    search?: string;
    template?: string;
    status?: string;
    showInMenu?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ pages: Page[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/pages?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockPages(params);
    }
  }

  async getPage(id: number): Promise<Page> {
    try {
      const response = await fetch(`${this.baseUrl}/pages/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockPage(id);
    }
  }

  async createPage(pageData: Partial<Page>): Promise<{ success: boolean; page?: Page; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error('Failed to create page');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Page created successfully (mock)',
        page: this.getMockPage(1)
      };
    }
  }

  async updatePage(id: number, pageData: Partial<Page>): Promise<{ success: boolean; page?: Page; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error('Failed to update page');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Page updated successfully (mock)',
        page: this.getMockPage(id)
      };
    }
  }

  async deletePage(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Page deleted successfully (mock)'
      };
    }
  }

  // Media Management
  async getMediaFiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    mimeType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ files: MediaFile[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/media?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch media files');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockMediaFiles(params);
    }
  }

  async uploadMedia(file: File, metadata?: {
    alt?: string;
    caption?: string;
    description?: string;
    tags?: string[];
    category?: string;
  }): Promise<{ success: boolean; file?: MediaFile; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(`${this.baseUrl}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload media file');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Media file uploaded successfully (mock)',
        file: this.getMockMediaFile(1)
      };
    }
  }

  async deleteMedia(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/media/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media file');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        message: 'Media file deleted successfully (mock)'
      };
    }
  }

  // Content Statistics
  async getContentStats(): Promise<ContentStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content statistics');
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock data');
      return this.getMockContentStats();
    }
  }

  // Mock data methods
  private getMockBlogPosts(params?: any): { posts: BlogPost[]; total: number; page: number; totalPages: number } {
    const mockPosts: BlogPost[] = [
      {
        id: 1,
        title: 'Boho Styling Trends 2024',
        slug: 'boho-styling-trends-2024',
        excerpt: 'Entdecke die neuesten Boho-Trends für 2024 und wie du sie in deinen Alltag integrieren kannst.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        featuredImage: '/images/blog/boho-trends-2024.jpg',
        author: 'Casa Petrada Team',
        category: 'Lifestyle',
        tags: ['boho', 'trends', 'styling', '2024'],
        status: 'published',
        publishedAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T09:30:00Z',
        wordCount: 850,
        readingTime: 4,
        views: 1250,
        likes: 45,
        comments: 12,
        seoTitle: 'Boho Styling Trends 2024 - Casa Petrada',
        seoDescription: 'Entdecke die neuesten Boho-Trends für 2024',
        seoKeywords: ['boho trends', 'styling', '2024'],
        featured: true,
        allowComments: true
      },
      {
        id: 2,
        title: 'Handgefertigter Schmuck - Die Kunst der Einzigartigkeit',
        slug: 'handgefertigter-schmuck-kunst-einzigartigkeit',
        excerpt: 'Erfahre mehr über die Kunst des handgefertigten Schmucks und warum jedes Stück einzigartig ist.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        featuredImage: '/images/blog/handgefertigt-schmuck.jpg',
        author: 'Casa Petrada Team',
        category: 'Handwerk',
        tags: ['handmade', 'schmuck', 'kunst', 'einzigartig'],
        status: 'published',
        publishedAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-10T14:00:00Z',
        createdAt: '2024-01-10T13:30:00Z',
        wordCount: 1200,
        readingTime: 6,
        views: 980,
        likes: 38,
        comments: 8,
        featured: false,
        allowComments: true
      }
    ];

    return {
      posts: mockPosts,
      total: mockPosts.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockBlogPost(id: number): BlogPost {
    const posts = this.getMockBlogPosts().posts;
    return posts.find(post => post.id === id) || posts[0];
  }

  private getMockPages(params?: any): { pages: Page[]; total: number; page: number; totalPages: number } {
    const mockPages: Page[] = [
      {
        id: 1,
        title: 'Über uns',
        slug: 'about',
        content: 'Casa Petrada ist ein Familienunternehmen...',
        template: 'about',
        status: 'published',
        publishedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        seoTitle: 'Über Casa Petrada - Handmade Boho Schmuck',
        seoDescription: 'Erfahre mehr über Casa Petrada und unsere Leidenschaft für handgefertigten Schmuck',
        featured: true,
        showInMenu: true,
        menuOrder: 1
      },
      {
        id: 2,
        title: 'Kontakt',
        slug: 'contact',
        content: 'Kontaktiere uns gerne...',
        template: 'contact',
        status: 'published',
        publishedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        featured: false,
        showInMenu: true,
        menuOrder: 2
      }
    ];

    return {
      pages: mockPages,
      total: mockPages.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockPage(id: number): Page {
    const pages = this.getMockPages().pages;
    return pages.find(page => page.id === id) || pages[0];
  }

  private getMockMediaFiles(params?: any): { files: MediaFile[]; total: number; page: number; totalPages: number } {
    const mockFiles: MediaFile[] = [
      {
        id: 1,
        filename: 'boho-styling.jpg',
        originalName: 'boho-styling.jpg',
        mimeType: 'image/jpeg',
        size: 245760,
        url: '/images/blog/boho-styling.jpg',
        thumbnailUrl: '/images/blog/thumbnails/boho-styling.jpg',
        alt: 'Boho Styling Inspiration',
        caption: 'Inspiration für Boho Styling',
        tags: ['boho', 'styling', 'inspiration'],
        category: 'blog',
        uploadedBy: 1,
        uploadedAt: '2024-01-15T10:00:00Z',
        dimensions: { width: 1200, height: 800 }
      }
    ];

    return {
      files: mockFiles,
      total: mockFiles.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockMediaFile(id: number): MediaFile {
    const files = this.getMockMediaFiles().files;
    return files.find(file => file.id === id) || files[0];
  }

  private getMockContentStats(): ContentStats {
    return {
      totalPosts: 25,
      totalPages: 8,
      totalMedia: 150,
      publishedPosts: 20,
      draftPosts: 5,
      publishedPages: 6,
      draftPages: 2,
      totalViews: 15000,
      totalLikes: 450,
      totalComments: 120,
      popularPosts: [
        {
          id: 1,
          title: 'Boho Styling Trends 2024',
          views: 1250,
          likes: 45
        },
        {
          id: 2,
          title: 'Handgefertigter Schmuck - Die Kunst der Einzigartigkeit',
          views: 980,
          likes: 38
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'post',
          title: 'Boho Styling Trends 2024',
          action: 'published',
          author: 'Casa Petrada Team',
          date: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          type: 'page',
          title: 'Über uns',
          action: 'updated',
          author: 'Admin',
          date: '2024-01-15T09:30:00Z'
        }
      ]
    };
  }
}

export const contentManagementService = new ContentManagementService();