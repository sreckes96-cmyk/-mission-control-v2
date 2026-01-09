/**
 * Shared Modal Styles
 * Global modal overlay and content styles
 */

export function addModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Lock body scroll when modal is open */
    body.modal-open {
      overflow: hidden;
    }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 24, 40, 0.9);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 0.2s ease;
      overflow-y: auto;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Modal Content */
    .modal-content {
      background: var(--navy-mid);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      max-width: 90vw;
      max-height: 90vh;
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
      position: relative;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--cream);
    }

    .modal-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: var(--cream);
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: rgba(239, 68, 68, 0.8);
      transform: rotate(90deg);
    }

    /* Modal Body */
    .modal-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 2rem;
      min-height: 0;
    }

    .modal-body::-webkit-scrollbar {
      width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: rgba(255, 167, 38, 0.5);
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: var(--amber-warm);
    }

    /* Modal Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
    }

    /* Form Groups */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--cream);
      font-size: 0.95rem;
    }

    .form-hint {
      font-size: 0.8rem;
      color: var(--gray-soft);
      margin-top: 0.5rem;
    }

    .empty-hint {
      color: var(--gray-soft);
      font-size: 0.85rem;
      font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-overlay {
        padding: 1rem;
      }

      .modal-content {
        max-width: 100%;
        max-height: 100%;
        border-radius: 12px;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1rem;
      }
    }
  `;
  document.head.appendChild(style);
}
