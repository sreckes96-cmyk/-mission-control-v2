/**
 * Logger and Error Handling Utility
 * Provides centralized logging with user-friendly error messages
 */

class Logger {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.logs = [];
    this.maxEntries = 100;
    this.enabled = true;
    this.notificationContainer = null;
  }

  /**
   * Initialize logger with notification container
   * @param {HTMLElement|string} container - Notification container
   */
  init(container) {
    this.notificationContainer =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }
  }

  /**
   * Create notification container if it doesn't exist
   * @private
   */
  createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    this.notificationContainer = container;
  }

  /**
   * Log error
   * @param {string} message - Technical error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  error(message, error = null, context = {}) {
    const entry = {
      level: 'error',
      timestamp: new Date(),
      message,
      error: error ? error.message : null,
      stack: error ? error.stack : null,
      context,
    };

    this.errors.push(entry);
    this.trimEntries(this.errors);

    if (this.enabled) {
      console.error(message, error || '', context);
      this.showNotification('error', this.getUserMessage(message, error));
    }
  }

  /**
   * Log warning
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    const entry = {
      level: 'warn',
      timestamp: new Date(),
      message,
      context,
    };

    this.warnings.push(entry);
    this.trimEntries(this.warnings);

    if (this.enabled) {
      console.warn(message, context);
    }
  }

  /**
   * Log info
   * @param {string} message - Info message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    const entry = {
      level: 'info',
      timestamp: new Date(),
      message,
      context,
    };

    this.logs.push(entry);
    this.trimEntries(this.logs);

    if (this.enabled) {
      console.info(message, context);
    }
  }

  /**
   * Log success
   * @param {string} message - Success message
   */
  success(message) {
    if (this.enabled) {
      console.log(`✓ ${message}`);
      this.showNotification('success', message);
    }
  }

  /**
   * Trim entries to max length
   * @private
   */
  trimEntries(array) {
    if (array.length > this.maxEntries) {
      array.shift();
    }
  }

  /**
   * Get user-friendly message from technical error
   * @param {string} message - Technical message
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  getUserMessage(message, error = null) {
    // Map technical errors to user-friendly messages
    const errorMap = {
      'Failed to save': 'Could not save your changes. Please try again.',
      'Failed to load': 'Could not load data. Your information might be temporarily unavailable.',
      'Failed to delete': 'Could not delete the item. Please try again.',
      'Validation error': 'Please check your input and try again.',
      'Network error': 'Network connection issue. Please check your connection.',
      'Storage quota': 'Storage is full. Please clear some data.',
      'Permission denied': 'Permission denied. Please check your browser settings.',
      'Not found': 'The requested item was not found.',
      'Duplicate': 'This item already exists.',
    };

    // Check for known errors
    for (const [key, userMsg] of Object.entries(errorMap)) {
      if (message.includes(key) || error?.message?.includes(key)) {
        return userMsg;
      }
    }

    // Check for validation errors
    if (message.includes('Validation') || error?.message?.includes('Validation')) {
      return error?.message || message;
    }

    // Generic fallback
    return 'Something went wrong. Your data is safe. Please try again.';
  }

  /**
   * Show toast notification
   * @param {string} type - Notification type (error, success, warning, info)
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  showNotification(type, message, duration = 5000) {
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const colors = {
      error: '#ef4444',
      success: '#10b981',
      warning: '#fbbf24',
      info: '#60a5fa',
    };

    const icons = {
      error: '❌',
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️',
    };

    notification.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
    `;

    notification.innerHTML = `
      <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${message}</span>
      <button style="
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        opacity: 0.7;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">✕</button>
    `;

    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => this.removeNotification(notification));

    this.notificationContainer.appendChild(notification);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification), duration);
    }
  }

  /**
   * Remove notification with animation
   * @private
   */
  removeNotification(notification) {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    if (this.notificationContainer) {
      this.notificationContainer.innerHTML = '';
    }
  }

  /**
   * Export logs as JSON
   * @returns {string} JSON string of logs
   */
  exportLogs() {
    return JSON.stringify(
      {
        errors: this.errors,
        warnings: this.warnings,
        logs: this.logs,
        timestamp: new Date(),
      },
      null,
      2
    );
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.errors = [];
    this.warnings = [];
    this.logs = [];
  }

  /**
   * Get recent errors
   * @param {number} count - Number of errors to return
   * @returns {Array} Recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Disable logging (for production)
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Enable logging
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Check if there are any errors
   * @returns {boolean}
   */
  hasErrors() {
    return this.errors.length > 0;
  }
}

// Export singleton
export const logger = new Logger();

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
