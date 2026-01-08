/**
 * Base Repository Class
 * Provides CRUD operations with validation and error handling
 */

import { loadFromStorage, saveToStorage, removeFromStorage } from './Storage.js';

export class Repository {
  /**
   * @param {string} storageKey - localStorage key (without prefix)
   * @param {Object} schema - Validation schema
   */
  constructor(storageKey, schema = null) {
    this.storageKey = storageKey;
    this.schema = schema;
    this.cache = null;
    this.cacheTime = 0;
    this.cacheDuration = 5000; // 5 seconds
  }

  /**
   * Get all items
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Array} All items
   */
  getAll(useCache = true) {
    // Return cached data if available and fresh
    if (useCache && this.cache && Date.now() - this.cacheTime < this.cacheDuration) {
      return [...this.cache];
    }

    try {
      const data = loadFromStorage(this.storageKey, []);
      const items = Array.isArray(data) ? data : [];

      // Update cache
      this.cache = items;
      this.cacheTime = Date.now();

      return [...items];
    } catch (error) {
      console.error(`Failed to load ${this.storageKey}:`, error);
      return [];
    }
  }

  /**
   * Get single item by ID
   * @param {number|string} id
   * @returns {Object|null}
   */
  getById(id) {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  /**
   * Get items matching filter
   * @param {Function} filterFn - Filter function
   * @returns {Array} Filtered items
   */
  find(filterFn) {
    const items = this.getAll();
    return items.filter(filterFn);
  }

  /**
   * Get first item matching filter
   * @param {Function} filterFn - Filter function
   * @returns {Object|null} First matching item
   */
  findOne(filterFn) {
    const items = this.getAll();
    return items.find(filterFn) || null;
  }

  /**
   * Save all items
   * @param {Array} items
   * @returns {boolean} Success status
   */
  save(items) {
    try {
      if (!Array.isArray(items)) {
        throw new Error('Data must be an array');
      }

      const validated = this.validateAll(items);
      const success = saveToStorage(this.storageKey, validated);

      if (success) {
        // Update cache
        this.cache = validated;
        this.cacheTime = Date.now();
      }

      return success;
    } catch (error) {
      console.error(`Failed to save ${this.storageKey}:`, error);
      throw error;
    }
  }

  /**
   * Add single item
   * @param {Object} item
   * @returns {Object} Added item with ID
   */
  add(item) {
    const items = this.getAll();

    // Generate ID if not provided
    if (!item.id) {
      item.id = this.generateId(items);
    }

    const validated = this.validate(item);
    items.push(validated);

    if (this.save(items)) {
      return validated;
    }

    throw new Error('Failed to add item');
  }

  /**
   * Update single item
   * @param {number|string} id
   * @param {Object} updates
   * @returns {Object} Updated item
   */
  update(id, updates) {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    const updated = { ...items[index], ...updates, id }; // Preserve ID
    const validated = this.validate(updated);

    items[index] = validated;

    if (this.save(items)) {
      return validated;
    }

    throw new Error('Failed to update item');
  }

  /**
   * Delete item by ID
   * @param {number|string} id
   * @returns {boolean} Success status
   */
  delete(id) {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length === items.length) {
      throw new Error(`Item with id ${id} not found`);
    }

    return this.save(filtered);
  }

  /**
   * Delete all items matching filter
   * @param {Function} filterFn - Filter function
   * @returns {number} Number of deleted items
   */
  deleteWhere(filterFn) {
    const items = this.getAll();
    const remaining = items.filter((item) => !filterFn(item));
    const deletedCount = items.length - remaining.length;

    if (deletedCount > 0) {
      this.save(remaining);
    }

    return deletedCount;
  }

  /**
   * Count all items
   * @returns {number}
   */
  count() {
    return this.getAll().length;
  }

  /**
   * Count items matching filter
   * @param {Function} filterFn
   * @returns {number}
   */
  countWhere(filterFn) {
    return this.find(filterFn).length;
  }

  /**
   * Check if item exists
   * @param {number|string} id
   * @returns {boolean}
   */
  exists(id) {
    return this.getById(id) !== null;
  }

  /**
   * Clear all data
   * @returns {boolean}
   */
  clear() {
    this.cache = null;
    this.cacheTime = 0;
    removeFromStorage(this.storageKey);
    return true;
  }

  /**
   * Export data as JSON
   * @returns {string} JSON string
   */
  export() {
    const items = this.getAll();
    return JSON.stringify(items, null, 2);
  }

  /**
   * Import data from JSON
   * @param {string|Object} data - JSON string or object
   * @param {boolean} merge - Merge with existing or replace
   * @returns {boolean} Success status
   */
  import(data, merge = false) {
    try {
      const items = typeof data === 'string' ? JSON.parse(data) : data;

      if (!Array.isArray(items)) {
        throw new Error('Import data must be an array');
      }

      const validated = this.validateAll(items);

      if (merge) {
        const existing = this.getAll();
        const combined = [...existing, ...validated];
        return this.save(combined);
      }

      return this.save(validated);
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Invalid import data: ' + error.message);
    }
  }

  /**
   * Validate all items
   * @param {Array} items
   * @returns {Array} Validated items
   */
  validateAll(items) {
    if (!Array.isArray(items)) {
      throw new Error('Data must be an array');
    }
    return items.map((item) => this.validate(item));
  }

  /**
   * Validate single item against schema
   * @param {Object} item
   * @returns {Object} Validated item
   */
  validate(item) {
    if (!this.schema) return item;

    const validated = {};
    const errors = [];

    for (const [key, rules] of Object.entries(this.schema)) {
      const value = item[key];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }

      // Skip validation if value is undefined/null and not required
      if (value === undefined || value === null) {
        validated[key] = rules.default !== undefined ? rules.default : value;
        continue;
      }

      // Type check
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be ${rules.type}`);
        continue;
      }

      // String validations
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${key} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} format is invalid`);
        }
      }

      // Number validations
      if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
        }
      }

      // Array validations
      if (rules.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(`${key} must be an array`);
        }
      }

      // Custom validation
      if (rules.validate && !rules.validate(value)) {
        errors.push(`${key} validation failed`);
      }

      validated[key] = value;
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    return validated;
  }

  /**
   * Generate unique ID
   * @param {Array} items - Existing items
   * @returns {number} New ID
   */
  generateId(items) {
    if (items.length === 0) return 1;
    const maxId = Math.max(...items.map((item) => item.id || 0));
    return maxId + 1;
  }

  /**
   * Invalidate cache
   */
  invalidateCache() {
    this.cache = null;
    this.cacheTime = 0;
  }
}
