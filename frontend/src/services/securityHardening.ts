// Security Hardening Service - Advanced security measures
export interface SecurityConfig {
  authentication: {
    jwtExpiry: number; // minutes
    refreshTokenExpiry: number; // days
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      preventReuse: number; // last N passwords
    };
    mfa: {
      enabled: boolean;
      required: boolean;
      methods: ('totp' | 'sms' | 'email')[];
    };
  };
  authorization: {
    rbac: boolean;
    permissions: string[];
    roles: string[];
    defaultRole: string;
  };
  encryption: {
    algorithm: 'AES-256' | 'AES-128' | 'ChaCha20';
    keyRotation: number; // days
    encryptSensitive: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
  };
  csrf: {
    enabled: boolean;
    tokenExpiry: number; // minutes
    sameSite: 'strict' | 'lax' | 'none';
  };
  xss: {
    enabled: boolean;
    sanitizeInput: boolean;
    contentSecurityPolicy: boolean;
  };
  sqlInjection: {
    enabled: boolean;
    parameterizedQueries: boolean;
    inputValidation: boolean;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    sensitiveData: boolean;
    retention: number; // days
  };
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      failedLogins: number;
      suspiciousActivity: number;
      dataBreach: number;
    };
    notifications: {
      email: string[];
      slack?: string;
      webhook?: string;
    };
  };
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_denied' | 'suspicious_activity' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: Record<string, any>;
  resolved: boolean;
}

export interface SecurityReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
  };
  topThreats: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  recommendations: string[];
  compliance: {
    gdpr: boolean;
    ccpa: boolean;
    pci: boolean;
    sox: boolean;
  };
}

export interface VulnerabilityScan {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  vulnerabilities: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    cve?: string;
    cvss?: number;
    remediation: string;
    affected: string[];
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

class SecurityHardeningService {
  private config: SecurityConfig;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.config = {
      authentication: {
        jwtExpiry: 60, // 1 hour
        refreshTokenExpiry: 30, // 30 days
        maxLoginAttempts: 5,
        lockoutDuration: 15, // 15 minutes
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          preventReuse: 5
        },
        mfa: {
          enabled: true,
          required: false,
          methods: ['totp', 'sms', 'email']
        }
      },
      authorization: {
        rbac: true,
        permissions: ['read', 'write', 'delete', 'admin'],
        roles: ['customer', 'editor', 'admin', 'superadmin'],
        defaultRole: 'customer'
      },
      encryption: {
        algorithm: 'AES-256',
        keyRotation: 90, // 90 days
        encryptSensitive: true
      },
      rateLimiting: {
        enabled: true,
        windowMs: 900000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false
      },
      cors: {
        enabled: true,
        origins: ['https://casa-petrada.de', 'https://www.casa-petrada.de'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
      },
      csrf: {
        enabled: true,
        tokenExpiry: 60, // 60 minutes
        sameSite: 'strict'
      },
      xss: {
        enabled: true,
        sanitizeInput: true,
        contentSecurityPolicy: true
      },
      sqlInjection: {
        enabled: true,
        parameterizedQueries: true,
        inputValidation: true
      },
      logging: {
        enabled: true,
        level: 'info',
        sensitiveData: false,
        retention: 365 // 1 year
      },
      monitoring: {
        enabled: true,
        alertThresholds: {
          failedLogins: 10,
          suspiciousActivity: 5,
          dataBreach: 1
        },
        notifications: {
          email: ['security@casa-petrada.de']
        }
      }
    };
    
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    this.apiKey = process.env.SECURITY_API_KEY || '';
  }

