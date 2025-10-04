/**
 * Form validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  min?: number;
  max?: number;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export class FormValidator {
  private rules: { [key: string]: ValidationRule } = {};

  addRule(fieldName: string, rule: ValidationRule): void {
    this.rules[fieldName] = rule;
  }

  validate(formData: FormData): ValidationResult {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    for (const [fieldName, rule] of Object.entries(this.rules)) {
      const value = formData.get(fieldName) as string || '';
      const error = this.validateField(value, rule, fieldName);
      
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  private validateField(value: string, rule: ValidationRule, fieldName: string): string | null {
    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return this.getFieldLabel(fieldName) + ' ist erforderlich';
    }

    if (!value || value.trim() === '') {
      return null; // Skip other validations if field is empty and not required
    }

    // Length validations
    if (rule.minLength && value.length < rule.minLength) {
      return `${this.getFieldLabel(fieldName)} muss mindestens ${rule.minLength} Zeichen lang sein`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${this.getFieldLabel(fieldName)} darf maximal ${rule.maxLength} Zeichen lang sein`;
    }

    // Email validation
    if (rule.email && !this.isValidEmail(value)) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    // Phone validation
    if (rule.phone && !this.isValidPhone(value)) {
      return 'Bitte geben Sie eine gültige Telefonnummer ein';
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${this.getFieldLabel(fieldName)} hat ein ungültiges Format`;
    }

    // Numeric validations
    if (rule.min !== undefined || rule.max !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${this.getFieldLabel(fieldName)} muss eine Zahl sein`;
      }

      if (rule.min !== undefined && numValue < rule.min) {
        return `${this.getFieldLabel(fieldName)} muss mindestens ${rule.min} sein`;
      }

      if (rule.max !== undefined && numValue > rule.max) {
        return `${this.getFieldLabel(fieldName)} darf maximal ${rule.max} sein`;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      phone: 'Telefon',
      street: 'Straße',
      houseNumber: 'Hausnummer',
      postalCode: 'PLZ',
      city: 'Stadt',
      subject: 'Betreff',
      message: 'Nachricht',
      terms: 'AGB und Datenschutz',
      privacy: 'Datenschutzbestimmungen'
    };
    return labels[fieldName] || fieldName;
  }
}

// Predefined validation rules for common forms
export const validationRules = {
  // User registration/login
  auth: {
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, email: true, maxLength: 100 },
    password: { 
      required: true, 
      minLength: 8, 
      maxLength: 100,
      custom: (value: string) => {
        if (!/(?=.*[a-z])/.test(value)) {
          return 'Passwort muss mindestens einen Kleinbuchstaben enthalten';
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          return 'Passwort muss mindestens einen Großbuchstaben enthalten';
        }
        if (!/(?=.*\d)/.test(value)) {
          return 'Passwort muss mindestens eine Zahl enthalten';
        }
        return null;
      }
    },
    confirmPassword: { required: true }
  },

  // Contact form
  contact: {
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, email: true, maxLength: 100 },
    subject: { required: true, minLength: 5, maxLength: 100 },
    message: { required: true, minLength: 10, maxLength: 1000 }
  },

  // Checkout form
  checkout: {
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, email: true, maxLength: 100 },
    street: { required: true, minLength: 3, maxLength: 100 },
    houseNumber: { required: true, minLength: 1, maxLength: 10 },
    postalCode: { 
      required: true, 
      pattern: /^\d{5}$/,
      custom: (value: string) => {
        if (!/^\d{5}$/.test(value)) {
          return 'PLZ muss 5 Ziffern haben';
        }
        return null;
      }
    },
    city: { required: true, minLength: 2, maxLength: 50 },
    paymentMethod: { required: true }
  },

  // Newsletter
  newsletter: {
    email: { required: true, email: true, maxLength: 100 }
  }
};

// Real-time validation for form fields
export function setupRealTimeValidation(form: HTMLFormElement, validator: FormValidator): void {
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    const fieldName = (input as HTMLInputElement).name;
    if (!fieldName) return;

    input.addEventListener('blur', () => {
      validateField(input as HTMLInputElement, validator);
    });

    input.addEventListener('input', () => {
      // Clear previous validation state
      clearFieldValidation(input as HTMLInputElement);
    });
  });
}

function validateField(input: HTMLInputElement, validator: FormValidator): void {
  const formData = new FormData(input.form!);
  const fieldName = input.name;
  
  if (!fieldName) return;

  const rule = validator['rules'][fieldName];
  if (!rule) return;

  const value = formData.get(fieldName) as string || '';
  const error = validator['validateField'](value, rule, fieldName);

  const formGroup = input.closest('.form-group');
  if (!formGroup) return;

  // Clear previous validation
  clearFieldValidation(input);

  if (error) {
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
    formGroup.appendChild(errorElement);
  } else if (value.trim() !== '') {
    formGroup.classList.add('success');
    formGroup.classList.remove('error');
  }
}

function clearFieldValidation(input: HTMLInputElement): void {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;

  formGroup.classList.remove('error', 'success');
  
  const existingError = formGroup.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }
}

// Validate password confirmation
export function validatePasswordConfirmation(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) {
    return 'Passwörter stimmen nicht überein';
  }
  return null;
}

// Validate form submission
export function validateFormSubmission(form: HTMLFormElement, validator: FormValidator): ValidationResult {
  const formData = new FormData(form);
  const result = validator.validate(formData);

  // Clear all previous validation states
  const formGroups = form.querySelectorAll('.form-group');
  formGroups.forEach(group => {
    group.classList.remove('error', 'success');
    const existingError = group.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
  });

  // Show validation errors
  if (!result.isValid) {
    Object.entries(result.errors).forEach(([fieldName, error]) => {
      const input = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
      if (input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
          formGroup.classList.add('error');
          
          const errorElement = document.createElement('div');
          errorElement.className = 'form-error';
          errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
          formGroup.appendChild(errorElement);
        }
      }
    });
  }

  return result;
}
