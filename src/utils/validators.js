/**
 * Input Validation and Sanitization Utilities
 */

/**
 * Sanitize HTML to prevent XSS
 * @param {string} input - Raw input
 * @returns {string} Sanitized output
 */
export function sanitize(input) {
  if (typeof input !== 'string') return input;

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize and allow specific HTML tags
 * @param {string} input - Raw HTML
 * @param {Array<string>} allowedTags - Allowed HTML tags
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(input, allowedTags = ['b', 'i', 'em', 'strong']) {
  if (typeof input !== 'string') return input;

  const div = document.createElement('div');
  div.innerHTML = input;

  // Remove all tags except allowed ones
  const walk = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        // Replace with text content
        const text = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(text, node);
      } else {
        // Recursively check children
        Array.from(node.childNodes).forEach(walk);
      }
    }
  };

  Array.from(div.childNodes).forEach(walk);
  return div.innerHTML;
}

/**
 * Validate email address
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validate phone number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Validate URL
 * @param {string} url
 * @returns {boolean}
 */
export function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate number is in range
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate string length
 * @param {string} str
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function isValidLength(str, min = 0, max = Infinity) {
  if (typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
}

/**
 * Validate required field
 * @param {any} value
 * @returns {boolean}
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Validate date
 * @param {string|Date} date
 * @returns {boolean}
 */
export function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

/**
 * Validate age
 * @param {number} age
 * @returns {boolean}
 */
export function isValidAge(age) {
  return isInRange(age, 0, 120);
}

/**
 * Validate grade level
 * @param {number} grade
 * @returns {boolean}
 */
export function isValidGrade(grade) {
  return isInRange(grade, 1, 12);
}

/**
 * Escape special regex characters
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate JSON string
 * @param {string} str
 * @returns {boolean}
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Trim and normalize whitespace
 * @param {string} str
 * @returns {string}
 */
export function normalizeWhitespace(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Remove non-alphanumeric characters
 * @param {string} str
 * @returns {string}
 */
export function removeNonAlphanumeric(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Truncate string to length
 * @param {string} str
 * @param {number} maxLength
 * @param {string} suffix
 * @returns {string}
 */
export function truncate(str, maxLength = 100, suffix = '...') {
  if (!str || typeof str !== 'string') return str;
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Check if value is empty
 * @param {any} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
