/**
 * Calendar View Component
 * Displays daily schedule with time slots
 */

import { Component } from '../../core/Component.js';
import { scheduleRepository } from '../../data/ScheduleRepository.js';
import { logger } from '../../utils/logger.js';
import { sanitize } from '../../utils/validators.js';

export class CalendarView extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      date: new Date().toISOString().split('T')[0],
      activities: [],
      selectedSlot: null,
    };

    // Time slots configuration
    this.timeSlots = this.generateTimeSlots();
  }

  /**
   * Generate time slots for the day
   */
  generateTimeSlots() {
    const slots = [];

    // Lunch period (15-minute intervals)
    for (let hour = 12; hour < 13; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push({ time, type: 'lunch' });
      }
    }

    // Main programming (30-minute intervals)
    const mainHours = [
      [9, 12],
      [13, 16],
    ];
    mainHours.forEach(([start, end]) => {
      for (let hour = start; hour < end; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          if (hour !== 12) {
            // Skip lunch hour
            slots.push({ time, type: 'main' });
          }
        }
      }
    });

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }

  /**
   * Component template
   */
  template() {
    const { date, activities } = this.state;

    // Create activities map for quick lookup
    const activitiesMap = {};
    activities.forEach((activity) => {
      activitiesMap[activity.time] = activity;
    });

    return `
      <div class="calendar-view">
        <div class="calendar-header">
          <div class="calendar-date-picker">
            <button class="btn btn-secondary btn-small" id="prev-day" aria-label="Previous day">
              ← Previous
            </button>
            <input
              type="date"
              id="calendar-date"
              value="${date}"
              class="input-field"
              aria-label="Select date"
            />
            <button class="btn btn-secondary btn-small" id="next-day" aria-label="Next day">
              Next →
            </button>
            <button class="btn btn-primary btn-small" id="today-btn">
              Today
            </button>
          </div>
        </div>

        <div class="schedule-grid" role="grid" aria-label="Daily schedule">
          ${this.timeSlots
            .map((slot) => {
              const activity = activitiesMap[slot.time];
              return this.renderTimeSlot(slot, activity);
            })
            .join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render individual time slot
   */
  renderTimeSlot(slot, activity) {
    const categoryClass = activity ? `category-${activity.category}` : '';
    const filledClass = activity ? 'filled' : '';

    return `
      <div class="time-slot-row" data-time="${slot.time}">
        <div class="time-slot" role="rowheader">
          ${slot.time}
        </div>
        <div
          class="activity-slot ${filledClass} ${categoryClass}"
          data-time="${slot.time}"
          role="gridcell"
          tabindex="0"
          aria-label="${activity ? `${activity.name} at ${slot.time}` : `Empty slot at ${slot.time}`}"
        >
          ${activity ? this.renderActivity(activity) : '<span class="empty-slot">+ Add Activity</span>'}
        </div>
      </div>
    `;
  }

  /**
   * Render activity block
   */
  renderActivity(activity) {
    const icon = this.getActivityIcon(activity.category);

    return `
      <div class="activity-block">
        <div class="activity-block-title">
          <span class="activity-icon">${icon}</span>
          ${sanitize(activity.name)}
          <span class="activity-category-badge badge-${activity.category}">
            ${activity.category}
          </span>
        </div>
        ${activity.description ? `<div class="activity-block-desc">${sanitize(activity.description)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Get icon for activity category
   */
  getActivityIcon(category) {
    const icons = {
      academics: '📚',
      fitness: '💪',
      music: '🎵',
      cooking: '🍳',
      games: '🎮',
      program: '📋',
      cancelled: '❌',
    };
    return icons[category] || '📋';
  }

  /**
   * Attach event listeners
   */
  attachEvents() {
    // Date navigation
    const prevBtn = this.$('#prev-day');
    const nextBtn = this.$('#next-day');
    const todayBtn = this.$('#today-btn');
    const dateInput = this.$('#calendar-date');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.changeDate(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.changeDate(1));
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => this.goToToday());
    }

    if (dateInput) {
      dateInput.addEventListener('change', (e) => this.setDate(e.target.value));
    }

    // Activity slot clicks
    const slots = this.$$('.activity-slot');
    slots.forEach((slot) => {
      slot.addEventListener('click', () => {
        const time = slot.dataset.time;
        this.selectSlot(time);
      });

      // Keyboard support
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const time = slot.dataset.time;
          this.selectSlot(time);
        }
      });
    });
  }

  /**
   * Change date by days offset
   */
  changeDate(days) {
    const current = new Date(this.state.date);
    current.setDate(current.getDate() + days);
    const newDate = current.toISOString().split('T')[0];
    this.setDate(newDate);
  }

  /**
   * Go to today
   */
  goToToday() {
    const today = new Date().toISOString().split('T')[0];
    this.setDate(today);
  }

  /**
   * Set specific date
   */
  setDate(date) {
    this.setState({ date });
    this.loadActivities();
    logger.info(`Calendar date changed to ${date}`);
  }

  /**
   * Load activities for current date
   */
  loadActivities() {
    try {
      const activities = scheduleRepository.getByDate(this.state.date);
      this.setState({ activities });
      logger.info(`Loaded ${activities.length} activities for ${this.state.date}`);
    } catch (error) {
      logger.error('Failed to load activities', error);
    }
  }

  /**
   * Select a time slot
   */
  selectSlot(time) {
    this.setState({ selectedSlot: time });
    logger.info(`Selected time slot: ${time}`);

    // TODO: Open activity editor modal
    // For now, just show an alert
    const activity = this.state.activities.find((a) => a.time === time);
    if (activity) {
      alert(`Edit activity: ${activity.name} at ${time}`);
    } else {
      alert(`Add activity at ${time}`);
    }
  }

  /**
   * Lifecycle: called after mount
   */
  onMount() {
    this.loadActivities();

    // Subscribe to schedule changes
    this.subscribe('schedules', () => {
      this.loadActivities();
    });

    logger.info('Calendar view mounted');
  }
}

/**
 * Add calendar styles
 */
export function addCalendarStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .calendar-view {
      width: 100%;
    }

    .calendar-header {
      margin-bottom: 1.5rem;
    }

    .calendar-date-picker {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .calendar-date-picker input[type="date"] {
      flex: 1;
      min-width: 200px;
    }

    .schedule-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      overflow: hidden;
    }

    .time-slot-row {
      display: grid;
      grid-template-columns: 80px 1fr;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .time-slot {
      padding: 1rem 0.75rem;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      font-family: var(--font-display);
      font-size: 0.85rem;
      color: var(--amber-warm);
      text-align: center;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .activity-slot {
      padding: 1rem;
      min-height: 60px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      align-items: center;
    }

    .activity-slot:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .activity-slot:focus {
      outline: 2px solid var(--amber-warm);
      outline-offset: -2px;
    }

    .activity-slot.filled {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-left: 3px solid var(--amber-warm);
    }

    /* Activity category colors */
    .activity-slot.category-academics { border-left-color: var(--color-academics); }
    .activity-slot.category-fitness { border-left-color: var(--color-fitness); }
    .activity-slot.category-music { border-left-color: var(--color-music); }
    .activity-slot.category-cooking { border-left-color: var(--color-cooking); }
    .activity-slot.category-games { border-left-color: var(--color-games); }
    .activity-slot.category-program { border-left-color: var(--color-program); }
    .activity-slot.category-cancelled { border-left-color: var(--color-cancelled); opacity: 0.6; }

    .empty-slot {
      color: var(--gray-soft);
      font-size: 0.9rem;
    }

    .activity-block {
      width: 100%;
    }

    .activity-block-title {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .activity-icon {
      font-size: 1.1rem;
    }

    .activity-block-desc {
      font-size: 0.85rem;
      color: var(--gray-soft);
      line-height: 1.4;
    }

    .activity-category-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-left: auto;
    }

    .badge-academics { background: rgba(96, 165, 250, 0.2); color: var(--color-academics); }
    .badge-fitness { background: rgba(249, 115, 22, 0.2); color: var(--color-fitness); }
    .badge-music { background: rgba(16, 185, 129, 0.2); color: var(--color-music); }
    .badge-cooking { background: rgba(167, 139, 250, 0.2); color: var(--color-cooking); }
    .badge-games { background: rgba(251, 191, 36, 0.2); color: var(--color-games); }
    .badge-program { background: rgba(139, 92, 246, 0.2); color: var(--color-program); }
    .badge-cancelled { background: rgba(239, 68, 68, 0.2); color: var(--color-cancelled); }

    @media (max-width: 768px) {
      .calendar-date-picker {
        flex-direction: column;
        align-items: stretch;
      }

      .calendar-date-picker input[type="date"] {
        width: 100%;
      }

      .time-slot-row {
        grid-template-columns: 60px 1fr;
      }

      .time-slot {
        font-size: 0.75rem;
        padding: 0.75rem 0.5rem;
      }

      .activity-slot {
        padding: 0.75rem;
        min-height: 50px;
      }

      .activity-block-title {
        font-size: 0.85rem;
      }
    }
  `;
  document.head.appendChild(style);
}
