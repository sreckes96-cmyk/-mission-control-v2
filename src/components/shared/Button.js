/**
 * Button Component Styles
 * Provides consistent button styling across the app
 */

/**
 * Create a button element with consistent styling
 * @param {Object} options - Button options
 * @param {string} options.text - Button text
 * @param {string} options.variant - Button variant (primary, secondary, danger)
 * @param {string} options.size - Button size (small, medium, large)
 * @param {Function} options.onClick - Click handler
 * @param {string} options.icon - Optional icon
 * @param {boolean} options.disabled - Disabled state
 * @param {string} options.ariaLabel - Accessibility label
 * @returns {HTMLButtonElement}
 */
export function createButton({
  text,
  variant = 'primary',
  size = 'medium',
  onClick,
  icon = '',
  disabled = false,
  ariaLabel = '',
  type = 'button',
}) {
  const button = document.createElement('button');
  button.type = type;
  button.className = `btn btn-${variant} btn-${size}`;
  button.disabled = disabled;

  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  // Add icon if provided
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'btn-icon';
    iconSpan.textContent = icon;
    button.appendChild(iconSpan);
  }

  // Add text
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  button.appendChild(textSpan);

  // Add click handler
  if (onClick && !disabled) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Add button styles to document
 */
export function addButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: var(--font-body);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn:focus {
      outline: 2px solid var(--amber-warm);
      outline-offset: 2px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--amber-warm), var(--amber-bright));
      color: var(--navy-deep);
      box-shadow: 0 4px 20px rgba(255, 167, 38, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(255, 167, 38, 0.4);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: var(--cream);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    .btn-danger {
      background: var(--color-cancelled);
      color: white;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-2px);
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .btn-medium {
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
    }

    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.05rem;
    }

    .btn-full {
      width: 100%;
      justify-content: center;
    }

    .btn-icon {
      font-size: 1.1em;
    }
  `;
  document.head.appendChild(style);
}
