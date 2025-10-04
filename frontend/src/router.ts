// Casa Petrada Router
import { store } from './store';

export interface Route {
  path: string;
  component: string;
  title: string;
}

export class Router {
  private routes: Map<string, Route> = new Map();

  constructor() {
    this.setupRoutes();
    this.handlePopState();
    this.navigate(window.location.pathname);
  }

  private setupRoutes() {
    // Define all routes
    const routes: Route[] = [
      { path: '/', component: 'home', title: 'Casa Petrada - Handgemachter Schmuck & stilvolle Mode' },
      { path: '/products', component: 'products', title: 'Alle Produkte - Casa Petrada' },
      { path: '/products/armbaender', component: 'category', title: 'Armbänder - Casa Petrada' },
      { path: '/products/ketten', component: 'category', title: 'Ketten - Casa Petrada' },
      { path: '/products/fussketchen', component: 'category', title: 'Fußkettchen - Casa Petrada' },
      { path: '/products/modeschmuck', component: 'category', title: 'Modeschmuck - Casa Petrada' },
      { path: '/products/kleider', component: 'category', title: 'Kleider - Casa Petrada' },
      { path: '/products/oberteile', component: 'category', title: 'Oberteile - Casa Petrada' },
      { path: '/products/taschen', component: 'category', title: 'Taschen - Casa Petrada' },
      { path: '/product/:id', component: 'product-detail', title: 'Produkt Details - Casa Petrada' },
      { path: '/cart', component: 'cart', title: 'Warenkorb - Casa Petrada' },
      { path: '/checkout', component: 'checkout', title: 'Kasse - Casa Petrada' },
      { path: '/admin', component: 'admin', title: 'Admin Panel - Casa Petrada' },
      { path: '/login', component: 'auth', title: 'Anmelden - Casa Petrada' },
      { path: '/register', component: 'auth', title: 'Registrieren - Casa Petrada' },
      { path: '/account', component: 'account', title: 'Mein Konto - Casa Petrada' },
      { path: '/wishlist', component: 'wishlist', title: 'Wunschliste - Casa Petrada' },
      { path: '/uber-mich', component: 'about', title: 'Über mich - Casa Petrada' },
      { path: '/kontakt', component: 'contact', title: 'Kontakt - Casa Petrada' },
      { path: '/impressum', component: 'legal', title: 'Impressum - Casa Petrada' },
      { path: '/datenschutz', component: 'legal', title: 'Datenschutz - Casa Petrada' },
      { path: '/agb', component: 'legal', title: 'AGB - Casa Petrada' },
      { path: '/widerruf', component: 'legal', title: 'Widerrufsrecht - Casa Petrada' },
      { path: '/versand', component: 'legal', title: 'Versand - Casa Petrada' },
      { path: '/newsletter/unsubscribe', component: 'newsletter-unsubscribe', title: 'Newsletter abmelden - Casa Petrada' }
    ];

    routes.forEach(route => {
      this.routes.set(route.path, route);
    });
  }

