/**
 * Antwaun Dashboard Component
 * 1-on-1 session tracking with achievements and badges
 */

import { Component } from '../../core/Component.js';
import { antwaunSessionRepository } from '../../data/AntwaunSessionRepository.js';
import { logger } from '../../utils/logger.js';
import { formatDate } from '../../utils/helpers.js';

export class AntwaunDashboard extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      sessions: [],
      weeklyStats: {},
      allTimeStats: {},
      showForm: false,
    };
  }

  template() {
    const { weeklyStats, allTimeStats, sessions, showForm } = this.state;

    return `
      <div class="antwaun-dashboard">
        <div class="antwaun-header">
          <h2 class="section-title">⭐ Antwaun's Dashboard</h2>
          <p class="section-subtitle">1-on-1 session tracking with achievements</p>
          <button class="btn btn-primary" id="log-session-btn">
            ${showForm ? '❌ Cancel' : '+ Log Today\'s Work'}
          </button>
        </div>

        ${showForm ? this.renderSessionForm() : ''}

        <div class="stats-grid">
          <div class="stat-card lexia">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-label">Lexia This Week</div>
              <div class="stat-value">${weeklyStats.totalLexiaMinutes || 0} min</div>
              <div class="stat-target">Goal: 150+ min/week</div>
            </div>
          </div>

          <div class="stat-card math">
            <div class="stat-icon">🔢</div>
            <div class="stat-content">
              <div class="stat-label">Math This Week</div>
              <div class="stat-value">${weeklyStats.totalMathMinutes || 0} min</div>
              <div class="stat-target">Goal: 150+ min/week</div>
            </div>
          </div>

          <div class="stat-card music">
            <div class="stat-icon">🎵</div>
            <div class="stat-content">
              <div class="stat-label">Music This Week</div>
              <div class="stat-value">${weeklyStats.totalMusicMinutes || 0} min</div>
              <div class="stat-target">${weeklyStats.totalSessions || 0} sessions</div>
            </div>
          </div>

          <div class="stat-card fitness">
            <div class="stat-icon">💪</div>
            <div class="stat-content">
              <div class="stat-label">Fitness This Week</div>
              <div class="stat-value">${weeklyStats.totalFitnessMinutes || 0} min</div>
              <div class="stat-target">${weeklyStats.totalSessions || 0} sessions</div>
            </div>
          </div>
        </div>

        <div class="achievements-section">
          <h3 class="section-title">🏆 Achievements</h3>
          <div class="achievements-grid">
            <div class="achievement-card">
              <div class="achievement-icon">🔥</div>
              <div class="achievement-label">Current Streak</div>
              <div class="achievement-value">${allTimeStats.streak || 0} days</div>
            </div>
            <div class="achievement-card">
              <div class="achievement-icon">⭐</div>
              <div class="achievement-label">Perfect Days</div>
              <div class="achievement-value">${weeklyStats.perfectDays || 0} this week</div>
            </div>
            <div class="achievement-card">
              <div class="achievement-icon">📊</div>
              <div class="achievement-label">Total Sessions</div>
              <div class="achievement-value">${allTimeStats.totalSessions || 0}</div>
            </div>
          </div>
        </div>

        <div class="sessions-history">
          <h3 class="section-title">📅 Recent Sessions</h3>
          ${sessions.length > 0 ? sessions.map((session) => this.renderSession(session)).join('') : '<p class="empty-message">No sessions logged yet</p>'}
        </div>
      </div>
    `;
  }

  renderSessionForm() {
    return `
      <div class="session-form-card">
        <h3 class="form-title">Log Today's Session</h3>
        <form id="session-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Lexia Minutes</label>
              <input type="number" id="lexia-minutes" class="input-field" min="0" max="180" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Lexia Category</label>
              <select id="lexia-category" class="input-field">
                <option value="">Select category</option>
                <option value="Reading Comprehension">Reading Comprehension</option>
                <option value="Grammar">Grammar</option>
                <option value="Word Study">Word Study</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Math Minutes</label>
              <input type="number" id="math-minutes" class="input-field" min="0" max="180" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Math Folder</label>
              <select id="math-folder" class="input-field">
                <option value="">Select folder</option>
                <option value="Addition">Addition</option>
                <option value="Subtraction">Subtraction</option>
                <option value="Multiplication">Multiplication</option>
                <option value="Division">Division</option>
                <option value="Fractions">Fractions</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Music Minutes</label>
              <input type="number" id="music-minutes" class="input-field" min="0" max="180" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Fitness Minutes</label>
              <input type="number" id="fitness-minutes" class="input-field" min="0" max="180" placeholder="0" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Fitness Activity</label>
            <input type="text" id="fitness-activity" class="input-field" placeholder="e.g., Basketball, Running, Yoga" />
          </div>

          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="session-notes" class="input-field" rows="3" placeholder="Any notes about today's session..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-full">💾 Save Session</button>
        </form>
      </div>
    `;
  }

  renderSession(session) {
    const badges = this.renderBadges(session.badges || []);

    return `
      <div class="session-card">
        <div class="session-header">
          <div class="session-date">${formatDate(session.date, 'long')}</div>
          ${badges}
        </div>
        <div class="session-stats">
          ${session.lexiaMinutes > 0 ? `<div class="session-stat lexia">📚 Lexia: ${session.lexiaMinutes}min${session.lexiaCategory ? ` (${session.lexiaCategory})` : ''}</div>` : ''}
          ${session.mathMinutes > 0 ? `<div class="session-stat math">🔢 Math: ${session.mathMinutes}min${session.mathFolder ? ` (${session.mathFolder})` : ''}</div>` : ''}
          ${session.musicMinutes > 0 ? `<div class="session-stat music">🎵 Music: ${session.musicMinutes}min</div>` : ''}
          ${session.fitnessMinutes > 0 ? `<div class="session-stat fitness">💪 Fitness: ${session.fitnessMinutes}min${session.fitnessActivity ? ` (${session.fitnessActivity})` : ''}</div>` : ''}
        </div>
        ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
      </div>
    `;
  }

  renderBadges(badges) {
    if (badges.length === 0) return '';

    const badgeIcons = {
      lexia_30: '🌟',
      lexia_45: '⭐',
      lexia_60: '🏆',
      math_30: '🌟',
      math_45: '⭐',
      math_60: '🏆',
      music_attended: '🎵',
      fitness_20: '💪',
      fitness_30: '🔥',
      perfect_day: '🏅',
    };

    return `
      <div class="session-badges">
        ${badges.map((badge) => `<span class="badge">${badgeIcons[badge] || '⭐'}</span>`).join('')}
      </div>
    `;
  }

  attachEvents() {
    // Log session button
    const logBtn = this.$('#log-session-btn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        this.setState({ showForm: !this.state.showForm });
      });
    }

    // Session form
    const form = this.$('#session-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmitSession();
      });
    }
  }

  handleSubmitSession() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const sessionData = {
        lexiaMinutes: parseInt(this.$('#lexia-minutes').value) || 0,
        lexiaCategory: this.$('#lexia-category').value,
        mathMinutes: parseInt(this.$('#math-minutes').value) || 0,
        mathFolder: this.$('#math-folder').value,
        musicMinutes: parseInt(this.$('#music-minutes').value) || 0,
        fitnessMinutes: parseInt(this.$('#fitness-minutes').value) || 0,
        fitnessActivity: this.$('#fitness-activity').value,
        notes: this.$('#session-notes').value,
      };

      antwaunSessionRepository.setSession(today, sessionData);

      logger.success('Session saved successfully!');
      this.setState({ showForm: false });
      this.loadData();
    } catch (error) {
      logger.error('Failed to save session', error);
    }
  }

  loadData() {
    try {
      const sessions = antwaunSessionRepository.getRecent(10);
      const weeklyStats = antwaunSessionRepository.getWeeklyStats();
      const allTimeStats = antwaunSessionRepository.getAllTimeStats();

      this.setState({ sessions, weeklyStats, allTimeStats });
    } catch (error) {
      logger.error('Failed to load Antwaun data', error);
    }
  }

  onMount() {
    this.loadData();

    // Subscribe to session changes
    this.subscribe('antwaunSessions', () => {
      this.loadData();
    });

    logger.info('Antwaun dashboard mounted');
  }
}

