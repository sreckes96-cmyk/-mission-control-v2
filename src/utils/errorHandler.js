/**
 * Comprehensive Error Handling System
 * Provides error boundaries, recovery mechanisms, and user-friendly error reporting
 */

import { logger } from './logger.js';

/**
 * Error types for classification
 */
export const ErrorType = {
  VALIDATION: 'VALIDATION',
  STORAGE: 'STORAGE',
  NETWORK: 'NETWORK',
  COMPONENT: 'COMPONENT',
  DATA_INTEGRITY: 'DATA_INTEGRITY',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'LOW',           // Minor issue, app continues normally
  MEDIUM: 'MEDIUM',     // Issue affects single feature, app continues
  HIGH: 'HIGH',         // Issue affects multiple features, degraded experience
  CRITICAL: 'CRITICAL', // App cannot function, requires user action
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, severity = ErrorSeverity.MEDIUM, metadata = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
    this.userMessage = this.generateUserMessage();
  }

  generateUserMessage() {
    const friendlyMessages = {
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.STORAGE]: 'Unable to save your data. Your work may not be saved.',
      [ErrorType.NETWORK]: 'Network connection issue. Some features may be unavailable.',
      [ErrorType.COMPONENT]: 'Something went wrong loading this feature.',
      [ErrorType.DATA_INTEGRITY]: 'Data consistency issue detected. Some information may be incorrect.',
      [ErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred.',
    };

    return friendlyMessages[this.type] || friendlyMessages[ErrorType.UNKNOWN];
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      metadata: this.metadata,
      timestamp: this.timestamp,
      userMessage: this.userMessage,
      stack: this.stack,
    };
  }
}

/**
 * Error handler with recovery strategies
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.recoveryStrategies = new Map();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Set up global error handlers
   */
  setupGlobalErrorHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      this.handleError(
        new AppError(
          event.reason?.message || 'Unhandled promise rejection',
          ErrorType.UNKNOWN,
          ErrorSeverity.HIGH,
          { reason: event.reason }
        )
      );
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      event.preventDefault();
      this.handleError(
        new AppError(
          event.message || 'Global error',
          ErrorType.UNKNOWN,
          ErrorSeverity.HIGH,
          { filename: event.filename, lineno: event.lineno, colno: event.colno }
        )
      );
    });
  }

  /**
   * Register a recovery strategy for an error type
   */
  registerRecovery(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  /**
   * Handle an error with recovery attempt
   */
  async handleError(error, context = {}) {
    const appError = error instanceof AppError
      ? error
      : new AppError(error.message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, { originalError: error });

    // Log error
    this.logError(appError, context);

    // Attempt recovery
    const recovered = await this.attemptRecovery(appError, context);

    // Notify user if not recovered
    if (!recovered) {
      this.notifyUser(appError);
    }

    return recovered;
  }

  /**
   * Attempt to recover from error
   */
  async attemptRecovery(error, context) {
    const strategy = this.recoveryStrategies.get(error.type);

    if (strategy) {
      try {
        const result = await strategy(error, context);
        if (result.success) {
          logger.success(`Recovered from ${error.type} error`);
          return true;
        }
      } catch (recoveryError) {
        logger.error('Recovery strategy failed', recoveryError);
      }
    }

    return false;
  }

  /**
   * Log error to console and internal log
   */
  logError(error, context) {
    const logEntry = {
      error: error.toJSON ? error.toJSON() : error,
      context,
      timestamp: new Date().toISOString(),
    };

    this.errorLog.push(logEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(`[CRITICAL] ${error.message}`, error);
        break;
      case ErrorSeverity.HIGH:
        logger.error(`[HIGH] ${error.message}`, error);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(`[MEDIUM] ${error.message}`, error);
        break;
      case ErrorSeverity.LOW:
        logger.info(`[LOW] ${error.message}`, error);
        break;
    }

    // Persist critical errors
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.persistError(logEntry);
    }
  }

  /**
   * Persist error to localStorage for debugging
   */
  persistError(logEntry) {
    try {
      const persistedErrors = JSON.parse(localStorage.getItem('mission_control_errors') || '[]');
      persistedErrors.push(logEntry);
      // Keep last 50 errors
      if (persistedErrors.length > 50) {
        persistedErrors.shift();
      }
      localStorage.setItem('mission_control_errors', JSON.stringify(persistedErrors));
    } catch (e) {
      // If localStorage fails, just log to console
      console.error('Failed to persist error:', e);
    }
  }

  /**
   * Notify user of error
   */
  notifyUser(error) {
    const message = error.userMessage || error.message;

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(message);
        break;
      case ErrorSeverity.HIGH:
        logger.error(message);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(message);
        break;
      case ErrorSeverity.LOW:
        logger.info(message);
        break;
    }
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Export errors for debugging
   */
  exportErrors() {
    const errors = this.getErrorLog();
    const persistedErrors = JSON.parse(localStorage.getItem('mission_control_errors') || '[]');

    return {
      recentErrors: errors,
      persistedErrors,
      exportDate: new Date().toISOString(),
    };
  }
}

/**
 * Singleton error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Register default recovery strategies
 */

// Storage error recovery - try to save to backup location
errorHandler.registerRecovery(ErrorType.STORAGE, async (error, context) => {
  try {
    const backupKey = `backup_${context.key || 'data'}_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(context.data));
    return { success: true, message: 'Data saved to backup location' };
  } catch (e) {
    return { success: false, message: 'Backup save failed' };
  }
});

// Component error recovery - attempt re-render
errorHandler.registerRecovery(ErrorType.COMPONENT, async (error, context) => {
  if (context.component && typeof context.component.render === 'function') {
    try {
      context.component.render();
      return { success: true, message: 'Component re-rendered successfully' };
    } catch (e) {
      return { success: false, message: 'Re-render failed' };
    }
  }
  return { success: false, message: 'No recovery strategy available' };
});

/**
 * Error boundary wrapper for components
 */
export function withErrorBoundary(component, fallbackUI = null) {
  const originalRender = component.render.bind(component);
  const originalOnMount = component.onMount?.bind(component);

  component.render = function (...args) {
    try {
      return originalRender(...args);
    } catch (error) {
      errorHandler.handleError(
        new AppError(
          `Component render error: ${error.message}`,
          ErrorType.COMPONENT,
          ErrorSeverity.HIGH,
          { component: component.constructor.name, error }
        ),
        { component }
      );

      // Return fallback UI
      return fallbackUI || `
        <div class="error-boundary">
          <div class="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>This feature is temporarily unavailable. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" class="btn btn-primary">Refresh Page</button>
        </div>
      `;
    }
  };

  if (originalOnMount) {
    component.onMount = async function (...args) {
      try {
        return await originalOnMount(...args);
      } catch (error) {
        errorHandler.handleError(
          new AppError(
            `Component mount error: ${error.message}`,
            ErrorType.COMPONENT,
            ErrorSeverity.HIGH,
            { component: component.constructor.name, error }
          ),
          { component }
        );
      }
    };
  }

  return component;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync(operation, errorType = ErrorType.UNKNOWN, context = {}) {
  try {
    return await operation();
  } catch (error) {
    await errorHandler.handleError(
      new AppError(
        error.message,
        errorType,
        ErrorSeverity.MEDIUM,
        { originalError: error }
      ),
      context
    );
    return null;
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new AppError(
    `Operation failed after ${maxRetries} attempts: ${lastError.message}`,
    ErrorType.UNKNOWN,
    ErrorSeverity.HIGH,
    { attempts: maxRetries, lastError }
  );
}
