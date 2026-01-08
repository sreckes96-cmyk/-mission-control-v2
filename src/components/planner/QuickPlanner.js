/**
 * Quick Planner Component
 * Intelligent activity recommendations based on context
 */

import { Component } from '../../core/Component.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { FITNESS_ACTIVITIES, COOKING_ACTIVITIES, GAMES_LIBRARY } from '../../data/activities.js';
import { logger } from '../../utils/logger.js';
import { debounce } from '../../utils/helpers.js';

export class QuickPlanner extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      selectedStudents: [],
      allStudents: [],
      filteredStudents: [],
      studentSearch: '',
      energyLevel: 'medium',
      location: 'indoor',
      activityType: 'all',
      recommendations: [],
      students: [],
    };
  }

  template() {
    const { selectedStudents, energyLevel, location, activityType, recommendations, students } =
      this.state;

    return `
      <div class="quick-planner">
        <div class="planner-header">
          <h2 class="section-title">🎯 Quick Planner</h2>
          <p class="section-subtitle">Get intelligent activity recommendations based on your context</p>
        </div>

        <div class="planner-form-card">
          <div class="planner-form-grid">
            <div class="form-group">
              <label class="form-label">👥 Select Students</label>
              <div class="student-search-container">
                <input
                  type="text"
                  class="input-field"
                  id="student-search"
                  placeholder="Search students by name..."
                />
              </div>
              <div id="selected-students-display" class="selected-students-planner">
                <!-- Selected students will appear here as chips -->
              </div>
              <div class="student-selector-grid-planner" id="student-selector-planner">
                <!-- Students will be populated here -->
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Energy Level</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="energy" value="low" ${energyLevel === 'low' ? 'checked' : ''} />
                  <span>😴 Low - Calm activities</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="energy" value="medium" ${energyLevel === 'medium' ? 'checked' : ''} />
                  <span>😊 Medium - Balanced</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="energy" value="high" ${energyLevel === 'high' ? 'checked' : ''} />
                  <span>⚡ High - Active</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="location" value="indoor" ${location === 'indoor' ? 'checked' : ''} />
                  <span>🏠 Indoor</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="location" value="outdoor" ${location === 'outdoor' ? 'checked' : ''} />
                  <span>🌲 Outdoor</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="location" value="either" ${location === 'either' ? 'checked' : ''} />
                  <span>🔄 Either</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Activity Type</label>
              <select id="activity-type" class="input-field">
                <option value="all" ${activityType === 'all' ? 'selected' : ''}>All Types</option>
                <option value="fitness" ${activityType === 'fitness' ? 'selected' : ''}>💪 Fitness</option>
                <option value="cooking" ${activityType === 'cooking' ? 'selected' : ''}>🍳 Cooking</option>
                <option value="games" ${activityType === 'games' ? 'selected' : ''}>🎮 Games</option>
              </select>
            </div>
          </div>

          <button class="btn btn-primary btn-full" id="get-recommendations-btn">
            ✨ Get Recommendations
          </button>
        </div>

        ${recommendations.length > 0 ? this.renderRecommendations() : this.renderEmptyState()}
      </div>
    `;
  }

  renderRecommendations() {
    const { recommendations } = this.state;

    return `
      <div class="recommendations-section">
        <h3 class="section-title">📋 Recommended Activities</h3>
        <div class="recommendations-grid">
          ${recommendations.map((rec) => this.renderRecommendation(rec)).join('')}
        </div>
      </div>
    `;
  }

  renderRecommendation(rec) {
    const typeIcons = {
      fitness: '💪',
      cooking: '🍳',
      games: '🎮',
    };

    return `
      <div class="recommendation-card">
        <div class="recommendation-header">
          <span class="recommendation-icon">${typeIcons[rec.type]}</span>
          <span class="recommendation-type">${rec.type}</span>
        </div>
        <div class="recommendation-title">${rec.name}</div>
        <div class="recommendation-meta">
          ${rec.category ? `<span class="meta-badge">${rec.category}</span>` : ''}
          ${rec.duration ? `<span class="meta-badge">⏱️ ${rec.duration}</span>` : ''}
          ${rec.equipment ? `<span class="meta-badge">🎒 ${rec.equipment}</span>` : ''}
        </div>
        ${rec.description ? `<div class="recommendation-desc">${rec.description}</div>` : ''}
        ${rec.instructions ? `<div class="recommendation-instructions">${rec.instructions}</div>` : ''}
        <div class="recommendation-match">
          <div class="match-bar" style="width: ${rec.matchScore}%"></div>
          <span class="match-label">${rec.matchScore}% match</span>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <h3>Ready to plan!</h3>
        <p>Select your criteria above and click "Get Recommendations"</p>
      </div>
    `;
  }

  attachEvents() {
    // Student selection
    const studentSelect = this.$('#student-select');
    if (studentSelect) {
      studentSelect.addEventListener('change', () => {
        const selected = Array.from(studentSelect.selectedOptions).map((opt) =>
          parseInt(opt.value)
        );
        this.setState({ selectedStudents: selected });
      });
    }

    // Energy level radios
    const energyRadios = this.$$('input[name="energy"]');
    energyRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.setState({ energyLevel: e.target.value });
      });
    });

    // Location radios
    const locationRadios = this.$$('input[name="location"]');
    locationRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.setState({ location: e.target.value });
      });
    });

    // Activity type
    const activityType = this.$('#activity-type');
    if (activityType) {
      activityType.addEventListener('change', (e) => {
        this.setState({ activityType: e.target.value });
      });
    }

    // Get recommendations button
    const recommendBtn = this.$('#get-recommendations-btn');
    if (recommendBtn) {
      recommendBtn.addEventListener('click', () => {
        this.generateRecommendations();
      });
    }
  }

  generateRecommendations() {
    const { selectedStudents, energyLevel, location, activityType } = this.state;

    logger.info('Generating recommendations...');

    // Collect all activities
    let activities = [];

    if (activityType === 'all' || activityType === 'fitness') {
      activities.push(
        ...FITNESS_ACTIVITIES.map((a) => ({ ...a, type: 'fitness' }))
      );
    }
    if (activityType === 'all' || activityType === 'cooking') {
      activities.push(
        ...COOKING_ACTIVITIES.map((a) => ({ ...a, type: 'cooking' }))
      );
    }
    if (activityType === 'all' || activityType === 'games') {
      activities.push(...GAMES_LIBRARY.map((a) => ({ ...a, type: 'games' })));
    }

    // Filter by location
    if (location !== 'either') {
      activities = activities.filter((a) => {
        if (!a.location) return true; // Include if no location specified
        if (location === 'outdoor') {
          return a.location.toLowerCase().includes('outdoor');
        } else {
          return !a.location.toLowerCase().includes('outdoor');
        }
      });
    }

    // Score activities based on energy level
    const scoredActivities = activities.map((activity) => {
      let matchScore = 50; // Base score

      // Energy level matching
      if (energyLevel === 'low') {
        if (
          activity.category?.toLowerCase().includes('stretch') ||
          activity.category?.toLowerCase().includes('yoga') ||
          activity.category?.toLowerCase().includes('balance')
        ) {
          matchScore += 30;
        }
        if (
          activity.category?.toLowerCase().includes('cardio') ||
          activity.category?.toLowerCase().includes('race')
        ) {
          matchScore -= 20;
        }
      } else if (energyLevel === 'high') {
        if (
          activity.category?.toLowerCase().includes('cardio') ||
          activity.category?.toLowerCase().includes('race') ||
          activity.category?.toLowerCase().includes('team')
        ) {
          matchScore += 30;
        }
        if (
          activity.category?.toLowerCase().includes('stretch') ||
          activity.category?.toLowerCase().includes('quiet')
        ) {
          matchScore -= 20;
        }
      } else {
        // Medium energy - slight preference for balanced
        matchScore += 10;
      }

      // Equipment availability (prefer minimal equipment)
      if (
        !activity.equipment ||
        activity.equipment.toLowerCase() === 'none' ||
        activity.equipment.toLowerCase().includes('minimal')
      ) {
        matchScore += 15;
      }

      // Group size consideration
      if (selectedStudents.length > 0) {
        if (selectedStudents.length >= 6 && activity.category?.toLowerCase().includes('team')) {
          matchScore += 20;
        }
        if (selectedStudents.length <= 3 && activity.category?.toLowerCase().includes('individual')) {
          matchScore += 15;
        }
      }

      // Cap score at 100
      matchScore = Math.min(matchScore, 100);

      return {
        ...activity,
        matchScore,
      };
    });

    // Sort by match score and take top 12
    const recommendations = scoredActivities
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12);

    this.setState({ recommendations });
    logger.success(`Generated ${recommendations.length} recommendations`);
  }

  loadStudents() {
    try {
      const students = studentRepository.getAllSorted();
      this.setState({
        students,
        allStudents: students,
        filteredStudents: students,
      });
      logger.info(`Loaded ${students.length} students for planner`);
    } catch (error) {
      logger.error('Failed to load students', error);
    }
  }

  toggleStudentSelection(studentId) {
    const { selectedStudents } = this.state;
    const isSelected = selectedStudents.includes(studentId);

    if (isSelected) {
      this.setState({
        selectedStudents: selectedStudents.filter(id => id !== studentId),
      });
    } else {
      this.setState({
        selectedStudents: [...selectedStudents, studentId],
      });
    }
  }

  filterStudents(searchTerm) {
    const { allStudents } = this.state;
    const filtered = searchTerm
      ? allStudents.filter(s =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allStudents;

    this.setState({
      studentSearch: searchTerm,
      filteredStudents: filtered,
    });
  }

  renderStudentSelector() {
    const { filteredStudents, selectedStudents } = this.state;

    return filteredStudents
      .map((student) => {
        const isSelected = selectedStudents.includes(student.id);
        const initials = student.name.split(' ').map(n => n[0]).join('');

        return `
          <div
            class="student-option ${isSelected ? 'selected' : ''}"
            data-student-id="${student.id}">
            <div class="student-option-avatar">${initials}</div>
            <div class="student-option-name">${student.name}</div>
            <div class="student-option-grade">Grade ${student.grade}</div>
            ${isSelected ? '<div class="student-option-check">✓</div>' : ''}
          </div>
        `;
      })
      .join('');
  }

  renderSelectedStudentsChips() {
    const { selectedStudents, allStudents } = this.state;

    if (selectedStudents.length === 0) {
      return '<p class="empty-hint">No students selected - click students below to add</p>';
    }

    return selectedStudents
      .map((studentId) => {
        const student = allStudents.find(s => s.id === studentId);
        if (!student) return '';

        return `
          <div class="student-chip-planner">
            <span class="student-chip-name">${student.name}</span>
            <button class="student-chip-remove" data-student-id="${studentId}">×</button>
          </div>
        `;
      })
      .join('');
  }

  populateStudentSelector() {
    const selectorContainer = this.$('#student-selector-planner');
    const selectedDisplay = this.$('#selected-students-display');

    if (selectorContainer) {
      selectorContainer.innerHTML = this.renderStudentSelector();

      // Add click handlers
      const studentOptions = this.$$('.student-option');
      studentOptions.forEach(option => {
        option.addEventListener('click', () => {
          const studentId = parseInt(option.dataset.studentId);
          this.toggleStudentSelection(studentId);
          // Re-render both selector and chips
          this.populateStudentSelector();
        });
      });
    }

    if (selectedDisplay) {
      selectedDisplay.innerHTML = this.renderSelectedStudentsChips();

      // Add remove handlers
      const removeButtons = this.$$('.student-chip-remove');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const studentId = parseInt(btn.dataset.studentId);
          this.toggleStudentSelection(studentId);
          this.populateStudentSelector();
        });
      });
    }
  }

  setupStudentSearch() {
    const searchInput = this.$('#student-search');
    if (searchInput) {
      const debouncedSearch = debounce((value) => {
        this.filterStudents(value);
        this.populateStudentSelector();
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }
  }

  onMount() {
    this.loadStudents();

    // Populate student selector after render
    setTimeout(() => {
      this.populateStudentSelector();
      this.setupStudentSearch();
    }, 100);

    // Subscribe to student changes
    this.subscribe('students', () => {
      this.loadStudents();
      this.populateStudentSelector();
    });

    logger.info('Quick planner mounted');
  }
}

export function addQuickPlannerStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .quick-planner {
      width: 100%;
    }

    .planner-header {
      margin-bottom: 1.5rem;
    }

    .planner-form-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .planner-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .radio-label:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .radio-label input[type="radio"] {
      cursor: pointer;
    }

    .radio-label span {
      flex: 1;
      font-size: 0.9rem;
    }

    .form-hint {
      font-size: 0.8rem;
      color: var(--gray-soft);
      margin-top: 0.5rem;
    }

    .recommendations-section {
      margin-top: 2rem;
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .recommendation-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.3s ease;
    }

    .recommendation-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .recommendation-icon {
      font-size: 1.5rem;
    }

    .recommendation-type {
      text-transform: uppercase;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--amber-warm);
      letter-spacing: 0.05em;
    }

    .recommendation-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--cream);
      margin-bottom: 0.75rem;
    }

    .recommendation-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .meta-badge {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--gray-soft);
    }

    .recommendation-desc {
      font-size: 0.85rem;
      color: var(--gray-soft);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .recommendation-instructions {
      font-size: 0.8rem;
      color: var(--gray-soft);
      line-height: 1.4;
      margin-bottom: 0.75rem;
      font-style: italic;
    }

    .recommendation-match {
      position: relative;
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .match-bar {
      height: 4px;
      background: linear-gradient(90deg, var(--success) 0%, var(--amber-warm) 100%);
      border-radius: 2px;
      margin-bottom: 0.25rem;
      transition: width 0.5s ease;
    }

    .match-label {
      font-size: 0.75rem;
      color: var(--success);
      font-weight: 600;
    }

    /* Student Selection Styles */
    .student-search-container {
      margin-bottom: 1rem;
    }

    .selected-students-planner {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
      min-height: 40px;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
    }

    .empty-hint {
      font-size: 0.85rem;
      color: var(--gray-soft);
      font-style: italic;
      margin: 0;
    }

    .student-chip-planner {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: linear-gradient(135deg, var(--amber-warm), var(--color-academics));
      border-radius: 20px;
      color: white;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .student-chip-name {
      font-weight: 500;
    }

    .student-chip-remove {
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: background 0.2s;
    }

    .student-chip-remove:hover {
      background: rgba(239, 68, 68, 0.8);
    }

    .student-selector-grid-planner {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
    }

    .student-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .student-option:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 167, 38, 0.5);
    }

    .student-option.selected {
      background: rgba(255, 167, 38, 0.15);
      border-color: var(--amber-warm);
      box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.2);
    }

    .student-option-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #60a5fa, #10b981);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .student-option.selected .student-option-avatar {
      background: linear-gradient(135deg, var(--amber-warm), var(--color-academics));
    }

    .student-option-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--cream);
      text-align: center;
    }

    .student-option-grade {
      font-size: 0.75rem;
      color: var(--gray-soft);
    }

    .student-option-check {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--amber-warm);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
    }

    @media (max-width: 768px) {
      .planner-form-grid {
        grid-template-columns: 1fr;
      }

      .recommendations-grid {
        grid-template-columns: 1fr;
      }

      .student-selector-grid-planner {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
    }
  `;
  document.head.appendChild(style);
}
