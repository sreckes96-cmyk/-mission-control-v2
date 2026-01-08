/**
 * Card Component
 * Reusable card container with consistent styling
 */

/**
 * Create a card element
 * @param {Object} options - Card options
 * @param {string} options.title - Card title
 * @param {string} options.subtitle - Card subtitle
 * @param {string} options.content - Card content HTML
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement}
 */
export function createCard({ title = '', subtitle = '', content = '', className = '' }) {
  const card = document.createElement('div');
  card.className = `card ${className}`;

  if (title) {
    const titleEl = document.createElement('h2');
    titleEl.className = 'section-title';
    titleEl.textContent = title;
    card.appendChild(titleEl);
  }

  if (subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'section-subtitle';
    subtitleEl.textContent = subtitle;
    card.appendChild(subtitleEl);
  }

  if (content) {
    const contentEl = document.createElement('div');
    contentEl.className = 'card-content';
    contentEl.innerHTML = content;
    card.appendChild(contentEl);
  }

  return card;
}

/**
 * Add card styles to document
 */
export function addCardStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      margin-bottom: 1.5rem;
      animation: slideUp 0.4s ease-out;
    }

    .card-content {
      margin-top: 1rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .card-compact {
      padding: 1rem;
    }

    .card-highlight {
      border: 2px solid var(--amber-warm);
      box-shadow: 0 4px 20px rgba(255, 167, 38, 0.2);
    }

    @media (max-width: 768px) {
      .card {
        padding: 1.5rem;
      }

      .card-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
