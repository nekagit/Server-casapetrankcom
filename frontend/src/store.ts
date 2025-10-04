// Casa Petrada State Management
import { apiService, User as ApiUser } from './api';

export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  images?: string[];
  category: string;
  description: string;
  longDescription?: string;
  material?: string;
  care?: string;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isLoggedIn: boolean;
}

export interface AppState {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  searchQuery: string;
  selectedCategory: string;
  loading: boolean;
  error: string | null;
}

class Store {
  private state: AppState = {
    products: [],
    cart: [],
    wishlist: [],
    user: null,
    searchQuery: '',
    selectedCategory: '',
    loading: false,
    error: null
  };

  private listeners: Array<(state: AppState) => void> = [];

  constructor() {
    this.loadFromLocalStorage();
    this.initializeProducts();
  }

  // State management
  getState(): AppState {
    return { ...this.state };
  }

  subscribe(listener: (state: AppState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setState(updates: Partial<AppState>) {
    this.state = { ...this.state, ...updates };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Local storage management
  private saveToLocalStorage() {
    try {
      localStorage.setItem('casapetrada_cart', JSON.stringify(this.state.cart));
      localStorage.setItem('casapetrada_wishlist', JSON.stringify(this.state.wishlist));
      if (this.state.user) {
        localStorage.setItem('casapetrada_user', JSON.stringify(this.state.user));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const cart = localStorage.getItem('casapetrada_cart');
      const wishlist = localStorage.getItem('casapetrada_wishlist');
      const user = localStorage.getItem('casapetrada_user');

      if (cart) {
        this.state.cart = JSON.parse(cart);
      }
      if (wishlist) {
        this.state.wishlist = JSON.parse(wishlist);
      }
      if (user) {
        this.state.user = JSON.parse(user);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // Product management
  private initializeProducts() {
    const products: Product[] = [
      {
        id: 'sicilia-kleid',
        name: 'Maxi Kleid schwarz SICILIA mit Volants und broderie anglaise',
        price: '149,00 €',
        image: '/images/products/sicilia-kleid.jpg',
        images: [
          '/images/products/sicilia-kleid.jpg',
          '/images/products/sicilia-kleid-2.jpg',
          '/images/products/sicilia-kleid-3.jpg'
        ],
        category: 'kleider',
        description: 'Elegantes schwarzes Maxikleid mit romantischen Volants und broderie anglaise Details.',
        longDescription: 'Dieses wunderschöne schwarze Maxikleid ist ein echter Hingucker. Die romantischen Volants und die zarten broderie anglaise Details verleihen dem Kleid eine feminine und elegante Ausstrahlung. Perfect für besondere Anlässe oder als Statement-Piece im Alltag.',
        material: 'Baumwolle, Spitze',
        care: 'Handwäsche empfohlen, nicht bleichen, liegend trocknen',
        inStock: true,
        featured: true,
        bestseller: true,
        newArrival: false
      },
      {
        id: 'korsika-kette',
        name: 'KORSIKA - Boho Kette mit Buddha Anhänger',
        price: '49,90 €',
        image: '/images/products/korsika-kette.jpg',
        images: [
          '/images/products/korsika-kette.jpg',
          '/images/products/korsika-kette-2.jpg'
        ],
        category: 'ketten',
        description: 'Spirituelle Boho-Kette mit handgearbeitetem Buddha-Anhänger.',
        longDescription: 'Diese wunderschöne Boho-Kette mit Buddha-Anhänger bringt Ruhe und Spiritualität in deinen Alltag. Der handgearbeitete Anhänger ist ein Symbol für inneren Frieden und Weisheit. Die Kette ist aus hochwertigen Materialien gefertigt und perfekt für den täglichen Gebrauch.',
        material: 'Halbedelsteine, Messing versilbert',
        care: 'Mit weichem Tuch reinigen, nicht mit Wasser in Berührung bringen',
        inStock: true,
        featured: true,
        bestseller: true,
        newArrival: false
      },
      {
        id: 'gobi-kimono',
        name: 'Kimono GOBI mit Fransen und Print',
        price: '54,90 €',
        image: '/images/products/gobi-kimono.jpg',
        category: 'oberteile',
        description: 'Luftiger Kimono im Boho-Style mit verspielten Fransen.',
        longDescription: 'Dieser luftige Kimono ist perfekt für warme Sommertage. Der wunderschöne Print und die verspielten Fransen verleihen ihm einen authentischen Boho-Look. Ideal als Cover-Up am Strand oder als stylisches Oberteil im Alltag.',
        material: 'Viskose',
        care: 'Maschinenwäsche 30°C, nicht schleudern',
        inStock: true,
        featured: false,
        bestseller: true,
        newArrival: false
      },
      {
        id: 'weisses-kleid',
        name: 'Boho Kleid in weiß mit Stickerei in schwarz von Piti Cuiti',
        price: '105,00 €',
        image: '/images/products/weisses-kleid.jpg',
        category: 'kleider',
        description: 'Traumhaftes weißes Kleid mit kontrastierenden schwarzen Stickereien.',
        longDescription: 'Ein wahres Kunstwerk! Dieses weiße Boho-Kleid besticht durch seine aufwendigen schwarzen Stickereien, die von Hand aufgebracht wurden. Jedes Kleid ist ein Unikat und erzählt seine eigene Geschichte. Perfect für besondere Anlässe.',
        material: 'Baumwolle, handgestickte Details',
        care: 'Schonwäsche 30°C, nicht bleichen',
        inStock: true,
        featured: true,
        bestseller: false,
        newArrival: true
      },
      {
        id: 'maria-kette',
        name: 'MARIA Lange Boho Kette mit einem großen Kreuzanhänger',
        price: '69,90 €',
        image: '/images/products/maria-kette.jpg',
        category: 'ketten',
        description: 'Statement-Kette mit imposantem Kreuzanhänger für besondere Anlässe.',
        longDescription: 'Diese beeindruckende Statement-Kette mit großem Kreuzanhänger ist ein echter Blickfang. Die aufwendige Verarbeitung und die hochwertigen Materialien machen sie zu einem besonderen Schmuckstück, das Kraft und Spiritualität ausstrahlt.',
        material: 'Messing antik, Halbedelsteine',
        care: 'Trocken lagern, mit weichem Tuch polieren',
        inStock: true,
        featured: false,
        bestseller: true,
        newArrival: false
      },
      {
        id: 'fluegel-anhaenger',
        name: 'Boho Schmuck Anhänger FLÜGEL SILVERSHINY der Firma SchauTime',
        price: '9,90 €',
        image: '/images/products/fluegel-anhaenger.jpg',
        category: 'anhaenger',
        description: 'Zarter Flügel-Anhänger in silbernem Finish.',
        longDescription: 'Dieser zarte Flügel-Anhänger symbolisiert Freiheit und Leichtigkeit. Das silberne Finish verleiht ihm eine edle Ausstrahlung. Perfect als Geschenk oder um deine bestehende Kette zu personalisieren.',
        material: 'Messing versilbert',
        care: 'Nicht mit Wasser in Berührung bringen, mit Silberputztuch reinigen',
        inStock: true,
        featured: false,
        bestseller: false,
        newArrival: true
      },
      {
        id: 'tibet-armband',
        name: 'TIBET - Armband aus Dzi Beads',
        price: '32,90 €',
        image: '/images/products/tibet-armband.jpg',
        category: 'armbaender',
        description: 'Authentisches Armband mit traditionellen Dzi-Perlen aus Tibet.',
        longDescription: 'Dieses authentische Armband mit traditionellen Dzi-Perlen bringt die spirituelle Kraft Tibets zu dir. Jede Perle hat ihre eigene Bedeutung und soll Schutz und Glück bringen. Ein kraftvolles Schmuckstück mit jahrhundertealter Tradition.',
        material: 'Dzi-Perlen, Naturstein, Baumwollband',
        care: 'Schonend behandeln, nicht mit Wasser in Berührung bringen',
        inStock: true,
        featured: true,
        bestseller: false,
        newArrival: false
      },
      {
        id: 'lourdes-kette',
        name: 'LOURDES - kurze Kette mit Madonna Anhänger',
        price: '59,90 €',
        image: '/images/products/lourdes-kette.jpg',
        category: 'ketten',
        description: 'Spirituelle Kette mit Madonna-Anhänger, perfekt für den Alltag.',
        longDescription: 'Diese spirituelle Kette mit Madonna-Anhänger ist ein Symbol für Schutz und Geborgenheit. Die kurze Länge macht sie perfect für den täglichen Gebrauch, während der detailreich gearbeitete Anhänger ein besonderes Highlight darstellt.',
        material: 'Messing vergoldet, Emaille',
        care: 'Mit weichem Tuch pflegen, vor Feuchtigkeit schützen',
        inStock: true,
        featured: false,
        bestseller: true,
        newArrival: false
      },
      {
        id: 'boho-armband-set',
        name: 'Boho Armband Set HARMONY mit Quasten',
        price: '24,90 €',
        image: '/images/products/boho-armband-set.jpg',
        category: 'armbaender',
        description: 'Set aus drei harmonisch aufeinander abgestimmten Armbändern.',
        longDescription: 'Dieses wunderschöne Set aus drei Armbändern ist perfect für den Layering-Look. Die unterschiedlichen Texturen und Farben ergänzen sich harmonisch und können sowohl zusammen als auch einzeln getragen werden.',
        material: 'Halbedelsteine, Baumwolle, Quasten',
        care: 'Schonend behandeln, trocken lagern',
        inStock: true,
        featured: false,
        bestseller: false,
        newArrival: true
      },
      {
        id: 'mandala-kette',
        name: 'MANDALA - Lange Kette mit Lebensbaum Anhänger',
        price: '42,90 €',
        image: '/images/products/mandala-kette.jpg',
        category: 'ketten',
        description: 'Mystische lange Kette mit detailreich gearbeitetem Lebensbaum.',
        longDescription: 'Diese mystische Kette mit Lebensbaum-Anhänger steht für Wachstum, Stärke und Verbundenheit. Der detailreich gearbeitete Anhänger ist ein wahres Kunstwerk und macht diese Kette zu einem besonderen Schmuckstück.',
        material: 'Messing antik, Natursteine',
        care: 'Vor Feuchtigkeit schützen, mit Schmucktuch reinigen',
        inStock: true,
        featured: true,
        bestseller: false,
        newArrival: true
      }
    ];

    this.setState({ products });
  }

  // Product actions
  getProducts(): Product[] {
    return this.state.products;
  }

  getProduct(id: string): Product | undefined {
    return this.state.products.find(product => product.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.state.products.filter(product => product.category === category);
  }

  getFeaturedProducts(): Product[] {
    return this.state.products.filter(product => product.featured);
  }

  getBestsellerProducts(): Product[] {
    return this.state.products.filter(product => product.bestseller);
  }

  getNewArrivalProducts(): Product[] {
    return this.state.products.filter(product => product.newArrival);
  }

  searchProducts(query: string): Product[] {
    const lowercaseQuery = query.toLowerCase();
    return this.state.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Cart actions
  addToCart(productId: string, quantity: number = 1): boolean {
    const product = this.getProduct(productId);
    if (!product || !product.inStock) {
      return false;
    }

    const existingItem = this.state.cart.find(item => item.id === productId);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = this.state.cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      };
      newCart = [...this.state.cart, newItem];
    }

    this.setState({ cart: newCart });
    return true;
  }

  removeFromCart(productId: string): void {
    const newCart = this.state.cart.filter(item => item.id !== productId);
    this.setState({ cart: newCart });
  }

  updateCartQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const newCart = this.state.cart.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    );
    this.setState({ cart: newCart });
  }

  clearCart(): void {
    this.setState({ cart: [] });
  }

  getCartItems(): CartItem[] {
    return this.state.cart;
  }

  getCartItemsCount(): number {
    return this.state.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): { subtotal: number; shipping: number; total: number; freeShippingRemaining: number } {
    const subtotal = this.state.cart.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('€', '').replace(',', '.'));
      return sum + (price * item.quantity);
    }, 0);

    const freeShippingThreshold = 39.90;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 4.90;
    const total = subtotal + shipping;
    const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

    return { subtotal, shipping, total, freeShippingRemaining };
  }

  // Wishlist actions
  addToWishlist(productId: string): boolean {
    if (this.state.wishlist.includes(productId)) {
      return false; // Already in wishlist
    }

    const newWishlist = [...this.state.wishlist, productId];
    this.setState({ wishlist: newWishlist });
    return true;
  }

  removeFromWishlist(productId: string): void {
    const newWishlist = this.state.wishlist.filter(id => id !== productId);
    this.setState({ wishlist: newWishlist });
  }

  isInWishlist(productId: string): boolean {
    return this.state.wishlist.includes(productId);
  }

  getWishlistItems(): Product[] {
    return this.state.products.filter(product => this.state.wishlist.includes(product.id));
  }

  getWishlistCount(): number {
    return this.state.wishlist.length;
  }

  // User actions
  login(user: User): void {
    this.setState({ user: { ...user, isLoggedIn: true } });
  }

  logout(): void {
    this.setState({ user: null });
    localStorage.removeItem('casapetrada_user');
  }

  updateUser(updates: Partial<User>): void {
    if (this.state.user) {
      this.setState({ user: { ...this.state.user, ...updates } });
    }
  }

  isLoggedIn(): boolean {
    return this.state.user !== null && this.state.user.isLoggedIn;
  }

  getUser(): User | null {
    return this.state.user;
  }

  // Search actions
  setSearchQuery(query: string): void {
    this.setState({ searchQuery: query });
  }

  getSearchQuery(): string {
    return this.state.searchQuery;
  }

  // Category actions
  setSelectedCategory(category: string): void {
    this.setState({ selectedCategory: category });
  }

  getSelectedCategory(): string {
    return this.state.selectedCategory;
  }

  // Loading and error states
  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setError(error: string | null): void {
    this.setState({ error });
  }

  isLoading(): boolean {
    return this.state.loading;
  }

  getError(): string | null {
    return this.state.error;
  }

  // Newsletter subscription
  async subscribeToNewsletter(email: string, source: string = 'website'): Promise<boolean> {
    try {
      await apiService.subscribeNewsletter(email, source);
      return true;
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      throw error;
    }
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    try {
      await apiService.unsubscribeNewsletter(email);
      return true;
    } catch (error) {
      console.error('Newsletter unsubscription failed:', error);
      throw error;
    }
  }

  // Review methods
  async createReview(reviewData: {
    product_id: number;
    rating: number;
    title?: string;
    comment?: string;
    reviewer_name?: string;
    reviewer_email?: string;
  }): Promise<any> {
    try {
      return await apiService.createReview(reviewData);
    } catch (error) {
      console.error('Review creation failed:', error);
      throw error;
    }
  }

  async getProductReviews(productId: number, skip: number = 0, limit: number = 20): Promise<any[]> {
    try {
      return await apiService.getProductReviews(productId, skip, limit);
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      throw error;
    }
  }

  async getProductReviewStats(productId: number): Promise<any> {
    try {
      return await apiService.getProductReviewStats(productId);
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
      throw error;
    }
  }

  async getUserReviews(skip: number = 0, limit: number = 20): Promise<any[]> {
    try {
      return await apiService.getUserReviews(skip, limit);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      throw error;
    }
  }

  async updateReview(reviewId: number, reviewData: {
    product_id: number;
    rating: number;
    title?: string;
    comment?: string;
    reviewer_name?: string;
    reviewer_email?: string;
  }): Promise<any> {
    try {
      return await apiService.updateReview(reviewId, reviewData);
    } catch (error) {
      console.error('Review update failed:', error);
      throw error;
    }
  }

  async deleteReview(reviewId: number): Promise<any> {
    try {
      return await apiService.deleteReview(reviewId);
    } catch (error) {
      console.error('Review deletion failed:', error);
      throw error;
    }
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    try {
      return await apiService.getAdminStats();
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      throw error;
    }
  }

  async getRecentOrders(limit: number = 20): Promise<any> {
    try {
      return await apiService.getRecentOrders(limit);
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      throw error;
    }
  }

  async getCustomers(skip: number = 0, limit: number = 50): Promise<any> {
    try {
      return await apiService.getCustomers(skip, limit);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw error;
    }
  }

  async getAnalytics(range: string = 'month'): Promise<any> {
    try {
      return await apiService.getAnalytics(range);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  async toggleProductFeatured(productId: number): Promise<any> {
    try {
      return await apiService.toggleProductFeatured(productId);
    } catch (error) {
      console.error('Failed to toggle product featured status:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      return await apiService.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  // Contact form submission
  submitContactForm(formData: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        // Store contact form submissions locally for demo
        const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        submissions.push({
          ...formData,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('contact_submissions', JSON.stringify(submissions));
        resolve(true);
      }, 1500);
    });
  }

  // Order management
  createOrder(orderData: {
    items: CartItem[];
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    customerNotes?: string;
  }): Promise<{ orderId: string; orderNumber: string }> {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        const orderId = Math.random().toString(36).substr(2, 9);
        const orderNumber = `CP${Date.now().toString().slice(-6)}`;
        
        const order = {
          id: orderId,
          orderNumber,
          ...orderData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          total: this.getCartTotal().total
        };

        // Store order locally for demo
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart after successful order
        this.clearCart();

        resolve({ orderId, orderNumber });
      }, 2000);
    });
  }

  getUserOrders(): any[] {
    if (!this.isLoggedIn()) {
      return [];
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.filter((order: any) => order.userId === this.state.user?.id);
  }

  // Create order via API
  async createOrder(orderData: {
    items: Array<{
      product_id: number;
      quantity: number;
      price: number;
    }>;
    total_amount: number;
    shipping_address: any;
    billing_address?: any;
    payment_method: string;
    notes?: string;
  }): Promise<any> {
    try {
      const order = await apiService.createOrder(orderData);
      return order;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const store = new Store();

// Add authentication methods to the store instance
Object.assign(store, {
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiService.login({ email, password });
      localStorage.setItem('access_token', response.access_token);
      
      // Get user data
      const user = await apiService.getCurrentUser();
      store.setState({
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isLoggedIn: true
        }
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      store.setError('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      return false;
    }
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    newsletterSubscribed: boolean;
  }): Promise<boolean> {
    try {
      const user = await apiService.register({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        newsletter_subscribed: userData.newsletterSubscribed
      });
      
      // Auto-login after registration
      const response = await apiService.login({ 
        email: userData.email, 
        password: userData.password 
      });
      localStorage.setItem('access_token', response.access_token);
      
      store.setState({
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isLoggedIn: true
        }
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      store.setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      return false;
    }
  },

  async logout(): Promise<void> {
    await apiService.logout();
    store.setState({
      user: null
    });
  },

  async checkAuthStatus(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const user = await apiService.getCurrentUser();
      store.setState({
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isLoggedIn: true
        }
      });
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('access_token');
      store.setState({ user: null });
    }
  }
});

export default store;
