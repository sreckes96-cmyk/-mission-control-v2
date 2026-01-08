/**
 * Hash-based Router
 * Manages navigation between tabs with lifecycle hooks
 */

export class Router {
  constructor() {
    this.routes = new Map();
    this.current = null;
    this.beforeChangeHooks = [];
    this.afterChangeHooks = [];
    this.initialized = false;
  }

  /**
   * Initialize router and start listening
   */
  init() {
    if (this.initialized) return;

    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('load', () => this.handleHashChange());

    this.initialized = true;
    return this;
  }

  /**
   * Register a route
   * @param {string} path - Route path (without #)
   * @param {Object} handler - Route handler with optional lifecycle methods
   */
  register(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Register multiple routes
   * @param {Object} routes - Object with path: handler pairs
   */
  registerRoutes(routes) {
    Object.entries(routes).forEach(([path, handler]) => {
      this.register(path, handler);
    });
    return this;
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path
   * @param {boolean} replace - Replace current history entry
   */
  navigate(path, replace = false) {
    if (replace) {
      window.location.replace(`#${path}`);
    } else {
      window.location.hash = path;
    }
  }

  /**
   * Get current route path
   * @returns {string}
   */
  getCurrentPath() {
    return window.location.hash.slice(1) || this.getDefaultRoute();
  }

  /**
   * Get default route
   * @returns {string}
   */
  getDefaultRoute() {
    const firstRoute = this.routes.keys().next().value;
    return firstRoute || 'calendar';
  }

  /**
   * Handle hash change
   * @private
   */
  async handleHashChange() {
    const newPath = this.getCurrentPath();

    // Run beforeChange hooks
    for (const hook of this.beforeChangeHooks) {
      try {
        const result = await hook(this.current, newPath);
        if (result === false) {
          // Navigation cancelled - restore previous hash
          if (this.current) {
            window.location.hash = this.current;
          }
          return;
        }
      } catch (error) {
        console.error('BeforeChange hook error:', error);
      }
    }

    // Call onLeave on current route
    if (this.current) {
      const currentHandler = this.routes.get(this.current);
      if (currentHandler && currentHandler.onLeave) {
        try {
          await currentHandler.onLeave();
        } catch (error) {
          console.error(`Error leaving route ${this.current}:`, error);
        }
      }
    }

    // Update current route
    const previousPath = this.current;
    this.current = newPath;

    // Call onEnter on new route
    const newHandler = this.routes.get(newPath);
    if (newHandler) {
      if (newHandler.onEnter) {
        try {
          await newHandler.onEnter();
        } catch (error) {
          console.error(`Error entering route ${newPath}:`, error);
        }
      }

      // Update UI
      this.updateUI(newPath);

      // Run afterChange hooks
      for (const hook of this.afterChangeHooks) {
        try {
          await hook(previousPath, newPath);
        } catch (error) {
          console.error('AfterChange hook error:', error);
        }
      }
    } else {
      console.warn(`No handler found for route: ${newPath}`);
      // Navigate to default route
      this.navigate(this.getDefaultRoute(), true);
    }
  }

  /**
   * Update UI for active route
   * @private
   */
  updateUI(path) {
    // Update navigation tabs
    document.querySelectorAll('.nav-tab').forEach((tab) => {
      const isActive = tab.dataset.tab === path;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Update sections
    document.querySelectorAll('.section').forEach((section) => {
      const sectionPath = section.id.replace('-section', '');
      const isActive = sectionPath === path;
      section.classList.toggle('active', isActive);
      section.setAttribute('aria-hidden', !isActive);
    });
  }

  /**
   * Add beforeChange hook
   * Hook can return false to cancel navigation
   * @param {Function} hook - (from, to) => boolean|Promise<boolean>
   */
  beforeChange(hook) {
    this.beforeChangeHooks.push(hook);
    return this;
  }

  /**
   * Add afterChange hook
   * @param {Function} hook - (from, to) => void|Promise<void>
   */
  afterChange(hook) {
    this.afterChangeHooks.push(hook);
    return this;
  }

  /**
   * Get route parameter from hash
   * Example: #students/123 → { id: '123' }
   * @returns {Object}
   */
  getParams() {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/');
    const params = {};

    if (parts.length > 1) {
      // Simple id parameter
      params.id = parts[1];
    }

    return params;
  }

  /**
   * Navigate back
   */
  back() {
    window.history.back();
  }

  /**
   * Navigate forward
   */
  forward() {
    window.history.forward();
  }

  /**
   * Reload current route
   */
  reload() {
    this.handleHashChange();
  }
}

// Export singleton
export const router = new Router();