  // Validate password strength
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= this.config.authentication.passwordPolicy.minLength) {
      score += 20;
    } else {
      feedback.push(`Password must be at least ${this.config.authentication.passwordPolicy.minLength} characters long`);
    }

    // Uppercase check
    if (this.config.authentication.passwordPolicy.requireUppercase) {
      if (/[A-Z]/.test(password)) {
        score += 20;
      } else {
        feedback.push('Password must contain at least one uppercase letter');
      }
    }

    // Lowercase check
    if (this.config.authentication.passwordPolicy.requireLowercase) {
      if (/[a-z]/.test(password)) {
        score += 20;
      } else {
        feedback.push('Password must contain at least one lowercase letter');
      }
    }

    // Numbers check
    if (this.config.authentication.passwordPolicy.requireNumbers) {
      if (/\d/.test(password)) {
        score += 20;
      } else {
        feedback.push('Password must contain at least one number');
      }
    }

    // Symbols check
    if (this.config.authentication.passwordPolicy.requireSymbols) {
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 20;
      } else {
        feedback.push('Password must contain at least one special character');
      }
    }

    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score -= 30;
      feedback.push('Password contains common patterns');
    }

    return {
      isValid: score >= 80 && feedback.length === 0,
      score,
      feedback
    };
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate CSRF token
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  // Sanitize input
  sanitizeInput(input: string): string {
    if (!this.config.xss.sanitizeInput) return input;

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }

  // Validate input
  validateInput(input: any, type: 'email' | 'phone' | 'url' | 'number' | 'string'): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'phone':
        return /^\+?[\d\s\-\(\)]+$/.test(input);
      case 'url':
        try {
          new URL(input);
          return true;
        } catch {
          return false;
        }
      case 'number':
        return !isNaN(Number(input));
      case 'string':
        return typeof input === 'string' && input.length > 0;
      default:
        return false;
    }
  }

  // Check rate limit
  async checkRateLimit(
    identifier: string,
    endpoint: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/rate-limit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier,
          endpoint,
          config: this.config.rateLimiting
        })
      });

      if (!response.ok) {
        return { allowed: false, remaining: 0, resetTime: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: false, remaining: 0, resetTime: 0 };
    }
  }

  // Log security event
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: this.generateEventId(),
        timestamp: new Date().toISOString()
      };

      await fetch(`${this.baseUrl}/api/v1/security/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securityEvent)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get security events
  async getSecurityEvents(
    filters?: {
      type?: string;
      severity?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<{ events: SecurityEvent[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/security/events?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get security events');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get security events:', error);
      return { events: [], total: 0 };
    }
  }

  // Generate security report
  async generateSecurityReport(
    startDate: string,
    endDate: string
  ): Promise<SecurityReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
      });

      if (!response.ok) {
        throw new Error('Failed to generate security report');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate security report:', error);
      return {
        period: { start: startDate, end: endDate },
        summary: { totalEvents: 0, criticalEvents: 0, highEvents: 0, mediumEvents: 0, lowEvents: 0 },
        topThreats: [],
        recommendations: [],
        compliance: { gdpr: false, ccpa: false, pci: false, sox: false }
      };
    }
  }

  // Run vulnerability scan
  async runVulnerabilityScan(): Promise<VulnerabilityScan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/vulnerability-scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start vulnerability scan');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Vulnerability scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get vulnerability scan status
  async getVulnerabilityScanStatus(scanId: string): Promise<VulnerabilityScan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/vulnerability-scan/${scanId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get vulnerability scan status');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get vulnerability scan status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check security compliance
  async checkSecurityCompliance(): Promise<{
    gdpr: boolean;
    ccpa: boolean;
    pci: boolean;
    sox: boolean;
    details: Record<string, any>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/compliance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check security compliance');
      }

      return await response.json();
    } catch (error) {
      return {
        gdpr: false,
        ccpa: false,
        pci: false,
        sox: false,
        details: {}
      };
    }
  }

  // Update security configuration
  async updateSecurityConfig(updates: Partial<SecurityConfig>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update security configuration');
      }

      this.config = { ...this.config, ...updates };
      return {
        success: true,
        message: 'Security configuration updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test security measures
  async testSecurityMeasures(): Promise<{
    success: boolean;
    results: Record<string, boolean>;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/security/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Security test failed');
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        results: {},
        recommendations: ['Enable all security measures', 'Update security configuration']
      };
    }
  }

  // Generate security recommendations
  generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.config.authentication.mfa.enabled) {
      recommendations.push('Enable multi-factor authentication for enhanced security');
    }

    if (!this.config.rateLimiting.enabled) {
      recommendations.push('Enable rate limiting to prevent brute force attacks');
    }

    if (!this.config.csrf.enabled) {
      recommendations.push('Enable CSRF protection to prevent cross-site request forgery');
    }

    if (!this.config.xss.enabled) {
      recommendations.push('Enable XSS protection to prevent cross-site scripting attacks');
    }

    if (!this.config.sqlInjection.enabled) {
      recommendations.push('Enable SQL injection protection to prevent database attacks');
    }

    if (!this.config.monitoring.enabled) {
      recommendations.push('Enable security monitoring for real-time threat detection');
    }

    return recommendations;
  }

  // Get security configuration
  getSecurityConfig(): SecurityConfig {
    return this.config;
  }

  // Generate event ID
  private generateEventId(): string {
    return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Setup Content Security Policy
  setupContentSecurityPolicy(): void {
    if (typeof document === 'undefined') return;

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  // Setup security headers
  setupSecurityHeaders(): void {
    if (typeof document === 'undefined') return;

    // Add security headers via meta tags
    const headers = [
      { name: 'X-Content-Type-Options', value: 'nosniff' },
      { name: 'X-Frame-Options', value: 'DENY' },
      { name: 'X-XSS-Protection', value: '1; mode=block' },
      { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
    ];

    headers.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.name;
      meta.content = header.value;
      document.head.appendChild(meta);
    });
  }
}

export const securityHardeningService = new SecurityHardeningService();
