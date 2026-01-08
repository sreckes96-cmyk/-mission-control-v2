/**
 * Reactive State Store
 * Centralized state management with pub/sub pattern
 */

export class Store {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.middleware = [];
  }

  /**
   * Get current state value
   * @param {string} key - State key
   * @returns {any} State value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Get entire state (for debugging)
   * @returns {Object} Full state object
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set state value and notify subscribers
   * @param {string} key - State key
   * @param {any} value - New value
   * @param {Object} options - Options { silent: boolean }
   */
  set(key, value, options = {}) {
    const oldValue = this.state[key];

    // Don't update if value hasn't changed
    if (oldValue === value) return;

    // Run middleware (validation, logging, persistence, etc.)
    let processedValue = value;
    for (const mw of this.middleware) {
      try {
        processedValue = mw(key, processedValue, oldValue);
      } catch (error) {
        console.error(`Middleware error for ${key}:`, error);
        throw error;
      }
    }

    this.state[key] = processedValue;

    // Notify subscribers unless silent
    if (!options.silent) {
      this.notify(key, processedValue, oldValue);
    }
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Called when state changes (newValue, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }

    this.listeners[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of state change
   * @private
   */
  notify(key, newValue, oldValue) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((callback) => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Subscriber error for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Add middleware function
   * Middleware signature: (key, value, oldValue) => value
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Batch multiple state updates
   * Only notifies subscribers once after all updates
   * @param {Function} updateFn - Function that performs multiple set() calls
   */
  batch(updateFn) {
    const updates = [];
    const originalSet = this.set.bind(this);

    // Temporarily override set to collect updates
    this.set = (key, value) => {
      const oldValue = this.state[key];
      this.state[key] = value;
      updates.push({ key, value, oldValue });
    };

    // Execute updates
    updateFn();

    // Restore original set
    this.set = originalSet;

    // Notify all subscribers
    updates.forEach(({ key, value, oldValue }) => {
      this.notify(key, value, oldValue);
    });
  }

  /**
   * Clear all state (useful for testing)
   */
  clear() {
    this.state = {};
    this.listeners = {};
  }

  /**
   * Reset to initial state
   * @param {Object} initialState - Initial state values
   */
  reset(initialState = {}) {
    this.clear();
    Object.keys(initialState).forEach((key) => {
      this.set(key, initialState[key]);
    });
  }
}

// Export singleton instance
export const store = new Store();
