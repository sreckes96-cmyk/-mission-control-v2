/**
 * Interactive Calendar Component
 * Daily schedule with activity placement and color coding
 */

import { Component } from '../../core/Component.js';
import { scheduleRepository } from '../../data/ScheduleRepository.js';
import { getAllCategories, getCategoryColor } from '../../data/activityCategories.js';
import { logger } from '../../utils/logger.js';

export class InteractiveCalendar extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      currentDate: new Date().toISOString().split('T')[0],
      selectedDay: this.getDayOfWeek(new Date()),
      activities: [],
      showActivityPicker: false,
      selectedSlot: null,
      draggedActivity: null,
    };

    // Schedule configuration
    this.scheduleConfig = {
      monday: { start: '12:00', end: '17:00', break: null },
      tuesday: { start: '12:00', end: '17:00', break: null },
      wednesday: { start: '12:00', end: '17:00', break: null },
      thursday: { start: '12:00', end: '17:00', break: null },
      friday: { start: '12:00', end: '21:00', break: { start: '17:00', end: '18:00' } },
      saturday: { start: '12:00', end: '19:00', break: null },
      sunday: null, // Closed
    };

    this.slotDuration = 30; // minutes
  }

  getDayOfWeek(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
  }

  generateTimeSlots(dayConfig) {
    if (!dayConfig) return [];

    const slots = [];
    const startTime = this.parseTime(dayConfig.start);
    const endTime = this.parseTime(dayConfig.end);

    let currentTime = startTime;

    while (currentTime < endTime) {
      const slotEnd = currentTime + this.slotDuration;

      // Check if this slot is during break time
      let isBreak = false;
      if (dayConfig.break) {
        const breakStart = this.parseTime(dayConfig.break.start);
        const breakEnd = this.parseTime(dayConfig.break.end);
        if (currentTime >= breakStart && currentTime < breakEnd) {
          isBreak = true;
        }
      }

      slots.push({
        start: this.formatTime(currentTime),
        end: this.formatTime(slotEnd),
        isBreak,
      });

      currentTime = slotEnd;
    }

    return slots;
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  template() {
    const { currentDate, selectedDay, activities, showActivityPicker, selectedSlot } = this.state;
    const dayConfig = this.scheduleConfig[selectedDay];

    if (!dayConfig) {
      return `
        <div class="interactive-calendar">
          <div class="calendar-header">
            ${this.renderDateNavigation()}
          </div>
          <div class="no-schedule">
            <div class="no-schedule-icon">🌙</div>
            <h3>Sunday - No Programming</h3>
            <p>Enjoy your day off!</p>
          </div>
        </div>
      `;
    }

    const timeSlots = this.generateTimeSlots(dayConfig);

    return `
      <div class="interactive-calendar">
        <div class="calendar-header">
          ${this.renderDateNavigation()}
          <div class="calendar-actions">
            <button class="btn btn-primary" id="add-activity-btn">
              ➕ Add Activity
            </button>
            <button class="btn btn-secondary" id="clear-day-btn">
              🗑️ Clear Day
            </button>
          </div>
        </div>

        <div class="calendar-body">
          <div class="activity-palette">
            ${this.renderActivityPalette()}
          </div>

          <div class="schedule-grid">
            ${this.renderScheduleGrid(timeSlots, activities)}
          </div>
        </div>

        ${showActivityPicker ? this.renderActivityPickerModal(selectedSlot) : ''}
      </div>
    `;
  }

  renderDateNavigation() {
    const { currentDate, selectedDay } = this.state;
    const date = new Date(currentDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="date-navigation">
        <button class="btn btn-icon" id="prev-day">←</button>
        <div class="current-date">
          <div class="date-display">${formattedDate}</div>
          <input type="date" id="date-picker" value="${currentDate}" />
        </div>
        <button class="btn btn-icon" id="next-day">→</button>
        <button class="btn btn-secondary" id="today-btn">Today</button>
      </div>
    `;
  }

  renderActivityPalette() {
    const categories = getAllCategories();

    return `
      <div class="palette-header">
        <h3>📚 Activity Types</h3>
        <p class="palette-subtitle">Click or drag to schedule</p>
      </div>
      <div class="palette-items">
        ${categories.map(cat => `
          <div
            class="palette-item"
            data-category-id="${cat.id}"
            draggable="true"
            style="--category-color: ${cat.color}">
            <span class="palette-emoji">${cat.emoji}</span>
            <span class="palette-name">${cat.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderScheduleGrid(timeSlots, activities) {
    return `
      <div class="time-slots">
        ${timeSlots.map(slot => {
          const activity = this.getActivityForSlot(slot.start, activities);
          const isBreak = slot.isBreak;

          return `
            <div
              class="time-slot ${activity ? 'has-activity' : ''} ${isBreak ? 'break-slot' : ''}"
              data-start-time="${slot.start}"
              data-end-time="${slot.end}">
              <div class="slot-time">${slot.start}</div>
              <div class="slot-content" data-slot-start="${slot.start}">
                ${activity ? this.renderActivity(activity) : (isBreak ? this.renderBreak() : this.renderEmptySlot())}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderActivity(activity) {
    const color = getCategoryColor(activity.category);
    return `
      <div class="scheduled-activity" style="background: ${color}20; border-left: 4px solid ${color}">
        <div class="activity-header">
          <span class="activity-icon">${activity.emoji || '📌'}</span>
          <span class="activity-title">${activity.title}</span>
          <button class="activity-delete" data-activity-id="${activity.id}">✕</button>
        </div>
        ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
        ${activity.students && activity.students.length > 0 ? `
          <div class="activity-students">
            👥 ${activity.students.length} student${activity.students.length !== 1 ? 's' : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderBreak() {
    return `
      <div class="break-indicator">
        <span class="break-icon">☕</span>
        <span class="break-text">Break</span>
      </div>
    `;
  }

  renderEmptySlot() {
    return `
      <div class="empty-slot">
        <span class="empty-text">Click to add activity</span>
      </div>
    `;
  }

  renderActivityPickerModal(slot) {
    const categories = getAllCategories();

    return `
      <div class="modal-overlay" id="activity-picker-modal">
        <div class="modal-content activity-picker-modal">
          <div class="modal-header">
            <h2>Add Activity</h2>
            <button class="modal-close" id="close-picker">✕</button>
          </div>

          <div class="modal-body">
            <div class="picker-time-info">
              <strong>Time:</strong> ${slot ? slot.start : 'Select a time slot'}
            </div>

            <div class="form-group">
              <label class="form-label">Activity Type</label>
              <div class="category-grid">
                ${categories.map(cat => `
                  <button
                    class="category-card"
                    data-category-id="${cat.id}"
                    style="--category-color: ${cat.color}">
                    <span class="category-emoji">${cat.emoji}</span>
                    <span class="category-name">${cat.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Activity Title</label>
              <input
                type="text"
                class="input-field"
                id="activity-title"
                placeholder="e.g., Basketball practice, Math lesson..."
              />
            </div>

            <div class="form-group">
              <label class="form-label">Notes (optional)</label>
              <textarea
                class="input-field"
                id="activity-notes"
                rows="3"
                placeholder="Add any details, reminders, or notes..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Students (optional)</label>
              <select
                id="activity-students"
                class="input-field"
                multiple
                size="5">
                <option value="all">All Students</option>
                <!-- Student options will be populated dynamically -->
              </select>
              <div class="form-hint">Hold Ctrl/Cmd to select multiple</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-activity">Cancel</button>
            <button class="btn btn-primary" id="save-activity">Save Activity</button>
          </div>
        </div>
      </div>
    `;
  }

  getActivityForSlot(timeStr, activities) {
    return activities.find(act => act.time === timeStr);
  }

  attachEvents() {
    // Date navigation
    const prevDay = this.$('#prev-day');
    const nextDay = this.$('#next-day');
    const todayBtn = this.$('#today-btn');
    const datePicker = this.$('#date-picker');

    if (prevDay) prevDay.addEventListener('click', () => this.changeDate(-1));
    if (nextDay) nextDay.addEventListener('click', () => this.changeDate(1));
    if (todayBtn) todayBtn.addEventListener('click', () => this.goToToday());
    if (datePicker) datePicker.addEventListener('change', (e) => this.setDate(e.target.value));

    // Activity palette drag events
    const paletteItems = this.$$('.palette-item');
    paletteItems.forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleDragStart(e));
      item.addEventListener('click', () => {
        logger.info(`Selected ${item.dataset.categoryId} - click on a time slot to add`);
        // Highlight time slots
        this.$$('.slot-content').forEach(slot => slot.classList.add('drop-ready'));
      });
    });

    // Time slot drop events
    const slotContents = this.$$('.slot-content');
    slotContents.forEach(slot => {
      slot.addEventListener('dragover', (e) => this.handleDragOver(e));
      slot.addEventListener('drop', (e) => this.handleDrop(e));
      slot.addEventListener('click', (e) => {
        const startTime = slot.dataset.slotStart;
        this.openActivityPicker({ start: startTime });
      });
    });

    // Activity actions
    const addBtn = this.$('#add-activity-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.openActivityPicker(null));

    const clearBtn = this.$('#clear-day-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearDay());

    // Delete activity buttons
    const deleteButtons = this.$$('.activity-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteActivity(btn.dataset.activityId);
      });
    });

    // Modal events
    const closePicker = this.$('#close-picker');
    if (closePicker) closePicker.addEventListener('click', () => this.closeActivityPicker());

    const cancelActivity = this.$('#cancel-activity');
    if (cancelActivity) cancelActivity.addEventListener('click', () => this.closeActivityPicker());

    const saveActivity = this.$('#save-activity');
    if (saveActivity) saveActivity.addEventListener('click', () => this.saveActivity());

    // Category card selection in modal
    const categoryCards = this.$$('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        this.$$('.category-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  handleDragStart(e) {
    const categoryId = e.target.dataset.categoryId;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('categoryId', categoryId);
    this.setState({ draggedActivity: categoryId });
    logger.info(`Dragging ${categoryId}`);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.target.closest('.slot-content')?.classList.add('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    const categoryId = e.dataTransfer.getData('categoryId');
    const slotContent = e.target.closest('.slot-content');
    const startTime = slotContent?.dataset.slotStart;

    if (startTime && categoryId) {
      this.quickAddActivity(startTime, categoryId);
    }

    this.$$('.slot-content').forEach(slot => slot.classList.remove('drag-over'));
  }

  changeDate(days) {
    const current = new Date(this.state.currentDate);
    current.setDate(current.getDate() + days);
    const newDate = current.toISOString().split('T')[0];
    this.setState({
      currentDate: newDate,
      selectedDay: this.getDayOfWeek(current)
    });
    this.loadActivities();
  }

  goToToday() {
    const today = new Date().toISOString().split('T')[0];
    this.setState({
      currentDate: today,
      selectedDay: this.getDayOfWeek(new Date())
    });
    this.loadActivities();
  }

  setDate(dateStr) {
    this.setState({
      currentDate: dateStr,
      selectedDay: this.getDayOfWeek(new Date(dateStr))
    });
    this.loadActivities();
  }

  openActivityPicker(slot) {
    this.setState({
      showActivityPicker: true,
      selectedSlot: slot
    });
  }

  closeActivityPicker() {
    this.setState({
      showActivityPicker: false,
      selectedSlot: null
    });
  }

  quickAddActivity(startTime, categoryId) {
    // Quick add without opening modal
    const category = getAllCategories().find(c => c.id === categoryId);
    if (!category) return;

    const activity = {
      id: Date.now(),
      date: this.state.currentDate,
      time: startTime,
      category: categoryId,
      title: category.name,
      emoji: category.emoji,
      notes: '',
      students: [],
    };

    this.saveActivityToRepository(activity);
  }

  saveActivity() {
    const selectedCategory = this.$('.category-card.selected');
    if (!selectedCategory) {
      logger.error('Please select an activity type');
      return;
    }

    const categoryId = selectedCategory.dataset.categoryId;
    const category = getAllCategories().find(c => c.id === categoryId);
    const title = this.$('#activity-title').value || category.name;
    const notes = this.$('#activity-notes').value;
    const startTime = this.state.selectedSlot?.start;

    if (!startTime) {
      logger.error('No time slot selected');
      return;
    }

    const activity = {
      id: Date.now(),
      date: this.state.currentDate,
      time: startTime,
      category: categoryId,
      title,
      emoji: category.emoji,
      notes,
      students: [],
    };

    this.saveActivityToRepository(activity);
    this.closeActivityPicker();
  }

  saveActivityToRepository(activity) {
    try {
      // For now, just add to local state
      // TODO: Integrate with scheduleRepository
      const activities = [...this.state.activities, activity];
      this.setState({ activities });
      this.props.store.set('schedules', activities);
      logger.success(`Added ${activity.title} at ${activity.time}`);
    } catch (error) {
      logger.error('Failed to save activity', error);
    }
  }

  deleteActivity(activityId) {
    if (confirm('Remove this activity?')) {
      const activities = this.state.activities.filter(act => act.id != activityId);
      this.setState({ activities });
      this.props.store.set('schedules', activities);
      logger.success('Activity removed');
    }
  }

  clearDay() {
    if (confirm('Clear all activities for this day?')) {
      const activities = this.state.activities.filter(
        act => act.date !== this.state.currentDate
      );
      this.setState({ activities });
      this.props.store.set('schedules', activities);
      logger.success('Day cleared');
    }
  }

  loadActivities() {
    const allActivities = this.props.store.get('schedules') || [];
    const activities = allActivities.filter(act => act.date === this.state.currentDate);
    this.setState({ activities });
  }

  onMount() {
    this.loadActivities();
    logger.info('Interactive calendar mounted');
  }
}

export function addInteractiveCalendarStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .interactive-calendar {
      width: 100%;
      height: 100%;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .date-navigation {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .current-date {
      position: relative;
    }

    .date-display {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--cream);
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
    }

    #date-picker {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .calendar-actions {
      display: flex;
      gap: 0.5rem;
    }

    .calendar-body {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 1.5rem;
      height: calc(100vh - 250px);
    }

    /* Activity Palette */
    .activity-palette {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      overflow-y: auto;
    }

    .palette-header h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: var(--cream);
    }

    .palette-subtitle {
      font-size: 0.75rem;
      color: var(--gray-soft);
      margin: 0 0 1rem 0;
    }

    .palette-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .palette-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: grab;
      transition: all 0.2s;
    }

    .palette-item:hover {
      background: var(--category-color);
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--category-color);
      transform: translateX(4px);
    }

    .palette-item:active {
      cursor: grabbing;
    }

    .palette-emoji {
      font-size: 1.5rem;
    }

    .palette-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--cream);
    }

    /* Schedule Grid */
    .schedule-grid {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      overflow-y: auto;
    }

    .time-slots {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .time-slot {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 1rem;
      align-items: stretch;
      min-height: 60px;
    }

    .slot-time {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--amber-warm);
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .slot-content {
      background: rgba(255, 255, 255, 0.05);
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slot-content:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--amber-warm);
    }

    .slot-content.drag-over {
      background: rgba(255, 167, 38, 0.2);
      border-color: var(--amber-warm);
      border-style: solid;
    }

    .slot-content.drop-ready {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { border-color: rgba(255, 255, 255, 0.2); }
      50% { border-color: var(--amber-warm); }
    }

    .empty-slot {
      width: 100%;
      text-align: center;
      color: var(--gray-soft);
      font-size: 0.85rem;
    }

    .break-slot .slot-content {
      background: rgba(251, 191, 36, 0.1);
      border-color: rgba(251, 191, 36, 0.3);
      cursor: default;
    }

    .break-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--cream);
      font-weight: 500;
    }

    .break-icon {
      font-size: 1.5rem;
    }

    /* Scheduled Activity */
    .scheduled-activity {
      width: 100%;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .scheduled-activity:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .activity-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .activity-icon {
      font-size: 1.25rem;
    }

    .activity-title {
      flex: 1;
      font-weight: 600;
      color: var(--cream);
      font-size: 0.95rem;
    }

    .activity-delete {
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .activity-delete:hover {
      opacity: 1;
      background: rgba(239, 68, 68, 0.8);
    }

    .activity-notes {
      font-size: 0.8rem;
      color: var(--gray-soft);
      margin-top: 0.25rem;
    }

    .activity-students {
      font-size: 0.75rem;
      color: var(--cream);
      margin-top: 0.5rem;
      padding: 0.25rem 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      display: inline-block;
    }

    /* Activity Picker Modal */
    .activity-picker-modal {
      width: 90%;
      max-width: 600px;
    }

    .picker-time-info {
      padding: 0.75rem;
      background: rgba(255, 167, 38, 0.1);
      border-left: 3px solid var(--amber-warm);
      border-radius: 4px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--category-color);
    }

    .category-card.selected {
      background: var(--category-color);
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--category-color);
      box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.3);
    }

    .category-emoji {
      font-size: 2rem;
    }

    .category-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--cream);
      text-align: center;
    }

    /* No Schedule */
    .no-schedule {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray-soft);
    }

    .no-schedule-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-schedule h3 {
      color: var(--cream);
      margin-bottom: 0.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .calendar-body {
        grid-template-columns: 1fr;
      }

      .activity-palette {
        max-height: 200px;
      }

      .time-slot {
        grid-template-columns: 80px 1fr;
      }

      .category-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      }
    }
  `;
  document.head.appendChild(style);
}
