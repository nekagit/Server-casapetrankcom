import './style.css'
import { Router } from './router'
import { store } from './store'
import { FormValidator, validationRules, setupRealTimeValidation, validateFormSubmission, validatePasswordConfirmation } from './validation'

// Initialize the Casa Petrada website
class CasaPetradaApp {
  private router: Router;

  constructor() {
    this.router = new Router();
    this.initializeApp();
    this.setupEventListeners();
    this.setupGlobalFunctions();
    this.subscribeToStore();
  }

  initializeApp() {
    // Initialize cart count
    this.updateCartCount();
    
    // Check authentication status
    this.checkAuthStatus();
    
    // Setup router global functions
    this.router.setupGlobalFunctions();
    
    // Setup search functionality
    this.setupSearch();
    
    // Setup newsletter
    this.setupNewsletter();
    
    // Setup contact form
    this.setupContactForm();
  }

  private async checkAuthStatus() {
    try {
      await store.checkAuthStatus();
    } catch (error) {
      console.error('Auth status check failed:', error);
    }
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');

    mobileMenuBtn?.addEventListener('click', () => {
      mobileNav?.classList.add('active');
    });

    mobileNavClose?.addEventListener('click', () => {
      mobileNav?.classList.remove('active');
    });

    // Search overlay toggle
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');

    searchBtn?.addEventListener('click', () => {
      searchOverlay?.classList.add('active');
      document.getElementById('search-input')?.focus();
    });

    searchClose?.addEventListener('click', () => {
      searchOverlay?.classList.remove('active');
    });

    // Close overlays on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        mobileNav?.classList.remove('active');
        searchOverlay?.classList.remove('active');
      }
    });

    // Close mobile nav on overlay click
    mobileNav?.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove('active');
      }
    });

    // Close search on overlay click
    searchOverlay?.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
      }
    });

    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && this.isInternalLink(link.href)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.router.navigate(path);
      }
    });
  }

  private isInternalLink(href: string): boolean {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin;
    } catch {
      return true; // Relative URLs are internal
    }
  }

  setupGlobalFunctions() {
    // Navigation function
    window.navigateTo = (path: string) => {
      this.router.navigate(path);
    };

    // Cart management functions (these are also set up in router, but we ensure they're available)
    window.addToCart = (productId: string) => {
      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
      
      const success = store.addToCart(productId, quantity);
      if (success) {
        this.showNotification('Produkt wurde zum Warenkorb hinzugefügt!', 'success');
        this.updateCartCount();
      } else {
        this.showNotification('Produkt konnte nicht hinzugefügt werden.', 'error');
      }
    };

    window.addToWishlist = (productId: string) => {
      const success = store.addToWishlist(productId);
      if (success) {
        this.showNotification('Produkt wurde zur Wunschliste hinzugefügt!', 'success');
      } else {
        this.showNotification('Produkt ist bereits in der Wunschliste!', 'info');
      }
    };

    window.removeFromCart = (productId: string) => {
      store.removeFromCart(productId);
      this.updateCartCount();
      this.router.navigate('/cart'); // Refresh cart view
    };

    window.updateCartQuantity = (productId: string, quantity: number) => {
      store.updateCartQuantity(productId, quantity);
      this.updateCartCount();
      this.router.navigate('/cart'); // Refresh cart view
    };
  }

  private setupSearch() {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            store.setSearchQuery(query);
            this.router.navigate(`/products?search=${encodeURIComponent(query)}`);
            document.getElementById('search-overlay')?.classList.remove('active');
          }
        }
      });
    }
  }

  private setupNewsletter() {
    // Newsletter signup functionality
    document.addEventListener('submit', async (e) => {
      const target = e.target as HTMLFormElement;
      if (target.id === 'newsletter-form') {
        e.preventDefault();
        
        const formData = new FormData(target);
        const email = formData.get('email') as string;
        const submitButton = target.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        // Validate email
        const validator = new FormValidator();
        validator.addRule('email', validationRules.newsletter.email);
        
        const validation = validateFormSubmission(target, validator);
        if (!validation.isValid) {
          return;
        }
        
        this.setButtonLoading(submitButton, true, 'Anmelden');
        
        try {
          const success = await store.subscribeToNewsletter(email, 'website');
          if (success) {
            this.showNotification('Vielen Dank für Ihre Newsletter-Anmeldung!', 'success', 'Newsletter-Anmeldung');
            target.reset();
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.';
          this.showNotification(errorMessage, 'error', 'Fehler');
        } finally {
          this.setButtonLoading(submitButton, false);
        }
      }
    });
  }

  private setupContactForm() {
    // Contact form functionality
    document.addEventListener('submit', async (e) => {
      const target = e.target as HTMLFormElement;
      if (target.id === 'contact-form') {
        e.preventDefault();
        
        const validator = new FormValidator();
        validator.addRule('firstName', validationRules.contact.firstName);
        validator.addRule('lastName', validationRules.contact.lastName);
        validator.addRule('email', validationRules.contact.email);
        validator.addRule('subject', validationRules.contact.subject);
        validator.addRule('message', validationRules.contact.message);
        
        const validation = validateFormSubmission(target, validator);
        if (!validation.isValid) {
          return;
        }
        
        const formData = new FormData(target);
        const contactData = {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('email') as string,
          subject: formData.get('subject') as string,
          message: formData.get('message') as string
        };
        
        const submitButton = target.querySelector('button[type="submit"]') as HTMLButtonElement;
        this.setButtonLoading(submitButton, true, 'Nachricht senden');
        
        try {
          const success = await store.submitContactForm(contactData);
          if (success) {
            this.showNotification('Ihre Nachricht wurde erfolgreich gesendet!', 'success', 'Nachricht gesendet');
            target.reset();
          } else {
            this.showNotification('Fehler beim Senden der Nachricht.', 'error', 'Fehler');
          }
        } catch (error) {
          this.showNotification('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.', 'error', 'Fehler');
        } finally {
          this.setButtonLoading(submitButton, false);
        }
      }
    });

    // Auth form functionality
    document.addEventListener('submit', async (e) => {
      const target = e.target as HTMLFormElement;
      if (target.id === 'auth-form') {
        e.preventDefault();
        
        const formData = new FormData(target);
        const isLogin = window.location.pathname === '/login';
        
        if (isLogin) {
          // Handle login
          const validator = new FormValidator();
          validator.addRule('email', validationRules.auth.email);
          validator.addRule('password', { required: true });
          
          const validation = validateFormSubmission(target, validator);
          if (!validation.isValid) {
            return;
          }

          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          const submitButton = target.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          this.setButtonLoading(submitButton, true, 'Anmelden');
          try {
            const success = await store.login(email, password);
            if (success) {
              this.showNotification('Erfolgreich angemeldet!', 'success', 'Anmeldung erfolgreich');
              this.router.navigate('/account');
            } else {
              this.showNotification('Ungültige Anmeldedaten!', 'error', 'Anmeldung fehlgeschlagen');
            }
          } catch (error) {
            this.showNotification('Anmeldung fehlgeschlagen!', 'error', 'Fehler');
          } finally {
            this.setButtonLoading(submitButton, false);
          }
        } else {
          // Handle registration
          const validator = new FormValidator();
          validator.addRule('firstName', validationRules.auth.firstName);
          validator.addRule('lastName', validationRules.auth.lastName);
          validator.addRule('email', validationRules.auth.email);
          validator.addRule('password', validationRules.auth.password);
          validator.addRule('confirmPassword', validationRules.auth.confirmPassword);
          
          const validation = validateFormSubmission(target, validator);
          if (!validation.isValid) {
            return;
          }

          const firstName = formData.get('firstName') as string;
          const lastName = formData.get('lastName') as string;
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          const confirmPassword = formData.get('confirmPassword') as string;
          const newsletter = formData.get('newsletter') === 'on';
          
          // Additional password confirmation validation
          const passwordMatchError = validatePasswordConfirmation(password, confirmPassword);
          if (passwordMatchError) {
            this.showNotification(passwordMatchError, 'error', 'Validierungsfehler');
            return;
          }
          
          const submitButton = target.querySelector('button[type="submit"]') as HTMLButtonElement;
          this.setButtonLoading(submitButton, true, 'Registrieren');
          
          try {
            const success = await store.register({
              email,
              password,
              firstName,
              lastName,
              newsletterSubscribed: newsletter
            });
            if (success) {
              this.showNotification('Konto erfolgreich erstellt!', 'success', 'Registrierung erfolgreich');
              this.router.navigate('/account');
            } else {
              this.showNotification('Registrierung fehlgeschlagen!', 'error', 'Fehler');
            }
          } catch (error) {
            this.showNotification('Registrierung fehlgeschlagen!', 'error', 'Fehler');
          } finally {
            this.setButtonLoading(submitButton, false);
          }
        }
      }
    });
  }

  private subscribeToStore() {
    // Subscribe to store changes
    store.subscribe((state) => {
      this.updateCartCount();
      
      // Update loading states
      const loadingElements = document.querySelectorAll('.loading');
      loadingElements.forEach(element => {
        if (state.loading) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      });
      
      // Show errors
      if (state.error) {
        this.showNotification(state.error, 'error');
        store.setError(null);
      }
    });
  }

  updateCartCount() {
    const cartCount = store.getCartItemsCount();
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = cartCount.toString();
      cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string) {
    // Create notification container if it doesn't exist
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
      <i class="notification-icon ${iconMap[type]}"></i>
      <div class="notification-content">
        ${title ? `<div class="notification-title">${title}</div>` : ''}
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  private showLoadingOverlay(text: string = 'Lädt...') {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">${text}</div>
    `;
    
    overlay.classList.add('active');
  }

  private hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  private setButtonLoading(button: HTMLButtonElement, loading: boolean, originalText?: string) {
    if (loading) {
      button.classList.add('loading-button');
      button.disabled = true;
      if (originalText) {
        button.dataset.originalText = originalText;
        button.innerHTML = '<div class="loading-spinner"></div><span class="btn-text" style="opacity: 0;">' + originalText + '</span>';
      }
    } else {
      button.classList.remove('loading-button');
      button.disabled = false;
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }
}

// Declare additional global functions for TypeScript
declare global {
  interface Window {
    navigateTo: (path: string) => void;
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
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CasaPetradaApp();
});
