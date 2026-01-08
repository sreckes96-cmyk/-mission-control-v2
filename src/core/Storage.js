/**
 * Storage Layer
 * Abstracts localStorage with versioning and migration support
 */

const STORAGE_PREFIX = 'missionControl_v2_';
const VERSION_KEY = `${STORAGE_PREFIX}version`;
const CURRENT_VERSION = 2;

/**
 * Storage middleware for automatic persistence
 * @param {Array<string>} keysTopersist - Keys that should be persisted
 * @returns {Function} Middleware function
 */
export function createPersistenceMiddleware(keysToPersist = []) {
  return (key, value, oldValue) => {
    // Only persist specified keys
    if (keysToPersist.length === 0 || keysToPersist.includes(key)) {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to persist ${key}:`, error);
        // Don't throw - allow app to continue even if storage fails
      }
    }
    return value;
  };
}

/**
 * Load persisted value from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Save value to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}

/**
 * Remove value from localStorage
 * @param {string} key - Storage key
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Get current data version
 * @returns {number} Version number
 */
export function getStorageVersion() {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    return version ? parseInt(version, 10) : 1;
  } catch (error) {
    return 1;
  }
}

/**
 * Set storage version
 * @param {number} version - Version number
 */
export function setStorageVersion(version) {
  try {
    localStorage.setItem(VERSION_KEY, version.toString());
  } catch (error) {
    console.error('Failed to set version:', error);
  }
}

/**
 * Check if migration is needed
 * @returns {boolean}
 */
export function needsMigration() {
  return getStorageVersion() < CURRENT_VERSION;
}

/**
 * Export all app data
 * @returns {Object} All stored data
 */
export function exportAllData() {
  const data = {};
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const shortKey = key.replace(STORAGE_PREFIX, '');
        data[shortKey] = JSON.parse(localStorage.getItem(key));
      }
    });
  } catch (error) {
    console.error('Failed to export data:', error);
  }
  return data;
}

/**
 * Import all app data
 * @param {Object} data - Data to import
 * @param {boolean} merge - Merge with existing data or replace
 * @returns {boolean} Success status
 */
export function importAllData(data, merge = false) {
  try {
    if (!merge) {
      clearAllStorage();
    }

    Object.keys(data).forEach((key) => {
      if (key !== 'version') {
        saveToStorage(key, data[key]);
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

/**
 * Get storage size estimate in bytes
 * @returns {number} Estimated size
 */
export function getStorageSize() {
  try {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        size += key.length + (item ? item.length : 0);
      }
    });
    return size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format storage size for display
 * @returns {string} Formatted size
 */
export function getStorageSizeFormatted() {
  const bytes = getStorageSize();
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
