/**
 * Quick Planner Component
 * Intelligent activity recommendations based on context
 */

import { Component } from '../../core/Component.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { FITNESS_ACTIVITIES, COOKING_ACTIVITIES, GAMES_LIBRARY } from '../../data/activities.js';
import { logger } from '../../utils/logger.js';

export class QuickPlanner extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      selectedStudents: [],
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
              <label class="form-label">Select Students</label>
              <select id="student-select" class="input-field" multiple size="5">
                ${students.map((s) => `<option value="${s.id}">${s.name} (Grade ${s.grade})</option>`).join('')}
              </select>
              <div class="form-hint">
                Hold Ctrl/Cmd to select multiple. ${selectedStudents.length} selected
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
      this.setState({ students });
      logger.info(`Loaded ${students.length} students for planner`);
    } catch (error) {
      logger.error('Failed to load students', error);
    }
  }

  onMount() {
    this.loadStudents();

    // Subscribe to student changes
    this.subscribe('students', () => {
      this.loadStudents();
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

    @media (max-width: 768px) {
      .planner-form-grid {
        grid-template-columns: 1fr;
      }

      .recommendations-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
