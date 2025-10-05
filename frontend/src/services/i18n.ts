// Internationalization (i18n) Service - Multi-language support
export interface Translation {
  [key: string]: string | Translation;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export interface LocalizedContent {
  [key: string]: {
    [language: string]: string;
  };
}

class I18nService {
  private currentLanguage: string = 'de';
  private fallbackLanguage: string = 'en';
  private translations: Map<string, Translation> = new Map();
  private languages: Language[] = [
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      rtl: false,
      currency: 'EUR',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: 'HH:mm',
      numberFormat: {
        decimal: ',',
        thousands: '.'
      }
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'h:mm A',
      numberFormat: {
        decimal: '.',
        thousands: ','
      }
    }
  ];

  constructor() {
    this.loadTranslations();
  }

  // Initialize translations
  private loadTranslations(): void {
    // German translations
    this.translations.set('de', {
      // Navigation
      'nav.home': 'Home',
      'nav.products': 'Produkte',
      'nav.categories': 'Kategorien',
      'nav.about': 'Über uns',
      'nav.contact': 'Kontakt',
      'nav.blog': 'Blog',
      'nav.account': 'Mein Konto',
      'nav.cart': 'Warenkorb',
      'nav.wishlist': 'Wunschliste',
      'nav.search': 'Suche',
      'nav.menu': 'Menü',
      'nav.close': 'Schließen',

      // Product categories
      'category.armbaender': 'Armbänder',
      'category.ketten': 'Ketten',
      'category.ohrringe': 'Ohrringe',
      'category.fashion': 'Fashion',
      'category.sale': 'Sale',
      'category.new': 'Neu',

      // Product details
      'product.add_to_cart': 'In den Warenkorb',
      'product.add_to_wishlist': 'Zur Wunschliste',
      'product.remove_from_wishlist': 'Aus Wunschliste entfernen',
      'product.quantity': 'Menge',
      'product.size': 'Größe',
      'product.color': 'Farbe',
      'product.material': 'Material',
      'product.description': 'Beschreibung',
      'product.specifications': 'Spezifikationen',
      'product.reviews': 'Bewertungen',
      'product.related': 'Ähnliche Produkte',
      'product.in_stock': 'Auf Lager',
      'product.out_of_stock': 'Ausverkauft',
      'product.low_stock': 'Wenige verfügbar',
      'product.free_shipping': 'Kostenloser Versand',
      'product.secure_payment': 'Sichere Zahlung',
      'product.returns': 'Rückgabe möglich',

      // Cart
      'cart.title': 'Warenkorb',
      'cart.empty': 'Ihr Warenkorb ist leer',
      'cart.subtotal': 'Zwischensumme',
      'cart.shipping': 'Versand',
      'cart.total': 'Gesamt',
      'cart.checkout': 'Zur Kasse',
      'cart.continue_shopping': 'Weiter einkaufen',
      'cart.remove_item': 'Artikel entfernen',
      'cart.update_quantity': 'Menge aktualisieren',

      // Checkout
      'checkout.title': 'Kasse',
      'checkout.billing_address': 'Rechnungsadresse',
      'checkout.shipping_address': 'Lieferadresse',
      'checkout.payment_method': 'Zahlungsart',
      'checkout.order_summary': 'Bestellübersicht',
      'checkout.place_order': 'Bestellung aufgeben',
      'checkout.terms_accept': 'Ich akzeptiere die AGB',
      'checkout.newsletter_signup': 'Newsletter abonnieren',

      // User account
      'account.title': 'Mein Konto',
      'account.profile': 'Profil',
      'account.orders': 'Bestellungen',
      'account.wishlist': 'Wunschliste',
      'account.addresses': 'Adressen',
      'account.settings': 'Einstellungen',
      'account.logout': 'Abmelden',
      'account.login': 'Anmelden',
      'account.register': 'Registrieren',
      'account.forgot_password': 'Passwort vergessen',

      // Search
      'search.title': 'Suchergebnisse',
      'search.placeholder': 'Nach Produkten suchen...',
      'search.no_results': 'Keine Ergebnisse gefunden',
      'search.filters': 'Filter',
      'search.sort': 'Sortieren',
      'search.results_count': '{count} Ergebnisse',

      // Common
      'common.loading': 'Lädt...',
      'common.error': 'Fehler',
      'common.success': 'Erfolgreich',
      'common.cancel': 'Abbrechen',
      'common.save': 'Speichern',
      'common.delete': 'Löschen',
      'common.edit': 'Bearbeiten',
      'common.add': 'Hinzufügen',
      'common.remove': 'Entfernen',
      'common.yes': 'Ja',
      'common.no': 'Nein',
      'common.back': 'Zurück',
      'common.next': 'Weiter',
      'common.previous': 'Vorherige',
      'common.close': 'Schließen',
      'common.open': 'Öffnen',
      'common.more': 'Mehr',
      'common.less': 'Weniger',

      // Footer
      'footer.newsletter': 'Newsletter',
      'footer.newsletter_signup': 'Newsletter abonnieren',
      'footer.newsletter_email': 'E-Mail-Adresse',
      'footer.newsletter_submit': 'Abonnieren',
      'footer.follow_us': 'Folge uns',
      'footer.customer_service': 'Kundenservice',
      'footer.legal': 'Rechtliches',
      'footer.copyright': '© 2024 Casa Petrada. Alle Rechte vorbehalten.',

      // Error messages
      'error.general': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      'error.network': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
      'error.validation': 'Bitte überprüfen Sie Ihre Eingaben.',
      'error.required': 'Dieses Feld ist erforderlich.',
      'error.email': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      'error.password': 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      'error.password_match': 'Die Passwörter stimmen nicht überein.',

      // Success messages
      'success.order_placed': 'Ihre Bestellung wurde erfolgreich aufgegeben.',
      'success.account_created': 'Ihr Konto wurde erfolgreich erstellt.',
      'success.password_reset': 'Ein Passwort-Reset-Link wurde an Ihre E-Mail gesendet.',
      'success.newsletter_signup': 'Sie haben sich erfolgreich für den Newsletter angemeldet.',
      'success.product_added': 'Produkt wurde zum Warenkorb hinzugefügt.',
      'success.wishlist_added': 'Produkt wurde zur Wunschliste hinzugefügt.'
    });

    // English translations
    this.translations.set('en', {
      // Navigation
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.categories': 'Categories',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.blog': 'Blog',
      'nav.account': 'My Account',
      'nav.cart': 'Cart',
      'nav.wishlist': 'Wishlist',
      'nav.search': 'Search',
      'nav.menu': 'Menu',
      'nav.close': 'Close',

      // Product categories
      'category.armbaender': 'Bracelets',
      'category.ketten': 'Necklaces',
      'category.ohrringe': 'Earrings',
      'category.fashion': 'Fashion',
      'category.sale': 'Sale',
      'category.new': 'New',

      // Product details
      'product.add_to_cart': 'Add to Cart',
      'product.add_to_wishlist': 'Add to Wishlist',
      'product.remove_from_wishlist': 'Remove from Wishlist',
      'product.quantity': 'Quantity',
      'product.size': 'Size',
      'product.color': 'Color',
      'product.material': 'Material',
      'product.description': 'Description',
      'product.specifications': 'Specifications',
      'product.reviews': 'Reviews',
      'product.related': 'Related Products',
      'product.in_stock': 'In Stock',
      'product.out_of_stock': 'Out of Stock',
      'product.low_stock': 'Low Stock',
      'product.free_shipping': 'Free Shipping',
      'product.secure_payment': 'Secure Payment',
      'product.returns': 'Returns Available',

      // Cart
      'cart.title': 'Shopping Cart',
      'cart.empty': 'Your cart is empty',
      'cart.subtotal': 'Subtotal',
      'cart.shipping': 'Shipping',
      'cart.total': 'Total',
      'cart.checkout': 'Checkout',
      'cart.continue_shopping': 'Continue Shopping',
      'cart.remove_item': 'Remove Item',
      'cart.update_quantity': 'Update Quantity',

      // Checkout
      'checkout.title': 'Checkout',
      'checkout.billing_address': 'Billing Address',
      'checkout.shipping_address': 'Shipping Address',
      'checkout.payment_method': 'Payment Method',
      'checkout.order_summary': 'Order Summary',
      'checkout.place_order': 'Place Order',
      'checkout.terms_accept': 'I accept the Terms and Conditions',
      'checkout.newsletter_signup': 'Subscribe to Newsletter',

      // User account
      'account.title': 'My Account',
      'account.profile': 'Profile',
      'account.orders': 'Orders',
      'account.wishlist': 'Wishlist',
      'account.addresses': 'Addresses',
      'account.settings': 'Settings',
      'account.logout': 'Logout',
      'account.login': 'Login',
      'account.register': 'Register',
      'account.forgot_password': 'Forgot Password',

      // Search
      'search.title': 'Search Results',
      'search.placeholder': 'Search for products...',
      'search.no_results': 'No results found',
      'search.filters': 'Filters',
      'search.sort': 'Sort',
      'search.results_count': '{count} results',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.remove': 'Remove',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.close': 'Close',
      'common.open': 'Open',
      'common.more': 'More',
      'common.less': 'Less',

      // Footer
      'footer.newsletter': 'Newsletter',
      'footer.newsletter_signup': 'Subscribe to Newsletter',
      'footer.newsletter_email': 'Email Address',
      'footer.newsletter_submit': 'Subscribe',
      'footer.follow_us': 'Follow Us',
      'footer.customer_service': 'Customer Service',
      'footer.legal': 'Legal',
      'footer.copyright': '© 2024 Casa Petrada. All rights reserved.',

      // Error messages
      'error.general': 'An error occurred. Please try again.',
      'error.network': 'Network error. Please check your internet connection.',
      'error.validation': 'Please check your inputs.',
      'error.required': 'This field is required.',
      'error.email': 'Please enter a valid email address.',
      'error.password': 'Password must be at least 8 characters long.',
      'error.password_match': 'Passwords do not match.',

      // Success messages
      'success.order_placed': 'Your order has been placed successfully.',
      'success.account_created': 'Your account has been created successfully.',
      'success.password_reset': 'A password reset link has been sent to your email.',
      'success.newsletter_signup': 'You have successfully subscribed to the newsletter.',
      'success.product_added': 'Product added to cart.',
      'success.wishlist_added': 'Product added to wishlist.'
    });
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Set current language
  setLanguage(language: string): void {
    if (this.languages.find(lang => lang.code === language)) {
      this.currentLanguage = language;
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', language);
        document.documentElement.lang = language;
      }
    }
  }