  private handlePopState() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
  }

  navigate(path: string, pushState: boolean = true) {
    // Update browser history
    if (pushState) {
      history.pushState(null, '', path);
    }

    // Find matching route
    const route = this.findRoute(path);
    if (route) {
      document.title = route.title;
      this.renderComponent(route.component, path);
    } else {
      this.render404();
    }
  }

  private findRoute(path: string): Route | null {
    // Exact match first
    if (this.routes.has(path)) {
      return this.routes.get(path)!;
    }

    // Dynamic route matching (e.g., /product/:id)
    for (const [routePath, route] of this.routes) {
      if (this.matchDynamicRoute(routePath, path)) {
        return route;
      }
    }

    return null;
  }

  private matchDynamicRoute(routePath: string, actualPath: string): boolean {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    if (routeParts.length !== actualParts.length) {
      return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        continue; // Dynamic segment
      }
      if (routeParts[i] !== actualParts[i]) {
        return false;
      }
    }

    return true;
  }

  getParams(path: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    for (const [routePath] of this.routes) {
      if (this.matchDynamicRoute(routePath, path)) {
        const routeParts = routePath.split('/');
        const actualParts = path.split('/');

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            const paramName = routeParts[i].substring(1);
            params[paramName] = actualParts[i];
          }
        }
        break;
      }
    }

    return params;
  }

  private renderComponent(component: string, path: string) {
    const app = document.querySelector('#app');
    if (!app) return;

    switch (component) {
      case 'home':
        this.renderHome(app);
        break;
      case 'products':
        this.renderProducts(app);
        break;
      case 'category':
        this.renderCategory(app, path);
        break;
      case 'product-detail':
        this.renderProductDetail(app, path);
        break;
      case 'cart':
        this.renderCart(app);
        break;
      case 'checkout':
        this.renderCheckoutPage(app);
        break;
      case 'auth':
        this.renderAuth(app, path);
        break;
      case 'admin':
        this.renderAdminPage(app);
        break;
      case 'account':
        this.renderAccount(app);
        break;
      case 'wishlist':
        this.renderWishlist(app);
        break;
      case 'about':
        this.renderAbout(app);
        break;
      case 'contact':
        this.renderContact(app);
        break;
      case 'blog':
        this.renderBlog(app, path);
        break;
      case 'legal':
        this.renderLegal(app, path);
        break;
      default:
        this.render404();
    }
  }

  private renderHome(app: Element) {
    // Import the existing homepage content from main.ts
    app.innerHTML = this.getHomepageContent();
  }

  private renderProducts(app: Element, path: string = '') {
    // Parse URL parameters
    const urlParams = new URLSearchParams(path.split('?')[1] || '');
    const searchQuery = urlParams.get('search') || '';
    const category = urlParams.get('category') || '';
    const sort = urlParams.get('sort') || 'newest';
    const priceMin = urlParams.get('priceMin') || '';
    const priceMax = urlParams.get('priceMax') || '';
    
    // Get filtered products
    const filteredProducts = this.getFilteredProducts(searchQuery, category, sort, priceMin, priceMax);
    
    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Home</a> > <span>Alle Produkte</span>
        </div>
        
        <div class="section-header">
          <h1 class="section-title">Alle Produkte</h1>
          <p class="section-subtitle">Entdecke unsere komplette Kollektion</p>
          ${searchQuery ? `<p class="search-results">Suchergebnisse für "${searchQuery}" (${filteredProducts.length} Produkte)</p>` : ''}
        </div>

        <div class="product-filters">
          <div class="filter-row">
            <div class="filter-group">
              <label for="search-input-filter">Suche:</label>
              <input type="text" id="search-input-filter" placeholder="Produkt suchen..." value="${searchQuery}">
            </div>
            
            <div class="filter-group">
              <label for="category-filter">Kategorie:</label>
              <select id="category-filter">
                <option value="">Alle Kategorien</option>
                <option value="armbaender" ${category === 'armbaender' ? 'selected' : ''}>Armbänder</option>
                <option value="ketten" ${category === 'ketten' ? 'selected' : ''}>Ketten</option>
                <option value="fussketchen" ${category === 'fussketchen' ? 'selected' : ''}>Fußkettchen</option>
                <option value="modeschmuck" ${category === 'modeschmuck' ? 'selected' : ''}>Modeschmuck</option>
                <option value="kleider" ${category === 'kleider' ? 'selected' : ''}>Kleider</option>
                <option value="oberteile" ${category === 'oberteile' ? 'selected' : ''}>Oberteile</option>
                <option value="taschen" ${category === 'taschen' ? 'selected' : ''}>Taschen</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="sort-filter">Sortieren:</label>
              <select id="sort-filter">
                <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Neueste</option>
                <option value="price-low" ${sort === 'price-low' ? 'selected' : ''}>Preis: Niedrig - Hoch</option>
                <option value="price-high" ${sort === 'price-high' ? 'selected' : ''}>Preis: Hoch - Niedrig</option>
                <option value="popular" ${sort === 'popular' ? 'selected' : ''}>Beliebtheit</option>
                <option value="name" ${sort === 'name' ? 'selected' : ''}>Name A-Z</option>
              </select>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group">
              <label for="price-min">Preis von:</label>
              <input type="number" id="price-min" placeholder="Min" value="${priceMin}" min="0" step="0.01">
            </div>
            
            <div class="filter-group">
              <label for="price-max">Preis bis:</label>
              <input type="number" id="price-max" placeholder="Max" value="${priceMax}" min="0" step="0.01">
            </div>
            
            <div class="filter-group">
              <button class="btn btn-secondary" id="clear-filters">Filter zurücksetzen</button>
            </div>
          </div>
        </div>

        <div class="filter-results">
          <div class="results-info">
            <span id="results-count">${filteredProducts.length} Produkte gefunden</span>
            <div class="view-options">
              <button class="view-btn active" data-view="grid" title="Rasteransicht">
                <i class="fas fa-th"></i>
              </button>
              <button class="view-btn" data-view="list" title="Listenansicht">
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        <div id="products-grid" class="product-grid">
          ${this.generateProductGrid(filteredProducts)}
        </div>

        ${filteredProducts.length === 0 ? `
          <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>Keine Produkte gefunden</h3>
            <p>Versuchen Sie andere Suchbegriffe oder Filter.</p>
            <button class="btn btn-primary" onclick="clearAllFilters()">Alle Filter zurücksetzen</button>
          </div>
        ` : ''}

        <div class="pagination">
          <button class="btn btn-secondary" id="load-more">Mehr laden</button>
        </div>
      </div>
    `;
    
    this.setupProductFilters();
  }

  private renderProductDetail(app: Element, path: string) {
    const params = this.getParams(path);
    const productId = params.id;
    const product = this.getProductById(productId);

    if (!product) {
      this.render404();
      return;
    }

    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Home</a> > 
          <a href="/products">Produkte</a> > 
          <span>${product.name}</span>
        </div>

        <div class="product-detail">
          <div class="product-images">
            <div class="main-image">
              <img src="${product.image}" alt="${product.name}" id="main-product-image">
            </div>
            <div class="thumbnail-images">
              ${product.images && product.images.length > 1 ? product.images.map((img: string, index: number) => `
                <img src="${img}" alt="${product.name} ${index + 1}" 
                     class="thumbnail ${index === 0 ? 'active' : ''}" 
                     onclick="changeMainImage('${img}')">
              `).join('') : ''}
            </div>
          </div>

          <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-price">
              <span class="current-price">${product.price}</span>
            </div>
            
            <div class="product-description">
              <p>${product.description}</p>
            </div>

            <div class="product-details">
              ${product.material ? `<p><strong>Material:</strong> ${product.material}</p>` : ''}
              ${product.care ? `<p><strong>Pflege:</strong> ${product.care}</p>` : ''}
              <p><strong>Handgefertigt:</strong> Ja</p>
              <p><strong>Versand:</strong> Versandkostenfrei ab 39,90 €</p>
            </div>

            <div class="product-actions">
              <div class="quantity-selector">
                <label for="quantity">Anzahl:</label>
                <div class="quantity-input">
                  <button onclick="decreaseQuantity()">-</button>
                  <input type="number" id="quantity" value="1" min="1" max="10">
                  <button onclick="increaseQuantity()">+</button>
                </div>
              </div>
              
              <button class="btn btn-primary add-to-cart" onclick="addToCart('${productId}')">
                <i class="fas fa-shopping-bag"></i>
                In den Warenkorb
              </button>
              
              <button class="btn btn-secondary add-to-wishlist" onclick="addToWishlist('${productId}')">
                <i class="fas fa-heart"></i>
                Zur Wunschliste
              </button>
            </div>

            <div class="product-features">
              <div class="feature">
                <i class="fas fa-heart"></i>
                <span>Handgefertigt mit Liebe</span>
              </div>
              <div class="feature">
                <i class="fas fa-gem"></i>
                <span>Hochwertige Materialien</span>
              </div>
              <div class="feature">
                <i class="fas fa-shipping-fast"></i>
                <span>Schneller Versand</span>
              </div>
            </div>
          </div>
        </div>

        <div class="product-tabs">
          <div class="tab-buttons">
            <button class="tab-button active" onclick="showTab('description')">Beschreibung</button>
            <button class="tab-button" onclick="showTab('reviews')">Bewertungen</button>
            <button class="tab-button" onclick="showTab('shipping')">Versand</button>
          </div>
          
          <div class="tab-content">
            <div id="description-tab" class="tab-pane active">
              <h3>Produktbeschreibung</h3>
              <p>${product.description}</p>
            </div>
            
            <div id="reviews-tab" class="tab-pane">
              <h3>Kundenbewertungen</h3>
              <div class="reviews-summary" id="reviews-summary">
                <div class="loading-skeleton">
                  <div class="skeleton-text" style="width: 200px; height: 20px;"></div>
                </div>
              </div>
              <div class="review-list" id="review-list">
                <div class="loading-skeleton">
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                </div>
              </div>
              <div class="review-form" id="review-form">
                <h4>Bewertung schreiben</h4>
                <form id="submit-review-form">
                  <div class="form-group">
                    <label>Bewertung *</label>
                    <div class="rating-input">
                      <input type="radio" id="rating-5" name="rating" value="5">
                      <label for="rating-5">★</label>
                      <input type="radio" id="rating-4" name="rating" value="4">
                      <label for="rating-4">★</label>
                      <input type="radio" id="rating-3" name="rating" value="3">
                      <label for="rating-3">★</label>
                      <input type="radio" id="rating-2" name="rating" value="2">
                      <label for="rating-2">★</label>
                      <input type="radio" id="rating-1" name="rating" value="1">
                      <label for="rating-1">★</label>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="review-title">Titel (optional)</label>
                    <input type="text" id="review-title" name="title" placeholder="Titel Ihrer Bewertung">
                  </div>
                  <div class="form-group">
                    <label for="review-comment">Kommentar *</label>
                    <textarea id="review-comment" name="comment" rows="4" placeholder="Teilen Sie Ihre Erfahrungen mit diesem Produkt" required></textarea>
                  </div>
                  <div class="form-group" id="guest-reviewer-info" style="display: none;">
                    <div class="form-row">
                      <div class="form-group">
                        <label for="reviewer-name">Name *</label>
                        <input type="text" id="reviewer-name" name="reviewer_name" placeholder="Ihr Name">
                      </div>
                      <div class="form-group">
                        <label for="reviewer-email">E-Mail *</label>
                        <input type="email" id="reviewer-email" name="reviewer_email" placeholder="Ihre E-Mail-Adresse">
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary">
                    <span class="btn-text">Bewertung abschicken</span>
                  </button>
                </form>
              </div>
            </div>
            
            <div id="shipping-tab" class="tab-pane">
              <h3>Versand & Rückgabe</h3>
              <ul>
                <li>Versandkostenfrei ab 39,90 €</li>
                <li>Lieferzeit: 2-3 Werktage</li>
                <li>30 Tage Rückgaberecht</li>
                <li>Sichere Verpackung</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="related-products">
          <h3>Ähnliche Produkte</h3>
          <div class="product-grid">
            ${this.generateRelatedProducts(product.category)}
          </div>
        </div>
      </div>
    `;
    
    this.setupProductDetail();
    this.loadProductReviews(productId);
  }

  private async loadProductReviews(productId: string) {
    try {
      const [reviews, stats] = await Promise.all([
        store.getProductReviews(parseInt(productId)),
        store.getProductReviewStats(parseInt(productId))
      ]);
      
      this.renderReviewsSummary(stats);
      this.renderReviewsList(reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      this.renderReviewsError();
    }
  }

  private renderReviewsSummary(stats: any) {
    const summaryElement = document.getElementById('reviews-summary');
    if (!summaryElement) return;

    const stars = '★'.repeat(5);
    const emptyStars = '☆'.repeat(5 - Math.floor(stats.average_rating));
    const filledStars = '★'.repeat(Math.floor(stats.average_rating));
    
    summaryElement.innerHTML = `
      <div class="rating-overview">
        <div class="rating-stars">
          <span class="filled-stars">${filledStars}</span>
          <span class="empty-stars">${emptyStars}</span>
        </div>
        <div class="rating-info">
          <span class="rating-number">${stats.average_rating}</span>
          <span class="rating-text">von 5 Sternen</span>
          <span class="review-count">(${stats.total_reviews} Bewertungen)</span>
        </div>
      </div>
      <div class="rating-distribution">
        ${[5, 4, 3, 2, 1].map(rating => `
          <div class="rating-bar">
            <span class="rating-label">${rating}★</span>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${(stats.rating_distribution[rating] / stats.total_reviews) * 100}%"></div>
            </div>
            <span class="rating-count">${stats.rating_distribution[rating]}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderReviewsList(reviews: any[]) {
    const listElement = document.getElementById('review-list');
    if (!listElement) return;

    if (reviews.length === 0) {
      listElement.innerHTML = `
        <div class="no-reviews">
          <p>Noch keine Bewertungen vorhanden. Seien Sie der Erste!</p>
        </div>
      `;
      return;
    }

    listElement.innerHTML = reviews.map(review => `
      <div class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-name">${review.reviewer_name || 'Anonymer Benutzer'}</div>
            <div class="review-date">${new Date(review.created_at).toLocaleDateString('de-DE')}</div>
          </div>
          <div class="review-rating">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
        </div>
        ${review.title ? `<div class="review-title">${review.title}</div>` : ''}
        <div class="review-comment">${review.comment}</div>
        ${review.is_verified_purchase ? '<div class="verified-badge">✓ Verifizierter Kauf</div>' : ''}
      </div>
    `).join('');
  }

  private renderReviewsError() {
    const summaryElement = document.getElementById('reviews-summary');
    const listElement = document.getElementById('review-list');
    
    if (summaryElement) {
      summaryElement.innerHTML = '<p>Fehler beim Laden der Bewertungen.</p>';
    }
    if (listElement) {
      listElement.innerHTML = '<p>Bewertungen konnten nicht geladen werden.</p>';
    }
  }

  private renderCart(app: Element) {
    const cartItems = this.getCartItems();
    const total = this.calculateCartTotal();

    app.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">Warenkorb</h1>
        </div>

        ${cartItems.length === 0 ? `
          <div class="empty-cart">
            <i class="fas fa-shopping-bag"></i>
            <h3>Dein Warenkorb ist leer</h3>
            <p>Entdecke unsere wunderschönen Schmuckstücke und füge sie zu deinem Warenkorb hinzu.</p>
            <a href="/products" class="btn btn-primary">Produkte entdecken</a>
          </div>
        ` : `
          <div class="cart-content">
            <div class="cart-items">
              ${cartItems.map((item: any) => `
                <div class="cart-item" data-id="${item.id}">
                  <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                  <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">${item.price}</p>
                  </div>
                  <div class="cart-item-quantity">
                    <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                  </div>
                  <div class="cart-item-total">
                    ${(parseFloat(item.price.replace('€', '').replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')} €
                  </div>
                  <button class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('')}
            </div>

            <div class="cart-summary">
              <div class="summary-card">
                <h3>Bestellübersicht</h3>
                <div class="summary-line">
                  <span>Zwischensumme:</span>
                  <span>${total.subtotal} €</span>
                </div>
                <div class="summary-line">
                  <span>Versand:</span>
                  <span>${total.shipping === 0 ? 'Kostenlos' : total.shipping + ' €'}</span>
                </div>
                <div class="summary-line total-line">
                  <span>Gesamt:</span>
                  <span>${total.total} €</span>
                </div>
                
                ${parseFloat(total.freeShippingRemaining) > 0 ? `
                  <div class="free-shipping-notice">
                    Noch ${total.freeShippingRemaining} € bis zum kostenlosen Versand!
                  </div>
                ` : `
                  <div class="free-shipping-notice success">
                    <i class="fas fa-check"></i> Kostenloser Versand!
                  </div>
                `}

                <button class="btn btn-primary checkout-btn" onclick="goToCheckout()">
                  Zur Kasse
                </button>
                
                <a href="/products" class="continue-shopping">
                  <i class="fas fa-arrow-left"></i>
                  Weiter einkaufen
                </a>
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    this.setupCart();
  }

  private render404() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div class="container">
        <div class="error-page">
          <h1>404</h1>
          <h2>Seite nicht gefunden</h2>
          <p>Die gesuchte Seite konnte nicht gefunden werden.</p>
          <a href="/" class="btn btn-primary">Zur Startseite</a>
        </div>
      </div>
    `;
  }

  // Helper methods
  private getHomepageContent(): string {
    // Return the existing homepage content
    return `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-background">
          <div class="hero-overlay">
            <div class="hero-content">
              <h1>Boho-Schmuck & Fashion</h1>
              <p>Handgemachter Schmuck & stilvolle Mode</p>
              <div class="hero-buttons">
                <a href="/products/new-arrivals" class="btn btn-primary">NEW ARRIVALS</a>
                <a href="/products/kleider" class="btn btn-secondary">BOHO-KLEIDER</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Overview -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">KATEGORIEN IM ÜBERBLICK</h2>
            <p class="section-subtitle">FINDE DEINEN BOHO-STYLE</p>
          </div>
          
          <div class="category-grid">
            <div class="category-card">
              <img src="/images/new-arrivals.jpg" alt="NEW ARRIVAL - neue Schmuckstücke" class="category-image">
              <div class="category-content">
                <h3>NEW ARRIVAL - neue Schmuckstücke</h3>
                <a href="/products/new-arrivals" class="btn btn-primary">Entdecken</a>
              </div>
            </div>
            
            <div class="category-card">
              <img src="/images/boho-armbaender.jpg" alt="Boho-Armbänder" class="category-image">
              <div class="category-content">
                <h3>Boho-Armbänder</h3>
                <p>Entdecke unsere handgefertigten Boho-Armbänder Inspiriert von der Vielfalt der Natur, den Farben...</p>
                <a href="/products/armbaender" class="btn btn-primary">Entdecken</a>
              </div>
            </div>
            
            <div class="category-card">
              <img src="/images/boho-ketten.jpg" alt="Boho-Ketten" class="category-image">
              <div class="category-content">
                <h3>Boho-Ketten</h3>
                <p>Handmade Boho-Ketten – Deine Kette im Boho Style für unbeschwerte Tage Egal,...</p>
                <a href="/products/ketten" class="btn btn-primary">Entdecken</a>
              </div>
            </div>
            
            <div class="category-card">
              <img src="/images/boho-anhaenger.jpg" alt="Boho-Anhänger" class="category-image">
              <div class="category-content">
                <h3>Boho-Anhänger</h3>
                <p>Boho Anhänger – Dein persönliches Schmuck-Statement Schmuck ist viel mehr als ein...</p>
                <a href="/products/anhaenger" class="btn btn-primary">Entdecken</a>
              </div>
            </div>
            
            <div class="category-card">
              <img src="/images/boho-kleider.jpg" alt="Boho-Kleider" class="category-image">
              <div class="category-content">
                <h3>Boho-Kleider</h3>
                <a href="/products/kleider" class="btn btn-primary">Entdecken</a>
              </div>
            </div>
            
            <div class="category-card">
              <img src="/images/oberteile.jpg" alt="Oberteile" class="category-image">
              <div class="category-content">
                <h3>Oberteile</h3>
                <a href="/products/oberteile" class="btn btn-primary">Entdecken</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bestsellers -->
      <section class="section" style="background-color: var(--gray-light);">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">UNSERE BESTSELLER</h2>
            <p class="section-subtitle">UNSERE BOHO-LIEBLINGE</p>
          </div>
          
          <div class="product-grid">
            ${this.generateProductGrid()}
          </div>
          
          <div class="text-center">
            <a href="/products" class="btn btn-secondary">Alle anzeigen</a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">WARUM CASA-PETRADA BESONDERS IST</h2>
            <p class="section-subtitle">HANDEMADE. NATÜRLICH. ZEITLOS.</p>
          </div>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-heart"></i>
              </div>
              <h3 class="feature-title">Persönlich Handgefertigt</h3>
              <p class="feature-description">Jedes Schmuckstück wird von mir selbst mit größter Liebe zum Detail und Sorgfalt von Hand gefertigt.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-gem"></i>
              </div>
              <h3 class="feature-title">Unikate aus Deutschland</h3>
              <p class="feature-description">Unsere Schmuckstücke werden in Deutschland angefertigt. Jedes Stück ist ein einzigartiges Unikat.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-comments"></i>
              </div>
              <h3 class="feature-title">persönlicher Kundenservice</h3>
              <p class="feature-description">Wir stehen dir jederzeit über unseren Chat zur Verfügung, um dir ganz individuell zu helfen.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-shipping-fast"></i>
              </div>
              <h3 class="feature-title">Versandkostenfrei ab 39,90 EUR</h3>
              <p class="feature-description">Profitiere von unserem kostenlosen Versand ab einem Bestellwert von 39,90 EUR.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">CASA-PETRADA - MODE & ACCESSOIRES</h2>
            <p class="section-subtitle">ÜBER MICH</p>
          </div>
          
          <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <p style="font-size: 1.125rem; line-height: 1.8; margin-bottom: 2rem;">
              Hallo, ich bin Petra, Gründerin von Casa-Petrada!
            </p>
            <p style="line-height: 1.8; margin-bottom: 2rem;">
              Vor vielen Jahren begann meine Reise mit der Herstellung von handgemachtem Modeschmuck aus Perlen.
            </p>
            <p style="line-height: 1.8; margin-bottom: 2rem;">
              Nach acht wundervollen Jahren als Geschäftsführerin einer Boutique, habe ich mich entschieden, 
              meiner kreativen Leidenschaft zu folgen. Heute präsentiere ich stolz meinen Onlineshop, 
              in dem ich meine einzigartigen, handgearbeiteten Schmuckstücke anbiete.
            </p>
            <a href="/uber-mich" class="btn btn-primary">mehr erfahren</a>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="testimonials" style="background-color: var(--gray-light);">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">WAS UNSEREN KUNDINNEN SAGEN</h2>
            <p class="section-subtitle">ECHTE STIMMEN - ECHTES VERTRAUEN</p>
          </div>
          
          <div class="testimonial-grid">
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Sehr happy"</p>
              <div class="testimonial-author">Anja Wulke</div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Wie immer eine 10 von 10. Ich liebe die Ketten und Armbänder"</p>
              <div class="testimonial-author">Inga Eckert</div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Ich liebe die Kette, es gab auch schon Komplimente dafür. Eine 10 von 10"</p>
              <div class="testimonial-author">Inga Eckert</div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Ich liebe das Armband. Gehe nicht mehr aus dem Haus ohne Armband oder Kette"</p>
              <div class="testimonial-author">Inga Eckert</div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Ich bin total begeistert über den Schmuck. Gehe eigentlich nicht mehr aus dem Haus ohne Armband oder Kette"</p>
              <div class="testimonial-author">Inga Eckert</div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Tolle Kette. Toller Schmuck. Bin mega zufrieden und glücklich damit."</p>
              <div class="testimonial-author">Kunde</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Signup -->
      <section class="newsletter" style="background-color: var(--accent-color); color: var(--white);">
        <div class="container">
          <div class="newsletter-content">
            <div class="newsletter-text">
              <h2>Bleib auf dem Laufenden</h2>
              <p>Erhalte als Erste Neuigkeiten über neue Kollektionen, exklusive Angebote und handgemachte Unikate.</p>
            </div>
            <form id="newsletter-form" class="newsletter-form">
              <div class="newsletter-input-group">
                <input type="email" name="email" placeholder="Deine E-Mail Adresse" required>
                <button type="submit" class="btn btn-primary newsletter-btn">
                  Anmelden
                </button>
              </div>
              <small>Du kannst dich jederzeit wieder abmelden. Datenschutz ist uns wichtig.</small>
            </form>
          </div>
        </div>
      </section>
    `;
  }


  private generateProductGrid(products: any[] = null): string {
    const productsToShow = products || this.getProducts();
    return productsToShow.map(product => `
      <div class="product-card" onclick="navigateToProduct('${product.id}')">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.bestseller ? '<span class="product-badge bestseller">Bestseller</span>' : ''}
          ${product.newArrival ? '<span class="product-badge new">Neu</span>' : ''}
          ${product.featured ? '<span class="product-badge featured">Empfohlen</span>' : ''}
        </div>
        <div class="product-content">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            <span class="current-price">${product.price}</span>
            ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
          </div>
          <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${product.id}')">
            <i class="fas fa-shopping-bag"></i>
            In den Warenkorb
          </button>
        </div>
      </div>
    `).join('');
  }

  private getFilteredProducts(searchQuery: string, category: string, sort: string, priceMin: string, priceMax: string) {
    let products = this.getProducts();
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter((product: any) => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.material && product.material.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (category) {
      products = products.filter((product: any) => product.category === category);
    }
    
    // Filter by price range
    if (priceMin) {
      const minPrice = parseFloat(priceMin);
      products = products.filter((product: any) => {
        const price = parseFloat(product.price.replace('€', '').replace(',', '.'));
        return price >= minPrice;
      });
    }
    
    if (priceMax) {
      const maxPrice = parseFloat(priceMax);
      products = products.filter((product: any) => {
        const price = parseFloat(product.price.replace('€', '').replace(',', '.'));
        return price <= maxPrice;
      });
    }
    
    // Sort products
    switch (sort) {
      case 'price-low':
        products.sort((a: any, b: any) => {
          const priceA = parseFloat(a.price.replace('€', '').replace(',', '.'));
          const priceB = parseFloat(b.price.replace('€', '').replace(',', '.'));
          return priceA - priceB;
        });
        break;
      case 'price-high':
        products.sort((a: any, b: any) => {
          const priceA = parseFloat(a.price.replace('€', '').replace(',', '.'));
          const priceB = parseFloat(b.price.replace('€', '').replace(',', '.'));
          return priceB - priceA;
        });
        break;
      case 'name':
        products.sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        products.sort((a: any, b: any) => {
          if (a.bestseller && !b.bestseller) return -1;
          if (!a.bestseller && b.bestseller) return 1;
          return 0;
        });
        break;
      case 'newest':
      default:
        products.sort((a: any, b: any) => {
          if (a.newArrival && !b.newArrival) return -1;
          if (!a.newArrival && b.newArrival) return 1;
          return 0;
        });
        break;
    }
    
    return products;
  }

  private getProducts() {
    return [
      {
        id: 'sicilia-kleid',
        name: 'Maxi Kleid schwarz SICILIA mit Volants und broderie anglaise',
        price: '149,00 €',
        image: '/images/products/sicilia-dress.jpg',
        category: 'kleider',
        description: 'Elegantes schwarzes Maxikleid mit romantischen Volants und broderie anglaise Details.',
        material: 'Baumwolle, Spitze',
        care: 'Handwäsche empfohlen'
      },
      {
        id: 'korsika-kette',
        name: 'KORSIKA - Boho Kette mit Buddha Anhänger',
        price: '49,90 €',
        image: '/images/products/korsika-kette.jpg',
        category: 'ketten',
        description: 'Spirituelle Boho-Kette mit handgearbeitetem Buddha-Anhänger.',
        material: 'Halbedelsteine, Messing',
        care: 'Mit weichem Tuch reinigen'
      },
      {
        id: 'gobi-kimono',
        name: 'Kimono GOBI mit Fransen und Print',
        price: '54,90 €',
        image: '/images/products/gobi-kimono.jpg',
        category: 'oberteile',
        description: 'Luftiger Kimono im Boho-Style mit verspielten Fransen.',
        material: 'Viskose',
        care: 'Maschinenwäsche 30°C'
      },
      {
        id: 'weisses-kleid',
        name: 'Boho Kleid in weiß mit Stickerei in schwarz von Piti Cuiti',
        price: '105,00 €',
        image: '/images/products/sicilia-dress.jpg',
        category: 'kleider',
        description: 'Traumhaftes weißes Kleid mit kontrastierenden schwarzen Stickereien.',
        material: 'Baumwolle, Stickerei',
        care: 'Schonwäsche'
      },
      {
        id: 'maria-kette',
        name: 'MARIA Lange Boho Kette mit einem großen Kreuzanhänger',
        price: '69,90 €',
        image: '/images/products/maria-kette.jpg',
        category: 'ketten',
        description: 'Statement-Kette mit imposantem Kreuzanhänger für besondere Anlässe.',
        material: 'Messing, Halbedelsteine',
        care: 'Trocken lagern'
      },
      {
        id: 'fluegel-anhaenger',
        name: 'Boho Schmuck Anhänger FLÜGEL SILVERSHINY der Firma SchauTime',
        price: '9,90 €',
        image: '/images/products/maria-kette.jpg',
        category: 'anhaenger',
        description: 'Zarter Flügel-Anhänger in silbernem Finish.',
        material: 'Versilbert',
        care: 'Nicht mit Wasser in Berührung bringen'
      },
      {
        id: 'tibet-armband',
        name: 'TIBET - Armband aus Dzi Beads',
        price: '32,90 €',
        image: '/images/products/tibet-armband.jpg',
        category: 'armbaender',
        description: 'Authentisches Armband mit traditionellen Dzi-Perlen aus Tibet.',
        material: 'Dzi-Perlen, Naturstein',
        care: 'Schonend behandeln'
      },
      {
        id: 'lourdes-kette',
        name: 'LOURDES - kurze Kette mit Madonna Anhänger',
        price: '59,90 €',
        image: '/images/products/maria-kette.jpg',
        category: 'ketten',
        description: 'Spirituelle Kette mit Madonna-Anhänger, perfekt für den Alltag.',
        material: 'Messing, Emaille',
        care: 'Mit weichem Tuch pflegen'
      }
    ];
  }

  private getProductById(id: string) {
    return this.getProducts().find(product => product.id === id);
  }

  private getBlogPosts() {
    return [
      {
        id: 1,
        slug: 'boho-schmuck-styling-tipps',
        title: 'Boho-Schmuck Styling: 5 Tipps für den perfekten Look',
        excerpt: 'Entdecke, wie du deinen Boho-Schmuck optimal kombinierst und damit einen einzigartigen, natürlichen Look kreierst.',
        content: `
          <p>Boho-Schmuck ist mehr als nur Accessoires – er ist ein Ausdruck deiner Persönlichkeit und deines Lebensstils. Hier sind unsere besten Tipps für das perfekte Boho-Styling:</p>
          
          <h3>1. Schichtung ist der Schlüssel</h3>
          <p>Kombiniere verschiedene Längen von Ketten und Armbändern. Trage eine kurze Kette mit einem langen Anhänger und ergänze sie mit mehreren Armbändern in unterschiedlichen Stilen.</p>
          
          <h3>2. Mische Materialien</h3>
          <p>Kombiniere verschiedene Materialien wie Holz, Stein, Metall und Textilien. Diese Mischung verleiht deinem Look Tiefe und Interesse.</p>
          
          <h3>3. Farbe mit Bedacht wählen</h3>
          <p>Erdige Töne wie Braun, Beige und Terrakotta passen perfekt zu Boho-Schmuck. Aber auch kräftige Akzentfarben wie Türkis oder Koralle können wunderschön aussehen.</p>
          
          <h3>4. Weniger ist manchmal mehr</h3>
          <p>Obwohl Boho-Stil oft mit vielen Accessoires verbunden wird, kann ein einzelnes Statement-Stück manchmal wirkungsvoller sein als eine Überladung.</p>
          
          <h3>5. Persönlichkeit zeigen</h3>
          <p>Wähle Schmuck, der zu deiner Persönlichkeit passt. Boho-Schmuck soll dich ausdrücken, nicht verstecken.</p>
        `,
        image: '/images/blog/boho-styling.jpg',
        category: 'Styling',
        date: '15. März 2024',
        readTime: 5,
        tags: ['Styling', 'Boho', 'Tipps', 'Fashion']
      },
      {
        id: 2,
        slug: 'schmuck-pflege-tipps',
        title: 'Schmuck richtig pflegen: So bleibt dein Boho-Schmuck schön',
        excerpt: 'Lerne, wie du deinen handgefertigten Boho-Schmuck richtig pflegst, damit er lange schön bleibt.',
        content: `
          <p>Handgefertigter Boho-Schmuck ist etwas Besonderes und verdient die richtige Pflege. Hier sind unsere besten Tipps:</p>
          
          <h3>Reinigung</h3>
          <p>Verwende ein weiches, trockenes Tuch zum Abwischen. Bei hartnäckigem Schmutz kannst du ein leicht feuchtes Tuch verwenden, aber trockne den Schmuck danach sofort ab.</p>
          
          <h3>Lagerung</h3>
          <p>Bewahre deinen Schmuck an einem trockenen, kühlen Ort auf. Verwende separate Beutel oder Schachteln, um Kratzer zu vermeiden.</p>
          
          <h3>Vermeide Feuchtigkeit</h3>
          <p>Nimm deinen Schmuck vor dem Duschen, Schwimmen oder Sport ab. Feuchtigkeit kann die Materialien beschädigen.</p>
          
          <h3>Regelmäßige Kontrolle</h3>
          <p>Überprüfe regelmäßig die Verschlüsse und Verbindungen. Bei Problemen wende dich an einen Fachmann.</p>
        `,
        image: '/images/blog/schmuck-pflege.jpg',
        category: 'Pflege',
        date: '10. März 2024',
        readTime: 3,
        tags: ['Pflege', 'Schmuck', 'Tipps', 'Handgefertigt']
      },
      {
        id: 3,
        slug: 'boho-trends-2024',
        title: 'Boho-Trends 2024: Was ist angesagt?',
        excerpt: 'Entdecke die neuesten Boho-Trends für 2024 und finde Inspiration für deinen persönlichen Stil.',
        content: `
          <p>Der Boho-Stil entwickelt sich ständig weiter. Hier sind die Trends, die 2024 angesagt sind:</p>
          
          <h3>Nachhaltige Materialien</h3>
          <p>Recycelte Materialien und nachhaltige Produktionsmethoden stehen im Fokus. Schmuck aus recyceltem Metall und natürlichen Materialien ist besonders beliebt.</p>
          
          <h3>Minimalistischer Boho</h3>
          <p>Ein neuer Trend ist der "Minimal Boho" – weniger Accessoires, aber mit besonderen Details und hochwertigen Materialien.</p>
          
          <h3>Kräftige Farben</p>
          <p>Nach Jahren der erdigen Töne kommen wieder kräftige Farben in Mode. Türkis, Koralle und warme Orange-Töne sind besonders angesagt.</p>
          
          <h3>Personalisierung</h3>
          <p>Individueller Schmuck mit persönlichen Elementen wie Initialen oder besonderen Symbolen ist sehr gefragt.</p>
        `,
        image: '/images/blog/boho-trends-2024.jpg',
        category: 'Neuigkeiten',
        date: '5. März 2024',
        readTime: 4,
        tags: ['Trends', '2024', 'Boho', 'Fashion']
      },
      {
        id: 4,
        slug: 'handgefertigt-vs-massproduktion',
        title: 'Warum handgefertigter Schmuck besonders ist',
        excerpt: 'Erfahre, warum handgefertigter Boho-Schmuck so besonders ist und welche Vorteile er gegenüber Massenware hat.',
        content: `
          <p>Handgefertigter Schmuck hat eine ganz besondere Ausstrahlung und Qualität. Hier sind die Gründe, warum er so wertvoll ist:</p>
          
          <h3>Einzigartigkeit</h3>
          <p>Jedes handgefertigte Stück ist ein Unikat. Kleine Unterschiede in Form, Farbe und Textur machen jedes Stück einzigartig.</p>
          
          <h3>Qualität</h3>
          <p>Handwerker verwenden hochwertige Materialien und achten auf Details, die in der Massenproduktion oft verloren gehen.</p>
          
          <h3>Nachhaltigkeit</h3>
          <p>Handgefertigter Schmuck wird oft aus nachhaltigen Materialien hergestellt und hat eine längere Lebensdauer.</p>
          
          <h3>Geschichte</h3>
          <p>Jedes Stück erzählt eine Geschichte und trägt die Handschrift des Handwerkers.</p>
          
          <h3>Wertschätzung</h3>
          <p>Handgefertigter Schmuck wird mit Liebe und Sorgfalt hergestellt – das spürt man beim Tragen.</p>
        `,
        image: '/images/blog/handgefertigt-schmuck.jpg',
        category: 'Inspiration',
        date: '1. März 2024',
        readTime: 6,
        tags: ['Handgefertigt', 'Qualität', 'Nachhaltigkeit', 'Einzigartigkeit']
      }
    ];
  }

  private getBlogPostBySlug(slug: string) {
    return this.getBlogPosts().find(post => post.slug === slug);
  }

  private setupBlogFilters() {
    const categoryFilter = document.getElementById('blog-category-filter') as HTMLSelectElement;
    const searchInput = document.getElementById('blog-search') as HTMLInputElement;

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.filterBlogPosts();
      });
    }

    if (searchInput) {
      let searchTimeout: NodeJS.Timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.filterBlogPosts();
        }, 300);
      });
    }

    // Global function for blog navigation
    (window as any).navigateToBlogPost = (slug: string) => this.navigate(`/blog/${slug}`);
  }

  private filterBlogPosts() {
    const category = (document.getElementById('blog-category-filter') as HTMLSelectElement)?.value || '';
    const searchQuery = (document.getElementById('blog-search') as HTMLInputElement)?.value || '';
    
    let posts = this.getBlogPosts();
    
    if (category) {
      posts = posts.filter(post => post.category.toLowerCase() === category.toLowerCase());
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Re-render blog grid
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
      blogGrid.innerHTML = posts.map(post => `
        <article class="blog-card" onclick="navigateToBlogPost('${post.slug}')">
          <div class="blog-image">
            <img src="${post.image}" alt="${post.title}" loading="lazy">
            <div class="blog-category">${post.category}</div>
          </div>
          <div class="blog-content">
            <div class="blog-meta">
              <span class="blog-date">${post.date}</span>
              <span class="blog-read-time">${post.readTime} Min. Lesezeit</span>
            </div>
            <h2 class="blog-title">${post.title}</h2>
            <p class="blog-excerpt">${post.excerpt}</p>
            <div class="blog-tags">
              ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  private setupProductFilters() {
    // Add event listeners for all filters
    const searchInput = document.getElementById('search-input-filter') as HTMLInputElement;
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;
    const sortFilter = document.getElementById('sort-filter') as HTMLSelectElement;
    const priceMinInput = document.getElementById('price-min') as HTMLInputElement;
    const priceMaxInput = document.getElementById('price-max') as HTMLInputElement;
    const clearFiltersBtn = document.getElementById('clear-filters') as HTMLButtonElement;
    const viewBtns = document.querySelectorAll('.view-btn');

    // Search input with debouncing
    if (searchInput) {
      let searchTimeout: NodeJS.Timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }

    // Category filter
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Sort filter
    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Price filters
    if (priceMinInput) {
      priceMinInput.addEventListener('input', () => {
        this.applyFilters();
      });
    }

    if (priceMaxInput) {
      priceMaxInput.addEventListener('input', () => {
        this.applyFilters();
      });
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }

    // View toggle buttons
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        this.toggleView(view);
      });
    });

    // Global function for clearing filters
    (window as any).clearAllFilters = () => this.clearAllFilters();
  }

  private applyFilters() {
    const searchQuery = (document.getElementById('search-input-filter') as HTMLInputElement)?.value || '';
    const category = (document.getElementById('category-filter') as HTMLSelectElement)?.value || '';
    const sort = (document.getElementById('sort-filter') as HTMLSelectElement)?.value || 'newest';
    const priceMin = (document.getElementById('price-min') as HTMLInputElement)?.value || '';
    const priceMax = (document.getElementById('price-max') as HTMLInputElement)?.value || '';

    // Update URL with current filters
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (category) params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    
    // Update URL without page reload
    window.history.pushState({}, '', newUrl);
    
    // Re-render products with filters
    this.renderProducts(document.getElementById('app')!, newUrl);
  }

  private clearAllFilters() {
    // Clear all filter inputs
    const searchInput = document.getElementById('search-input-filter') as HTMLInputElement;
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;
    const sortFilter = document.getElementById('sort-filter') as HTMLSelectElement;
    const priceMinInput = document.getElementById('price-min') as HTMLInputElement;
    const priceMaxInput = document.getElementById('price-max') as HTMLInputElement;

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (sortFilter) sortFilter.value = 'newest';
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';

    // Navigate to clean products page
    this.navigate('/products');
  }

  private toggleView(view: string | null) {
    const grid = document.getElementById('products-grid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    if (!grid || !view) return;

    // Update active button
    viewBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

    // Toggle CSS class
    if (view === 'list') {
      grid.classList.add('list-view');
    } else {
      grid.classList.remove('list-view');
    }
  }

  private setupProductDetail() {
    // Setup product detail functionality
    window.changeMainImage = (imageSrc: string) => {
      const mainImage = document.getElementById('main-product-image') as HTMLImageElement;
      if (mainImage) {
        mainImage.src = imageSrc;
      }
      
      // Update active thumbnail
      const thumbnails = document.querySelectorAll('.thumbnail');
      thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if ((thumb as HTMLImageElement).src === imageSrc) {
          thumb.classList.add('active');
        }
      });
    };

    window.increaseQuantity = () => {
      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
      if (quantityInput) {
        quantityInput.value = String(Math.min(10, parseInt(quantityInput.value) + 1));
      }
    };

    window.decreaseQuantity = () => {
      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
      if (quantityInput) {
        quantityInput.value = String(Math.max(1, parseInt(quantityInput.value) - 1));
      }
    };

    window.showTab = (tabName: string) => {
      // Hide all tab panes
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      
      // Remove active class from all buttons
      document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
      });

      // Show selected tab
      const selectedTab = document.getElementById(`${tabName}-tab`);
      if (selectedTab) {
        selectedTab.classList.add('active');
      }

      // Add active class to clicked button
      (event?.target as HTMLElement)?.classList.add('active');
    };

    // Setup review form
    this.setupReviewForm();
  }

  private setupReviewForm() {
    const form = document.getElementById('submit-review-form') as HTMLFormElement;
    if (!form) return;

    // Show/hide guest reviewer fields based on login status
    const guestInfo = document.getElementById('guest-reviewer-info');
    if (guestInfo) {
      if (store.getUser()) {
        guestInfo.style.display = 'none';
      } else {
        guestInfo.style.display = 'block';
      }
    }

    // Setup rating input
    const ratingInputs = form.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach((input, index) => {
      input.addEventListener('change', () => {
        const labels = form.querySelectorAll('.rating-input label');
        labels.forEach((label, labelIndex) => {
          if (labelIndex < 5 - index) {
            label.classList.add('selected');
          } else {
            label.classList.remove('selected');
          }
        });
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const rating = formData.get('rating') as string;
      const title = formData.get('title') as string;
      const comment = formData.get('comment') as string;
      const reviewerName = formData.get('reviewer_name') as string;
      const reviewerEmail = formData.get('reviewer_email') as string;
      
      // Validate form
      if (!rating) {
        this.showNotification('Bitte wählen Sie eine Bewertung aus.', 'error', 'Validierungsfehler');
        return;
      }
      
      if (!comment.trim()) {
        this.showNotification('Bitte geben Sie einen Kommentar ein.', 'error', 'Validierungsfehler');
        return;
      }

      if (!store.getUser() && (!reviewerName || !reviewerEmail)) {
        this.showNotification('Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse ein.', 'error', 'Validierungsfehler');
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      this.setButtonLoading(submitButton, true, 'Abschicken');

      try {
        const productId = this.getParams(window.location.pathname).id;
        const reviewData = {
          product_id: parseInt(productId),
          rating: parseInt(rating),
          title: title || undefined,
          comment: comment,
          reviewer_name: reviewerName || undefined,
          reviewer_email: reviewerEmail || undefined
        };

        await store.createReview(reviewData);
        this.showNotification('Vielen Dank für Ihre Bewertung!', 'success', 'Bewertung abgeschickt');
        
        // Reload reviews
        this.loadProductReviews(productId);
        form.reset();
        
        // Reset rating display
        const labels = form.querySelectorAll('.rating-input label');
        labels.forEach(label => label.classList.remove('selected'));
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Fehler beim Abschicken der Bewertung.';
        this.showNotification(errorMessage, 'error', 'Fehler');
      } finally {
        this.setButtonLoading(submitButton, false);
      }
    });
  }

  private generateReviews(): string {
    const reviews = [
      {
        name: 'Anna M.',
        rating: 5,
        comment: 'Wunderschönes Schmuckstück! Genau wie beschrieben und sehr hochwertig.',
        date: '15.09.2025'
      },
      {
        name: 'Sarah K.',
        rating: 5,
        comment: 'Bin total begeistert! Der Schmuck ist noch schöner als auf den Bildern.',
        date: '12.09.2025'
      },
      {
        name: 'Lisa W.',
        rating: 4,
        comment: 'Sehr schön, nur die Lieferung hat etwas länger gedauert.',
        date: '08.09.2025'
      }
    ];

    return reviews.map(review => `
      <div class="review">
        <div class="review-header">
          <span class="review-author">${review.name}</span>
          <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
          <span class="review-date">${review.date}</span>
        </div>
        <p class="review-comment">${review.comment}</p>
      </div>
    `).join('');
  }

  private generateRelatedProducts(category: string): string {
    const relatedProducts = this.getProducts()
      .filter(product => product.category === category)
      .slice(0, 4);

    return relatedProducts.map(product => `
      <div class="product-card" onclick="navigateToProduct('${product.id}')">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-content">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">${product.price}</div>
        </div>
      </div>
    `).join('');
  }

  private setupCart() {
    // Setup cart functionality
    window.updateCartQuantity = (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        window.removeFromCart(productId);
        return;
      }
      
      const cart = this.getCartItems();
      const itemIndex = cart.findIndex((item: any) => item.id === productId);
      
      if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        this.navigate('/cart'); // Refresh cart view
      }
    };

    window.removeFromCart = (productId: string) => {
      const cart = this.getCartItems();
      const filteredCart = cart.filter((item: any) => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      this.updateCartCount();
      this.navigate('/cart'); // Refresh cart view
    };

    window.goToCheckout = () => {
      this.navigate('/checkout');
    };
  }

  private getCartItems() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  private calculateCartTotal() {
    const items = this.getCartItems();
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price.replace('€', '').replace(',', '.'));
      return sum + (price * item.quantity);
    }, 0);

    const freeShippingThreshold = 39.90;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 4.90;
    const total = subtotal + shipping;
    const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

    return {
      subtotal: subtotal.toFixed(2).replace('.', ','),
      shipping: shipping,
      total: total.toFixed(2).replace('.', ','),
      freeShippingRemaining: freeShippingRemaining.toFixed(2).replace('.', ',')
    };
  }

  updateCartCount() {
    const cartItems = this.getCartItems();
    const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = totalItems.toString();
    }
  }

  // Global functions for cart management
  setupGlobalFunctions() {
    window.navigateToProduct = (productId: string) => {
      this.navigate(`/product/${productId}`);
    };

    window.addToCart = (productId: string) => {
      const product = this.getProductById(productId);
      if (!product) return;

      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

      const cart = this.getCartItems();
      const existingItem = cart.find((item: any) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      this.updateCartCount();
      
      // Show success message
      this.showNotification('Produkt wurde zum Warenkorb hinzugefügt!', 'success');
    };

    window.addToWishlist = (productId: string) => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        this.showNotification('Produkt wurde zur Wunschliste hinzugefügt!', 'success');
      } else {
        this.showNotification('Produkt ist bereits in der Wunschliste!', 'info');
      }
    };
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Additional render methods for other pages...
  private renderAuth(app: Element, path: string) {
    const isLogin = path === '/login';
    app.innerHTML = `
      <div class="container">
        <div class="auth-container">
          <div class="auth-form">
            <h2>${isLogin ? 'Anmelden' : 'Registrieren'}</h2>
            <form id="auth-form">
              ${!isLogin ? `
                <div class="form-group">
                  <label for="firstName">Vorname</label>
                  <input type="text" id="firstName" name="firstName" required>
                </div>
                <div class="form-group">
                  <label for="lastName">Nachname</label>
                  <input type="text" id="lastName" name="lastName" required>
                </div>
              ` : ''}
              <div class="form-group">
                <label for="email">E-Mail</label>
                <input type="email" id="email" name="email" required>
              </div>
              <div class="form-group">
                <label for="password">Passwort</label>
                <input type="password" id="password" name="password" required>
              </div>
              ${!isLogin ? `
                <div class="form-group">
                  <label for="confirmPassword">Passwort bestätigen</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="newsletter" name="newsletter">
                    Ich möchte den Newsletter erhalten
                  </label>
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="terms" name="terms" required>
                    Ich akzeptiere die <a href="/agb">AGB</a> und <a href="/datenschutz">Datenschutzbestimmungen</a>
                  </label>
                </div>
              ` : ''}
              <button type="submit" class="btn btn-primary">
                ${isLogin ? 'Anmelden' : 'Registrieren'}
              </button>
            </form>
            <div class="auth-links">
              ${isLogin ? `
                <p>Noch kein Konto? <a href="/register">Jetzt registrieren</a></p>
                <p><a href="/forgot-password">Passwort vergessen?</a></p>
              ` : `
                <p>Bereits ein Konto? <a href="/login">Jetzt anmelden</a></p>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderCategory(app: Element, path: string) {
    const category = path.split('/').pop() || '';
    const categoryNames: Record<string, string> = {
      'armbaender': 'Armbänder',
      'ketten': 'Ketten', 
      'fussketchen': 'Fußkettchen',
      'modeschmuck': 'Modeschmuck',
      'kleider': 'Kleider',
      'oberteile': 'Oberteile',
      'taschen': 'Taschen'
    };

    const categoryName = categoryNames[category] || 'Produkte';
    const products = this.getProducts().filter(product => product.category === category);

    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Home</a> > <a href="/products">Produkte</a> > <span>${categoryName}</span>
        </div>
        
        <div class="section-header">
          <h1 class="section-title">${categoryName}</h1>
          <p class="section-subtitle">Entdecke unsere ${categoryName.toLowerCase()}</p>
        </div>

          <div class="product-grid">
            ${products.map((product: any) => `
            <div class="product-card" onclick="navigateToProduct('${product.id}')">
              <img src="${product.image}" alt="${product.name}" class="product-image">
              <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price}</div>
                <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${product.id}')">
                  In den Warenkorb
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderWishlist(app: Element) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const wishlistProducts = this.getProducts().filter(product => wishlist.includes(product.id));

    app.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">Meine Wunschliste</h1>
        </div>

        ${wishlistProducts.length === 0 ? `
          <div class="empty-wishlist">
            <i class="fas fa-heart"></i>
            <h3>Deine Wunschliste ist leer</h3>
            <p>Füge deine Lieblings-Schmuckstücke zu deiner Wunschliste hinzu.</p>
            <a href="/products" class="btn btn-primary">Produkte entdecken</a>
          </div>
        ` : `
          <div class="product-grid">
            ${wishlistProducts.map((product: any) => `
              <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-content">
                  <h3 class="product-title">${product.name}</h3>
                  <div class="product-price">${product.price}</div>
                  <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                      In den Warenkorb
                    </button>
                    <button class="btn btn-secondary" onclick="removeFromWishlist('${product.id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    window.removeFromWishlist = (productId: string) => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const filteredWishlist = wishlist.filter((id: string) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(filteredWishlist));
      this.navigate('/wishlist'); // Refresh wishlist view
    };
  }

  private renderAbout(app: Element) {
    app.innerHTML = `
      <div class="container">
        <div class="about-page">
          <div class="section-header">
            <h1 class="section-title">Über mich</h1>
            <p class="section-subtitle">Die Geschichte hinter Casa Petrada</p>
          </div>

          <div class="about-content">
            <div class="about-text">
              <h2>Hallo, ich bin Petra!</h2>
              <p>Willkommen in meiner Welt des handgemachten Boho-Schmucks und der stilvollen Mode. Meine Reise begann vor vielen Jahren mit einer einfachen Leidenschaft für schöne, einzigartige Schmuckstücke.</p>
              
              <p>Nach acht wundervollen Jahren als Geschäftsführerin einer Boutique habe ich mich entschieden, meiner kreativen Leidenschaft zu folgen und Casa Petrada zu gründen. Hier entstehen einzigartige, handgearbeitete Schmuckstücke, die nicht nur schön sind, sondern auch eine Geschichte erzählen.</p>

              <h3>Meine Philosophie</h3>
              <p>Jedes Schmuckstück, das ich kreiere, ist ein Unikat. Ich verwende ausschließlich hochwertige Materialien wie Halbedelsteine, Glasperlen und natürliche Elemente. Mein Ziel ist es, Schmuck zu schaffen, der nicht nur schön aussieht, sondern auch eine besondere Energie und Ausstrahlung hat.</p>

              <h3>Handgemacht in Deutschland</h3>
              <p>Alle meine Schmuckstücke entstehen in liebevoller Handarbeit in meinem Atelier in Deutschland. Jedes Stück durchläuft einen sorgfältigen Entstehungsprozess, bei dem ich größten Wert auf Details und Qualität lege.</p>

              <div class="values">
                <div class="value-item">
                  <i class="fas fa-heart"></i>
                  <h4>Mit Liebe gemacht</h4>
                  <p>Jedes Schmuckstück wird mit größter Sorgfalt und Leidenschaft gefertigt.</p>
                </div>
                <div class="value-item">
                  <i class="fas fa-gem"></i>
                  <h4>Hochwertige Materialien</h4>
                  <p>Nur die besten Halbedelsteine und Materialien finden Verwendung.</p>
                </div>
                <div class="value-item">
                  <i class="fas fa-star"></i>
                  <h4>Einzigartige Designs</h4>
                  <p>Jedes Stück ist ein Unikat mit eigenem Charakter.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderContact(app: Element) {
    app.innerHTML = `
      <div class="container">
        <div class="contact-page">
          <div class="section-header">
            <h1 class="section-title">Kontakt</h1>
            <p class="section-subtitle">Ich freue mich auf deine Nachricht!</p>
          </div>

          <div class="contact-content">
            <div class="contact-info">
              <h3>Kontaktinformationen</h3>
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <div>
                  <strong>E-Mail</strong>
                  <p>petra@casa-petrada.de</p>
                </div>
              </div>
              
              <div class="contact-item">
                <i class="fas fa-clock"></i>
                <div>
                  <strong>Antwortzeit</strong>
                  <p>Innerhalb von 24 Stunden</p>
                </div>
              </div>

              <div class="contact-item">
                <i class="fas fa-shipping-fast"></i>
                <div>
                  <strong>Versand</strong>
                  <p>Versandkostenfrei ab 39,90 €</p>
                </div>
              </div>

              <div class="social-links">
                <h4>Folge mir</h4>
                <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
              </div>
            </div>

            <div class="contact-form">
              <h3>Nachricht senden</h3>
              <form id="contact-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Vorname *</label>
                    <input type="text" id="firstName" name="firstName" required>
                  </div>
                  <div class="form-group">
                    <label for="lastName">Nachname *</label>
                    <input type="text" id="lastName" name="lastName" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="email">E-Mail *</label>
                  <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                  <label for="subject">Betreff</label>
                  <select id="subject" name="subject">
                    <option value="">Bitte wählen...</option>
                    <option value="product">Frage zu einem Produkt</option>
                    <option value="order">Bestellung</option>
                    <option value="custom">Individuelle Anfrage</option>
                    <option value="other">Sonstiges</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="message">Nachricht *</label>
                  <textarea id="message" name="message" rows="6" required></textarea>
                </div>
                
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="privacy" name="privacy" required>
                    Ich habe die <a href="/datenschutz">Datenschutzbestimmungen</a> gelesen und akzeptiert.
                  </label>
                </div>
                
                <button type="submit" class="btn btn-primary">Nachricht senden</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderBlog(app: Element, path: string) {
    // Check if it's a specific blog post
    const pathParts = path.split('/');
    if (pathParts.length > 2 && pathParts[2]) {
      this.renderBlogPost(app, pathParts[2]);
      return;
    }

    // Render blog listing
    const blogPosts = this.getBlogPosts();
    
    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Home</a> > <span>Blog</span>
        </div>
        
        <div class="section-header">
          <h1 class="section-title">Blog</h1>
          <p class="section-subtitle">Geschichten, Tipps und Inspirationen rund um Boho-Schmuck</p>
        </div>

        <div class="blog-filters">
          <div class="filter-group">
            <label for="blog-category-filter">Kategorie:</label>
            <select id="blog-category-filter">
              <option value="">Alle Kategorien</option>
              <option value="styling">Styling</option>
              <option value="pflege">Pflege</option>
              <option value="inspiration">Inspiration</option>
              <option value="neuigkeiten">Neuigkeiten</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="blog-search">Suche:</label>
            <input type="text" id="blog-search" placeholder="Blog durchsuchen...">
          </div>
        </div>

        <div class="blog-grid">
          ${blogPosts.map(post => `
            <article class="blog-card" onclick="navigateToBlogPost('${post.slug}')">
              <div class="blog-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <div class="blog-category">${post.category}</div>
              </div>
              <div class="blog-content">
                <div class="blog-meta">
                  <span class="blog-date">${post.date}</span>
                  <span class="blog-read-time">${post.readTime} Min. Lesezeit</span>
                </div>
                <h2 class="blog-title">${post.title}</h2>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-tags">
                  ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
              </div>
            </article>
          `).join('')}
        </div>

        <div class="blog-pagination">
          <button class="btn btn-secondary" id="load-more-posts">Mehr Artikel laden</button>
        </div>
      </div>
    `;

    this.setupBlogFilters();
  }

  private renderBlogPost(app: Element, slug: string) {
    const post = this.getBlogPostBySlug(slug);
    
    if (!post) {
      this.render404();
      return;
    }

    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Home</a> > 
          <a href="/blog">Blog</a> > 
          <span>${post.title}</span>
        </div>

        <article class="blog-post">
          <header class="blog-post-header">
            <div class="blog-post-meta">
              <span class="blog-post-category">${post.category}</span>
              <span class="blog-post-date">${post.date}</span>
              <span class="blog-post-read-time">${post.readTime} Min. Lesezeit</span>
            </div>
            <h1 class="blog-post-title">${post.title}</h1>
            <p class="blog-post-excerpt">${post.excerpt}</p>
            <div class="blog-post-tags">
              ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
          </header>

          <div class="blog-post-image">
            <img src="${post.image}" alt="${post.title}">
          </div>

          <div class="blog-post-content">
            ${post.content}
          </div>

          <footer class="blog-post-footer">
            <div class="blog-post-share">
              <h4>Teilen:</h4>
              <div class="share-buttons">
                <a href="#" class="share-btn facebook" onclick="shareOnFacebook('${post.title}', '${window.location.href}')">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="share-btn twitter" onclick="shareOnTwitter('${post.title}', '${window.location.href}')">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="share-btn pinterest" onclick="shareOnPinterest('${post.title}', '${post.image}', '${window.location.href}')">
                  <i class="fab fa-pinterest"></i>
                </a>
              </div>
            </div>
            
            <div class="blog-post-navigation">
              <a href="/blog" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i>
                Zurück zum Blog
              </a>
            </div>
          </footer>
        </article>
      </div>
    `;
  }

  private renderNewsletterUnsubscribe(app: Element) {
    app.innerHTML = `
      <div class="container">
        <div class="newsletter-unsubscribe-page">
          <div class="section-header">
            <h1 class="section-title">Newsletter abmelden</h1>
            <p class="section-subtitle">Möchten Sie sich von unserem Newsletter abmelden? Geben Sie einfach Ihre E-Mail-Adresse ein.</p>
          </div>
          
          <div class="newsletter-unsubscribe-form">
            <form id="newsletter-unsubscribe-form">
              <div class="form-group">
                <label for="email">E-Mail-Adresse</label>
                <input type="email" id="email" name="email" required>
              </div>
              <button type="submit" class="btn btn-primary">
                <span class="btn-text">Newsletter abmelden</span>
              </button>
            </form>
          </div>
          
          <div class="newsletter-info">
            <h3>Warum abmelden?</h3>
            <p>Wir bedauern, dass Sie sich von unserem Newsletter abmelden möchten. Falls Sie Probleme mit unserem Newsletter haben, können Sie uns gerne kontaktieren.</p>
            <p>Sie können sich jederzeit wieder anmelden, indem Sie sich auf unserer Website für den Newsletter registrieren.</p>
          </div>
        </div>
      </div>
    `;
    
    this.setupNewsletterUnsubscribe();
  }

  private setupNewsletterUnsubscribe() {
    const form = document.getElementById('newsletter-unsubscribe-form') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      // Validate email
      const validator = new FormValidator();
      validator.addRule('email', validationRules.newsletter.email);
      
      const validation = validateFormSubmission(form, validator);
      if (!validation.isValid) {
        return;
      }
      
      this.setButtonLoading(submitButton, true, 'Abmelden');
      
      try {
        const success = await store.unsubscribeFromNewsletter(email);
        if (success) {
          this.showNotification('Sie wurden erfolgreich vom Newsletter abgemeldet.', 'success', 'Abmeldung erfolgreich');
          form.reset();
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Fehler bei der Abmeldung. Bitte versuchen Sie es erneut.';
        this.showNotification(errorMessage, 'error', 'Fehler');
      } finally {
        this.setButtonLoading(submitButton, false);
      }
    });
  }

  private renderLegal(app: Element, path: string) {
    const page = path.split('/').pop();
    let title = '';
    let content = '';

    switch (page) {
      case 'impressum':
        title = 'Impressum';
        content = `
          <div class="legal-section">
            <h2>Angaben gemäß § 5 TMG</h2>
            <div class="contact-info">
              <p><strong>Casa Petrada</strong><br>
              Petra Mustermann<br>
              Musterstraße 123<br>
              12345 Musterstadt<br>
              Deutschland</p>
            </div>

            <h3>Kontakt</h3>
            <div class="contact-details">
              <p><strong>E-Mail:</strong> petra@casa-petrada.de<br>
              <strong>Telefon:</strong> +49 (0) 123 456 789<br>
              <strong>Website:</strong> www.casa-petrada.de</p>
            </div>

            <h3>Umsatzsteuer-ID</h3>
            <p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br>
            <strong>Im Sinne der Kleinunternehmerregelung nach § 19 UStG wird keine MwSt. ausgewiesen.</strong></p>

            <h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
            <p>Petra Mustermann<br>
            Musterstraße 123<br>
            12345 Musterstadt</p>

            <h3>Haftung für Inhalte</h3>
            <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>

            <h3>Haftung für Links</h3>
            <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>

            <h3>Urheberrecht</h3>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </div>
        `;
        break;
      case 'datenschutz':
        title = 'Datenschutzerklärung';
        content = `
          <div class="legal-section">
            <h2>1. Datenschutz auf einen Blick</h2>
            <h3>Allgemeine Hinweise</h3>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

            <h3>Datenerfassung auf unserer Website</h3>
            <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>

            <h2>2. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3>Datenschutz</h3>
            <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

            <h3>Hinweis zur verantwortlichen Stelle</h3>
            <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
            <div class="contact-info">
              <p>Casa Petrada<br>
              Petra Mustermann<br>
              Musterstraße 123<br>
              12345 Musterstadt<br>
              Deutschland</p>
              <p>E-Mail: petra@casa-petrada.de</p>
            </div>

            <h2>3. Datenerfassung auf unserer Website</h2>
            <h3>Cookies</h3>
            <p>Unsere Internetseiten verwenden so genannte "Cookies". Cookies sind kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (dauerhafte Cookies) auf Ihrem Endgerät gespeichert.</p>

            <h3>Server-Log-Dateien</h3>
            <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
            <ul>
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>

            <h2>4. Newsletter</h2>
            <p>Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind.</p>

            <h2>5. Kontaktformular</h2>
            <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>

            <h2>6. Ihre Rechte</h2>
            <p>Sie haben folgende Rechte:</p>
            <ul>
              <li>Recht auf Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten</li>
              <li>Recht auf Berichtigung unrichtiger oder unvollständiger Daten</li>
              <li>Recht auf Löschung Ihrer bei uns gespeicherten Daten</li>
              <li>Recht auf Einschränkung der Datenverarbeitung</li>
              <li>Recht auf Datenübertragbarkeit</li>
              <li>Widerspruchsrecht gegen die Verarbeitung Ihrer Daten bei uns</li>
            </ul>

            <h2>7. Widerspruch gegen Werbe-E-Mails</h2>
            <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.</p>
          </div>
        `;
        break;
      case 'agb':
        title = 'Allgemeine Geschäftsbedingungen';
        content = `
          <div class="legal-section">
            <h2>§ 1 Geltungsbereich</h2>
            <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen Casa Petrada und dem Kunden. Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich zugestimmt.</p>

            <h2>§ 2 Vertragspartner</h2>
            <p>Vertragspartner des Kunden ist Casa Petrada, vertreten durch Petra Mustermann, Musterstraße 123, 12345 Musterstadt, Deutschland.</p>

            <h2>§ 3 Vertragsschluss</h2>
            <p>Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Vertragsangebot unsererseits dar, sondern sind nur unverbindliche Katalogdaten. Durch Anklicken des Buttons "In den Warenkorb" geben Sie eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab.</p>

            <h2>§ 4 Preise und Zahlungsbedingungen</h2>
            <p>Die angegebenen Preise enthalten die gesetzliche Umsatzsteuer und sonstige Preisbestandteile. Hinzu kommen etwaige Versandkosten, die vor Abschluss des Bestellvorgangs separat ausgewiesen werden.</p>
            <p>Die Zahlung erfolgt per Vorkasse, PayPal, Kreditkarte oder Klarna. Bei Zahlung per Vorkasse erfolgt die Lieferung nach Zahlungseingang.</p>

            <h2>§ 5 Lieferung und Versand</h2>
            <p>Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse. Die Lieferzeit beträgt 2-3 Werktage nach Zahlungseingang. Bei nicht verfügbaren Artikeln werden Sie umgehend informiert.</p>

            <h2>§ 6 Eigentumsvorbehalt</h2>
            <p>Die gelieferte Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>

            <h2>§ 7 Gewährleistung</h2>
            <p>Es gelten die gesetzlichen Gewährleistungsbestimmungen. Bei Mängeln der Ware haben Sie das Recht auf Nacherfüllung oder Minderung des Kaufpreises.</p>

            <h2>§ 8 Haftung</h2>
            <p>Wir haften nur für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit resultieren.</p>

            <h2>§ 9 Anwendbares Recht</h2>
            <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>

            <h2>§ 10 Gerichtsstand</h2>
            <p>Gerichtsstand ist Musterstadt, soweit der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.</p>
          </div>
        `;
        break;
      case 'widerruf':
        title = 'Widerrufsrecht';
        content = `
          <div class="legal-section">
            <h2>Widerrufsbelehrung</h2>
            <h3>Widerrufsrecht</h3>
            <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
            <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.</p>

            <h3>Widerrufsfolgen</h3>
            <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die daraus entstehen, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.</p>

            <h3>Widerrufsformular</h3>
            <div class="withdrawal-form">
              <p>Wenn Sie den Vertrag widerrufen möchten, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.</p>
              <p>An: Casa Petrada, Petra Mustermann, Musterstraße 123, 12345 Musterstadt, Deutschland, E-Mail: petra@casa-petrada.de</p>
              <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)</p>
              <p>Bestellt am (*)/erhalten am (*): _________________</p>
              <p>Name des/der Verbraucher(s): _________________</p>
              <p>Anschrift des/der Verbraucher(s): _________________</p>
              <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _________________</p>
              <p>Datum: _________________</p>
              <p>(*) Unzutreffendes streichen.</p>
            </div>

            <h3>Ausschluss des Widerrufsrechts</h3>
            <p>Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind.</p>
          </div>
        `;
        break;
      case 'versand':
        title = 'Versand und Zahlungsmöglichkeiten';
        content = `
          <div class="legal-section">
            <h2>Versandkosten</h2>
            <p>Innerhalb Deutschlands berechnen wir folgende Versandkosten:</p>
            <ul>
              <li>Standardversand: 4,90 €</li>
              <li>Expressversand: 9,90 € (Lieferung am nächsten Werktag)</li>
              <li>Versandkostenfrei ab einem Bestellwert von 39,90 €</li>
            </ul>

            <h3>Versandkosten ins Ausland</h3>
            <ul>
              <li>Österreich: 8,90 €</li>
              <li>Schweiz: 12,90 €</li>
              <li>EU-Länder: 9,90 €</li>
              <li>Nicht-EU-Länder: 19,90 €</li>
            </ul>

            <h2>Lieferzeiten</h2>
            <p>Die Lieferung erfolgt innerhalb von 2-3 Werktagen nach Zahlungseingang. Bei Expressversand erfolgt die Lieferung am nächsten Werktag.</p>
            <p>Lieferzeiten ins Ausland:</p>
            <ul>
              <li>Österreich: 3-4 Werktage</li>
              <li>Schweiz: 4-5 Werktage</li>
              <li>EU-Länder: 5-7 Werktage</li>
              <li>Nicht-EU-Länder: 7-14 Werktage</li>
            </ul>

            <h2>Zahlungsmöglichkeiten</h2>
            <h3>Sofortige Zahlung</h3>
            <ul>
              <li>PayPal</li>
              <li>Kreditkarte (Visa, Mastercard, American Express)</li>
              <li>Klarna (Sofort, Ratenkauf)</li>
              <li>Apple Pay</li>
              <li>Google Pay</li>
              <li>SEPA-Lastschrift</li>
            </ul>

            <h3>Kauf auf Rechnung</h3>
            <ul>
              <li>Klarna (Rechnung mit 14 Tagen Zahlungsziel)</li>
              <li>PayPal (Rechnung)</li>
            </ul>

            <h2>Versandpartner</h2>
            <p>Wir versenden mit folgenden Partnern:</p>
            <ul>
              <li>DHL (Standardversand)</li>
              <li>DHL Express (Expressversand)</li>
              <li>UPS (International)</li>
            </ul>

            <h2>Verpackung</h2>
            <p>Alle Artikel werden sorgfältig und umweltfreundlich verpackt. Wir verwenden recycelbare Materialien und achten auf eine nachhaltige Verpackung.</p>

            <h2>Sendungsverfolgung</h2>
            <p>Nach Versand erhalten Sie eine E-Mail mit der Sendungsverfolgungsnummer, mit der Sie den Status Ihrer Sendung online verfolgen können.</p>
          </div>
        `;
        break;
      case 'newsletter-unsubscribe':
        this.renderNewsletterUnsubscribe(app);
        return;
    }

    app.innerHTML = `
      <div class="container">
        <div class="legal-page">
          <div class="section-header">
            <h1 class="section-title">${title}</h1>
          </div>
          <div class="legal-content">
            ${content}
          </div>
        </div>
      </div>
    `;
  }

  private renderAccount(app: Element) {
    const user = store.getState().user;
    const orders = store.getUserOrders();
    const wishlistItems = store.getWishlistItems();
    
    if (!user) {
      app.innerHTML = `
        <div class="container">
          <div class="login-required">
            <i class="fas fa-user-lock"></i>
            <h2>Anmeldung erforderlich</h2>
            <p>Bitte melden Sie sich an, um Ihr Konto zu verwalten.</p>
            <div class="login-actions">
              <a href="/login" class="btn btn-primary">Anmelden</a>
              <a href="/register" class="btn btn-secondary">Registrieren</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    app.innerHTML = `
      <div class="container">
        <div class="account-page">
          <div class="section-header">
            <h1 class="section-title">Mein Konto</h1>
            <p class="section-subtitle">Willkommen zurück, ${user.firstName}!</p>
          </div>

          <div class="account-content">
            <div class="account-sidebar">
              <nav class="account-nav">
                <a href="#" class="account-nav-item active" onclick="showAccountSection('overview')">
                  <i class="fas fa-home"></i>
                  Übersicht
                </a>
                <a href="#" class="account-nav-item" onclick="showAccountSection('orders')">
                  <i class="fas fa-shopping-bag"></i>
                  Bestellungen
                  <span class="nav-badge">${orders.length}</span>
                </a>
                <a href="#" class="account-nav-item" onclick="showAccountSection('wishlist')">
                  <i class="fas fa-heart"></i>
                  Wunschliste
                  <span class="nav-badge">${wishlistItems.length}</span>
                </a>
                <a href="#" class="account-nav-item" onclick="showAccountSection('profile')">
                  <i class="fas fa-user"></i>
                  Profil
                </a>
                <a href="#" class="account-nav-item" onclick="showAccountSection('addresses')">
                  <i class="fas fa-map-marker-alt"></i>
                  Adressen
                </a>
                <a href="#" class="account-nav-item" onclick="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  Abmelden
                </a>
              </nav>
            </div>

            <div class="account-main">
              <div id="overview-section" class="account-section active">
                <h2>Konto-Übersicht</h2>
                <div class="account-stats">
                  <div class="stat-card">
                    <div class="stat-icon">
                      <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div class="stat-content">
                      <h3>Bestellungen</h3>
                      <span class="stat-number">${orders.length}</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <i class="fas fa-heart"></i>
                    </div>
                    <div class="stat-content">
                      <h3>Wunschliste</h3>
                      <span class="stat-number">${wishlistItems.length}</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-content">
                      <h3>Treuepunkte</h3>
                      <span class="stat-number">${orders.length * 10}</span>
                    </div>
                  </div>
                </div>
                
                <div class="recent-orders">
                  <h3>Letzte Bestellungen</h3>
                  ${orders.length > 0 ? `
                    <div class="order-list">
                      ${orders.slice(0, 3).map(order => `
                        <div class="order-item">
                          <div class="order-info">
                            <span class="order-number">#${order.orderNumber || order.id}</span>
                            <span class="order-date">${new Date(order.createdAt).toLocaleDateString('de-DE')}</span>
                          </div>
                          <div class="order-details">
                            <span class="order-status ${order.status}">${this.getOrderStatusText(order.status)}</span>
                            <span class="order-total">${order.total} €</span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                    <a href="#" class="btn btn-secondary" onclick="showAccountSection('orders')">Alle Bestellungen anzeigen</a>
                  ` : `
                    <div class="empty-state">
                      <i class="fas fa-shopping-bag"></i>
                      <p>Sie haben noch keine Bestellungen.</p>
                      <a href="/products" class="btn btn-primary">Jetzt einkaufen</a>
                    </div>
                  `}
                </div>
              </div>

              <div id="orders-section" class="account-section">
                <h2>Meine Bestellungen</h2>
                ${orders.length > 0 ? `
                  <div class="orders-list">
                    ${orders.map(order => `
                      <div class="order-card">
                        <div class="order-header">
                          <div class="order-info">
                            <h3>Bestellung #${order.orderNumber || order.id}</h3>
                            <p class="order-date">Bestellt am ${new Date(order.createdAt).toLocaleDateString('de-DE')}</p>
                          </div>
                          <div class="order-status">
                            <span class="status-badge ${order.status}">${this.getOrderStatusText(order.status)}</span>
                            <span class="order-total">${order.total} €</span>
                          </div>
                        </div>
                        <div class="order-items">
                          ${order.items ? order.items.map(item => `
                            <div class="order-item">
                              <img src="${item.image}" alt="${item.name}" class="item-image">
                              <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>Anzahl: ${item.quantity}</p>
                              </div>
                              <span class="item-price">${item.price} €</span>
                            </div>
                          `).join('') : ''}
                        </div>
                        <div class="order-actions">
                          <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')">Details anzeigen</button>
                          ${order.status === 'delivered' ? '<button class="btn btn-primary" onclick="reorder(\'' + order.id + '\')">Erneut bestellen</button>' : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Keine Bestellungen gefunden</h3>
                    <p>Sie haben noch keine Bestellungen aufgegeben.</p>
                    <a href="/products" class="btn btn-primary">Jetzt einkaufen</a>
                  </div>
                `}
              </div>

              <div id="wishlist-section" class="account-section">
                <h2>Meine Wunschliste</h2>
                ${wishlistItems.length > 0 ? `
                  <div class="wishlist-grid">
                    ${wishlistItems.map(item => `
                      <div class="wishlist-item">
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-info">
                          <h3>${item.name}</h3>
                          <p class="item-price">${item.price}</p>
                        </div>
                        <div class="item-actions">
                          <button class="btn btn-primary" onclick="addToCart('${item.id}')">
                            <i class="fas fa-shopping-bag"></i>
                            In den Warenkorb
                          </button>
                          <button class="btn btn-secondary" onclick="removeFromWishlist('${item.id}')">
                            <i class="fas fa-heart-broken"></i>
                            Entfernen
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>Wunschliste ist leer</h3>
                    <p>Fügen Sie Produkte zu Ihrer Wunschliste hinzu, um sie hier zu sehen.</p>
                    <a href="/products" class="btn btn-primary">Produkte entdecken</a>
                  </div>
                `}
              </div>

              <div id="profile-section" class="account-section">
                <h2>Profil bearbeiten</h2>
                <form class="profile-form" id="profile-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="profileFirstName">Vorname *</label>
                      <input type="text" id="profileFirstName" name="firstName" value="${user.firstName}" required>
                    </div>
                    <div class="form-group">
                      <label for="profileLastName">Nachname *</label>
                      <input type="text" id="profileLastName" name="lastName" value="${user.lastName}" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="profileEmail">E-Mail *</label>
                    <input type="email" id="profileEmail" name="email" value="${user.email}" required>
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="newsletter" name="newsletter" ${user.newsletterSubscribed ? 'checked' : ''}>
                      Newsletter abonnieren
                    </label>
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Änderungen speichern</button>
                    <button type="button" class="btn btn-secondary" onclick="changePassword()">Passwort ändern</button>
                  </div>
                </form>
              </div>

              <div id="addresses-section" class="account-section">
                <h2>Meine Adressen</h2>
                <div class="addresses-list">
                  <div class="address-card">
                    <h3>Standard-Lieferadresse</h3>
                    <p>Musterstraße 123<br>12345 Musterstadt<br>Deutschland</p>
                    <div class="address-actions">
                      <button class="btn btn-secondary">Bearbeiten</button>
                      <button class="btn btn-danger">Löschen</button>
                    </div>
                  </div>
                  <button class="btn btn-primary" onclick="addNewAddress()">
                    <i class="fas fa-plus"></i>
                    Neue Adresse hinzufügen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupAccountPage();
  }

  private setupAccountPage() {
    // Account section navigation
    window.showAccountSection = (sectionName: string) => {
      // Hide all sections
      document.querySelectorAll('.account-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Remove active class from nav items
      document.querySelectorAll('.account-nav-item').forEach(item => {
        item.classList.remove('active');
      });

      // Show selected section
      const selectedSection = document.getElementById(`${sectionName}-section`);
      if (selectedSection) {
        selectedSection.classList.add('active');
      }

      // Add active class to clicked nav item
      (event?.target as HTMLElement)?.classList.add('active');
    };

    // Profile form submission
    const profileForm = document.getElementById('profile-form') as HTMLFormElement;
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        
        try {
          // Update user profile
          const updatedUser = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            newsletterSubscribed: formData.has('newsletter')
          };
          
          // Update in store
          store.setState({
            user: { ...store.getState().user, ...updatedUser }
          });
          
          this.showNotification('Profil erfolgreich aktualisiert!', 'success');
        } catch (error) {
          this.showNotification('Fehler beim Aktualisieren des Profils.', 'error');
        }
      });
    }

    // Global functions
    window.logout = async () => {
      await store.logout();
      this.navigate('/');
      this.showNotification('Sie wurden erfolgreich abgemeldet.', 'success');
    };

    window.viewOrderDetails = (orderId: string) => {
      this.showNotification('Bestelldetails werden geladen...', 'info');
      // TODO: Implement order details modal/page
    };

    window.reorder = (orderId: string) => {
      this.showNotification('Bestellung wird zum Warenkorb hinzugefügt...', 'info');
      // TODO: Implement reorder functionality
    };

    window.removeFromWishlist = (productId: string) => {
      store.removeFromWishlist(productId);
      this.showNotification('Produkt aus Wunschliste entfernt.', 'success');
      // Refresh the account page
      this.renderAccount(document.getElementById('app')!);
    };

    window.changePassword = () => {
      this.showNotification('Passwort-Änderung wird implementiert...', 'info');
      // TODO: Implement password change modal
    };

    window.addNewAddress = () => {
      this.showNotification('Neue Adresse hinzufügen wird implementiert...', 'info');
      // TODO: Implement add address modal
    };
  }

  private getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Ausstehend',
      'processing': 'In Bearbeitung',
      'shipped': 'Versandt',
      'delivered': 'Geliefert',
      'cancelled': 'Storniert'
    };
    return statusMap[status] || status;
  }

  private renderCheckoutPage(app: Element) {
    const cartItems = this.getCartItems();
    const total = this.calculateCartTotal();

    if (cartItems.length === 0) {
      app.innerHTML = `
        <div class="container">
          <div class="empty-cart">
            <i class="fas fa-shopping-bag"></i>
            <h3>Dein Warenkorb ist leer</h3>
            <p>Du musst Artikel in deinen Warenkorb legen, bevor du zur Kasse gehen kannst.</p>
            <a href="/products" class="btn btn-primary">Produkte entdecken</a>
          </div>
        </div>
      `;
      return;
    }

    app.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h1 class="section-title">Kasse</h1>
          <p class="section-subtitle">Vervollständige deine Bestellung</p>
        </div>
        
        <div class="checkout-simple">
          <div class="checkout-form-container">
            <h2>Versandinformationen</h2>
            <form id="simple-checkout-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="checkoutFirstName">Vorname *</label>
                  <input type="text" id="checkoutFirstName" name="firstName" required>
                </div>
                <div class="form-group">
                  <label for="checkoutLastName">Nachname *</label>
                  <input type="text" id="checkoutLastName" name="lastName" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="checkoutEmail">E-Mail *</label>
                <input type="email" id="checkoutEmail" name="email" required>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="checkoutStreet">Straße *</label>
                  <input type="text" id="checkoutStreet" name="street" required>
                </div>
                <div class="form-group">
                  <label for="checkoutHouseNumber">Hausnummer *</label>
                  <input type="text" id="checkoutHouseNumber" name="houseNumber" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="checkoutPostalCode">PLZ *</label>
                  <input type="text" id="checkoutPostalCode" name="postalCode" required>
                </div>
                <div class="form-group">
                  <label for="checkoutCity">Stadt *</label>
                  <input type="text" id="checkoutCity" name="city" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="checkoutPayment">Zahlungsmethode *</label>
                <select id="checkoutPayment" name="paymentMethod" required onchange="showPaymentDetails(this.value)">
                  <option value="">Zahlungsmethode wählen</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Kreditkarte (Visa, Mastercard, American Express)</option>
                  <option value="klarna">Klarna - Kauf auf Rechnung</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
                  <option value="sepa">SEPA-Lastschrift</option>
                </select>
              </div>
              
              <div id="payment-details" class="payment-details" style="display: none;">
                <div id="credit-card-details" class="payment-method-details" style="display: none;">
                  <h4>Kreditkartendaten</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="cardNumber">Kartennummer *</label>
                      <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="cardExpiry">Ablaufdatum *</label>
                      <input type="text" id="cardExpiry" name="cardExpiry" placeholder="MM/JJ" maxlength="5">
                    </div>
                    <div class="form-group">
                      <label for="cardCvv">CVV *</label>
                      <input type="text" id="cardCvv" name="cardCvv" placeholder="123" maxlength="4">
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="cardName">Name auf der Karte *</label>
                    <input type="text" id="cardName" name="cardName" placeholder="Max Mustermann">
                  </div>
                </div>
                
                <div id="sepa-details" class="payment-method-details" style="display: none;">
                  <h4>SEPA-Lastschrift</h4>
                  <div class="form-group">
                    <label for="iban">IBAN *</label>
                    <input type="text" id="iban" name="iban" placeholder="DE89 3704 0044 0532 0130 00">
                  </div>
                  <div class="form-group">
                    <label for="bic">BIC (optional)</label>
                    <input type="text" id="bic" name="bic" placeholder="COBADEFFXXX">
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="sepa-mandate" name="sepaMandate" required>
                      Ich erteile ein SEPA-Lastschriftmandat und bestätige, dass die Bankverbindung korrekt ist. *
                    </label>
                  </div>
                </div>
                
                <div id="klarna-details" class="payment-method-details" style="display: none;">
                  <h4>Klarna - Kauf auf Rechnung</h4>
                  <div class="klarna-info">
                    <p>Mit Klarna können Sie bequem auf Rechnung kaufen. Sie erhalten Ihre Ware und zahlen innerhalb von 14 Tagen.</p>
                    <div class="klarna-benefits">
                      <div class="benefit">
                        <i class="fas fa-shield-alt"></i>
                        <span>Sicher & geschützt</span>
                      </div>
                      <div class="benefit">
                        <i class="fas fa-clock"></i>
                        <span>14 Tage Zahlungsziel</span>
                      </div>
                      <div class="benefit">
                        <i class="fas fa-undo"></i>
                        <span>Einfache Rückgabe</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="paypal-details" class="payment-method-details" style="display: none;">
                  <h4>PayPal</h4>
                  <div class="paypal-info">
                    <p>Sie werden zu PayPal weitergeleitet, um Ihre Zahlung sicher abzuschließen.</p>
                    <div class="paypal-logo">
                      <i class="fab fa-paypal"></i>
                    </div>
                  </div>
                </div>
                
                <div id="mobile-pay-details" class="payment-method-details" style="display: none;">
                  <h4>Mobile Payment</h4>
                  <div class="mobile-pay-info">
                    <p>Zahlen Sie schnell und sicher mit Ihrem Smartphone.</p>
                    <div class="mobile-pay-logos">
                      <div class="mobile-pay-logo">
                        <i class="fab fa-apple-pay"></i>
                        <span>Apple Pay</span>
                      </div>
                      <div class="mobile-pay-logo">
                        <i class="fab fa-google-pay"></i>
                        <span>Google Pay</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="checkoutTerms" name="terms" required>
                  Ich akzeptiere die <a href="/agb">AGB</a> und <a href="/datenschutz">Datenschutzbestimmungen</a> *
                </label>
              </div>
              
              <button type="submit" class="btn btn-primary checkout-submit">
                <i class="fas fa-lock"></i>
                Kostenpflichtig bestellen (${total.total} €)
              </button>
            </form>
          </div>
          
          <div class="checkout-summary">
            <h3>Bestellübersicht</h3>
            <div class="summary-items">
              ${cartItems.map((item: any) => `
                <div class="summary-item">
                  <img src="${item.image}" alt="${item.name}">
                  <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">Qty: ${item.quantity}</span>
                  </div>
                  <span class="item-total">${(parseFloat(item.price.replace('€', '').replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')} €</span>
                </div>
              `).join('')}
            </div>
            
            <div class="summary-totals">
              <div class="summary-line">
                <span>Zwischensumme:</span>
                <span>${total.subtotal} €</span>
              </div>
              <div class="summary-line">
                <span>Versand:</span>
                <span>${total.shipping === 0 ? 'Kostenlos' : total.shipping + ' €'}</span>
              </div>
              <div class="summary-line total">
                <span>Gesamt:</span>
                <span>${total.total} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup payment details display
    window.showPaymentDetails = (paymentMethod: string) => {
      const paymentDetails = document.getElementById('payment-details');
      const allMethodDetails = document.querySelectorAll('.payment-method-details');
      
      // Hide all payment method details
      allMethodDetails.forEach(detail => {
        (detail as HTMLElement).style.display = 'none';
      });
      
      if (paymentMethod) {
        paymentDetails!.style.display = 'block';
        
        switch (paymentMethod) {
          case 'stripe':
            document.getElementById('credit-card-details')!.style.display = 'block';
            break;
          case 'sepa':
            document.getElementById('sepa-details')!.style.display = 'block';
            break;
          case 'klarna':
            document.getElementById('klarna-details')!.style.display = 'block';
            break;
          case 'paypal':
            document.getElementById('paypal-details')!.style.display = 'block';
            break;
          case 'apple_pay':
          case 'google_pay':
            document.getElementById('mobile-pay-details')!.style.display = 'block';
            break;
        }
      } else {
        paymentDetails!.style.display = 'none';
      }
    };

    // Setup form submission
    document.getElementById('simple-checkout-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target as HTMLFormElement);
      const orderData = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        street: formData.get('street') as string,
        houseNumber: formData.get('houseNumber') as string,
        postalCode: formData.get('postalCode') as string,
        city: formData.get('city') as string,
        paymentMethod: formData.get('paymentMethod') as string,
        items: cartItems,
        total: total.total
      };

      // Process order via API
      const submitButton = document.querySelector('.checkout-submit') as HTMLButtonElement;
      
        try {
          submitButton.disabled = true;
          submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bestellung wird verarbeitet...';

          // Simulate payment processing
          const paymentSuccess = await this.simulatePaymentProcessing(orderData.paymentMethod, orderData);
          
          if (!paymentSuccess) {
            throw new Error('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
          }

          // Prepare order data for API
          const apiOrderData = {
            items: cartItems.map(item => ({
              product_id: parseInt(item.id.replace(/\D/g, '')) || 1, // Extract numeric ID
              quantity: item.quantity,
              price: parseFloat(item.price.replace('€', '').replace(',', '.'))
            })),
            total_amount: parseFloat(total.total.replace(',', '.')),
            shipping_address: {
              firstName: orderData.firstName,
              lastName: orderData.lastName,
              email: orderData.email,
              street: orderData.street,
              houseNumber: orderData.houseNumber,
              postalCode: orderData.postalCode,
              city: orderData.city,
              country: 'Deutschland'
            },
            payment_method: orderData.paymentMethod,
            notes: ''
          };

          // Create order via API
          const order = await store.createOrder(apiOrderData);
        
        // Clear cart
        store.setState({ cart: [] });
        this.updateCartCount();
        
        // Show success page
        app.innerHTML = `
          <div class="container">
            <div class="order-success">
              <div class="success-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h1>Vielen Dank für Ihre Bestellung!</h1>
              <p class="order-number">Ihre Bestellnummer: <strong>${order.order_number}</strong></p>
              
              <div class="success-details">
                <div class="detail-card">
                  <i class="fas fa-envelope"></i>
                  <h3>Bestätigung per E-Mail</h3>
                  <p>Sie erhalten in Kürze eine Bestätigungsmail mit allen Details.</p>
                </div>
                
                <div class="detail-card">
                  <i class="fas fa-shipping-fast"></i>
                  <h3>Versand</h3>
                  <p>Ihr Paket wird innerhalb von 2-3 Werktagen versandt.</p>
                </div>
                
                <div class="detail-card">
                  <i class="fas fa-headset"></i>
                  <h3>Fragen?</h3>
                  <p>Bei Fragen kontaktieren Sie uns: petra@casa-petrada.de</p>
                </div>
              </div>

              <div class="success-actions">
                <a href="/products" class="btn btn-primary">Weiter einkaufen</a>
                <a href="/account" class="btn btn-secondary">Bestellstatus verfolgen</a>
              </div>
            </div>
          </div>
        `;
        
      } catch (error) {
        console.error('Order creation failed:', error);
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-lock"></i> Kostenpflichtig bestellen';
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
          <div class="alert alert-error">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Bestellung fehlgeschlagen!</strong> Bitte versuchen Sie es erneut oder kontaktieren Sie uns.
          </div>
        `;
        
        const form = document.getElementById('simple-checkout-form');
        form?.parentNode?.insertBefore(errorDiv, form);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
          errorDiv.remove();
        }, 5000);
      }
    });
  }

  private async renderAdminPage(app: Element) {
    // Simple admin check
    const user = store.getUser();
    if (!user || !user.is_admin) {
      this.navigate('/login');
      return;
    }

    app.innerHTML = `
      <div class="container">
        <div class="admin-dashboard">
          <div class="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Casa Petrada Verwaltung</p>
            <div class="admin-nav">
              <button class="nav-btn active" onclick="showAdminSection('overview')">Übersicht</button>
              <button class="nav-btn" onclick="showAdminSection('orders')">Bestellungen</button>
              <button class="nav-btn" onclick="showAdminSection('products')">Produkte</button>
              <button class="nav-btn" onclick="showAdminSection('customers')">Kunden</button>
              <button class="nav-btn" onclick="showAdminSection('analytics')">Analytics</button>
            </div>
          </div>
          
          <div class="admin-content">
            <div id="admin-overview" class="admin-section active">
              <div class="stats-grid" id="admin-stats">
                <div class="loading-skeleton">
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                </div>
              </div>
              
              <div class="recent-orders-section">
                <h3>Neueste Bestellungen</h3>
                <div id="recent-orders-list">
                  <div class="loading-skeleton">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="admin-orders" class="admin-section">
              <h3>Bestellungen verwalten</h3>
              <div class="orders-filters">
                <select id="order-status-filter">
                  <option value="">Alle Status</option>
                  <option value="pending">Ausstehend</option>
                  <option value="processing">In Bearbeitung</option>
                  <option value="shipped">Versandt</option>
                  <option value="delivered">Geliefert</option>
                  <option value="cancelled">Storniert</option>
                </select>
                <input type="text" id="order-search" placeholder="Bestellnummer oder Kunde suchen...">
              </div>
              <div id="orders-list" class="orders-list">
                <div class="loading-skeleton">
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                </div>
              </div>
            </div>
            
            <div id="admin-products" class="admin-section">
              <h3>Produkte verwalten</h3>
              <div class="products-actions">
                <button class="btn btn-primary" onclick="addNewProduct()">
                  <i class="fas fa-plus"></i>
                  Neues Produkt
                </button>
                <div class="products-filters">
                  <select id="product-category-filter">
                    <option value="">Alle Kategorien</option>
                    <option value="armbaender">Armbänder</option>
                    <option value="ketten">Ketten</option>
                    <option value="fussketchen">Fußkettchen</option>
                    <option value="modeschmuck">Modeschmuck</option>
                    <option value="kleider">Kleider</option>
                    <option value="oberteile">Oberteile</option>
                    <option value="taschen">Taschen</option>
                  </select>
                  <input type="text" id="product-search" placeholder="Produkt suchen...">
                </div>
              </div>
              <div id="products-list" class="products-list">
                <div class="loading-skeleton">
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                </div>
              </div>
            </div>
            
            <div id="admin-customers" class="admin-section">
              <h3>Kunden verwalten</h3>
              <div class="customers-filters">
                <input type="text" id="customer-search" placeholder="Kunde suchen...">
                <select id="customer-filter">
                  <option value="">Alle Kunden</option>
                  <option value="newsletter">Newsletter-Abonnenten</option>
                  <option value="active">Aktive Kunden</option>
                </select>
              </div>
              <div id="customers-list" class="customers-list">
                <div class="loading-skeleton">
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                </div>
              </div>
            </div>
            
            <div id="admin-analytics" class="admin-section">
              <h3>Analytics & Berichte</h3>
              <div class="analytics-filters">
                <select id="analytics-range">
                  <option value="week">Letzte Woche</option>
                  <option value="month" selected>Letzter Monat</option>
                  <option value="quarter">Letztes Quartal</option>
                  <option value="year">Letztes Jahr</option>
                </select>
                <button class="btn btn-secondary" onclick="exportAnalytics()">
                  <i class="fas fa-download"></i>
                  Exportieren
                </button>
              </div>
              <div id="analytics-content" class="analytics-content">
                <div class="loading-skeleton">
                  <div class="skeleton-card"></div>
                  <div class="skeleton-card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.setupAdminPage();
    this.loadAdminData();
  }

  private setupAdminPage() {
    // Setup admin navigation
    window.showAdminSection = (sectionName: string) => {
      // Hide all sections
      document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Remove active class from all nav buttons
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Show selected section
      const selectedSection = document.getElementById(`admin-${sectionName}`);
      if (selectedSection) {
        selectedSection.classList.add('active');
      }
      
      // Add active class to clicked button
      (event?.target as HTMLElement)?.classList.add('active');
      
      // Load section data
      this.loadAdminSectionData(sectionName);
    };

    // Setup order status updates
    window.updateOrderStatus = async (orderId: number, newStatus: string) => {
      try {
        await store.updateOrderStatus(orderId, newStatus);
        this.showNotification('Bestellstatus erfolgreich aktualisiert', 'success', 'Status geändert');
        this.loadAdminSectionData('orders');
      } catch (error) {
        this.showNotification('Fehler beim Aktualisieren des Status', 'error', 'Fehler');
      }
    };

    // Setup product featured toggle
    window.toggleProductFeatured = async (productId: number) => {
      try {
        await store.toggleProductFeatured(productId);
        this.showNotification('Produkt-Status erfolgreich geändert', 'success', 'Status geändert');
        this.loadAdminSectionData('products');
      } catch (error) {
        this.showNotification('Fehler beim Ändern des Produkt-Status', 'error', 'Fehler');
      }
    };
  }

  private async loadAdminData() {
    try {
      const [stats, recentOrders] = await Promise.all([
        store.getAdminStats(),
        store.getRecentOrders(10)
      ]);
      
      this.renderAdminStats(stats);
      this.renderRecentOrders(recentOrders.orders || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      this.showNotification('Fehler beim Laden der Admin-Daten', 'error', 'Fehler');
    }
  }

  private async loadAdminSectionData(section: string) {
    try {
      switch (section) {
        case 'orders':
          const orders = await store.getRecentOrders(50);
          this.renderOrdersList(orders.orders || []);
          break;
        case 'customers':
          const customers = await store.getCustomers();
          this.renderCustomersList(customers.customers || []);
          break;
        case 'analytics':
          const analytics = await store.getAnalytics();
          this.renderAnalytics(analytics);
          break;
        case 'products':
          this.renderProductsList(store.getProducts());
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${section} data:`, error);
      this.showNotification(`Fehler beim Laden der ${section} Daten`, 'error', 'Fehler');
    }
  }

  private renderAdminStats(stats: any) {
    const statsElement = document.getElementById('admin-stats');
    if (!statsElement) return;

    statsElement.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-euro-sign"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">${stats.overview.total_revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
          <div class="stat-label">Gesamtumsatz</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">${stats.overview.total_orders}</div>
          <div class="stat-label">Bestellungen</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-gem"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">${stats.overview.total_products}</div>
          <div class="stat-label">Produkte</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">${stats.overview.total_customers}</div>
          <div class="stat-label">Kunden</div>
        </div>
      </div>
    `;
  }

  private renderRecentOrders(orders: any[]) {
    const ordersElement = document.getElementById('recent-orders-list');
    if (!ordersElement) return;

    if (orders.length === 0) {
      ordersElement.innerHTML = '<p>Keine Bestellungen vorhanden.</p>';
      return;
    }

    ordersElement.innerHTML = orders.map(order => `
      <div class="order-item">
        <div class="order-info">
          <div class="order-number">#${order.order_number}</div>
          <div class="order-customer">${order.customer_name}</div>
          <div class="order-date">${new Date(order.created_at).toLocaleDateString('de-DE')}</div>
        </div>
        <div class="order-amount">${order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        <div class="order-status">
          <span class="status-badge status-${order.status}">${this.getOrderStatusText(order.status)}</span>
        </div>
      </div>
    `).join('');
  }

  private renderOrdersList(orders: any[]) {
    const ordersElement = document.getElementById('orders-list');
    if (!ordersElement) return;

    if (orders.length === 0) {
      ordersElement.innerHTML = '<p>Keine Bestellungen vorhanden.</p>';
      return;
    }

    ordersElement.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-number">#${order.order_number}</div>
          <div class="order-date">${new Date(order.created_at).toLocaleDateString('de-DE')}</div>
        </div>
        <div class="order-details">
          <div class="order-customer">
            <strong>${order.customer_name}</strong><br>
            ${order.customer_email}
          </div>
          <div class="order-amount">
            ${order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <div class="order-status">
            <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-select">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Ausstehend</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>In Bearbeitung</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Versandt</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Geliefert</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Storniert</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');
  }

  private renderCustomersList(customers: any[]) {
    const customersElement = document.getElementById('customers-list');
    if (!customersElement) return;

    if (customers.length === 0) {
      customersElement.innerHTML = '<p>Keine Kunden vorhanden.</p>';
      return;
    }

    customersElement.innerHTML = customers.map(customer => `
      <div class="customer-card">
        <div class="customer-info">
          <div class="customer-name">${customer.first_name} ${customer.last_name}</div>
          <div class="customer-email">${customer.email}</div>
          <div class="customer-date">Registriert: ${new Date(customer.created_at).toLocaleDateString('de-DE')}</div>
        </div>
        <div class="customer-status">
          <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
            ${customer.is_active ? 'Aktiv' : 'Inaktiv'}
          </span>
          ${customer.newsletter_subscribed ? '<span class="newsletter-badge">Newsletter</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  private renderProductsList(products: any[]) {
    const productsElement = document.getElementById('products-list');
    if (!productsElement) return;

    productsElement.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-category">${product.category}</div>
          <div class="product-price">${product.price}</div>
        </div>
        <div class="product-actions">
          <button class="btn btn-sm ${product.is_featured ? 'btn-warning' : 'btn-secondary'}" 
                  onclick="toggleProductFeatured(${product.id})">
            ${product.is_featured ? 'Featured' : 'Feature'}
          </button>
          <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
            Bearbeiten
          </button>
        </div>
      </div>
    `).join('');
  }

  private renderAnalytics(analytics: any) {
    const analyticsElement = document.getElementById('analytics-content');
    if (!analyticsElement) return;

    analyticsElement.innerHTML = `
      <div class="analytics-grid">
        <div class="analytics-card">
          <h4>Umsatz</h4>
          <div class="analytics-value">${analytics.revenue.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
          <div class="analytics-change ${analytics.revenue.trend}">
            ${analytics.revenue.change_percentage > 0 ? '+' : ''}${analytics.revenue.change_percentage}%
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>Bestellungen</h4>
          <div class="analytics-value">${analytics.orders.total}</div>
          <div class="analytics-change ${analytics.orders.trend}">
            ${analytics.orders.change_percentage > 0 ? '+' : ''}${analytics.orders.change_percentage}%
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>Kunden</h4>
          <div class="analytics-value">${analytics.customers.total}</div>
          <div class="analytics-change ${analytics.customers.trend}">
            ${analytics.customers.change_percentage > 0 ? '+' : ''}${analytics.customers.change_percentage}%
          </div>
        </div>
        
        <div class="analytics-card">
          <h4>Conversion Rate</h4>
          <div class="analytics-value">${analytics.conversion_rate.rate}%</div>
          <div class="analytics-change ${analytics.conversion_rate.trend}">
            ${analytics.conversion_rate.change_percentage > 0 ? '+' : ''}${analytics.conversion_rate.change_percentage}%
          </div>
        </div>
      </div>
      
      <div class="analytics-charts">
        <div class="chart-section">
          <h4>Top Produkte</h4>
          <div class="top-products">
            ${analytics.top_products.map((product: any) => `
              <div class="product-item">
                <span class="product-name">${product.name}</span>
                <span class="product-sales">${product.sales} Verkäufe</span>
                <span class="product-revenue">${product.revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="chart-section">
          <h4>Verkäufe nach Kategorie</h4>
          <div class="category-sales">
            ${analytics.sales_by_category.map((category: any) => `
              <div class="category-item">
                <span class="category-name">${category.category}</span>
                <div class="category-bar">
                  <div class="bar-fill" style="width: ${category.percentage}%"></div>
                </div>
                <span class="category-percentage">${category.percentage}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private async simulatePaymentProcessing(paymentMethod: string, orderData: any): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different payment method behaviors
    switch (paymentMethod) {
      case 'stripe':
        // Simulate credit card validation
        const cardNumber = (document.getElementById('cardNumber') as HTMLInputElement)?.value;
        const cardExpiry = (document.getElementById('cardExpiry') as HTMLInputElement)?.value;
        const cardCvv = (document.getElementById('cardCvv') as HTMLInputElement)?.value;
        
        if (!cardNumber || !cardExpiry || !cardCvv) {
          return false;
        }
        
        // Simulate card validation (basic checks)
        if (cardNumber.length < 16 || cardCvv.length < 3) {
          return false;
        }
        
        // Simulate 95% success rate for valid cards
        return Math.random() > 0.05;
        
      case 'sepa':
        // Simulate SEPA validation
        const iban = (document.getElementById('iban') as HTMLInputElement)?.value;
        const mandate = (document.getElementById('sepa-mandate') as HTMLInputElement)?.checked;
        
        if (!iban || !mandate) {
          return false;
        }
        
        // Simulate 98% success rate for SEPA
        return Math.random() > 0.02;
        
      case 'klarna':
        // Simulate Klarna approval (high success rate)
        return Math.random() > 0.01;
        
      case 'paypal':
        // Simulate PayPal processing
        return Math.random() > 0.02;
        
      case 'apple_pay':
      case 'google_pay':
        // Simulate mobile payment processing
        return Math.random() > 0.01;
        
      default:
        return false;
    }
  }
}

// Declare global functions for TypeScript
declare global {
  interface Window {
    navigateToProduct: (productId: string) => void;
    addToCart: (productId: string) => void;
    addToWishlist: (productId: string) => void;
    removeFromCart: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    goToCheckout: () => void;
    changeMainImage: (imageSrc: string) => void;
    increaseQuantity: () => void;
    decreaseQuantity: () => void;
    showTab: (tabName: string) => void;
    showAccountSection: (sectionName: string) => void;
    logout: () => void;
    showPaymentDetails: (paymentMethod: string) => void;
  }
}

