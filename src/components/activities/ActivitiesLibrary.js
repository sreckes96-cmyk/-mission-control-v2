/**
 * Activities Library Component
 * Browse fitness, cooking, and games activities
 */

import { Component } from '../../core/Component.js';
import { FITNESS_ACTIVITIES, COOKING_ACTIVITIES, GAMES_LIBRARY } from '../../data/activities.js';
import { logger } from '../../utils/logger.js';
import { sanitize } from '../../utils/validators.js';
import { debounce } from '../../utils/helpers.js';

export class ActivitiesLibrary extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      activeTab: 'fitness',
      searchQuery: '',
      filteredActivities: [],
    };

    this.debouncedSearch = debounce((query) => this.performSearch(query), 300);
  }

  template() {
    const { activeTab, searchQuery, filteredActivities } = this.state;

    return `
      <div class="activities-library">
        <div class="activities-header">
          <h2 class="section-title">📚 Activities Library</h2>
          <p class="section-subtitle">
            ${FITNESS_ACTIVITIES.length} fitness • ${COOKING_ACTIVITIES.length} cooking • ${GAMES_LIBRARY.length} games
          </p>
        </div>

        <div class="activities-controls">
          <input
            type="text"
            id="activity-search"
            class="input-field"
            placeholder="🔍 Search activities..."
            value="${sanitize(searchQuery)}"
            aria-label="Search activities"
          />
          <div class="activities-tabs">
            <button class="activities-tab ${activeTab === 'fitness' ? 'active' : ''}" data-tab="fitness">
              💪 Fitness (${FITNESS_ACTIVITIES.length})
            </button>
            <button class="activities-tab ${activeTab === 'cooking' ? 'active' : ''}" data-tab="cooking">
              🍳 Cooking (${COOKING_ACTIVITIES.length})
            </button>
            <button class="activities-tab ${activeTab === 'games' ? 'active' : ''}" data-tab="games">
              🎮 Games (${GAMES_LIBRARY.length})
            </button>
          </div>
        </div>

        <div class="activities-grid">
          ${filteredActivities.length > 0 ? filteredActivities.map((activity) => this.renderActivity(activity)).join('') : this.renderEmptyState()}
        </div>
      </div>
    `;
  }

  renderActivity(activity) {
    const { activeTab } = this.state;

    if (activeTab === 'fitness') {
      return `
        <div class="activity-card">
          <div class="activity-card-header">
            <h3 class="activity-card-title">${sanitize(activity.name)}</h3>
            <span class="activity-badge">${sanitize(activity.category)}</span>
          </div>
          <p class="activity-card-desc">${sanitize(activity.description)}</p>
          <div class="activity-card-meta">
            <span>⏱️ ${sanitize(activity.duration)}</span>
            <span>🎯 ${sanitize(activity.equipment)}</span>
          </div>
        </div>
      `;
    }

    if (activeTab === 'cooking') {
      return `
        <div class="activity-card">
          <div class="activity-card-header">
            <h3 class="activity-card-title">${sanitize(activity.name)}</h3>
            <span class="activity-badge">${sanitize(activity.category)}</span>
          </div>
          <p class="activity-card-desc">${sanitize(activity.description)}</p>
          <div class="activity-card-meta">
            <span>⏱️ ${sanitize(activity.duration)}</span>
            <span>📚 Skills: ${sanitize(activity.skills)}</span>
          </div>
        </div>
      `;
    }

    if (activeTab === 'games') {
      return `
        <div class="activity-card">
          <div class="activity-card-header">
            <h3 class="activity-card-title">${sanitize(activity.name)}</h3>
            <span class="activity-badge">${sanitize(activity.energy)}</span>
          </div>
          <p class="activity-card-desc">${sanitize(activity.description)}</p>
          <div class="activity-card-meta">
            <span>👥 Ages ${activity.minAge}-${activity.maxAge}</span>
            <span>📍 ${sanitize(activity.location)}</span>
            <span>🏆 ${sanitize(activity.competition)}</span>
          </div>
        </div>
      `;
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No activities found</h3>
        <p>Try adjusting your search</p>
      </div>
    `;
  }

  attachEvents() {
    // Search input
    const searchInput = this.$('#activity-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setState({ searchQuery: e.target.value });
        this.debouncedSearch(e.target.value);
      });
    }

    // Tab buttons
    const tabButtons = this.$$('.activities-tab');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.setState({ activeTab: tab });
        this.filterActivities();
      });
    });
  }

  performSearch(query) {
    this.filterActivities();
  }

  filterActivities() {
    const { activeTab, searchQuery } = this.state;
    let activities = [];

    // Get activities for active tab
    if (activeTab === 'fitness') {
      activities = FITNESS_ACTIVITIES;
    } else if (activeTab === 'cooking') {
      activities = COOKING_ACTIVITIES;
    } else if (activeTab === 'games') {
      activities = GAMES_LIBRARY;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      activities = activities.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          (a.description && a.description.toLowerCase().includes(query))
      );
    }

    this.setState({ filteredActivities: activities });
  }

  onMount() {
    this.filterActivities();
    logger.info('Activities library mounted');
  }
}

export function addActivitiesLibraryStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .activities-library {
      width: 100%;
    }

    .activities-header {
      margin-bottom: 1.5rem;
    }

    .activities-controls {
      margin-bottom: 1.5rem;
    }

    .activities-controls input {
      width: 100%;
      margin-bottom: 1rem;
    }

    .activities-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .activities-tab {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--cream);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: var(--font-body);
    }

    .activities-tab:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .activities-tab.active {
      background: var(--amber-warm);
      color: var(--navy-deep);
      border-color: var(--amber-warm);
    }

    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .activity-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.3s ease;
    }

    .activity-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
    }

    .activity-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .activity-card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--amber-bright);
      margin: 0;
    }

    .activity-badge {
      padding: 0.25rem 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .activity-card-desc {
      font-size: 0.9rem;
      color: var(--gray-soft);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .activity-card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: var(--gray-soft);
    }

    @media (max-width: 768px) {
      .activities-grid {
        grid-template-columns: 1fr;
      }

      .activities-tabs {
        flex-direction: column;
      }

      .activities-tab {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}