  // Get available languages
  getAvailableLanguages(): Language[] {
    return this.languages;
  }

  // Get current language object
  getCurrentLanguageObject(): Language {
    return this.languages.find(lang => lang.code === this.currentLanguage) || this.languages[0];
  }

  // Translate text
  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  // Get translation for a key
  private getTranslation(key: string): string | null {
    const currentLangTranslations = this.translations.get(this.currentLanguage);
    if (!currentLangTranslations) {
      return null;
    }

    const keys = key.split('.');
    let translation: any = currentLangTranslations;

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        const fallbackTranslations = this.translations.get(this.fallbackLanguage);
        if (fallbackTranslations) {
          translation = fallbackTranslations;
          for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
              translation = translation[k];
            } else {
                return null;
              }
          }
        } else {
          return null;
        }
      }
    }

    return typeof translation === 'string' ? translation : null;
  }

  // Interpolate parameters in translation
  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Format currency
  formatCurrency(amount: number, currency?: string): string {
    const lang = this.getCurrentLanguageObject();
    const currencyCode = currency || lang.currency;
    
    return new Intl.NumberFormat(lang.code, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  }

  // Format date
  formatDate(date: Date | string, format?: string): string {
    const lang = this.getCurrentLanguageObject();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(lang.code, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  }

  // Format number
  formatNumber(number: number, decimals?: number): string {
    const lang = this.getCurrentLanguageObject();
    
    return new Intl.NumberFormat(lang.code, {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    }).format(number);
  }

  // Format relative time
  formatRelativeTime(date: Date | string): string {
    const lang = this.getCurrentLanguageObject();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(lang.code, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
  }

  // Initialize language from browser or localStorage
  initializeLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language');
      if (savedLanguage && this.languages.find(lang => lang.code === savedLanguage)) {
        this.setLanguage(savedLanguage);
      } else {
        const browserLanguage = navigator.language.split('-')[0];
        const supportedLanguage = this.languages.find(lang => lang.code === browserLanguage);
        if (supportedLanguage) {
          this.setLanguage(browserLanguage);
        } else {
          this.setLanguage(this.fallbackLanguage);
        }
      }
    }
  }

  // Get localized content
  getLocalizedContent(content: LocalizedContent, key: string): string {
    const currentLang = this.getCurrentLanguage();
    const fallbackLang = this.fallbackLanguage;
    
    if (content[key] && content[key][currentLang]) {
      return content[key][currentLang];
    } else if (content[key] && content[key][fallbackLang]) {
      return content[key][fallbackLang];
    } else {
      return key;
    }
  }

  // Check if language is RTL
  isRTL(): boolean {
    return this.getCurrentLanguageObject().rtl;
  }

  // Get text direction
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }
}

export const i18nService = new I18nService();