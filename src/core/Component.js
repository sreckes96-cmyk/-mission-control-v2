/**
 * Base Component Class
 * Provides lifecycle management and rendering patterns
 */

export class Component {
  /**
   * @param {HTMLElement|string} container - DOM element or selector
   * @param {Object} props - Component properties
   */
  constructor(container, props = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) {
      console.error(`Container not found:`, container);
    }

    this.props = props;
    this.state = {};
    this.mounted = false;
    this.subscriptions = [];
    this.eventListeners = [];
  }

  /**
   * Override to define component template
   * @returns {string} HTML template
   */
  template() {
    return '';
  }

  /**
   * Override to attach event listeners
   * Use this.addEventListener() to ensure proper cleanup
   */
  attachEvents() {}

  /**
   * Override to cleanup on unmount
   */
  cleanup() {}

  /**
   * Lifecycle: called after first render
   */
  onMount() {}

  /**
   * Lifecycle: called before unmount
   */
  onUnmount() {}

  /**
   * Lifecycle: called after every update
   */
  onUpdate() {}

  /**
   * Set internal component state
   * @param {Object} newState - State updates
   * @param {boolean} shouldRender - Whether to re-render
   */
  setState(newState, shouldRender = true) {
    this.state = { ...this.state, ...newState };
    if (shouldRender) {
      this.render();
    }
  }

  /**
   * Render component
   * @param {boolean} force - Force re-render even if already mounted
   */
  render(force = false) {
    if (!this.container) {
      console.error('Cannot render: container not found');
      return;
    }

    const html = this.template();
    this.container.innerHTML = html;
    this.attachEvents();

    if (!this.mounted || force) {
      this.mounted = true;
      this.onMount();
    } else {
      this.onUpdate();
    }
  }

  /**
   * Update component with new props
   * @param {Object} newProps - New properties
   */
  update(newProps = {}) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  /**
   * Remove component and cleanup
   */
  destroy() {
    this.onUnmount();
    this.cleanup();
    this.removeAllEventListeners();
    this.unsubscribeAll();

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.mounted = false;
  }

  /**
   * Add event listener with automatic cleanup
   * @param {HTMLElement|string} target - Element or selector
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  addEventListener(target, event, handler, options = {}) {
    const element = typeof target === 'string' ? this.container.querySelector(target) : target;

    if (!element) {
      console.warn(`Event target not found:`, target);
      return;
    }

    element.addEventListener(event, handler, options);

    // Store for cleanup
    this.eventListeners.push({ element, event, handler, options });
  }

  /**
   * Remove all event listeners
   * @private
   */
  removeAllEventListeners() {
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners = [];
  }

  /**
   * Subscribe to store with automatic cleanup
   * @param {string} key - State key
   * @param {Function} callback - Subscription callback
   */
  subscribe(key, callback) {
    const unsubscribe = this.props.store?.subscribe(key, callback);
    if (unsubscribe) {
      this.subscriptions.push(unsubscribe);
    }
  }

  /**
   * Unsubscribe from all store subscriptions
   * @private
   */
  unsubscribeAll() {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
  }

  /**
   * Emit custom event
   * @param {string} eventName - Event name
   * @param {any} detail - Event data
   */
  emit(eventName, detail = {}) {
    if (!this.container) return;

    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });

    this.container.dispatchEvent(event);
  }

  /**
   * Query element within component
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null}
   */
  $(selector) {
    return this.container ? this.container.querySelector(selector) : null;
  }

  /**
   * Query all elements within component
   * @param {string} selector - CSS selector
   * @returns {NodeList}
   */
  $$(selector) {
    return this.container ? this.container.querySelectorAll(selector) : [];
  }

  /**
   * Show component
   */
  show() {
    if (this.container) {
      this.container.style.display = '';
      this.container.removeAttribute('hidden');
    }
  }

  /**
   * Hide component
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Toggle component visibility
   */
  toggle() {
    if (this.container) {
      const isHidden = this.container.style.display === 'none';
      isHidden ? this.show() : this.hide();
    }
  }
}
