/**
 * Base Repository Class
 * Provides CRUD operations with validation and error handling
 */

import { loadFromStorage, saveToStorage, removeFromStorage } from './Storage.js';
import { AppError, ErrorType, ErrorSeverity, errorHandler } from '../utils/errorHandler.js';
import { Validator } from '../utils/validation.js';

export class Repository {
  /**
   * @param {string} storageKey - localStorage key (without prefix)
   * @param {Object} schema - Validation schema
   */
  constructor(storageKey, schema = null) {
    this.storageKey = storageKey;
    this.schema = schema;
    this.validator = schema ? new Validator(schema) : null;
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
      errorHandler.handleError(
        new AppError(
          `Failed to load ${this.storageKey}`,
          ErrorType.STORAGE,
          ErrorSeverity.MEDIUM,
          { storageKey: this.storageKey, originalError: error }
        ),
        { operation: 'getAll', repository: this.constructor.name }
      );
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
        throw new AppError(
          'Data must be an array',
          ErrorType.DATA_INTEGRITY,
          ErrorSeverity.HIGH,
          { storageKey: this.storageKey }
        );
      }

      const validated = this.validateAll(items);
      const success = saveToStorage(this.storageKey, validated);

      if (success) {
        // Update cache
        this.cache = validated;
        this.cacheTime = Date.now();
      } else {
        throw new AppError(
          `Failed to save ${this.storageKey}`,
          ErrorType.STORAGE,
          ErrorSeverity.HIGH,
          { storageKey: this.storageKey, itemCount: items.length }
        );
      }

      return success;
    } catch (error) {
      errorHandler.handleError(
        error instanceof AppError ? error : new AppError(
          `Failed to save ${this.storageKey}: ${error.message}`,
          ErrorType.STORAGE,
          ErrorSeverity.HIGH,
          { storageKey: this.storageKey, originalError: error }
        ),
        { operation: 'save', repository: this.constructor.name, data: items }
      );
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
    if (!this.validator) return item;

    try {
      const result = this.validator.validate(item);

      if (!result.isValid) {
        const errorMessages = this.validator.getAllErrors();
        throw new AppError(
          `Validation failed: ${errorMessages.join(', ')}`,
          ErrorType.VALIDATION,
          ErrorSeverity.MEDIUM,
          { errors: result.errors, item }
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Validation error: ${error.message}`,
        ErrorType.VALIDATION,
        ErrorSeverity.MEDIUM,
        { originalError: error, item }
      );
    }
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
