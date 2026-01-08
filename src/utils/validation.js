/**
 * Comprehensive Validation Layer
 * Form validation, data validation, and schema validation utilities
 */

import { AppError, ErrorType, ErrorSeverity } from './errorHandler.js';

/**
 * Validation rule definitions
 */
export const ValidationRule = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN: 'min',
  MAX: 'max',
  PATTERN: 'pattern',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  CUSTOM: 'custom',
};

/**
 * Validator class for comprehensive validation
 */
export class Validator {
  constructor(schema) {
    this.schema = schema;
    this.errors = {};
  }

  /**
   * Validate data against schema
   */
  validate(data) {
    this.errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field];
      const fieldErrors = this.validateField(field, value, rules);

      if (fieldErrors.length > 0) {
        this.errors[field] = fieldErrors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors: this.errors,
      data: isValid ? this.sanitize(data) : null,
    };
  }

  /**
   * Validate a single field
   */
  validateField(field, value, rules) {
    const errors = [];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${this.getFieldLabel(field)} is required`);
      return errors; // Skip other validations if required fails
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return errors;
    }

    // Type check
    if (rules.type && !this.checkType(value, rules.type)) {
      errors.push(`${this.getFieldLabel(field)} must be a ${rules.type}`);
    }

    // Min length
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`);
    }

    // Max length
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`${this.getFieldLabel(field)} must be no more than ${rules.maxLength} characters`);
    }

    // Min value
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${this.getFieldLabel(field)} must be at least ${rules.min}`);
    }

    // Max value
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${this.getFieldLabel(field)} must be no more than ${rules.max}`);
    }

    // Pattern match
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || `${this.getFieldLabel(field)} format is invalid`);
    }

    // Email validation
    if (rules.email && !this.isValidEmail(value)) {
      errors.push(`${this.getFieldLabel(field)} must be a valid email address`);
    }

    // Phone validation
    if (rules.phone && !this.isValidPhone(value)) {
      errors.push(`${this.getFieldLabel(field)} must be a valid phone number`);
    }

    // Date validation
    if (rules.date && !this.isValidDate(value)) {
      errors.push(`${this.getFieldLabel(field)} must be a valid date`);
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }

  /**
   * Check if value matches expected type
   */
  checkType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date || this.isValidDate(value);
      default:
        return true;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (flexible)
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  }

  /**
   * Validate date
   */
  isValidDate(date) {
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  /**
   * Get user-friendly field label
   */
  getFieldLabel(field) {
    const schema = this.schema[field];
    if (schema && schema.label) {
      return schema.label;
    }
    // Convert camelCase to Title Case
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  /**
   * Sanitize data (trim strings, convert types)
   */
  sanitize(data) {
    const sanitized = {};

    for (const [field, value] of Object.entries(data)) {
      const rules = this.schema[field];

      if (rules) {
        // Trim strings
        if (typeof value === 'string') {
          sanitized[field] = value.trim();
        }
        // Convert to number if specified
        else if (rules.type === 'number' && typeof value !== 'number') {
          sanitized[field] = Number(value);
        }
        // Convert to boolean if specified
        else if (rules.type === 'boolean' && typeof value !== 'boolean') {
          sanitized[field] = Boolean(value);
        }
        // Keep original value
        else {
          sanitized[field] = value;
        }
      } else {
        sanitized[field] = value;
      }
    }

    return sanitized;
  }

  /**
   * Get all errors as a flat array
   */
  getAllErrors() {
    const allErrors = [];
    for (const [field, errors] of Object.entries(this.errors)) {
      allErrors.push(...errors);
    }
    return allErrors;
  }

  /**
   * Check if a specific field has errors
   */
  hasError(field) {
    return this.errors[field] && this.errors[field].length > 0;
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(field) {
    return this.errors[field] || [];
  }
}

/**
 * Form validator with real-time validation
 */
export class FormValidator {
  constructor(formElement, schema, options = {}) {
    this.form = formElement;
    this.schema = schema;
    this.validator = new Validator(schema);
    this.options = {
      validateOnBlur: true,
      validateOnInput: false,
      showErrorsInline: true,
      errorClass: 'field-error',
      ...options,
    };

    this.setupValidation();
  }

  /**
   * Set up form validation listeners
   */
  setupValidation() {
    const fields = this.form.querySelectorAll('input, select, textarea');

    fields.forEach(field => {
      if (this.options.validateOnBlur) {
        field.addEventListener('blur', () => this.validateField(field));
      }

      if (this.options.validateOnInput) {
        field.addEventListener('input', () => this.validateField(field));
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateForm();
    });
  }

  /**
   * Validate a single field
   */
  validateField(field) {
    const fieldName = field.name || field.id;
    const value = this.getFieldValue(field);
    const rules = this.schema[fieldName];

    if (!rules) return;

    const errors = this.validator.validateField(fieldName, value, rules);

    if (this.options.showErrorsInline) {
      this.showFieldErrors(field, errors);
    }

    return errors.length === 0;
  }

  /**
   * Validate entire form
   */
  validateForm() {
    const formData = this.getFormData();
    const result = this.validator.validate(formData);

    if (this.options.showErrorsInline) {
      this.showAllErrors(result.errors);
    }

    if (result.isValid && this.options.onSuccess) {
      this.options.onSuccess(result.data);
    } else if (!result.isValid && this.options.onError) {
      this.options.onError(result.errors);
    }

    return result;
  }

  /**
   * Get form data as object
   */
  getFormData() {
    const formData = {};
    const fields = this.form.querySelectorAll('input, select, textarea');

    fields.forEach(field => {
      const fieldName = field.name || field.id;
      if (fieldName) {
        formData[fieldName] = this.getFieldValue(field);
      }
    });

    return formData;
  }

  /**
   * Get field value (handle checkboxes, radio buttons)
   */
  getFieldValue(field) {
    if (field.type === 'checkbox') {
      return field.checked;
    } else if (field.type === 'radio') {
      const checked = this.form.querySelector(`input[name="${field.name}"]:checked`);
      return checked ? checked.value : null;
    } else if (field.type === 'number') {
      return field.value ? Number(field.value) : null;
    } else {
      return field.value;
    }
  }

  /**
   * Show errors for a single field
   */
  showFieldErrors(field, errors) {
    // Remove existing error messages
    this.clearFieldErrors(field);

    if (errors.length > 0) {
      field.classList.add(this.options.errorClass);
      field.setAttribute('aria-invalid', 'true');

      const errorContainer = document.createElement('div');
      errorContainer.className = 'validation-error';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.textContent = errors[0]; // Show first error

      field.parentElement.appendChild(errorContainer);
    } else {
      field.classList.remove(this.options.errorClass);
      field.removeAttribute('aria-invalid');
    }
  }

  /**
   * Clear field errors
   */
  clearFieldErrors(field) {
    const errorContainer = field.parentElement.querySelector('.validation-error');
    if (errorContainer) {
      errorContainer.remove();
    }
  }

  /**
   * Show all form errors
   */
  showAllErrors(errors) {
    // Clear all existing errors
    this.form.querySelectorAll('.validation-error').forEach(el => el.remove());
    this.form.querySelectorAll(`.${this.options.errorClass}`).forEach(el => {
      el.classList.remove(this.options.errorClass);
      el.removeAttribute('aria-invalid');
    });

    // Show new errors
    for (const [fieldName, fieldErrors] of Object.entries(errors)) {
      const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
      if (field) {
        this.showFieldErrors(field, fieldErrors);
      }
    }
  }

  /**
   * Reset form validation state
   */
  reset() {
    this.form.querySelectorAll('.validation-error').forEach(el => el.remove());
    this.form.querySelectorAll(`.${this.options.errorClass}`).forEach(el => {
      el.classList.remove(this.options.errorClass);
      el.removeAttribute('aria-invalid');
    });
  }
}

/**
 * Quick validation helpers
 */

export function validateRequired(value, fieldName = 'Field') {
  if (value === undefined || value === null || value === '') {
    throw new AppError(
      `${fieldName} is required`,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      { field: fieldName, value }
    );
  }
  return value;
}

export function validateEmail(email, fieldName = 'Email') {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(
      `${fieldName} must be a valid email address`,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      { field: fieldName, value: email }
    );
  }
  return email;
}

export function validateRange(value, min, max, fieldName = 'Value') {
  if (value < min || value > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max}`,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      { field: fieldName, value, min, max }
    );
  }
  return value;
}

export function validateLength(value, min, max, fieldName = 'Field') {
  if (value.length < min || value.length > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max} characters`,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      { field: fieldName, value, min, max }
    );
  }
  return value;
}

/**
 * Data sanitization helpers
 */

export function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

export function sanitizeNumber(value) {
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Schema builder helper
 */
export function createSchema() {
  return {
    field(name, rules) {
      this[name] = rules;
      return this;
    },
  };
}

/**
 * Add validation styles
 */
export function addValidationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .field-error {
      border-color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.05) !important;
    }

    .validation-error {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .validation-error:before {
      content: '⚠';
      font-size: 1rem;
    }

    .field-error:focus {
      outline-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .error-boundary {
      padding: 2rem;
      text-align: center;
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      margin: 2rem 0;
    }

    .error-boundary .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-boundary h3 {
      color: #ef4444;
      margin-bottom: 0.5rem;
    }

    .error-boundary p {
      color: var(--gray-soft);
      margin-bottom: 1rem;
    }
  `;
  document.head.appendChild(style);
}
