/**
 * Music Coordination Component
 * Weekly music class booking tracker
 */

import { Component } from '../../core/Component.js';
import { musicBookingRepository } from '../../data/MusicBookingRepository.js';
import { logger } from '../../utils/logger.js';
import { formatDate, getCurrentWeek } from '../../utils/helpers.js';

export class MusicCoordination extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      currentWeek: getCurrentWeek(),
      bookings: [],
      weeklyStats: {},
      showBookingForm: false,
    };

    // Days of the week
    this.daysOfWeek = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
    ];

    // Time slots
    this.timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
  }

  template() {
    const { currentWeek, bookings, showBookingForm, weeklyStats } = this.state;

    return `
      <div class="music-coordination">
        <div class="music-header">
          <div>
            <h2 class="section-title">🎵 Music Coordination</h2>
            <p class="section-subtitle">Weekly class booking tracker</p>
          </div>
          <button class="btn btn-primary" id="book-class-btn">
            ${showBookingForm ? '❌ Cancel' : '+ Book Class'}
          </button>
        </div>

        <div class="week-navigation">
          <button class="btn btn-secondary btn-small" id="prev-week">← Previous Week</button>
          <div class="current-week">
            Week of ${formatDate(currentWeek, 'long')}
          </div>
          <button class="btn btn-secondary btn-small" id="next-week">Next Week →</button>
          <button class="btn btn-primary btn-small" id="this-week">This Week</button>
        </div>

        ${showBookingForm ? this.renderBookingForm() : ''}

        <div class="weekly-summary">
          <div class="summary-stat">
            <span class="summary-label">Total Classes:</span>
            <span class="summary-value">${weeklyStats.totalClasses || 0}</span>
          </div>
          <div class="summary-stat">
            <span class="summary-label">Hours Booked:</span>
            <span class="summary-value">${weeklyStats.totalHours || 0}h</span>
          </div>
          <div class="summary-stat">
            <span class="summary-label">Most Popular Day:</span>
            <span class="summary-value">${weeklyStats.popularDay || 'N/A'}</span>
          </div>
        </div>

        <div class="schedule-table-container">
          ${this.renderScheduleTable()}
        </div>

        <div class="booking-history">
          <h3 class="section-title">📋 Recent Bookings</h3>
          ${bookings.length > 0 ? this.renderBookingsList() : '<p class="empty-message">No bookings for this week</p>'}
        </div>
      </div>
    `;
  }

  renderBookingForm() {
    return `
      <div class="booking-form-card">
        <h3 class="form-title">Book Music Class</h3>
        <form id="booking-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Day</label>
              <select id="booking-day" class="input-field" required>
                <option value="">Select day</option>
                ${this.daysOfWeek.map((d) => `<option value="${d.key}">${d.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Time</label>
              <select id="booking-time" class="input-field" required>
                <option value="">Select time</option>
                ${this.timeSlots.map((t) => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Instructor</label>
            <input type="text" id="booking-instructor" class="input-field" placeholder="Instructor name" required />
          </div>

          <div class="form-group">
            <label class="form-label">Activity Type</label>
            <select id="booking-type" class="input-field" required>
              <option value="">Select activity</option>
              <option value="Drum Circle">Drum Circle</option>
              <option value="Singing">Singing</option>
              <option value="Guitar">Guitar</option>
              <option value="Piano">Piano</option>
              <option value="Cultural Music">Cultural Music</option>
              <option value="Music Theory">Music Theory</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Duration (hours)</label>
            <input type="number" id="booking-duration" class="input-field" min="0.5" max="3" step="0.5" value="1" required />
          </div>

          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="booking-notes" class="input-field" rows="3" placeholder="Additional notes..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-full">💾 Save Booking</button>
        </form>
      </div>
    `;
  }

  renderScheduleTable() {
    const { bookings } = this.state;

    // Create a map of bookings by day and time
    const bookingMap = {};
    bookings.forEach((booking) => {
      const key = `${booking.day}-${booking.time}`;
      bookingMap[key] = booking;
    });

    return `
      <table class="schedule-table" role="grid">
        <thead>
          <tr role="row">
            <th role="columnheader">Time</th>
            ${this.daysOfWeek.map((d) => `<th role="columnheader">${d.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${this.timeSlots
            .map(
              (time) => `
            <tr role="row">
              <td class="time-cell" role="rowheader">${time}</td>
              ${this.daysOfWeek
                .map((day) => {
                  const key = `${day.key}-${time}`;
                  const booking = bookingMap[key];
                  return `
                    <td class="booking-cell ${booking ? 'booked' : 'available'}"
                        data-day="${day.key}"
                        data-time="${time}"
                        role="gridcell"
                        tabindex="0">
                      ${booking ? this.renderBookingSlot(booking) : '<span class="empty-slot">Available</span>'}
                    </td>
                  `;
                })
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  renderBookingSlot(booking) {
    return `
      <div class="booking-slot" data-booking-id="${booking.id}">
        <div class="booking-slot-type">${booking.activityType}</div>
        <div class="booking-slot-instructor">${booking.instructor}</div>
        <div class="booking-slot-duration">${booking.duration}h</div>
        <button class="booking-delete-btn" data-booking-id="${booking.id}" aria-label="Delete booking">
          ❌
        </button>
      </div>
    `;
  }

  renderBookingsList() {
    const { bookings } = this.state;

    return `
      <div class="bookings-list">
        ${bookings
          .map(
            (booking) => `
          <div class="booking-card">
            <div class="booking-card-header">
              <div class="booking-card-title">
                ${booking.activityType} - ${booking.instructor}
              </div>
              <button class="btn btn-secondary btn-small delete-booking-btn" data-booking-id="${booking.id}">
                🗑️ Delete
              </button>
            </div>
            <div class="booking-card-details">
              <span>📅 ${this.daysOfWeek.find((d) => d.key === booking.day)?.label}</span>
              <span>⏰ ${booking.time}</span>
              <span>⏱️ ${booking.duration}h</span>
            </div>
            ${booking.notes ? `<div class="booking-card-notes">${booking.notes}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  attachEvents() {
    // Book class button
    const bookBtn = this.$('#book-class-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        this.setState({ showBookingForm: !this.state.showBookingForm });
      });
    }

    // Week navigation
    const prevWeekBtn = this.$('#prev-week');
    const nextWeekBtn = this.$('#next-week');
    const thisWeekBtn = this.$('#this-week');

    if (prevWeekBtn) {
      prevWeekBtn.addEventListener('click', () => this.changeWeek(-7));
    }
    if (nextWeekBtn) {
      nextWeekBtn.addEventListener('click', () => this.changeWeek(7));
    }
    if (thisWeekBtn) {
      thisWeekBtn.addEventListener('click', () => this.goToThisWeek());
    }

    // Booking form
    const form = this.$('#booking-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmitBooking();
      });
    }

    // Delete booking buttons (in table)
    const deleteTableBtns = this.$$('.booking-delete-btn');
    deleteTableBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.bookingId);
        this.handleDeleteBooking(id);
      });
    });

    // Delete booking buttons (in list)
    const deleteListBtns = this.$$('.delete-booking-btn');
    deleteListBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.bookingId);
        this.handleDeleteBooking(id);
      });
    });

    // Booking cell clicks for quick view
    const bookingCells = this.$$('.booking-cell');
    bookingCells.forEach((cell) => {
      cell.addEventListener('click', () => {
        const day = cell.dataset.day;
        const time = cell.dataset.time;
        if (!cell.classList.contains('booked')) {
          // Auto-fill form for empty slot
          const daySelect = this.$('#booking-day');
          const timeSelect = this.$('#booking-time');
          if (daySelect) daySelect.value = day;
          if (timeSelect) timeSelect.value = time;
          this.setState({ showBookingForm: true });
        }
      });
    });
  }

  changeWeek(days) {
    const current = new Date(this.state.currentWeek);
    current.setDate(current.getDate() + days);
    const newWeek = current.toISOString().split('T')[0];
    this.setState({ currentWeek: newWeek });
    this.loadBookings();
  }

  goToThisWeek() {
    const thisWeek = getCurrentWeek();
    this.setState({ currentWeek: thisWeek });
    this.loadBookings();
  }

  handleSubmitBooking() {
    try {
      const bookingData = {
        week: this.state.currentWeek,
        day: this.$('#booking-day').value,
        time: this.$('#booking-time').value,
        instructor: this.$('#booking-instructor').value,
        activityType: this.$('#booking-type').value,
        duration: parseFloat(this.$('#booking-duration').value),
        notes: this.$('#booking-notes').value,
      };

      musicBookingRepository.addBooking(bookingData);

      logger.success('Booking saved successfully!');
      this.setState({ showBookingForm: false });
      this.loadBookings();
    } catch (error) {
      logger.error('Failed to save booking', error);
    }
  }

  handleDeleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        musicBookingRepository.deleteBooking(id);
        logger.success('Booking deleted');
        this.loadBookings();
      } catch (error) {
        logger.error('Failed to delete booking', error);
      }
    }
  }

  loadBookings() {
    try {
      const bookings = musicBookingRepository.getByWeek(this.state.currentWeek);
      const weeklyStats = musicBookingRepository.getWeeklyStats(this.state.currentWeek);

      this.setState({ bookings, weeklyStats });
      logger.info(`Loaded ${bookings.length} bookings for week of ${this.state.currentWeek}`);
    } catch (error) {
      logger.error('Failed to load bookings', error);
    }
  }

  onMount() {
    this.loadBookings();

    // Subscribe to booking changes
    this.subscribe('musicBookings', () => {
      this.loadBookings();
    });

    logger.info('Music coordination mounted');
  }
}

export function addMusicCoordinationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .music-coordination {
      width: 100%;
    }

    .music-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .week-navigation {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .current-week {
      flex: 1;
      text-align: center;
      font-weight: 600;
      color: var(--cream);
      min-width: 200px;
    }

    .booking-form-card {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid var(--amber-warm);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .weekly-summary {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      flex-wrap: wrap;
    }

    .summary-stat {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .summary-label {
      color: var(--gray-soft);
      font-size: 0.9rem;
    }

    .summary-value {
      color: var(--amber-warm);
      font-weight: 700;
      font-size: 1.1rem;
    }

    .schedule-table-container {
      overflow-x: auto;
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 1rem;
    }

    .schedule-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .schedule-table th {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.75rem;
      text-align: center;
      font-weight: 600;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      color: var(--amber-warm);
    }

    .schedule-table .time-cell {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.75rem;
      text-align: center;
      font-family: var(--font-display);
      font-weight: 600;
      color: var(--amber-warm);
      font-size: 0.85rem;
    }

    .schedule-table .booking-cell {
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 80px;
      vertical-align: top;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .schedule-table .booking-cell:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .schedule-table .booking-cell:focus {
      outline: 2px solid var(--amber-warm);
      outline-offset: -2px;
    }

    .schedule-table .booking-cell.available {
      background: rgba(255, 255, 255, 0.02);
    }

    .schedule-table .booking-cell.booked {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--color-music);
    }

    .booking-slot {
      position: relative;
      padding: 0.5rem;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.2);
    }

    .booking-slot-type {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--cream);
      margin-bottom: 0.25rem;
    }

    .booking-slot-instructor {
      font-size: 0.75rem;
      color: var(--gray-soft);
      margin-bottom: 0.25rem;
    }

    .booking-slot-duration {
      font-size: 0.7rem;
      color: var(--cyan);
      font-weight: 600;
    }

    .booking-delete-btn {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      border-radius: 4px;
      padding: 0.15rem 0.25rem;
      cursor: pointer;
      font-size: 0.7rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .booking-delete-btn:hover {
      opacity: 1;
    }

    .empty-slot {
      font-size: 0.8rem;
      color: var(--gray-soft);
      display: block;
      text-align: center;
      padding: 1rem;
    }

    .booking-history {
      margin-top: 2rem;
    }

    .bookings-list {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    .booking-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .booking-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }

    .booking-card-title {
      font-weight: 600;
      color: var(--cream);
      font-size: 1.05rem;
    }

    .booking-card-details {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: var(--gray-soft);
      margin-bottom: 0.5rem;
    }

    .booking-card-notes {
      font-size: 0.85rem;
      color: var(--gray-soft);
      font-style: italic;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      border-left: 2px solid var(--color-music);
    }

    .empty-message {
      text-align: center;
      color: var(--gray-soft);
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .music-header {
        flex-direction: column;
        align-items: stretch;
      }

      .week-navigation {
        flex-direction: column;
      }

      .current-week {
        order: -1;
        margin-bottom: 0.5rem;
      }

      .weekly-summary {
        flex-direction: column;
      }

      .schedule-table th,
      .schedule-table td {
        font-size: 0.75rem;
        padding: 0.5rem 0.25rem;
      }

      .booking-card-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `;
  document.head.appendChild(style);
}