export function addAntwaunDashboardStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .antwaun-dashboard {
      width: 100%;
    }

    .antwaun-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .session-form-card {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid var(--amber-warm);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--amber-warm);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--cream);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .stat-card.lexia { border-left: 3px solid var(--color-academics); }
    .stat-card.math { border-left: 3px solid var(--color-music); }
    .stat-card.music { border-left: 3px solid var(--color-games); }
    .stat-card.fitness { border-left: 3px solid var(--color-fitness); }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--gray-soft);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--cream);
      font-family: var(--font-display);
    }

    .stat-target {
      font-size: 0.8rem;
      color: var(--gray-soft);
      margin-top: 0.25rem;
    }

    .achievements-section {
      margin-bottom: 2rem;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .achievement-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
    }

    .achievement-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .achievement-label {
      font-size: 0.85rem;
      color: var(--gray-soft);
      margin-bottom: 0.25rem;
    }

    .achievement-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--amber-warm);
      font-family: var(--font-display);
    }

    .sessions-history {
      margin-top: 2rem;
    }

    .session-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .session-date {
      font-weight: 600;
      color: var(--cream);
    }

    .session-badges {
      display: flex;
      gap: 0.25rem;
    }

    .badge {
      font-size: 1.2rem;
    }

    .session-stats {
      display: grid;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .session-stat {
      font-size: 0.9rem;
      color: var(--gray-soft);
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
    }

    .session-notes {
      font-size: 0.85rem;
      color: var(--gray-soft);
      font-style: italic;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      border-left: 2px solid var(--amber-warm);
    }

    .empty-message {
      text-align: center;
      color: var(--gray-soft);
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .antwaun-header {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
