/**
 * Keyboard Navigation & Shortcuts System
 * Provides comprehensive keyboard navigation for accessibility
 */

import { logger } from './logger.js';

/**
 * Keyboard shortcut manager
 */
export class KeyboardManager {
  constructor() {
    this.shortcuts = new Map();
    this.scopes = new Map();
    this.currentScope = 'global';
    this.enabled = true;
    this.setupGlobalListeners();
  }

  /**
   * Set up global keyboard listeners
   */
  setupGlobalListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

      const key = this.getKeyCombo(e);

      // Check current scope first
      const scopeShortcuts = this.scopes.get(this.currentScope);
      if (scopeShortcuts && scopeShortcuts.has(key)) {
        const handler = scopeShortcuts.get(key);
        if (this.shouldExecute(e, handler)) {
          e.preventDefault();
          handler.callback(e);
        }
        return;
      }

      // Fall back to global shortcuts
      if (this.shortcuts.has(key)) {
        const handler = this.shortcuts.get(key);
        if (this.shouldExecute(e, handler)) {
          e.preventDefault();
          handler.callback(e);
        }
      }
    });
  }

  /**
   * Get key combination string
   */
  getKeyCombo(e) {
    const parts = [];

    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');

    const key = e.key.toLowerCase();
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      parts.push(key);
    }

    return parts.join('+');
  }

  /**
   * Check if shortcut should execute
   */
  shouldExecute(e, handler) {
    // Don't execute if typing in input/textarea
    if (!handler.allowInInputs && this.isInputFocused()) {
      return false;
    }
    return true;
  }

  /**
   * Check if an input element is focused
   */
  isInputFocused() {
    const active = document.activeElement;
    return active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.contentEditable === 'true'
    );
  }

  /**
   * Register a keyboard shortcut
   */
  register(key, callback, options = {}) {
    const {
      description = '',
      scope = 'global',
      allowInInputs = false,
    } = options;

    const handler = { callback, description, allowInInputs };

    if (scope === 'global') {
      this.shortcuts.set(key, handler);
    } else {
      if (!this.scopes.has(scope)) {
        this.scopes.set(scope, new Map());
      }
      this.scopes.get(scope).set(key, handler);
    }

    logger.info(`Registered shortcut: ${key} (${description || 'no description'})`);
    return this;
  }

  /**
   * Unregister a shortcut
   */
  unregister(key, scope = 'global') {
    if (scope === 'global') {
      this.shortcuts.delete(key);
    } else {
      const scopeShortcuts = this.scopes.get(scope);
      if (scopeShortcuts) {
        scopeShortcuts.delete(key);
      }
    }
    return this;
  }

  /**
   * Set current scope
   */
  setScope(scope) {
    this.currentScope = scope;
  }

  /**
   * Enable/disable keyboard shortcuts
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(scope = 'global') {
    const shortcuts = [];

    if (scope === 'global') {
      for (const [key, handler] of this.shortcuts.entries()) {
        shortcuts.push({ key, description: handler.description });
      }
    } else {
      const scopeShortcuts = this.scopes.get(scope);
      if (scopeShortcuts) {
        for (const [key, handler] of scopeShortcuts.entries()) {
          shortcuts.push({ key, description: handler.description });
        }
      }
    }

    return shortcuts;
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  constructor() {
    this.focusStack = [];
    this.setupFocusIndicators();
  }

  /**
   * Set up visual focus indicators
   */
  setupFocusIndicators() {
    // Add global focus styles
    const style = document.createElement('style');
    style.textContent = `
      /* Focus visible polyfill */
      *:focus {
        outline: none;
      }

      *:focus-visible {
        outline: 2px solid var(--amber-warm);
        outline-offset: 2px;
        border-radius: 4px;
      }

      /* Skip to content link */
      .skip-to-content {
        position: absolute;
        top: -100px;
        left: 0;
        background: var(--navy-deep);
        color: var(--amber-warm);
        padding: 0.75rem 1.5rem;
        z-index: 10000;
        border: 2px solid var(--amber-warm);
        border-radius: 4px;
        font-weight: 600;
        transition: top 0.2s;
      }

      .skip-to-content:focus {
        top: 0;
      }

      /* Focus trap styles */
      .focus-trap-active {
        position: relative;
      }

      .focus-trap-active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Trap focus within an element
   */
  trapFocus(element) {
    const focusableElements = this.getFocusableElements(element);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store previous focus
    this.focusStack.push(document.activeElement);

    // Focus first element
    firstElement.focus();

    // Trap focus within element
    const trapHandler = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', trapHandler);
    element.classList.add('focus-trap-active');

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', trapHandler);
      element.classList.remove('focus-trap-active');

      // Restore previous focus
      const previousFocus = this.focusStack.pop();
      if (previousFocus) {
        previousFocus.focus();
      }
    };
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  }

  /**
   * Move focus to next focusable element
   */
  focusNext(container = document.body) {
    const focusable = this.getFocusableElements(container);
    const currentIndex = focusable.indexOf(document.activeElement);

    if (currentIndex === -1) {
      focusable[0]?.focus();
    } else {
      const nextIndex = (currentIndex + 1) % focusable.length;
      focusable[nextIndex]?.focus();
    }
  }

  /**
   * Move focus to previous focusable element
   */
  focusPrevious(container = document.body) {
    const focusable = this.getFocusableElements(container);
    const currentIndex = focusable.indexOf(document.activeElement);

    if (currentIndex === -1) {
      focusable[focusable.length - 1]?.focus();
    } else {
      const prevIndex = currentIndex === 0 ? focusable.length - 1 : currentIndex - 1;
      focusable[prevIndex]?.focus();
    }
  }

  /**
   * Add skip to content link
   */
  addSkipToContent(targetId = 'app-content') {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.tabIndex = -1;
        target.focus();
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

/**
 * ARIA live region manager
 */
export class LiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.setupLiveRegions();
  }

  /**
   * Set up default live regions
   */
  setupLiveRegions() {
    // Create polite region
    const polite = this.createRegion('polite');
    document.body.appendChild(polite);
    this.regions.set('polite', polite);

    // Create assertive region
    const assertive = this.createRegion('assertive');
    document.body.appendChild(assertive);
    this.regions.set('assertive', assertive);
  }

  /**
   * Create a live region element
   */
  createRegion(politeness) {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    return region;
  }

  /**
   * Announce a message to screen readers
   */
  announce(message, politeness = 'polite') {
    const region = this.regions.get(politeness);
    if (!region) return;

    // Clear previous message
    region.textContent = '';

    // Announce new message after small delay (ensures screen reader picks it up)
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear after 5 seconds
    setTimeout(() => {
      region.textContent = '';
    }, 5000);
  }
}

/**
 * Singleton instances
 */
export const keyboardManager = new KeyboardManager();
export const focusManager = new FocusManager();
export const liveRegion = new LiveRegionManager();

/**
 * Register default keyboard shortcuts
 */
export function registerDefaultShortcuts() {
  // Navigation shortcuts
  keyboardManager.register('ctrl+1', () => window.location.hash = '#calendar', {
    description: 'Navigate to Calendar'
  });
  keyboardManager.register('ctrl+2', () => window.location.hash = '#students', {
    description: 'Navigate to Students'
  });
  keyboardManager.register('ctrl+3', () => window.location.hash = '#antwaun', {
    description: 'Navigate to Antwaun Dashboard'
  });
  keyboardManager.register('ctrl+4', () => window.location.hash = '#planner', {
    description: 'Navigate to Quick Planner'
  });
  keyboardManager.register('ctrl+5', () => window.location.hash = '#activities', {
    description: 'Navigate to Activities'
  });
  keyboardManager.register('ctrl+6', () => window.location.hash = '#arena', {
    description: 'Navigate to Arena'
  });

  // Utility shortcuts
  keyboardManager.register('ctrl+k', () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
    if (searchInput) searchInput.focus();
  }, {
    description: 'Focus search'
  });

  keyboardManager.register('escape', () => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.click();
    }
  }, {
    description: 'Close modal',
    allowInInputs: true
  });

  keyboardManager.register('?', () => {
    showKeyboardShortcuts();
  }, {
    description: 'Show keyboard shortcuts'
  });

  logger.info('Default keyboard shortcuts registered');
}

/**
 * Show keyboard shortcuts help
 */
function showKeyboardShortcuts() {
  const shortcuts = keyboardManager.getShortcuts();

  const html = `
    <div class="modal-overlay" id="shortcuts-modal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button class="modal-close" id="close-shortcuts">✕</button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-list">
            ${shortcuts.map(s => `
              <div class="shortcut-item">
                <kbd>${s.key.replace(/\+/g, '</kbd> + <kbd>')}</kbd>
                <span>${s.description}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container.firstElementChild);

  const modal = document.getElementById('shortcuts-modal');
  const closeBtn = document.getElementById('close-shortcuts');

  closeBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Add styles for shortcuts modal
  const style = document.createElement('style');
  style.textContent = `
    .shortcuts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
    }

    kbd {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      color: var(--amber-warm);
    }
  `;
  document.head.appendChild(style);

  focusManager.trapFocus(modal);
}

/**
 * Initialize accessibility features
 */
export function initializeAccessibility() {
  registerDefaultShortcuts();
  focusManager.addSkipToContent();
  logger.success('Accessibility features initialized');
}
